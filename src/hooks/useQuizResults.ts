"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  updateQuizAttempt,
  saveQuizAnswers,
  calculateStudentRanking,
  getQuizLeaderboard,
} from "@/lib/quiz/data-access";
import { QuizResults, Question, Answer, StudentRanking } from "@/types/types";
import { calculateQuizScore, getStudentQuizHistory } from "@/lib/quiz/data-access-utils";

interface UseQuizResultsProps {
  studentId: string;
  levelId: number;
  weekNo: number;
  difficulty: string;
}

interface SaveQuizResultsParams {
  attemptId: string;
  questions: Question[];
  answers: Answer[];
  timeSpent: number;
}

export function useQuizResults({ 
  studentId, 
  levelId, 
  weekNo, 
  difficulty 
}: UseQuizResultsProps) {
  const queryClient = useQueryClient();

  // Mutation to save quiz results
  const saveResultsMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      questions, 
      answers, 
      timeSpent 
    }: SaveQuizResultsParams) => {
      // Calculate score
      const scoreData = calculateQuizScore(questions, answers);
      
      // Update quiz attempt with final results
      await updateQuizAttempt(
        attemptId,
        scoreData.correctAnswers,
        scoreData.score,
        timeSpent
      );

      // Save individual answers
      const answersToSave = answers.map(answer => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        timeTaken: answer.timeTaken,
      }));

      await saveQuizAnswers(attemptId, answersToSave);

      return {
        ...scoreData,
        timeSpent,
        attemptId,
      };
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['student-ranking', studentId, levelId, weekNo, difficulty]
      });
      queryClient.invalidateQueries({
        queryKey: ['quiz-leaderboard', levelId, weekNo, difficulty]
      });
      queryClient.invalidateQueries({
        queryKey: ['student-quiz-history', studentId]
      });
    },
  });

  // Query for student ranking
  const rankingQuery = useQuery<StudentRanking | null>({
    queryKey: ['student-ranking', studentId, levelId, weekNo, difficulty],
    queryFn: () => calculateStudentRanking(studentId, levelId, weekNo, difficulty),
    enabled: !!studentId && !!levelId && !!weekNo && !!difficulty,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });

  // Query for leaderboard
  const leaderboardQuery = useQuery({
    queryKey: ['quiz-leaderboard', levelId, weekNo, difficulty],
    queryFn: () => getQuizLeaderboard(levelId, weekNo, difficulty, 10),
    enabled: !!levelId && !!weekNo && !!difficulty,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });

  // Query for student's quiz history
  const historyQuery = useQuery({
    queryKey: ['student-quiz-history', studentId],
    queryFn: () => getStudentQuizHistory(studentId, 10),
    enabled: !!studentId,
    staleTime: 60000, // 1 minute
  });

  // Function to get performance insights
  const getPerformanceInsights = (results: QuizResults, history?: any[]) => {
    const insights = [];
    
    // Score-based insights
    if (results.score >= 90) {
      insights.push({
        type: 'excellent',
        message: 'Outstanding performance! You\'re mastering this level.',
        icon: '🏆'
      });
    } else if (results.score >= 70) {
      insights.push({
        type: 'good',
        message: 'Great job! You\'re doing well with this material.',
        icon: '⭐'
      });
    } else if (results.score >= 50) {
      insights.push({
        type: 'improvement',
        message: 'Good effort! Keep practicing to improve your score.',
        icon: '📈'
      });
    } else {
      insights.push({
        type: 'practice',
        message: 'Don\'t give up! More practice will help you improve.',
        icon: '💪'
      });
    }

    // Time-based insights
    const avgTimePerQuestion = results.timeSpent / results.totalQuestions;
    const timeLimit = results.difficulty.timeLimit;
    
    if (avgTimePerQuestion < timeLimit * 0.5) {
      insights.push({
        type: 'speed',
        message: 'Impressive speed! You answered questions quickly.',
        icon: '⚡'
      });
    } else if (avgTimePerQuestion > timeLimit * 0.9) {
      insights.push({
        type: 'time',
        message: 'Take your time, but try to work a bit faster next time.',
        icon: '⏰'
      });
    }

    // Historical comparison
    if (history && history.length > 1) {
      const previousScore = history[1]?.score || 0;
      const improvement = results.score - previousScore;
      
      if (improvement > 10) {
        insights.push({
          type: 'improvement',
          message: `Great improvement! You scored ${improvement}% better than last time.`,
          icon: '📊'
        });
      } else if (improvement < -10) {
        insights.push({
          type: 'review',
          message: 'Consider reviewing the material before your next attempt.',
          icon: '📚'
        });
      }
    }

    return insights;
  };

  return {
    // Mutations
    saveResults: saveResultsMutation.mutateAsync,
    isSaving: saveResultsMutation.isPending,
    saveError: saveResultsMutation.error,

    // Queries
    ranking: rankingQuery.data,
    isRankingLoading: rankingQuery.isLoading,
    rankingError: rankingQuery.error,

    leaderboard: leaderboardQuery.data,
    isLeaderboardLoading: leaderboardQuery.isLoading,
    leaderboardError: leaderboardQuery.error,

    history: historyQuery.data,
    isHistoryLoading: historyQuery.isLoading,
    historyError: historyQuery.error,

    // Utility functions
    getPerformanceInsights,

    // Manual refetch functions
    refetchRanking: rankingQuery.refetch,
    refetchLeaderboard: leaderboardQuery.refetch,
    refetchHistory: historyQuery.refetch,
  };
}