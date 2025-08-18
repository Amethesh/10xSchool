'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('Quiz Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/student/levels';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="pixel-panel p-6 sm:p-8 text-center max-w-md w-full">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
            
            <h2 className="pixel-font text-lg sm:text-xl text-white mb-4">
              Oops! Something went wrong
            </h2>
            
            <div className="pixel-font text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
              The quiz encountered an unexpected error. Don't worry - your progress is safe!
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="pixel-font text-xs text-cyan-400 cursor-pointer mb-2">
                  Technical Details
                </summary>
                <div className="pixel-panel-inner p-3 text-xs text-gray-300 font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="pixel-button w-full flex items-center justify-center space-x-2"
                aria-label="Try again"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>TRY AGAIN</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="pixel-button-secondary w-full flex items-center justify-center space-x-2"
                aria-label="Go back to level selection"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>GO TO LEVELS</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Quiz error:', error);
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

// Specialized error boundary for quiz components
export function QuizErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log quiz-specific error information
    console.error('Quiz component error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Could send to error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError} showDetails={process.env.NODE_ENV === 'development'}>
      {children}
    </ErrorBoundary>
  );
}