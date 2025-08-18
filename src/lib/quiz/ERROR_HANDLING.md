# Quiz Error Handling System

This document describes the comprehensive error handling system implemented for the quiz components.

## Overview

The error handling system provides:
- **Error Boundaries** for catching React component errors
- **Network Error Handling** with retry mechanisms
- **Timer Error Handling** with graceful degradation
- **User-friendly Error Messages** with recovery options
- **Circuit Breaker Pattern** to prevent cascading failures
- **Offline/Online Detection** for network-aware behavior

## Components

### 1. Error Boundaries

#### `ErrorBoundary`
Generic error boundary component that catches JavaScript errors in child components.

```tsx
<ErrorBoundary onError={handleError} showDetails={isDevelopment}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches and displays errors with user-friendly messages
- Provides retry and navigation options
- Logs errors for debugging
- Supports custom fallback UI

#### `QuizErrorBoundary`
Specialized error boundary for quiz components with quiz-specific error logging.

```tsx
<QuizErrorBoundary>
  <QuizInterface />
</QuizErrorBoundary>
```

### 2. Error Types and Classes

#### `QuizError`
Custom error class with quiz-specific error types and user messages.

```typescript
// Create specific error types
const networkError = QuizError.network('Connection failed');
const timerError = QuizError.timer('Timer malfunction');
const databaseError = QuizError.database('Save failed');
```

**Error Types:**
- `NETWORK_ERROR` - Connection and fetch failures
- `DATABASE_ERROR` - Supabase/database operation failures
- `TIMER_ERROR` - Quiz timer malfunctions
- `VALIDATION_ERROR` - Input validation failures
- `QUIZ_STATE_ERROR` - Quiz state inconsistencies
- `QUESTION_LOAD_ERROR` - Question loading failures
- `SAVE_ERROR` - Answer/progress saving failures

### 3. Retry Mechanisms

#### `withRetry`
Generic retry function with exponential backoff.

```typescript
const result = await withRetry(
  () => fetchQuestions(level, week),
  {
    config: { maxAttempts: 3, baseDelay: 1000, maxDelay: 10000 },
    onRetry: (attempt, error) => console.log(`Retry ${attempt}:`, error)
  }
);
```

#### Specialized Retry Functions
- `withNetworkRetry` - For network operations
- `withDatabaseRetry` - For database operations

### 4. Circuit Breaker Pattern

Prevents cascading failures by temporarily blocking requests to failing services.

```typescript
// Database operations with circuit breaker
const result = await withDatabaseCircuitBreaker(async () => {
  return await saveQuizAnswers(attemptId, answers);
});
```

**States:**
- `CLOSED` - Normal operation
- `OPEN` - Blocking requests (service is failing)
- `HALF_OPEN` - Testing if service has recovered

### 5. Error Notifications

#### `ErrorNotification`
User-friendly error notification component with retry options.

```tsx
<ErrorNotification
  error={error}
  onRetry={handleRetry}
  onDismiss={clearError}
  autoHide={true}
/>
```

#### `useErrorNotification`
Hook for managing error notifications.

```typescript
const { error, showError, clearError, retry } = useErrorNotification();

// Show an error
showError(QuizError.network('Connection failed'));

