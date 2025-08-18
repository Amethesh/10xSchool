# Quiz Results and Ranking System

This document describes the quiz results and ranking system implementation for the Student Quiz System.

## Overview

The quiz results system provides comprehensive performance tracking, real-time ranking, and historical analysis for student quiz attempts. It includes components for displaying results, tracking performance over time, and providing insights to help students improve.

## Components

### ResultsDisplay

The main component for displaying quiz results with performance metrics, ranking, and leaderboard.

**Props:**
- `results: QuizResults` - The quiz results data
- `onRetry: () => void` - Callback for retrying the quiz
- `onBackToLevels: () => void` - Callback for navigating back to levels

**Features:**
- Performance badges based on score (Excellent ≥90%, Great Job ≥70%, etc.)
- Confetti animation for good scores (≥70%)
- Real-time ranking display
- Performance metrics (accuracy, time, average per question)
- Leaderboard with top 10 students
- Recent performance history
- Retry and navigation functionality

### PerformanceTracker

A component for displaying detailed performance analytics and trends.

**Props:**
- `history: PerformanceData[]` - Array of historical quiz attempts
- `currentScore?: number` - Current quiz score for highlighting
- `isLoading?: boolean` - Loading state

**Features:**
- Performance summary metrics
- Trend analysis (improving, declining, stable)
- Recent attempts history
- Performance insights and recommendations
- Consistency scoring

### useQuizResults Hook

A custom hook for managing quiz results data and operations.

**Parameters:**
- `studentId: string` - Student identifier
- `level: string` - Quiz level
- `weekNo: number` - Week number
- `difficulty: string` - Difficulty setting

**Returns:**
- `saveResults` - Function to save quiz results
- `ranking` - Student ranking data
- `leaderboard` - Leaderboard data
- `history` - Quiz history data
- `createQuizResults` - Utility function to create results object
- `getPerformanceInsights` - Function to generate performance insights

### useRealTimeRanking Hook

A hook for real-time ranking updates using Supabase subscriptions.

**Features:**
- Real-time ranking updates
- Live leaderboard changes
- Connection status monitoring
- Performance tier calculation
- Ranking change notifications

## Data Flow

1. **Quiz Completion**: When a quiz is completed, results are calculated and saved
2. **Results Display**: The ResultsDisplay component shows immediate results
3. **Ranking Calculation**: Real-time ranking is calculated against other students
4. **Performance Tracking**: Historical data is stored and analyzed
5. **Insights Generation**: Performance insights are generated based on trends

## Database Schema

### quiz_attempts
- `id` - Unique attempt identifier
- `student_id` - Reference to student
- `level` - Quiz level
- `week_no` - Week number
- `difficulty` - Difficulty setting
- `total_questions` - Number of questions
- `correct_answers` - Number correct
- `score` - Percentage score
- `time_spent` - Total time in seconds
- `completed_at` - Completion timestamp

### quiz_answers
- `id` - Unique answer identifier
- `attempt_id` - Reference to quiz attempt
- `question_id` - Reference to question
- `selected_answer` - Student's answer
- `is_correct` - Whether answer was correct
- `time_taken` - Time spent on question

## Usage Examples

### Basic Results Display

```tsx
import { ResultsDisplay } from '@/components/quiz';

function QuizResultsPage() {
  const results = {
    studentId: 'student-123',
    level: 'Beginner',
    weekNo: 1,
    difficulty: { name: 'medium', timeLimit: 10, label: 'Medium (10s)' },
    totalQuestions: 10,
    correctAnswers: 8,
    score: 80,
    timeSpent: 120,
    answers: [],
    completedAt: new Date(),
  };

  return (
    <ResultsDisplay
      results={results}
      onRetry={() => console.log('Retry')}
      onBackToLevels={() => console.log('Back')}
    />
  );
}
```

### Using the Quiz Results Hook

```tsx
import { useQuizResults } from '@/hooks/useQuizResults';

function QuizComponent() {
  const {
    saveResults,
    ranking,
    leaderboard,
    history,
    createQuizResults,
  } = useQuizResults({
    studentId: 'student-123',
    level: 'Beginner',
    weekNo: 1,
    difficulty: 'medium',
  });

  const handleQuizComplete = async (questions, answers, timeSpent) => {
    const results = createQuizResults(questions, answers, timeSpent, difficulty);
    await saveResults({
      attemptId: 'attempt-123',
      questions,
      answers,
      timeSpent,
    });
  };

  return (
    <div>
      {ranking && <div>Your rank: #{ranking.rank}</div>}
      {/* Quiz interface */}
    </div>
  );
}
```

### Performance Tracking

```tsx
import { PerformanceTracker } from '@/components/quiz';

function StudentDashboard() {
  const { history, isHistoryLoading } = useQuizResults({
    studentId: 'student-123',
    level: 'Beginner',
    weekNo: 1,
    difficulty: 'medium',
  });

  return (
    <PerformanceTracker
      history={history || []}
      currentScore={85}
      isLoading={isHistoryLoading}
    />
  );
}
```

## Requirements Fulfilled

### 4.1 - Calculate and Display Student Score
- ✅ Quiz results show percentage score and correct/total answers
- ✅ Score calculation is performed server-side for accuracy

### 4.2 - Show Correct Answers Out of Total
- ✅ Results display shows "X out of Y correct" format
- ✅ Individual question results are tracked

### 4.3 - Show Student Ranking
- ✅ Real-time ranking calculation against other students
- ✅ Percentile and position display
- ✅ Live updates when other students complete quizzes

### 4.5 - Handle Tie-Breaking Consistently
- ✅ Ties are broken by completion time (earlier completion ranks higher)
- ✅ Consistent ranking algorithm across all displays

### 6.1 - Store Performance Data
- ✅ All quiz attempts are stored in database
- ✅ Individual answers and timing data preserved
- ✅ Historical tracking across sessions

### 6.2 - Associate Data with Identifiers
- ✅ Data linked to student, level, week, and difficulty
- ✅ Proper foreign key relationships maintained
- ✅ Query optimization for performance

## Performance Considerations

- **Caching**: React Query caching reduces database load
- **Real-time Updates**: Supabase subscriptions for live ranking
- **Optimistic Updates**: Immediate UI feedback while saving
- **Query Optimization**: Indexed database queries for fast ranking
- **Pagination**: Leaderboards limited to top 10 for performance

## Testing

The system includes comprehensive tests for:
- Results display logic and calculations
- Performance insights generation
- Hook functionality and state management
- Requirements validation
- Edge cases and error handling

Run tests with:
```bash
npm test -- --run src/components/quiz/__tests__/ResultsDisplay.test.tsx
npm test -- --run src/hooks/__tests__/useQuizResults.test.ts
```

## Future Enhancements

- **Achievement System**: Badges for milestones and streaks
- **Detailed Analytics**: Charts and graphs for performance trends
- **Comparative Analysis**: Compare performance across different levels
- **Export Functionality**: Download performance reports
- **Social Features**: Share achievements and compete with friends