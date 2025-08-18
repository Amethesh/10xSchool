# Design Document

## Overview

The Student Quiz System is a Next.js 15 application with Supabase backend that provides timed math quizzes for students. The system uses React Query for state management, Tailwind CSS for styling, and follows a component-based architecture. Students progress through lessons organized by weeks and difficulty levels, with performance tracking and ranking features.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom pixel-art theme
- **UI Components**: Radix UI primitives with custom styling
- **Forms**: React Hook Form with Zod validation

### Application Structure
```
src/
├── app/
│   ├── student/
│   │   ├── levels/           # Level selection page
│   │   ├── quiz/             # Quiz taking interface
│   │   └── results/          # Results and rankings
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── quiz/                 # Quiz-specific components
│   └── student/              # Student-specific components
├── lib/
│   ├── supabase/            # Database client and utilities
│   ├── quiz/                # Quiz logic and utilities
│   └── utils.ts             # General utilities
└── types/                   # TypeScript type definitions
```

## Components and Interfaces

### Core Components

#### 1. LevelSelector Component
- **Purpose**: Display available lessons organized by difficulty levels
- **Props**: 
  - `levels: Level[]` - Array of available levels
  - `studentLevel: number` - Current student level for access control
- **State**: 
  - `selectedLevel: Level | null` - Currently selected level
  - `showDifficultyModal: boolean` - Modal visibility state

#### 2. DifficultyModal Component
- **Purpose**: Allow students to select quiz difficulty and timing
- **Props**:
  - `level: Level` - Selected level information
  - `onSelect: (difficulty: QuizDifficulty) => void` - Difficulty selection handler
  - `onClose: () => void` - Modal close handler

#### 3. QuizInterface Component
- **Purpose**: Main quiz taking interface with timer, questions, and lives system
- **Props**:
  - `questions: Question[]` - Array of quiz questions
  - `difficulty: QuizDifficulty` - Selected difficulty settings
  - `onComplete: (results: QuizResults) => void` - Quiz completion handler
- **State**:
  - `currentQuestionIndex: number` - Current question position
  - `answers: Answer[]` - Student's answers
  - `timeRemaining: number` - Countdown timer (must work correctly)
  - `quizStartTime: Date` - Quiz start timestamp
  - `livesRemaining: number` - Number of lives left (starts at 3)
  - `showAnswerFeedback: boolean` - Whether to show correct answer
  - `selectedAnswer: string | null` - Currently selected answer
  - `isGameOver: boolean` - Whether quiz ended due to no lives

#### 4. ResultsDisplay Component
- **Purpose**: Show quiz results and student ranking
- **Props**:
  - `results: QuizResults` - Quiz completion results
  - `ranking: StudentRanking` - Student's ranking information
  - `onRetry: () => void` - Retry quiz handler

### Data Interfaces

#### Question Interface (Based on math_questions table)
```typescript
interface Question {
  id: number;
  level_no: number;
  level: string;
  week_no: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
}
```

#### QuizDifficulty Interface
```typescript
interface QuizDifficulty {
  name: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds per question
  label: string;
}
```

#### QuizResults Interface
```typescript
interface QuizResults {
  studentId: string;
  level: string;
  weekNo: number;
  difficulty: QuizDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number; // total time in seconds
  answers: Answer[];
  completedAt: Date;
  livesUsed: number; // number of lives lost during quiz
  endReason: 'completed' | 'no_lives'; // how the quiz ended
}
```

#### Answer Interface
```typescript
interface Answer {
  questionId: number;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeTaken: number; // seconds spent on this question
  liveLost: boolean; // whether this answer caused a life to be lost
}
```

#### StudentRanking Interface
```typescript
interface StudentRanking {
  studentId: string;
  rank: number;
  totalStudents: number;
  percentile: number;
  score: number;
}
```

## Quiz Flow and Answer Feedback System

### Enhanced Quiz Flow
The quiz system implements an immediate feedback mechanism with a lives system:

1. **Question Display**: Show question with 4 multiple choice options and timer
2. **Answer Selection**: When student clicks an option, immediately show feedback
3. **Answer Feedback**: Display correct answer with visual indicators (green for correct, red for incorrect)
4. **Lives Management**: Deduct life for wrong answers or timeouts
5. **Immediate Progression**: Move to next question without delays or loading screens
6. **Game Over Check**: End quiz immediately when lives reach 0

### Timer System Requirements
- **Accurate Countdown**: Timer must count down correctly from difficulty time limit
- **Visual Progress**: Show both numeric countdown and progress bar
- **Auto-Submit**: Automatically submit when time expires (counts as wrong answer)
- **No Delays**: Timer should start immediately when question loads
- **Pause/Resume**: Support pause functionality without timer drift