// Clear the error
clearError();
```

### 6. Timer Error Handling

The quiz timer includes comprehensive error handling:

- **Time Drift Detection** - Detects system clock changes
- **Validation** - Ensures timer values are reasonable
- **Graceful Degradation** - Continues quiz without timing if timer fails
- **Page Visibility** - Handles tab switching gracefully

```typescript
const {
  timeRemaining,
  hasError,
  error
} = useQuizTimer({
  timeLimit: 30,
  onTimeUp: handleTimeUp,
  onError: handleTimerError
});
```

## Implementation Examples

### 1. Data Access with Error Handling

```typescript
export async function fetchQuestionsByLevelAndWeek(
  level: string,
  weekNo: number
): Promise<Question[]> {
  try {
    return await withDatabaseCircuitBreaker(async () => {
      return await withDatabaseRetry(async () => {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('math_questions')
          .select('*')
          .eq('level', level)
          .eq('week_no', weekNo);

        if (error) {
          throw QuizError.database(`Failed to fetch questions: ${error.message}`, {
            level,
            weekNo,
            operation: 'fetchQuestionsByLevelAndWeek'
          });
        }

        return data || [];
      });
    });
  } catch (error) {
    if (error instanceof QuizError) {
      throw error;
    }
    throw categorizeError(error as Error, { level, weekNo });
  }
}
```

### 2. Component with Error Handling

```tsx
function QuizComponent() {
  const { error, showError, clearError } = useErrorNotification();
  
  const handleQuizAction = async () => {
    try {
      await performQuizAction();
    } catch (error) {
      showError(categorizeError(error as Error));
    }
  };

  return (
    <QuizErrorBoundary>
      <div>
        {/* Quiz content */}
        <button onClick={handleQuizAction}>Start Quiz</button>
      </div>
      
      <ErrorNotification
        error={error}
        onRetry={() => {
          clearError();
          handleQuizAction();
        }}
        onDismiss={clearError}
      />
    </QuizErrorBoundary>
  );
}
```

### 3. Timer with Error Handling

```tsx
function QuizTimer() {
  const { error, showError } = useErrorNotification();
  
  const {
    timeRemaining,
    hasError,
    error: timerError
  } = useQuizTimer({
    timeLimit: 30,
    onTimeUp: handleTimeUp,
    onError: (error) => {
      console.warn('Timer error:', error);
      showError(error);
    }
  });

  return (
    <div>
      {hasError ? (
        <div className="text-yellow-400">Timer Disabled</div>
      ) : (
        <div>Time: {timeRemaining}s</div>
      )}
    </div>
  );
}
```

## Error Recovery Strategies

### 1. Network Errors
- **Retry with backoff** - Automatic retry with increasing delays
- **Offline detection** - Show offline status and retry when online
- **Local caching** - Use cached data when network fails

### 2. Database Errors
- **Retry operations** - Retry failed database operations
- **Local storage** - Store answers locally as backup
- **Graceful degradation** - Continue quiz with reduced functionality

### 3. Timer Errors
- **Disable timing** - Continue quiz without time limits
- **Manual progression** - Allow manual question progression
- **State preservation** - Maintain quiz state despite timer issues

### 4. Quiz State Errors
- **State validation** - Validate quiz state consistency
- **Recovery options** - Provide restart or continue options
- **Progress preservation** - Maintain as much progress as possible

## Configuration

### Retry Configuration

```typescript
const RETRY_CONFIGS: Record<QuizErrorType, RetryConfig> = {
  [QuizErrorType.NETWORK_ERROR]: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
  },
  [QuizErrorType.DATABASE_ERROR]: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 6000,
    backoffMultiplier: 1.5,
  },
  // ... other configurations
};
```

### Circuit Breaker Configuration

```typescript
// Database circuit breaker: 3 failures, 30 second recovery
export const databaseCircuitBreaker = new CircuitBreaker(3, 30000);

// Network circuit breaker: 5 failures, 1 minute recovery
export const networkCircuitBreaker = new CircuitBreaker(5, 60000);
```

## Testing

The error handling system includes comprehensive tests:

- **Error Boundary Tests** - Component error catching and recovery
- **Retry Mechanism Tests** - Retry logic and backoff behavior
- **Circuit Breaker Tests** - Circuit state transitions
- **Error Notification Tests** - User notification behavior
- **Integration Tests** - End-to-end error scenarios

Run tests with:
```bash
npm test src/components/quiz/__tests__/error-handling.test.tsx
```

## Best Practices

1. **Always wrap quiz components in error boundaries**
2. **Use specific error types for better user messages**
3. **Implement retry logic for transient failures**
4. **Provide fallback options for critical failures**
5. **Log errors for debugging but show user-friendly messages**
6. **Test error scenarios thoroughly**
7. **Monitor error rates in production**

## Monitoring and Debugging

### Development
- Detailed error logs with stack traces
- Error boundary details visible
- Console warnings for recoverable errors

### Production
- User-friendly error messages only
- Error reporting to monitoring service
- Performance metrics for error rates

### Error Context
All errors include contextual information:
- Operation being performed
- User state (student ID, level, etc.)
- Timestamp and environment details
- Recovery options available