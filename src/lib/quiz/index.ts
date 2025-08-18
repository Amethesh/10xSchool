// Export all quiz data access functions
export {
  fetchQuestionsByLevelAndWeek,
  createQuizAttempt,
  updateQuizAttempt,
  saveQuizAnswer,
  saveQuizAnswers,
  getStudentQuizAttempts,
  getQuizAttemptWithAnswers,
  calculateStudentRanking,
  getQuizLeaderboard,
  getLevelLeaderboard,
  calculateQuizScore,
  checkAnswer,
  getStudentQuizHistory,
} from './data-access';

// Export all quiz utility functions
export {
  QUIZ_DIFFICULTIES,
  shuffleArray,
  validateQuizConfig,
  formatTime,
  calculateTimeTaken,
  generateQuizSummary,
  validateAnswers,
  getPerformanceGrade,
  isLevelAccessible,
  generateQuizAttemptId,
} from './utils';

// Export error handling utilities
export {
  QuizError,
  QuizErrorType,
  categorizeError,
  isNetworkError,
  isDatabaseError,
  RETRY_CONFIGS,
  DEFAULT_RETRY_CONFIG,
} from './errors';

export {
  withRetry,
  withNetworkRetry,
  withDatabaseRetry,
  withDatabaseCircuitBreaker,
  withNetworkCircuitBreaker,
  CircuitBreaker,
  databaseCircuitBreaker,
  networkCircuitBreaker,
} from './retry';

// Re-export types for convenience
export type {
  Question,
  QuizDifficulty,
  QuizResults,
  StudentRanking,
  QuizAttempt,
  QuizAnswer,
  Answer,
  QuizState,
} from '@/types/types';