### Answer Feedback System
- **Immediate Display**: Show correct answer as soon as student selects any option
- **Visual Indicators**: Use colors and icons to show correct/incorrect status
- **Brief Display**: Show feedback for 1-2 seconds before moving to next question
- **Consistent Timing**: Same feedback duration whether answer is right or wrong
- **No Loading States**: Eliminate any loading spinners or delays between questions

### Lives System Implementation
- **Initial Lives**: Start each quiz with exactly 3 lives
- **Life Loss Conditions**: 
  - Wrong answer selection
  - Timer expiration (no answer selected)
- **Life Preservation**: Correct answers do not affect lives
- **Visual Display**: Show remaining lives prominently in UI (hearts, numbers, etc.)
- **Game Over**: Immediately end quiz when lives = 0, show results

## Data Models

### Database Schema

#### Existing Tables (No Changes Required)

**students table** - Already exists with required fields:
- `id` (UUID, primary key, references auth.users)
- `fullName` (text)
- `level` (integer, current level)
- `totalScore` (bigint)
- `rank` (text)
- `email` (text)

**math_questions table** - Already exists with quiz questions:
- `id` (integer, primary key)
- `level_no` (integer)
- `level` (text)
- `question` (text)
- `option_a`, `option_b`, `option_c`, `option_d` (text)
- `correct_answer` (text)
- `points` (integer)
- `week_no` (integer)

#### New Tables Required

**quiz_attempts table** - Track individual quiz attempts:
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  level TEXT NOT NULL,
  week_no INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  lives_used INTEGER DEFAULT 0, -- number of lives lost
  end_reason TEXT DEFAULT 'completed' CHECK (end_reason IN ('completed', 'no_lives')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**quiz_answers table** - Track individual question answers:
```sql
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id),
  question_id INTEGER REFERENCES math_questions(id),
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- seconds for this question
  live_lost BOOLEAN DEFAULT FALSE, -- whether this answer caused a life to be lost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**level_access table** - Track level access permissions:
```sql
CREATE TABLE level_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  level TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(student_id, level)
);
```

**access_requests table** - Track level access requests:
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  level TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(student_id, level, status)
);
```

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Display user-friendly messages with retry options
- **Validation Errors**: Show inline validation messages for form inputs
- **Quiz Timeout**: Gracefully handle timer expiration and auto-submit
- **Authentication Errors**: Redirect to login with appropriate messaging

### Server-Side Error Handling
- **Database Connection**: Implement connection pooling and retry logic
- **Query Failures**: Log errors and return standardized error responses
- **Authentication**: Validate user sessions and permissions
- **Rate Limiting**: Prevent quiz abuse with attempt limits

### Error Recovery Strategies
- **Auto-save Progress**: Periodically save quiz progress to prevent data loss
- **Offline Support**: Cache questions for offline quiz taking
- **Graceful Degradation**: Provide basic functionality when features fail

## Testing Strategy

### Unit Testing
- **Component Testing**: Test individual React components with React Testing Library
- **Utility Functions**: Test quiz logic, scoring calculations, and data transformations
- **Custom Hooks**: Test React Query hooks and custom state management

### Integration Testing
- **API Routes**: Test Next.js API routes with mock database
- **Database Operations**: Test Supabase queries and mutations
- **Authentication Flow**: Test user login, session management, and permissions

### End-to-End Testing
- **Quiz Flow**: Test complete quiz taking experience from level selection to results
- **User Journey**: Test student registration, level progression, and ranking
- **Performance**: Test quiz timer accuracy and response times

### Performance Testing
- **Load Testing**: Test system performance with multiple concurrent users
- **Database Performance**: Optimize queries for large datasets
- **Client Performance**: Test component rendering and state updates

## Security Considerations

### Authentication & Authorization
- **Row Level Security**: Implement Supabase RLS policies for data access
- **Session Management**: Secure session handling with proper expiration
- **Role-Based Access**: Separate student and admin permissions

### Data Protection
- **Input Validation**: Validate all user inputs on client and server
- **SQL Injection Prevention**: Use parameterized queries and ORM
- **XSS Protection**: Sanitize user-generated content

### Quiz Integrity
- **Answer Validation**: Server-side answer checking to prevent tampering
- **Time Validation**: Server-side timer validation to prevent cheating
- **Attempt Limits**: Prevent excessive quiz attempts and gaming

## Performance Optimizations

### Client-Side Optimizations
- **Code Splitting**: Lazy load quiz components and routes
- **Caching**: Implement React Query caching for questions and results
- **Memoization**: Use React.memo and useMemo for expensive calculations

### Server-Side Optimizations
- **Database Indexing**: Index frequently queried columns (level, week_no, student_id)
- **Query Optimization**: Optimize complex ranking and statistics queries
- **Connection Pooling**: Efficient database connection management

### Real-time Features
- **Live Rankings**: Use Supabase real-time subscriptions for live leaderboards
- **Progress Tracking**: Real-time updates for quiz progress and completion