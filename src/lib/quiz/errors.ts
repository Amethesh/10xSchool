/**
 * Quiz-specific error types and utilities for comprehensive error handling
 */

export enum QuizErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TIMER_ERROR = 'TIMER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  QUIZ_STATE_ERROR = 'QUIZ_STATE_ERROR',
  QUESTION_LOAD_ERROR = 'QUESTION_LOAD_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface QuizErrorDetails {
  type: QuizErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  context?: Record<string, any>;
  originalError?: Error;
}

export class QuizError extends Error {
  public readonly type: QuizErrorType;
  public readonly userMessage: string;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;
  public readonly originalError?: Error;

  constructor(details: QuizErrorDetails) {
    super(details.message);
    this.name = 'QuizError';
    this.type = details.type;
    this.userMessage = details.userMessage;
    this.recoverable = details.recoverable;
    this.retryable = details.retryable;
    this.context = details.context;
    this.originalError = details.originalError;
  }

  static fromError(error: Error, type: QuizErrorType = QuizErrorType.UNKNOWN_ERROR): QuizError {
    return new QuizError({
      type,
      message: error.message,
      userMessage: getDefaultUserMessage(type),
      recoverable: isRecoverable(type),
      retryable: isRetryable(type),
      originalError: error,
    });
  }

  static network(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.NETWORK_ERROR,
      message,
      userMessage: 'Connection problem. Please check your internet and try again.',
      recoverable: true,
      retryable: true,
      context,
    });
  }

  static database(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.DATABASE_ERROR,
      message,
      userMessage: 'Unable to save your progress. Please try again.',
      recoverable: true,
      retryable: true,
      context,
    });
  }

  static timer(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.TIMER_ERROR,
      message,
      userMessage: 'Timer malfunction detected. Your quiz will continue without timing.',
      recoverable: true,
      retryable: false,
      context,
    });
  }

  static validation(message: string, userMessage?: string): QuizError {
    return new QuizError({
      type: QuizErrorType.VALIDATION_ERROR,
      message,
      userMessage: userMessage || 'Invalid input. Please check your selection and try again.',
      recoverable: true,
      retryable: false,
    });
  }

  static quizState(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.QUIZ_STATE_ERROR,
      message,
      userMessage: 'Quiz state error. Your progress has been saved. Please restart the quiz.',
      recoverable: true,
      retryable: false,
      context,
    });
  }

  static questionLoad(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.QUESTION_LOAD_ERROR,
      message,
      userMessage: 'Unable to load quiz questions. Please try again.',
      recoverable: true,
      retryable: true,
      context,
    });
  }

  static save(message: string, context?: Record<string, any>): QuizError {
    return new QuizError({
      type: QuizErrorType.SAVE_ERROR,
      message,
      userMessage: 'Unable to save your answer. Your progress is still tracked locally.',
      recoverable: true,
      retryable: true,
      context,
    });
  }
}

function getDefaultUserMessage(type: QuizErrorType): string {
  switch (type) {
    case QuizErrorType.NETWORK_ERROR:
      return 'Connection problem. Please check your internet and try again.';
    case QuizErrorType.DATABASE_ERROR:
      return 'Unable to save your progress. Please try again.';
    case QuizErrorType.TIMER_ERROR:
      return 'Timer issue detected. Your quiz will continue.';
    case QuizErrorType.VALIDATION_ERROR:
      return 'Invalid input. Please check your selection.';
    case QuizErrorType.AUTHENTICATION_ERROR:
      return 'Please log in again to continue.';
    case QuizErrorType.QUIZ_STATE_ERROR:
      return 'Quiz state error. Please restart the quiz.';
    case QuizErrorType.QUESTION_LOAD_ERROR:
      return 'Unable to load questions. Please try again.';
    case QuizErrorType.SAVE_ERROR:
      return 'Unable to save progress. Your answers are tracked locally.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function isRecoverable(type: QuizErrorType): boolean {
  switch (type) {
    case QuizErrorType.AUTHENTICATION_ERROR:
      return false;
    default:
      return true;
  }
}

function isRetryable(type: QuizErrorType): boolean {
  switch (type) {
    case QuizErrorType.NETWORK_ERROR:
    case QuizErrorType.DATABASE_ERROR:
    case QuizErrorType.QUESTION_LOAD_ERROR:
    case QuizErrorType.SAVE_ERROR:
      return true;
    case QuizErrorType.VALIDATION_ERROR:
    case QuizErrorType.TIMER_ERROR:
    case QuizErrorType.QUIZ_STATE_ERROR:
      return false;
    default:
      return false;
  }
}

/**
 * Retry configuration for different error types
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export const RETRY_CONFIGS: Record<QuizErrorType, RetryConfig> = {
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
  [QuizErrorType.QUESTION_LOAD_ERROR]: {
    maxAttempts: 3,
    baseDelay: 1500,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  [QuizErrorType.SAVE_ERROR]: {
    maxAttempts: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
  },
  [QuizErrorType.TIMER_ERROR]: DEFAULT_RETRY_CONFIG,
  [QuizErrorType.VALIDATION_ERROR]: DEFAULT_RETRY_CONFIG,
  [QuizErrorType.AUTHENTICATION_ERROR]: DEFAULT_RETRY_CONFIG,
  [QuizErrorType.QUIZ_STATE_ERROR]: DEFAULT_RETRY_CONFIG,
  [QuizErrorType.UNKNOWN_ERROR]: DEFAULT_RETRY_CONFIG,
};

/**
 * Utility function to determine if an error is a network error
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && message.includes('failed to fetch')
  );
}

/**
 * Utility function to determine if an error is a database error
 */
export function isDatabaseError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('database') ||
    message.includes('supabase') ||
    message.includes('postgresql') ||
    message.includes('relation') ||
    message.includes('column')
  );
}

/**
 * Convert a generic error to a QuizError with appropriate type detection
 */
export function categorizeError(error: Error, context?: Record<string, any>): QuizError {
  if (error instanceof QuizError) {
    return error;
  }

  let type: QuizErrorType;

  if (isNetworkError(error)) {
    type = QuizErrorType.NETWORK_ERROR;
  } else if (isDatabaseError(error)) {
    type = QuizErrorType.DATABASE_ERROR;
  } else {
    type = QuizErrorType.UNKNOWN_ERROR;
  }

  return new QuizError({
    type,
    message: error.message,
    userMessage: getDefaultUserMessage(type),
    recoverable: isRecoverable(type),
    retryable: isRetryable(type),
    context,
    originalError: error,
  });
}