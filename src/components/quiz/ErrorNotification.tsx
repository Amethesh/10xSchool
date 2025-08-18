'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { QuizError, QuizErrorType } from '@/lib/quiz/errors';

interface ErrorNotificationProps {
  error: QuizError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function ErrorNotification({
  error,
  onRetry,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show/hide notification based on error
  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide && error.type !== QuizErrorType.NETWORK_ERROR) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onDismiss?.();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  const getErrorIcon = () => {
    if (!isOnline || error?.type === QuizErrorType.NETWORK_ERROR) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  const getErrorColor = () => {
    switch (error?.type) {
      case QuizErrorType.NETWORK_ERROR:
        return 'border-red-400 bg-red-900/20';
      case QuizErrorType.TIMER_ERROR:
        return 'border-yellow-400 bg-yellow-900/20';
      case QuizErrorType.SAVE_ERROR:
        return 'border-orange-400 bg-orange-900/20';
      default:
        return 'border-red-400 bg-red-900/20';
    }
  };

  if (!error || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div 
        className={`pixel-panel p-4 max-w-md w-full ${getErrorColor()} animate-in slide-in-from-top-2 duration-300`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getErrorIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="pixel-font text-xs sm:text-sm text-white mb-1">
              {error.userMessage}
            </div>
            
            {!isOnline && (
              <div className="pixel-font text-xs text-gray-400 mb-2">
                You appear to be offline. Check your connection.
              </div>
            )}
            
            {error.retryable && (
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={handleRetry}
                  className="pixel-button-small flex items-center space-x-1"
                  disabled={!isOnline && error.type === QuizErrorType.NETWORK_ERROR}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>RETRY</span>
                </button>
                
                {isOnline && error.type === QuizErrorType.NETWORK_ERROR && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <Wifi className="w-3 h-3" />
                    <span className="pixel-font text-xs">Back online</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing error notifications
export function useErrorNotification() {
  const [error, setError] = useState<QuizError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const showError = (error: QuizError | Error) => {
    const quizError = error instanceof QuizError ? error : QuizError.fromError(error);
    setError(quizError);
    setRetryCount(0);
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    // Don't clear error immediately - let the retry operation handle it
  };

  return {
    error,
    retryCount,
    showError,
    clearError,
    retry,
  };
}

// Specialized notification for offline status
export function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    // Check initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div 
        className={`pixel-panel p-3 ${
          isOnline 
            ? 'border-green-400 bg-green-900/20' 
            : 'border-red-400 bg-red-900/20'
        } animate-in slide-in-from-bottom-2 duration-300`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="pixel-font text-xs sm:text-sm text-white">
            {isOnline ? 'Back online!' : 'You are offline'}
          </span>
        </div>
      </div>
    </div>
  );
}