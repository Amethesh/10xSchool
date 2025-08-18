// hooks/useQuizTimer.ts (Final, Robust Version)
'use-client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseQuizTimerProps {
  timeLimit: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function useQuizTimer({ timeLimit, onTimeUp, isActive }: UseQuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(0);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const resetTimer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setTimeRemaining(timeLimit);
    setIsPaused(false);
    endTimeRef.current = Date.now() + timeLimit * 1000;
    lastSecondRef.current = timeLimit;
  }, [timeLimit]);

  const pauseTimer = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      endTimeRef.current = endTimeRef.current - Date.now();
    }
  }, [isActive, isPaused]);

  const resumeTimer = useCallback(() => {
    if (isActive && isPaused) {
      endTimeRef.current = Date.now() + endTimeRef.current;
      setIsPaused(false);
    }
  }, [isActive, isPaused]);

  // === THIS IS THE CRITICAL FIX ===
  // This effect runs ONLY when `isActive` changes.
  // When the quiz tells the timer to become active, we reset it.
  // This ensures the timer starts fresh for the first question AND every subsequent question.
  useEffect(() => {
    if (isActive) {
      resetTimer();
    }
  }, [isActive, resetTimer]);
  // Note: We depend on resetTimer, which depends on timeLimit, so this also correctly handles difficulty changes.


  // This effect handles the animation loop. It runs when active status or pause status changes.
  useEffect(() => {
    const animate = () => {
      const remainingMillis = endTimeRef.current - Date.now();
      const remainingSeconds = Math.ceil(remainingMillis / 1000);

      if (remainingSeconds < lastSecondRef.current) {
        setTimeRemaining(Math.max(0, remainingSeconds));
        lastSecondRef.current = remainingSeconds;
      }

      if (remainingMillis > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeRemaining(0);
        onTimeUpRef.current();
      }
    };

    // We only start the animation if active AND not paused.
    // The reset is handled by the effect above.
    if (isActive && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Cleanup function to stop the animation frame loop
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isPaused]); // This effect now only cares about running/stopping the loop

  const progress = timeLimit > 0 ? ((timeLimit - timeRemaining) / timeLimit) * 100 : 0;

  return {
    timeRemaining,
    progress,
    isTimeUp: timeRemaining <= 0,
    pauseTimer,
    resumeTimer,
    isPaused,
  };
}