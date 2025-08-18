"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getStudentQuizAttempts,
  calculateStudentRanking,
} from "@/lib/quiz/data-access";
import { QuizResults } from "@/types/types";
import { getStudentQuizHistory } from "@/lib/quiz/data-access-utils";

interface PerformanceMetrics {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  averageTimePerQuiz: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  streakCount: number;
  accuracyRate: number;
  speedScore: number; // Questions per minute
}

interface LevelProgress {
  level: string;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number;
  lastAttempt: string;
}

interface WeeklyProgress {
  weekNo: number;
  level: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  improvement: number; // Percentage improvement from first to last attempt
  timeSpent: number;
}

interface PerformanceComparison {
  currentAttempt: {
    score: number;
    timeSpent: number;
    accuracy: number;
    speed: number;
  };
  previousAttempt?: {
    score: number;
    timeSpent: number;
    accuracy: number;
    speed: number;
  };
  improvement: {
    scoreChange: number;
    timeChange: number;
    accuracyChange: number;
    speedChange: number;
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    icon: string;
  }>;
}

export function usePerformanceTracking(studentId: string) {
  const queryClient = useQueryClient();

  // Get comprehensive quiz history
  const historyQuery = useQuery({
    queryKey: ['performance-history', studentId],
    queryFn: () => getStudentQuizHistory(studentId, 50), // Get more history for better analytics
    enabled: !!studentId,
    staleTime: 60000, // 1 minute
  });

  // Calculate performance metrics
  const calculateMetrics = (history: any[]): PerformanceMetrics => {
    if (!history || history.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalTimeSpent: 0,
        averageTimePerQuiz: 0,
        improvementTrend: 'stable',
        streakCount: 0,
        accuracyRate: 0,
        speedScore: 0,
      };
    }

    const scores = history.map(h => h.score);
    const totalQuizzes = history.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalQuizzes;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const totalTimeSpent = history.reduce((sum, h) => sum + h.timeSpent, 0);
    const averageTimePerQuiz = totalTimeSpent / totalQuizzes;

    // Calculate improvement trend (compare first half vs second half)
    const midPoint = Math.floor(totalQuizzes / 2);
    const firstHalfAvg = history.slice(midPoint).reduce((sum, h) => sum + h.score, 0) / (totalQuizzes - midPoint);
    const secondHalfAvg = history.slice(0, midPoint).reduce((sum, h) => sum + h.score, 0) / midPoint;
    
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (totalQuizzes >= 4) {
      const improvement = secondHalfAvg - firstHalfAvg;
      if (improvement > 5) improvementTrend = 'improving';
      else if (improvement < -5) improvementTrend = 'declining';
    }

    // Calculate current streak (consecutive scores above average)
    let streakCount = 0;
    for (const attempt of history) {
      if (attempt.score >= averageScore) {
        streakCount++;
      } else {
        break;
      }
    }

    // Calculate accuracy rate (average correct answers percentage)
    const accuracyRate = history.reduce((sum, h) => sum + (h.correctAnswers / h.totalQuestions * 100), 0) / totalQuizzes;

    // Calculate speed score (questions per minute)
    const totalQuestions = history.reduce((sum, h) => sum + h.totalQuestions, 0);
    const totalMinutes = totalTimeSpent / 60;
    const speedScore = totalMinutes > 0 ? totalQuestions / totalMinutes : 0;

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      worstScore,
      totalTimeSpent,
      averageTimePerQuiz: Math.round(averageTimePerQuiz),
      improvementTrend,
      streakCount,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      speedScore: Math.round(speedScore * 100) / 100,
    };
  };

  // Calculate level-wise progress
  const calculateLevelProgress = (history: any[]): LevelProgress[] => {
    if (!history || history.length === 0) return [];

    const levelMap = new Map<string, any[]>();
    
    // Group attempts by level
    history.forEach(attempt => {
      if (!levelMap.has(attempt.level)) {
        levelMap.set(attempt.level, []);
      }
      levelMap.get(attempt.level)!.push(attempt);
    });

    return Array.from(levelMap.entries()).map(([level, attempts]) => {
      const scores = attempts.map(a => a.score);
      const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
      
      return {
        level,
        quizzesCompleted: attempts.length,
        averageScore: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100,
        bestScore: Math.max(...scores),
        timeSpent: totalTime,
        lastAttempt: attempts[0].completedAt, // Most recent (history is sorted desc)
      };
    }).sort((a, b) => new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime());
  };

  // Calculate weekly progress
  const calculateWeeklyProgress = (history: any[]): WeeklyProgress[] => {
    if (!history || history.length === 0) return [];

    const weekMap = new Map<string, any[]>();
    
    // Group attempts by level + week
    history.forEach(attempt => {
      const key = `${attempt.level}-${attempt.weekNo}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, []);
      }
      weekMap.get(key)!.push(attempt);
    });

    return Array.from(weekMap.entries()).map(([key, attempts]) => {
      const [level, weekNoStr] = key.split('-');
      const weekNo = parseInt(weekNoStr);
      const scores = attempts.map(a => a.score);
      const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
      
      // Calculate improvement (first vs last attempt)
      const sortedAttempts = attempts.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
      const firstScore = sortedAttempts[0]?.score || 0;
      const lastScore = sortedAttempts[sortedAttempts.length - 1]?.score || 0;
      const improvement = attempts.length > 1 ? lastScore - firstScore : 0;
      
      return {
        weekNo,
        level,
        attempts: attempts.length,
        bestScore: Math.max(...scores),
        averageScore: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100,
        improvement: Math.round(improvement * 100) / 100,
        timeSpent: totalTime,
      };
    }).sort((a, b) => {
      // Sort by level first, then by week
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return a.weekNo - b.weekNo;
    });
  };

  // Compare two quiz attempts
  const compareAttempts = (
    current: QuizResults,
    previous?: QuizResults
  ): PerformanceComparison => {
    const currentMetrics = {
      score: current.score,
      timeSpent: current.timeSpent,
      accuracy: (current.correctAnswers / current.totalQuestions) * 100,
      speed: current.totalQuestions / (current.timeSpent / 60), // questions per minute
    };

    const previousMetrics = previous ? {
      score: previous.score,
      timeSpent: previous.timeSpent,
      accuracy: (previous.correctAnswers / previous.totalQuestions) * 100,
      speed: previous.totalQuestions / (previous.timeSpent / 60),
    } : undefined;

    const improvement = previousMetrics ? {
      scoreChange: currentMetrics.score - previousMetrics.score,
      timeChange: currentMetrics.timeSpent - previousMetrics.timeSpent,
      accuracyChange: currentMetrics.accuracy - previousMetrics.accuracy,
      speedChange: currentMetrics.speed - previousMetrics.speed,
    } : {
      scoreChange: 0,
      timeChange: 0,
      accuracyChange: 0,
      speedChange: 0,
    };

    // Generate insights
    const insights = [];
    
    if (previousMetrics) {
      // Score insights
      if (improvement.scoreChange > 10) {
        insights.push({
          type: 'positive' as const,
          message: `Great improvement! You scored ${improvement.scoreChange.toFixed(1)}% better than last time.`,
          icon: '📈'
        });
      } else if (improvement.scoreChange < -10) {
        insights.push({
          type: 'negative' as const,
          message: `Your score dropped by ${Math.abs(improvement.scoreChange).toFixed(1)}%. Keep practicing!`,
          icon: '📉'
        });
      }

      // Speed insights
      if (improvement.speedChange > 0.5) {
        insights.push({
          type: 'positive' as const,
          message: `You're getting faster! ${improvement.speedChange.toFixed(1)} more questions per minute.`,
          icon: '⚡'
        });
      } else if (improvement.speedChange < -0.5) {
        insights.push({
          type: 'neutral' as const,
          message: `Take your time to ensure accuracy. Speed will come with practice.`,
          icon: '🎯'
        });
      }

      // Accuracy insights
      if (improvement.accuracyChange > 5) {
        insights.push({
          type: 'positive' as const,
          message: `More accurate! Your accuracy improved by ${improvement.accuracyChange.toFixed(1)}%.`,
          icon: '🎯'
        });
      }
    } else {
      // First attempt insights
      if (currentMetrics.score >= 80) {
        insights.push({
          type: 'positive' as const,
          message: 'Excellent first attempt! You\'re off to a great start.',
          icon: '🌟'
        });
      } else if (currentMetrics.score >= 60) {
        insights.push({
          type: 'neutral' as const,
          message: 'Good first attempt! There\'s room for improvement.',
          icon: '👍'
        });
      } else {
        insights.push({
          type: 'neutral' as const,
          message: 'Keep practicing! Every attempt helps you improve.',
          icon: '💪'
        });
      }
    }

    return {
      currentAttempt: currentMetrics,
      previousAttempt: previousMetrics,
      improvement,
      insights,
    };
  };

  // Derived data
  const metrics = historyQuery.data ? calculateMetrics(historyQuery.data) : null;
  const levelProgress = historyQuery.data ? calculateLevelProgress(historyQuery.data) : [];
  const weeklyProgress = historyQuery.data ? calculateWeeklyProgress(historyQuery.data) : [];

  return {
    // Raw data
    history: historyQuery.data,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,

    // Calculated metrics
    metrics,
    levelProgress,
    weeklyProgress,

    // Utility functions
    compareAttempts,
    
    // Manual refresh
    refetch: historyQuery.refetch,
  };
}