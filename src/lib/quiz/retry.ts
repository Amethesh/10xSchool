/**
 * Retry utility with exponential backoff for quiz operations
 */

import { QuizError, QuizErrorType, RetryConfig, RETRY_CONFIGS, categorizeError } from './errors';

export interface RetryOptions {
  config?: RetryConfig;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = options.config || RETRY_CONFIGS[QuizErrorType.UNKNOWN_ERROR];
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const quizError = categorizeError(lastError);
      
      // Check if we should retry this error
      const shouldRetry = options.shouldRetry 
        ? options.shouldRetry(lastError, attempt)
        : quizError.retryable && attempt < config.maxAttempts;

      if (!shouldRetry) {
        throw quizError;
      }

      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, lastError);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      await sleep(jitteredDelay);
    }
  }

  throw categorizeError(lastError!);
}

/**
 * Retry specifically for network operations
 */
export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  return withRetry(fn, {
    config: RETRY_CONFIGS[QuizErrorType.NETWORK_ERROR],
    onRetry,
    shouldRetry: (error, attempt) => {
      const quizError = categorizeError(error);
      return quizError.type === QuizErrorType.NETWORK_ERROR && 
             attempt < RETRY_CONFIGS[QuizErrorType.NETWORK_ERROR].maxAttempts;
    },
  });
}

/**
 * Retry specifically for database operations
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  return withRetry(fn, {
    config: RETRY_CONFIGS[QuizErrorType.DATABASE_ERROR],
    onRetry,
    shouldRetry: (error, attempt) => {
      const quizError = categorizeError(error);
      return quizError.type === QuizErrorType.DATABASE_ERROR && 
             attempt < RETRY_CONFIGS[QuizErrorType.DATABASE_ERROR].maxAttempts;
    },
  });
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw QuizError.network('Service temporarily unavailable. Please try again later.');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Global circuit breaker instances for different services
 */
export const databaseCircuitBreaker = new CircuitBreaker(3, 30000); // 30 seconds
export const networkCircuitBreaker = new CircuitBreaker(5, 60000); // 1 minute

/**
 * Wrapper for database operations with circuit breaker
 */
export async function withDatabaseCircuitBreaker<T>(
  fn: () => Promise<T>
): Promise<T> {
  return databaseCircuitBreaker.execute(fn);
}

/**
 * Wrapper for network operations with circuit breaker
 */
export async function withNetworkCircuitBreaker<T>(
  fn: () => Promise<T>
): Promise<T> {
  return networkCircuitBreaker.execute(fn);
}