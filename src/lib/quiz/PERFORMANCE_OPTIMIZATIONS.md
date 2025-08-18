# Quiz System Performance Optimizations

This document outlines the performance optimizations implemented for the student quiz system, focusing on React Query caching, optimistic updates, database query optimization, and loading states.

## Overview

The optimizations target the following areas:
1. **React Query Caching** - Intelligent caching strategies for different data types
2. **Optimistic Updates** - Immediate UI feedback for better user experience
3. **Database Query Optimization** - Efficient SQL queries and indexing
4. **Loading States** - Skeleton components and progressive loading
5. **Performance Monitoring** - Tools to track and optimize performance

## 1. React Query Configuration

### Enhanced Provider Configuration (`src/lib/TanstackProvider.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes for questions
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
      retry: (failureCount, error) => {
        // Smart retry logic based on error type
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

**Benefits:**
- Reduces unnecessary network requests
- Implements exponential backoff for retries
- Avoids retrying client errors (4xx)
- Configurable cache times based on data volatility

## 2. Optimized Data Fetching Hooks

### Quiz Questions (`src/hooks/useQuizQuestions.ts`)

```typescript
export function useQuizQuestions(level: string, weekNo: number) {
  return useQuery<Question[]>({
    queryKey: ['quiz-questions', level, weekNo],
    queryFn: () => fetchQuestionsByLevelAndWeek(level, weekNo),
    staleTime: 30 * 60 * 1000, // Questions rarely change
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
}
```

**Features:**
- Long cache times for static data (questions)
- Prefetching for improved navigation
- Cached question access without network requests

### Student Data (`src/hooks/useOptimizedStudentData.ts`)

```typescript
export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile', user?.id],
    staleTime: 5 * 60 * 1000, // Profile changes less frequently
    gcTime: 15 * 60 * 1000,
  });
}
```

**Benefits:**
- Appropriate cache times based on data update frequency
- Batch prefetching for related data
- Optimistic updates for immediate feedback

## 3. Optimistic Updates

### Quiz Answers (`src/hooks/useOptimisticQuizAnswers.ts`)

```typescript
const saveAnswerMutation = useMutation({
  mutationFn: async (answer: QuizAnswer) => {
    await saveQuizAnswers(attemptId, [answer]);
  },
  onMutate: async (answer: QuizAnswer) => {
    // Optimistically update UI immediately
    queryClient.setQueryData(['quiz-progress', attemptId], (old) => ({
      ...old,
      answers: [...old.answers, answer],
      score: old.score + (answer.isCorrect ? 1 : 0),
    }));
  },
});
```

**Benefits:**
- Immediate UI feedback
- Better perceived performance
- Automatic rollback on errors
- Maintains data consistency

### Ranking Updates (`src/hooks/useOptimizedRanking.ts`)

```typescript
const updateRankingOptimistically = (studentId, level, weekNo, difficulty, newScore) => {
  // Update ranking cache immediately
  queryClient.setQueryData(['optimized-ranking', ...], (oldData) => ({
    ...oldData,
    score: newScore,
    rank: Math.max(1, Math.floor(oldData.rank * 0.8)), // Estimate improvement
  }));
};
```

**Features:**
- Immediate ranking updates
- Leaderboard optimistic updates
- Batch ranking calculations

## 4. Database Query Optimizations

### Optimized SQL Functions (`src/lib/quiz/database-functions.sql`)

```sql
-- Optimized ranking calculation using window functions
CREATE OR REPLACE FUNCTION calculate_student_ranking_optimized(
  p_student_id UUID,
  p_level TEXT,
  p_week_no INTEGER,
  p_difficulty TEXT
)
RETURNS TABLE (rank BIGINT, total_students BIGINT, score DECIMAL)
```

**Optimizations:**
- Window functions for efficient ranking
- Single query instead of multiple round trips
- Proper indexing for performance
- Fallback methods for compatibility

### Database Indexes

```sql
-- Composite index for quiz performance queries
CREATE INDEX idx_quiz_attempts_performance 
ON quiz_attempts (level, week_no, difficulty, completed_at, score DESC, student_id);

-- Partial index for completed attempts only
CREATE INDEX idx_quiz_attempts_completed 
ON quiz_attempts (level, week_no, difficulty, student_id, score) 
WHERE completed_at IS NOT NULL;
```

**Benefits:**
- Faster ranking calculations
- Optimized leaderboard queries
- Reduced database load
- Better concurrent performance

## 5. Loading States and Skeletons

### Skeleton Components (`src/components/quiz/QuizSkeletons.tsx`)

```typescript
export function QuizQuestionSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
      <CardContent className="space-y-6">
        <Skeleton className="h-8 w-3/4 mx-auto bg-gray-700" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-gray-700" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Components Available:**
- `QuizQuestionSkeleton` - For loading questions
- `QuizResultsSkeleton` - For loading results
- `LeaderboardSkeleton` - For loading leaderboards
- `LevelSelectionSkeleton` - For loading level selection
- `PerformanceAnalyticsSkeleton` - For loading analytics

## 6. Performance Monitoring

### Performance Monitoring Hook (`src/hooks/usePerformanceMonitoring.ts`)

```typescript
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryCount: 0,
    cacheHitRate: 0,
    averageQueryTime: 0,
    slowQueries: [],
    memoryUsage: { cacheSize: 0, queryCount: 0 },
  });
  
  // Monitor query performance and cache efficiency
}
```

**Features:**
- Cache hit rate monitoring
- Query performance tracking
- Memory usage analysis
- Slow query identification
- Development-only debugger

## 7. Implementation Guidelines

### Cache Key Strategy

```typescript
// Hierarchical cache keys for better invalidation
['quiz-questions', level, weekNo]           // Static data, long cache
['student-ranking', studentId, level, weekNo, difficulty] // Dynamic, shorter cache
['quiz-progress', attemptId]                // Session data, no persistence
```

### Prefetching Strategy

```typescript
// Prefetch related data for better navigation
const { prefetchQuestions } = usePrefetchQuestions();
const { prefetchRankings } = usePrefetchRankings();

