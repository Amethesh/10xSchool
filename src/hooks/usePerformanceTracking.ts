"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudentQuizHistory } from "@/lib/quiz/data-access-utils";
import { HistoryEntry } from "@/components/result/PerformanceHistory";

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

export function usePerformanceTracking(studentId: string) {

  // Get comprehensive quiz history
  const historyQuery = useQuery({
    queryKey: ['performance-history', studentId],
    queryFn: () => getStudentQuizHistory(studentId, 50), // Get more history for better analytics
    enabled: !!studentId,
    staleTime: 60000, // 1 minute
  });

  // Calculate performance metrics
  const calculateMetrics = (history: HistoryEntry[]): PerformanceMetrics => {
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
  const calculateLevelProgress = (history: HistoryEntry[]): LevelProgress[] => {
    console.log("HISTORYYY", history)
    if (!history || history.length === 0) return [];

    const levelMap = new Map<string, any[]>();
    
    // Group attempts by level
    history.forEach(attempt => {
      if (!levelMap.has(attempt.levelName)) {
        levelMap.set(attempt.levelName, []);
      }
      levelMap.get(attempt.levelName)!.push(attempt);
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

  // Derived data
  const metrics = historyQuery.data ? calculateMetrics(historyQuery.data) : null;
  const levelProgress = historyQuery.data ? calculateLevelProgress(historyQuery.data) : [];

  return {
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,

    // Calculated metrics
    metrics,
    levelProgress,
    
    // Manual refresh
    refetch: historyQuery.refetch,
  };
}