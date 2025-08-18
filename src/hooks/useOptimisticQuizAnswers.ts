"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateQuizAttempt, saveQuizAnswers } from "@/lib/quiz/data-access";
import { QuizResults } from "@/types/types";

interface QuizAnswer {
  questionId: number;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeTaken: number | null;
}

interface OptimisticQuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  score: number;
  timeSpent: number;
}

/**
 * Hook for optimistic quiz answer updates and progress tracking
 */
export function useOptimisticQuizAnswers(
  attemptId: string,
  studentId: string,
  level: string,
  weekNo: number,
  difficulty: string
) {
  const queryClient = useQueryClient();
  
  // Mutation for saving individual answers optimistically
  const saveAnswerMutation = useMutation({
    mutationFn: async (answer: QuizAnswer) => {
      // Save to database
      await saveQuizAnswers(attemptId, [answer]);
      return answer;
    },
    
    onMutate: async (answer: QuizAnswer) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['quiz-progress', attemptId]
      });
      
      // Snapshot previous value
      const previousProgress = queryClient.getQueryData(['quiz-progress', attemptId]);
      
      // Optimistically update progress
      queryClient.setQueryData(['quiz-progress', attemptId], (old: OptimisticQuizState | undefined) => {
        if (!old) {
          return {
            currentQuestion: 0,
            answers: [answer],
            score: answer.isCorrect ? 1 : 0,
            timeSpent: answer.timeTaken || 0,
          };
        }
        
        const newAnswers = [...old.answers, answer];
        const newScore = newAnswers.filter(a => a.isCorrect).length;
        const newTimeSpent = old.timeSpent + (answer.timeTaken || 0);
        
        return {
          ...old,
          currentQuestion: old.currentQuestion + 1,
          answers: newAnswers,
          score: newScore,
          timeSpent: newTimeSpent,
        };
      });
      
      return { previousProgress };
    },
    
    onError: (err, answer, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(['quiz-progress', attemptId], context.previousProgress);
      }
    },
    
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: ['quiz-progress', attemptId]
      });
    },
  });
  
  // Mutation for completing the quiz
  const completeQuizMutation = useMutation({
    mutationFn: async (results: QuizResults) => {
      // Update the quiz attempt with final results
      await updateQuizAttempt(attemptId, {
        correct_answers: results.correctAnswers,
        score: results.score,
        time_spent: results.timeSpent,
        completed_at: results.completedAt.toISOString(),
      });
      
      return results;
    },
    
    onMutate: async (results: QuizResults) => {
      // Optimistically update related caches
      
      // Update student quiz attempts
      queryClient.setQueryData(
        ['student-quiz-attempts', studentId, 50],
        (oldData: any[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(attempt => 
            attempt.id === attemptId 
              ? {
                  ...attempt,
                  correct_answers: results.correctAnswers,
                  score: results.score,
                  time_spent: results.timeSpent,
                  completed_at: results.completedAt.toISOString(),
                }
              : attempt
          );
        }
      );
      
      // Update quiz progress to completed state
      queryClient.setQueryData(['quiz-progress', attemptId], {
        currentQuestion: results.totalQuestions,
        answers: results.answers,
        score: results.correctAnswers,
        timeSpent: results.timeSpent,
        completed: true,
      });
      
      return { results };
    },
    
    onSuccess: (results) => {
      // Invalidate ranking and leaderboard queries to get fresh data
      queryClient.invalidateQueries({
        queryKey: ['optimized-ranking', studentId, level, weekNo, difficulty]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['optimized-leaderboard', level, weekNo, difficulty]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['student-quiz-history', studentId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['performance-analytics', studentId]
      });
    },
    
    onError: (err, results, context) => {
      console.error('Failed to complete quiz:', err);
      
      // Rollback optimistic updates
      queryClient.invalidateQueries({
        queryKey: ['student-quiz-attempts', studentId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['quiz-progress', attemptId]
      });
    },
  });
  
  // Function to get current quiz progress from cache
  const getQuizProgress = (): OptimisticQuizState | undefined => {
    return queryClient.getQueryData(['quiz-progress', attemptId]);
  };
  
  // Function to initialize quiz progress
  const initializeQuizProgress = (totalQuestions: number) => {
    queryClient.setQueryData(['quiz-progress', attemptId], {
      currentQuestion: 0,
      answers: [],
      score: 0,
      timeSpent: 0,
      totalQuestions,
    });
  };
  
  // Function to update timer optimistically
  const updateTimeSpent = (additionalTime: number) => {
    queryClient.setQueryData(['quiz-progress', attemptId], (old: OptimisticQuizState | undefined) => {
      if (!old) return old;
      
      return {
        ...old,
        timeSpent: old.timeSpent + additionalTime,
      };
    });
  };
  
  return {
    // Mutations
    saveAnswer: saveAnswerMutation.mutate,
    completeQuiz: completeQuizMutation.mutate,
    
    // State
    isSavingAnswer: saveAnswerMutation.isPending,
    isCompletingQuiz: completeQuizMutation.isPending,
    
    // Errors
    saveAnswerError: saveAnswerMutation.error,
    completeQuizError: completeQuizMutation.error,
    
    // Utility functions
    getQuizProgress,
    initializeQuizProgress,
    updateTimeSpent,
    
    // Reset functions
    resetSaveAnswerError: saveAnswerMutation.reset,
    resetCompleteQuizError: completeQuizMutation.reset,
  };
}

/**
 * Hook for batch answer saving with optimistic updates
 */
export function useBatchAnswerSaving(attemptId: string) {
  const queryClient = useQueryClient();
  
  const batchSaveMutation = useMutation({
    mutationFn: async (answers: QuizAnswer[]) => {
      await saveQuizAnswers(attemptId, answers);
      return answers;
    },
    
    onMutate: async (answers: QuizAnswer[]) => {
      // Optimistically update all answers at once
      queryClient.setQueryData(['quiz-progress', attemptId], (old: OptimisticQuizState | undefined) => {
        if (!old) return old;
        
        const allAnswers = [...old.answers, ...answers];
        const totalScore = allAnswers.filter(a => a.isCorrect).length;
        const totalTime = allAnswers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
        
        return {
          ...old,
          answers: allAnswers,
          score: totalScore,
          timeSpent: totalTime,
          currentQuestion: allAnswers.length,
        };
      });
    },
    
    onError: () => {
      // Invalidate on error to refetch fresh state
      queryClient.invalidateQueries({
        queryKey: ['quiz-progress', attemptId]
      });
    },
  });
  
  return {
    batchSaveAnswers: batchSaveMutation.mutate,
    isBatchSaving: batchSaveMutation.isPending,
    batchSaveError: batchSaveMutation.error,
  };
}