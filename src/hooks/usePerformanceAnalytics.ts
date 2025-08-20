"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudentQuizHistory } from "@/lib/quiz/data-access-utils";

interface PerformanceAnalytics {
  strengthsAndWeaknesses: {
    strongLevels: Array<{ level: string; averageScore: number; attempts: number }>;
    weakLevels: Array<{ level: string; averageScore: number; attempts: number }>;
    strongDifficulties: Array<{ difficulty: string; averageScore: number; attempts: number }>;
    weakDifficulties: Array<{ difficulty: string; averageScore: number; attempts: number }>;
  };
  timeAnalysis: {
    fastestQuizzes: Array<{ level: string; weekNo: number; timeSpent: number; score: number }>;
    slowestQuizzes: Array<{ level: string; weekNo: number; timeSpent: number; score: number }>;
    averageTimeByDifficulty: Array<{ difficulty: string; averageTime: number; attempts: number }>;
    timeEfficiency: number; // Score per minute
  };
  consistencyMetrics: {
    scoreVariance: number;
    consistencyRating: 'high' | 'medium' | 'low';
    mostConsistentLevel: string | null;
    leastConsistentLevel: string | null;
  };
  progressTrends: {
    overallTrend: 'improving' | 'declining' | 'stable';
    recentTrend: 'improving' | 'declining' | 'stable'; // Last 5 attempts
    longestStreak: { type: 'improving' | 'declining' | 'stable'; count: number };
    currentStreak: { type: 'improving' | 'declining' | 'stable'; count: number };
  };
  goalTracking: {
    targetScore: number;
    currentAverage: number;
    progressToTarget: number; // Percentage
    estimatedAttemptsToTarget: number;
    recommendations: string[];
  };
}

interface DetailedAttemptAnalysis {
  attemptId: string;
  performance: {
    score: number;
    accuracy: number;
    speed: number; // questions per minute
    timeEfficiency: number; // score per minute
  };
  comparison: {
    vsPersonalAverage: {
      scoreDiff: number;
      speedDiff: number;
      accuracyDiff: number;
    };
    vsLevelAverage: {
      scoreDiff: number;
      speedDiff: number;
      rank: number;
      percentile: number;
    };
  };
  insights: Array<{
    category: 'speed' | 'accuracy' | 'consistency' | 'improvement';
    type: 'strength' | 'weakness' | 'opportunity';
    message: string;
    actionable: boolean;
    suggestion?: string;
  }>;
}