// Prefetch next week's questions when current quiz loads
useEffect(() => {
  if (questions) {
    prefetchQuestions(level, [weekNo + 1, weekNo + 2]);
  }
}, [questions, level, weekNo]);
```

### Error Handling

```typescript
// Graceful degradation with fallbacks
const { data, error, isLoading } = useOptimizedRanking(studentId, level, weekNo, difficulty);

if (error) {
  // Show cached data if available, or fallback UI
  return <FallbackRankingDisplay />;
}
```

## 8. Performance Metrics

### Expected Improvements

- **Cache Hit Rate**: 70-85% for typical usage patterns
- **Query Response Time**: 50-80% reduction for cached data
- **Perceived Performance**: Immediate UI feedback with optimistic updates
- **Database Load**: 60-70% reduction in ranking calculation queries
- **Memory Usage**: Efficient garbage collection with appropriate cache times

### Monitoring

```typescript
// Development monitoring
import { PerformanceDebugger } from '@/hooks/usePerformanceMonitoring';

// Add to development builds
{process.env.NODE_ENV === 'development' && <PerformanceDebugger />}
```

## 9. Best Practices

### Do's
- ✅ Use appropriate cache times based on data volatility
- ✅ Implement optimistic updates for user actions
- ✅ Prefetch data for anticipated navigation
- ✅ Use skeleton components for loading states
- ✅ Monitor performance in development
- ✅ Implement proper error boundaries

### Don'ts
- ❌ Don't cache user-specific data globally
- ❌ Don't use optimistic updates for critical operations without rollback
- ❌ Don't ignore cache invalidation after mutations
- ❌ Don't fetch data that's already cached
- ❌ Don't use long cache times for frequently changing data

## 10. Migration Guide

### Updating Existing Components

1. Replace direct data fetching with optimized hooks:
```typescript
// Before
const { data } = useQuery(['questions', level, weekNo], () => fetchQuestions(level, weekNo));

// After
const { data } = useQuizQuestions(level, weekNo);
```

2. Add optimistic updates to mutations:
```typescript
// Before
const mutation = useMutation(saveAnswer);

// After
const { saveAnswer } = useOptimisticQuizAnswers(attemptId, studentId, level, weekNo, difficulty);
```

3. Replace loading states with skeletons:
```typescript
// Before
if (isLoading) return <div>Loading...</div>;

// After
if (isLoading) return <QuizQuestionSkeleton />;
```

### Database Migration

1. Run the SQL functions in Supabase SQL editor
2. Create the performance indexes
3. Update existing queries to use optimized functions
4. Monitor performance improvements

## 11. Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check cache sizes with performance monitor
   - Adjust `gcTime` values
   - Implement proper cache invalidation

2. **Slow Queries**
   - Monitor slow query list
   - Check database indexes
   - Optimize query patterns

3. **Cache Inconsistency**
   - Ensure proper invalidation after mutations
   - Check optimistic update rollback logic
   - Verify cache key consistency

### Debug Tools

```typescript
// Performance monitoring
const { metrics, getCacheStats } = usePerformanceMonitoring();

// Query-specific monitoring
const queryMetrics = useQueryPerformanceMonitor(['quiz-questions', level, weekNo]);

// Cache inspection
const cacheStats = getCacheStats();
```

This comprehensive optimization strategy provides significant performance improvements while maintaining data consistency and user experience quality.