# Quiz System Test Suite

This directory contains comprehensive tests for the student quiz system, covering all major functionality and requirements.

## Test Coverage

### Unit Tests

#### 1. Timer Functionality (`src/hooks/__tests__/useQuizTimer.test.ts`)
- Basic timer countdown functionality
- Timer controls (pause, resume, reset)
- Progress calculation
- Error handling and timer drift detection
- Page visibility handling
- Requirements validation (3.2, 3.3, 3.4)

#### 2. Quiz Manager (`src/hooks/__tests__/useQuizManager.test.ts`)
- Quiz initialization and state management
- Answer selection and progression
- Question navigation
- Time up handling
- Quiz completion and results calculation
- Requirements validation (3.1, 3.5, 3.6)

#### 3. Quiz Results (`src/hooks/__tests__/useQuizResults.test.ts`)
- Score calculation and display
- Performance insights generation
- Historical comparison
- Requirements validation (4.1, 4.2, 6.1, 6.2)

#### 4. Level Access System (`src/hooks/__tests__/use-level-access.test.ts`)
- Level access checking
- Access request creation and management
- Permission validation
- Requirements validation (1.3, 1.4, 1.5, 5.1, 5.2, 5.3)

#### 5. Quiz Data Access (`src/lib/quiz/__tests__/`)
- Question fetching by level and week
- Score calculations
- Answer validation
- Database operations
- Error handling

#### 6. Level Access Utils (`src/lib/quiz/__tests__/level-access.test.ts`)
- Level validation and hierarchy
- Access request validation
- Level progression logic

### Component Tests

#### 1. Difficulty Modal (`src/components/quiz/__tests__/DifficultyModal.test.tsx`)
- Modal rendering and interaction
- Difficulty selection
- Keyboard navigation and accessibility
- Focus management
- Requirements validation (2.1, 2.2, 2.3, 2.4)

### Integration Tests

#### 1. Quiz Flow (`src/components/quiz/__tests__/QuizFlow.integration.test.tsx`)
- Complete quiz flow from start to finish
- Mixed correct/incorrect answers
- Timer expiration handling
- Quiz controls (pause, resume, restart, exit)
- Error handling (initialization, save errors)
- Requirements validation (3.1, 3.2, 3.3, 4.1)

### End-to-End Tests

#### 1. Complete Quiz Experience (`src/__tests__/quiz-e2e.test.tsx`)
- Full user journey from level selection to results
- Level access control
- Difficulty selection and quiz taking
- Results display and retry functionality
- Navigation between different states
- Requirements validation (all major requirements)

## Requirements Coverage

The test suite validates all specified requirements:

### Requirement 3.1 - Question Selection
- ✅ Tests verify questions are selected from chosen week and level

### Requirement 3.2 - Question Display
- ✅ Tests verify math problems with 4 multiple choice options

### Requirement 3.3 - Timer Functionality
- ✅ Tests verify countdown timer based on difficulty

### Requirement 3.4 - Timer Expiration
- ✅ Tests verify automatic progression when timer expires

### Requirement 3.5 - Answer Selection
- ✅ Tests verify immediate progression on answer selection

### Requirement 4.1 - Score Calculation
- ✅ Tests verify score calculation and display

### Requirement 5.1 - Access Requests
- ✅ Tests verify access request notifications to administrators

## Test Categories

### 1. Unit Tests
- Individual function and hook testing
- Isolated component behavior
- Business logic validation

### 2. Integration Tests
- Component interaction testing
- Data flow validation
- User workflow testing

### 3. End-to-End Tests
- Complete user journey testing
- Cross-component functionality
- Real-world usage scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/hooks/__tests__/useQuizTimer.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Setup

The test suite uses:
- **Vitest** for test runner
- **React Testing Library** for component testing
- **User Event** for user interaction simulation
- **MSW** for API mocking (where needed)
- **Fake Timers** for timer testing

## Notes

Some tests may require additional setup or mocking depending on the actual implementation details. The test files provide comprehensive coverage of the quiz system functionality and serve as both validation and documentation of the expected behavior.