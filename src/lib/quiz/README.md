# Quiz Data Access Layer

This module provides comprehensive data access functions for the Student Quiz System. It handles all database operations related to quiz questions, attempts, answers, and student rankings.

## Features

- ✅ Fetch questions by level and week
- ✅ Create and manage quiz attempts
- ✅ Save and retrieve quiz answers
- ✅ Calculate student rankings and leaderboards
- ✅ Quiz scoring and validation utilities
- ✅ Performance tracking and analytics

## File Structure

```
src/lib/quiz/
├── data-access.ts      # Database operations
├── utils.ts           # Utility functions
├── index.ts          # Main exports
├── validate.ts       # Validation script
├── README.md         # This file
└── __tests__/        # Test files
    ├── data-access.test.ts
    └── quiz-functions.test.ts
```

## Core Functions

### Data Access Functions (`data-access.ts`)

#### Question Management
- `fetchQuestionsByLevelAndWeek(level, weekNo)` - Fetch questions for a specific level and week
- `checkAnswer(question, selectedAnswer)` - Validate if an answer is correct

#### Quiz Attempt Management
- `createQuizAttempt(studentId, level, weekNo, difficulty, totalQuestions)` - Create new quiz attempt
- `updateQuizAttempt(attemptId, correctAnswers, score, timeSpent)` - Update attempt with results
- `getStudentQuizAttempts(studentId, level?, weekNo?)` - Get student's quiz history
- `getQuizAttemptWithAnswers(attemptId)` - Get attempt details with all answers

#### Answer Management
- `saveQuizAnswer(attemptId, questionId, selectedAnswer, isCorrect, timeTaken)` - Save single answer
- `saveQuizAnswers(attemptId, answers)` - Save multiple answers in batch

#### Ranking and Leaderboards
- `calculateStudentRanking(studentId, level, weekNo, difficulty)` - Calculate student's rank
- `getQuizLeaderboard(level, weekNo, difficulty, limit)` - Get quiz-specific leaderboard
- `getLevelLeaderboard(level, limit)` - Get overall level leaderboard
- `getStudentQuizHistory(studentId, limit)` - Get student's performance history

#### Scoring
- `calculateQuizScore(questions, answers)` - Calculate quiz score and statistics

### Utility Functions (`utils.ts`)

#### Configuration
- `QUIZ_DIFFICULTIES` - Predefined difficulty settings (easy: 15s, medium: 10s, hard: 5s)
- `validateQuizConfig(level, weekNo, difficulty)` - Validate quiz configuration

#### Data Processing
- `shuffleArray(array)` - Shuffle array using Fisher-Yates algorithm
- `validateAnswers(questions, answers)` - Validate answer format
- `generateQuizSummary(questions, answers, timeTaken)` - Generate comprehensive quiz statistics

#### Formatting
- `formatTime(seconds)` - Format seconds to MM:SS
- `calculateTimeTaken(startTime, endTime)` - Calculate time difference
- `getPerformanceGrade(score)` - Get grade and message based on score

#### Utilities
- `isLevelAccessible(studentLevel, requiredLevel)` - Check level access
- `generateQuizAttemptId()` - Generate unique attempt ID

## Usage Examples

### Basic Quiz Flow

```typescript
import {
  fetchQuestionsByLevelAndWeek,
  createQuizAttempt,
  saveQuizAnswers,
  updateQuizAttempt,
  calculateQuizScore,
  calculateStudentRanking,
} from '@/lib/quiz';

// 1. Fetch questions
const questions = await fetchQuestionsByLevelAndWeek('Beginner', 1);

// 2. Create quiz attempt
const attemptId = await createQuizAttempt(
  'student-id',
  'Beginner',
  1,
  'easy',
  questions.length
);

// 3. Process answers
const answers = [
  { questionId: 1, selectedAnswer: 'B', isCorrect: true, timeTaken: 8 },
  { questionId: 2, selectedAnswer: 'A', isCorrect: false, timeTaken: 12 },
];

// 4. Save answers
await saveQuizAnswers(attemptId, answers);

// 5. Calculate and save results
const scoreResult = calculateQuizScore(questions, answers);
await updateQuizAttempt(
  attemptId,
  scoreResult.correctAnswers,
  scoreResult.score,
  20 // total time spent
);

// 6. Get ranking
const ranking = await calculateStudentRanking(
  'student-id',
  'Beginner',
  1,
  'easy'
);
```

### Leaderboard Example

```typescript
import { getQuizLeaderboard, getLevelLeaderboard } from '@/lib/quiz';

// Get quiz-specific leaderboard
const quizLeaderboard = await getQuizLeaderboard('Beginner', 1, 'easy', 10);

// Get overall level leaderboard
const levelLeaderboard = await getLevelLeaderboard('Beginner', 10);
```

### Validation Example

```typescript
import { validateQuizConfig, validateAnswers } from '@/lib/quiz';

// Validate quiz configuration
const configValidation = validateQuizConfig('Beginner', 1, 'easy');
if (!configValidation.isValid) {
  console.error('Invalid config:', configValidation.errors);
}

// Validate answers
const answerValidation = validateAnswers(questions, answers);
if (!answerValidation.isValid) {
  console.error('Invalid answers:', answerValidation.errors);
}
```

## Database Schema

The functions work with these database tables:

### `math_questions`
- `id` - Question ID
- `level` - Difficulty level name
- `level_no` - Numeric level
- `week_no` - Week number
- `question` - Question text
- `option_a`, `option_b`, `option_c`, `option_d` - Answer options
- `correct_answer` - Correct answer (A, B, C, or D)
- `points` - Points awarded for correct answer

### `quiz_attempts`
- `id` - Attempt ID
- `student_id` - Student ID
- `level` - Level name
- `week_no` - Week number
- `difficulty` - Difficulty setting
- `total_questions` - Number of questions
- `correct_answers` - Number correct
- `score` - Percentage score
- `time_spent` - Total time in seconds
- `completed_at` - Completion timestamp

### `quiz_answers`
- `id` - Answer ID
- `attempt_id` - Related attempt
- `question_id` - Related question
- `selected_answer` - Student's answer
- `is_correct` - Whether answer was correct
- `time_taken` - Time spent on question

### `students`
- `id` - Student ID
- `fullName` - Student name
- `level` - Current level
- Other student fields...

## Error Handling

All functions include comprehensive error handling:

- Database connection errors
- Invalid parameters
- Missing data
- Validation failures

Errors are thrown with descriptive messages for easy debugging.

## Performance Considerations

- Batch operations for multiple answers
- Optimized queries with proper indexing
- Efficient ranking calculations
- Caching-friendly data structures

## Testing

Run validation tests:

```bash
# If you have tsx installed
npx tsx src/lib/quiz/validate.ts

# Or run the validation function programmatically
import { runValidation } from '@/lib/quiz/validate';
runValidation();
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **3.1**: Quiz question fetching and display ✅
- **4.1**: Quiz results calculation and display ✅
- **4.3**: Student ranking calculations ✅
- **6.3**: Performance tracking and leaderboards ✅

## Next Steps

After implementing this data access layer, you can:

1. Create React hooks that use these functions
2. Build quiz UI components
3. Implement real-time features with Supabase subscriptions
4. Add caching with React Query
5. Create admin interfaces for quiz management