export function usePerformanceAnalytics(studentId: string) {
  // Get comprehensive quiz history
  const historyQuery = useQuery({
    queryKey: ['performance-analytics', studentId],
    queryFn: () => getStudentQuizHistory(studentId, 100), // Get extensive history
    enabled: !!studentId,
    staleTime: 300000, // 5 minutes
  });

  // Analyze strengths and weaknesses
  const analyzeStrengthsAndWeaknesses = (history: any[]) => {
    if (!history || history.length === 0) {
      return {
        strongLevels: [],
        weakLevels: [],
        strongDifficulties: [],
        weakDifficulties: [],
      };
    }

    // Group by level
    const levelStats = new Map<string, { scores: number[]; attempts: number }>();
    const difficultyStats = new Map<string, { scores: number[]; attempts: number }>();

    history.forEach(attempt => {
      // Level stats
      if (!levelStats.has(attempt.level)) {
        levelStats.set(attempt.level, { scores: [], attempts: 0 });
      }
      const levelStat = levelStats.get(attempt.level)!;
      levelStat.scores.push(attempt.score);
      levelStat.attempts++;

      // Difficulty stats
      if (!difficultyStats.has(attempt.difficulty)) {
        difficultyStats.set(attempt.difficulty, { scores: [], attempts: 0 });
      }
      const difficultyStat = difficultyStats.get(attempt.difficulty)!;
      difficultyStat.scores.push(attempt.score);
      difficultyStat.attempts++;
    });

    // Calculate averages and sort
    const levelAverages = Array.from(levelStats.entries())
      .map(([level, stats]) => ({
        level,
        averageScore: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length,
        attempts: stats.attempts,
      }))
      .filter(item => item.attempts >= 2); // Only include levels with multiple attempts

    const difficultyAverages = Array.from(difficultyStats.entries())
      .map(([difficulty, stats]) => ({
        difficulty,
        averageScore: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length,
        attempts: stats.attempts,
      }))
      .filter(item => item.attempts >= 2);

    return {
      strongLevels: levelAverages
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3),
      weakLevels: levelAverages
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3),
      strongDifficulties: difficultyAverages
        .sort((a, b) => b.averageScore - a.averageScore),
      weakDifficulties: difficultyAverages
        .sort((a, b) => a.averageScore - b.averageScore),
    };
  };

  // Analyze time patterns
  const analyzeTimePatterns = (history: any[]) => {
    if (!history || history.length === 0) {
      return {
        fastestQuizzes: [],
        slowestQuizzes: [],
        averageTimeByDifficulty: [],
        timeEfficiency: 0,
      };
    }

    // Sort by time spent
    const sortedByTime = [...history].sort((a, b) => a.timeSpent - b.timeSpent);
    
    // Group by difficulty for time analysis
    const difficultyTimeStats = new Map<string, { times: number[]; attempts: number }>();
    
    history.forEach(attempt => {
      if (!difficultyTimeStats.has(attempt.difficulty)) {
        difficultyTimeStats.set(attempt.difficulty, { times: [], attempts: 0 });
      }
      const stat = difficultyTimeStats.get(attempt.difficulty)!;
      stat.times.push(attempt.timeSpent);
      stat.attempts++;
    });

    const averageTimeByDifficulty = Array.from(difficultyTimeStats.entries())
      .map(([difficulty, stats]) => ({
        difficulty,
        averageTime: Math.round(stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length),
        attempts: stats.attempts,
      }));

    // Calculate overall time efficiency (score per minute)
    const totalScore = history.reduce((sum, h) => sum + h.score, 0);
    const totalMinutes = history.reduce((sum, h) => sum + h.timeSpent, 0) / 60;
    const timeEfficiency = totalMinutes > 0 ? totalScore / totalMinutes : 0;

    return {
      fastestQuizzes: sortedByTime.slice(0, 5).map(h => ({
        level: h.level,
        weekNo: h.weekNo,
        timeSpent: h.timeSpent,
        score: h.score,
      })),
      slowestQuizzes: sortedByTime.slice(-5).reverse().map(h => ({
        level: h.level,
        weekNo: h.weekNo,
        timeSpent: h.timeSpent,
        score: h.score,
      })),
      averageTimeByDifficulty,
      timeEfficiency: Math.round(timeEfficiency * 100) / 100,
    };
  };

  // Analyze consistency
  const analyzeConsistency = (history: any[]) => {
    if (!history || history.length < 3) {
      return {
        scoreVariance: 0,
        consistencyRating: 'low' as const,
        mostConsistentLevel: null,
        leastConsistentLevel: null,
      };
    }

    const scores = history.map(h => h.score);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Determine consistency rating
    let consistencyRating: 'high' | 'medium' | 'low';
    if (standardDeviation < 10) consistencyRating = 'high';
    else if (standardDeviation < 20) consistencyRating = 'medium';
    else consistencyRating = 'low';

    // Analyze consistency by level
    const levelConsistency = new Map<string, number>();
    const levelGroups = new Map<string, number[]>();

    history.forEach(attempt => {
      if (!levelGroups.has(attempt.level)) {
        levelGroups.set(attempt.level, []);
      }
      levelGroups.get(attempt.level)!.push(attempt.score);
    });

    levelGroups.forEach((scores, level) => {
      if (scores.length >= 3) {
        const levelMean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const levelVariance = scores.reduce((sum, s) => sum + Math.pow(s - levelMean, 2), 0) / scores.length;
        levelConsistency.set(level, Math.sqrt(levelVariance));
      }
    });

    const sortedLevelConsistency = Array.from(levelConsistency.entries())
      .sort((a, b) => a[1] - b[1]);

    return {
      scoreVariance: Math.round(variance * 100) / 100,
      consistencyRating,
      mostConsistentLevel: sortedLevelConsistency[0]?.[0] || null,
      leastConsistentLevel: sortedLevelConsistency[sortedLevelConsistency.length - 1]?.[0] || null,
    };
  };

  // Analyze progress trends
  const analyzeProgressTrends = (history: any[]) => {
    if (!history || history.length < 3) {
      return {
        overallTrend: 'stable' as const,
        recentTrend: 'stable' as const,
        longestStreak: { type: 'stable' as const, count: 0 },
        currentStreak: { type: 'stable' as const, count: 0 },
      };
    }

    // Sort by date (oldest first for trend analysis)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    // Calculate overall trend (first quarter vs last quarter)
    const quarterSize = Math.max(1, Math.floor(sortedHistory.length / 4));
    const firstQuarter = sortedHistory.slice(0, quarterSize);
    const lastQuarter = sortedHistory.slice(-quarterSize);

    const firstQuarterAvg = firstQuarter.reduce((sum, h) => sum + h.score, 0) / firstQuarter.length;
    const lastQuarterAvg = lastQuarter.reduce((sum, h) => sum + h.score, 0) / lastQuarter.length;

    let overallTrend: 'improving' | 'declining' | 'stable';
    const overallDiff = lastQuarterAvg - firstQuarterAvg;
    if (overallDiff > 5) overallTrend = 'improving';
    else if (overallDiff < -5) overallTrend = 'declining';
    else overallTrend = 'stable';

    // Calculate recent trend (last 5 attempts)
    const recentAttempts = sortedHistory.slice(-5);
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (recentAttempts.length >= 3) {
      const recentFirst = recentAttempts.slice(0, 2);
      const recentLast = recentAttempts.slice(-2);
      const recentFirstAvg = recentFirst.reduce((sum, h) => sum + h.score, 0) / recentFirst.length;
      const recentLastAvg = recentLast.reduce((sum, h) => sum + h.score, 0) / recentLast.length;
      const recentDiff = recentLastAvg - recentFirstAvg;
      
      if (recentDiff > 3) recentTrend = 'improving';
      else if (recentDiff < -3) recentTrend = 'declining';
    }

    // Calculate streaks
    let currentStreak = { type: 'stable' as const, count: 0 };
    let longestStreak = { type: 'stable' as const, count: 0 };
    
    // This is a simplified streak calculation
    // In a real implementation, you'd want more sophisticated streak detection
    
    return {
      overallTrend,
      recentTrend,
      longestStreak,
      currentStreak,
    };
  };

  // Generate goal tracking and recommendations
  const generateGoalTracking = (history: any[]) => {
    if (!history || history.length === 0) {
      return {
        targetScore: 85,
        currentAverage: 0,
        progressToTarget: 0,
        estimatedAttemptsToTarget: 0,
        recommendations: ['Start taking quizzes to track your progress!'],
      };
    }

    const currentAverage = history.reduce((sum, h) => sum + h.score, 0) / history.length;
    const targetScore = Math.max(85, currentAverage + 10); // Target 10 points above current or 85, whichever is higher
    const progressToTarget = Math.min(100, (currentAverage / targetScore) * 100);

    // Simple estimation based on recent improvement rate
    const recentAttempts = history.slice(0, 5); // Most recent 5
    const olderAttempts = history.slice(5, 10); // Previous 5
    
    let estimatedAttemptsToTarget = 0;
    if (olderAttempts.length > 0) {
      const recentAvg = recentAttempts.reduce((sum, h) => sum + h.score, 0) / recentAttempts.length;
      const olderAvg = olderAttempts.reduce((sum, h) => sum + h.score, 0) / olderAttempts.length;
      const improvementRate = recentAvg - olderAvg;
      
      if (improvementRate > 0) {
        const pointsNeeded = targetScore - currentAverage;
        estimatedAttemptsToTarget = Math.ceil(pointsNeeded / (improvementRate / 5)); // Improvement per 5 attempts
      }
    }

    // Generate recommendations
    const recommendations = [];
    
    if (currentAverage < 60) {
      recommendations.push('Focus on understanding the fundamentals before attempting harder levels');
      recommendations.push('Take your time to read questions carefully');
    } else if (currentAverage < 75) {
      recommendations.push('Practice regularly to build consistency');
      recommendations.push('Review incorrect answers to learn from mistakes');
    } else if (currentAverage < 85) {
      recommendations.push('Challenge yourself with harder difficulty levels');
      recommendations.push('Work on improving your speed while maintaining accuracy');
    } else {
      recommendations.push('Excellent work! Focus on maintaining consistency');
      recommendations.push('Help other students to reinforce your own learning');
    }

    return {
      targetScore,
      currentAverage: Math.round(currentAverage * 100) / 100,
      progressToTarget: Math.round(progressToTarget * 100) / 100,
      estimatedAttemptsToTarget: Math.max(0, estimatedAttemptsToTarget),
      recommendations,
    };
  };

  // Calculate all analytics
  const analytics: PerformanceAnalytics | null = historyQuery.data ? {
    strengthsAndWeaknesses: analyzeStrengthsAndWeaknesses(historyQuery.data),
    timeAnalysis: analyzeTimePatterns(historyQuery.data),
    consistencyMetrics: analyzeConsistency(historyQuery.data),
    progressTrends: analyzeProgressTrends(historyQuery.data),
    goalTracking: generateGoalTracking(historyQuery.data),
  } : null;

  // Function to analyze a specific attempt in detail
  const analyzeAttempt = async (attemptId: string): Promise<DetailedAttemptAnalysis | null> => {
    if (!historyQuery.data) return null;

    const attempt = historyQuery.data.find(h => h.attemptId === attemptId);
    if (!attempt) return null;

    // Calculate personal averages
    const personalHistory = historyQuery.data.filter(h => h.attemptId !== attemptId);
    const personalAvgScore = personalHistory.length > 0 
      ? personalHistory.reduce((sum, h) => sum + h.score, 0) / personalHistory.length 
      : 0;
    const personalAvgSpeed = personalHistory.length > 0
      ? personalHistory.reduce((sum, h) => sum + (h.totalQuestions / (h.timeSpent / 60)), 0) / personalHistory.length
      : 0;
    const personalAvgAccuracy = personalHistory.length > 0
      ? personalHistory.reduce((sum, h) => sum + (h.correctAnswers / h.totalQuestions * 100), 0) / personalHistory.length
      : 0;

    const attemptSpeed = attempt.totalQuestions / (attempt.timeSpent / 60);
    const attemptAccuracy = (attempt.correctAnswers / attempt.totalQuestions) * 100;
    const attemptTimeEfficiency = attempt.score / (attempt.timeSpent / 60);

    // Generate insights
    const insights = [];

    // Speed insights
    if (attemptSpeed > personalAvgSpeed * 1.2) {
      insights.push({
        category: 'speed' as const,
        type: 'strength' as const,
        message: 'You answered questions significantly faster than your average',
        actionable: false,
      });
    } else if (attemptSpeed < personalAvgSpeed * 0.8) {
      insights.push({
        category: 'speed' as const,
        type: 'opportunity' as const,
        message: 'You took longer than usual on this quiz',
        actionable: true,
        suggestion: 'Practice with easier questions to build speed confidence',
      });
    }

    // Accuracy insights
    if (attemptAccuracy > personalAvgAccuracy + 10) {
      insights.push({
        category: 'accuracy' as const,
        type: 'strength' as const,
        message: 'Excellent accuracy improvement!',
        actionable: false,
      });
    } else if (attemptAccuracy < personalAvgAccuracy - 10) {
      insights.push({
        category: 'accuracy' as const,
        type: 'weakness' as const,
        message: 'Accuracy was lower than usual',
        actionable: true,
        suggestion: 'Slow down and double-check your answers',
      });
    }

    return {
      attemptId,
      performance: {
        score: attempt.score,
        accuracy: attemptAccuracy,
        speed: attemptSpeed,
        timeEfficiency: attemptTimeEfficiency,
      },
      comparison: {
        vsPersonalAverage: {
          scoreDiff: attempt.score - personalAvgScore,
          speedDiff: attemptSpeed - personalAvgSpeed,
          accuracyDiff: attemptAccuracy - personalAvgAccuracy,
        },
        vsLevelAverage: {
          scoreDiff: 0, // Would need level-wide data
          speedDiff: 0,
          rank: 0,
          percentile: 0,
        },
      },
      insights,
    };
  };

  return {
    analytics,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    analyzeAttempt,
    refetch: historyQuery.refetch,
  };
}