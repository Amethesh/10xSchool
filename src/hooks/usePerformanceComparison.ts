"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getQuizLeaderboard,
  calculateStudentRanking,
} from "@/lib/quiz/data-access";
import { getStudentQuizHistory } from "@/lib/quiz/data-access-utils";
import { HistoryEntry } from "@/components/result/PerformanceHistory";

interface AttemptComparison {
  current: {
    attemptId: string;
    score: number;
    accuracy: number;
    speed: number; // questions per minute
    timeSpent: number;
    difficulty: string;
    completedAt: string;
  };
  previous?: {
    attemptId: string;
    score: number;
    accuracy: number;
    speed: number;
    timeSpent: number;
    difficulty: string;
    completedAt: string;
  };
  improvements: {
    scoreChange: number;
    accuracyChange: number;
    speedChange: number;
    timeChange: number;
  };
  insights: Array<{
    type: "improvement" | "regression" | "maintained";
    category: "score" | "speed" | "accuracy" | "consistency";
    message: string;
    significance: "high" | "medium" | "low";
  }>;
}

interface PeerComparison {
  studentRank: number;
  totalStudents: number;
  percentile: number;
  scoreVsAverage: number;
  speedVsAverage: number;
  accuracyVsAverage: number;
  topPerformers: Array<{
    rank: number;
    score: number;
    studentName: string;
  }>;
  similarPerformers: Array<{
    rank: number;
    score: number;
    studentName: string;
    scoreDifference: number;
  }>;
}

interface HistoricalComparison {
  timeframe: "week" | "month" | "all_time";
  currentPeriod: {
    averageScore: number;
    quizzesCompleted: number;
    totalTimeSpent: number;
    bestScore: number;
    consistency: number; // standard deviation
  };
  previousPeriod?: {
    averageScore: number;
    quizzesCompleted: number;
    totalTimeSpent: number;
    bestScore: number;
    consistency: number;
  };
  trends: {
    scoreImprovement: number;
    activityChange: number;
    efficiencyChange: number;
    consistencyChange: number;
  };
  milestones: Array<{
    achievement: string;
    date: string;
    significance: "major" | "minor";
  }>;
}

interface DifficultyComparison {
  easy: {
    averageScore: number;
    attempts: number;
    bestScore: number;
    averageTime: number;
  };
  medium: {
    averageScore: number;
    attempts: number;
    bestScore: number;
    averageTime: number;
  };
  hard: {
    averageScore: number;
    attempts: number;
    bestScore: number;
    averageTime: number;
  };
  recommendations: Array<{
    difficulty: "easy" | "medium" | "hard";
    action: "focus_more" | "maintain" | "challenge_yourself";
    reason: string;
  }>;
}

interface LevelComparison {
  levels: Array<{
    level: string;
    averageScore: number;
    attempts: number;
    bestScore: number;
    masteryLevel: "struggling" | "learning" | "proficient" | "mastered";
    timeSpent: number;
    lastAttempt: string;
  }>;
  strongestLevel: string;
  weakestLevel: string;
  mostImprovedLevel: string;
  recommendations: Array<{
    level: string;
    action: "review" | "practice" | "advance";
    priority: "high" | "medium" | "low";
    reason: string;
  }>;
}

export function usePerformanceComparison(
  studentId: string,
  currentAttemptId?: string,
  level?: string,
  weekNo?: number,
  difficulty?: string
) {
  // Get student's quiz history
  const historyQuery = useQuery({
    queryKey: ["comparison-history", studentId],
    queryFn: () => getStudentQuizHistory(studentId, 100),
    enabled: !!studentId,
    staleTime: 300000, // 5 minutes
  });

  // Get leaderboard for peer comparison
  const leaderboardQuery = useQuery({
    queryKey: ["comparison-leaderboard", level, weekNo, difficulty],
    queryFn: () =>
      level && weekNo && difficulty
        ? getQuizLeaderboard(2, weekNo, difficulty, 50)
        : Promise.resolve([]),
    enabled: !!level && !!weekNo && !!difficulty,
    staleTime: 300000,
  });

  // Get student ranking
  const rankingQuery = useQuery({
    queryKey: ["comparison-ranking", studentId, level, weekNo, difficulty],
    queryFn: () =>
      level && weekNo && difficulty
        ? calculateStudentRanking(studentId, 2, weekNo, difficulty)
        : Promise.resolve(null),
    enabled: !!studentId && !!level && !!weekNo && !!difficulty,
    staleTime: 300000,
  });

  // Compare current attempt with previous attempt
  const compareAttempts = (
    history: HistoryEntry[],
    currentId?: string
  ): AttemptComparison | null => {
    if (!history || history.length === 0) return null;
    console.log("CURRENT ID", currentId)
    let currentAttempt;
    let previousAttempt;

    if (currentId) {
      const currentIndex = history.findIndex((h) => h.attemptId === currentId);
      if (currentIndex === -1) return null;

      currentAttempt = history[currentIndex];
      previousAttempt =
        currentIndex < history.length - 1
          ? history[currentIndex + 1]
          : undefined;
    } else {
      // Use most recent attempt
      currentAttempt = history[0];
      previousAttempt = history.length > 1 ? history[1] : undefined;
    }

    const currentMetrics = {
      attemptId: currentAttempt.attemptId,
      score: currentAttempt.score,
      accuracy:
        currentAttempt.totalQuestions > 0
          ? (currentAttempt.correctAnswers / currentAttempt.totalQuestions) *
            100
          : 0,
      speed:
        currentAttempt.timeSpent > 0
          ? currentAttempt.totalQuestions / (currentAttempt.timeSpent / 60)
          : 0,
      timeSpent: currentAttempt.timeSpent,
      difficulty: currentAttempt.difficulty,
      completedAt: currentAttempt.completedAt || new Date().toISOString(),
    };

    const previousMetrics = previousAttempt
      ? {
          attemptId: previousAttempt.attemptId,
          score: previousAttempt.score,
          accuracy:
            previousAttempt.totalQuestions > 0
              ? (previousAttempt.correctAnswers /
                  previousAttempt.totalQuestions) *
                100
              : 0,
          speed:
            previousAttempt.timeSpent > 0
              ? previousAttempt.totalQuestions /
                (previousAttempt.timeSpent / 60)
              : 0,
          timeSpent: previousAttempt.timeSpent,
          difficulty: previousAttempt.difficulty,
          completedAt: previousAttempt.completedAt || new Date().toISOString(),
        }
      : undefined;

    const improvements = previousMetrics
      ? {
          scoreChange: currentMetrics.score - previousMetrics.score,
          accuracyChange: currentMetrics.accuracy - previousMetrics.accuracy,
          speedChange: currentMetrics.speed - previousMetrics.speed,
          timeChange: currentMetrics.timeSpent - previousMetrics.timeSpent,
        }
      : {
          scoreChange: 0,
          accuracyChange: 0,
          speedChange: 0,
          timeChange: 0,
        };

    // Generate insights
    const insights = [];

    // Check for incomplete attempts
    if (currentMetrics.timeSpent === 0 || currentMetrics.score === 0) {
      insights.push({
        type: "regression" as const,
        category: "consistency" as const,
        message: "Quiz appears to be incomplete or not properly submitted",
        significance: "high" as const,
      });
    }

    if (previousMetrics) {
      // Score insights
      if (Math.abs(improvements.scoreChange) >= 10) {
        insights.push({
          type:
            improvements.scoreChange > 0
              ? ("improvement" as const)
              : ("regression" as const),
          category: "score" as const,
          message: `Score ${
            improvements.scoreChange > 0 ? "improved" : "decreased"
          } by ${Math.abs(improvements.scoreChange).toFixed(1)}%`,
          significance:
            Math.abs(improvements.scoreChange) >= 20
              ? ("high" as const)
              : ("medium" as const),
        });
      }

      // Speed insights (only if both attempts have valid time data)
      if (
        currentMetrics.timeSpent > 0 &&
        previousMetrics.timeSpent > 0 &&
        Math.abs(improvements.speedChange) >= 0.5 &&
        isFinite(improvements.speedChange)
      ) {
        insights.push({
          type:
            improvements.speedChange > 0
              ? ("improvement" as const)
              : ("regression" as const),
          category: "speed" as const,
          message: `Speed ${
            improvements.speedChange > 0 ? "increased" : "decreased"
          } by ${Math.abs(improvements.speedChange).toFixed(1)} questions/min`,
          significance:
            Math.abs(improvements.speedChange) >= 1
              ? ("high" as const)
              : ("medium" as const),
        });
      }

      // Accuracy insights
      if (Math.abs(improvements.accuracyChange) >= 5) {
        insights.push({
          type:
            improvements.accuracyChange > 0
              ? ("improvement" as const)
              : ("regression" as const),
          category: "accuracy" as const,
          message: `Accuracy ${
            improvements.accuracyChange > 0 ? "improved" : "decreased"
          } by ${Math.abs(improvements.accuracyChange).toFixed(1)}%`,
          significance:
            Math.abs(improvements.accuracyChange) >= 10
              ? ("high" as const)
              : ("medium" as const),
        });
      }
    }

    return {
      current: currentMetrics,
      previous: previousMetrics,
      improvements,
      insights,
    };
  };

  // Compare with peers
  const comparePeers = (
    leaderboard: any[],
    ranking: any,
    studentScore: number
  ): PeerComparison | null => {
    if (!leaderboard || !ranking) return null;

    const leaderboardAverage =
      leaderboard.length > 0
        ? leaderboard.reduce((sum, entry) => sum + entry.score, 0) /
          leaderboard.length
        : 0;

    const topPerformers = leaderboard.slice(0, 3).map((entry) => ({
      rank: entry.rank,
      score: entry.score,
      studentName: entry.studentName,
    }));

    // Find similar performers (within 10 points)
    const similarPerformers = leaderboard
      .filter(
        (entry) =>
          Math.abs(entry.score - studentScore) <= 10 &&
          entry.studentId !== studentId
      )
      .slice(0, 5)
      .map((entry) => ({
        rank: entry.rank,
        score: entry.score,
        studentName: entry.studentName,
        scoreDifference: entry.score - studentScore,
      }));

    return {
      studentRank: ranking.rank,
      totalStudents: ranking.totalStudents,
      percentile: ranking.percentile,
      scoreVsAverage: studentScore - leaderboardAverage,
      speedVsAverage: 0, // Would need more detailed leaderboard data
      accuracyVsAverage: 0, // Would need more detailed leaderboard data
      topPerformers,
      similarPerformers,
    };
  };

  // Compare historical periods
  const compareHistoricalPeriods = (
    history: any[],
    timeframe: "week" | "month" | "all_time"
  ): HistoricalComparison => {
    if (!history || history.length === 0) {
      return {
        timeframe,
        currentPeriod: {
          averageScore: 0,
          quizzesCompleted: 0,
          totalTimeSpent: 0,
          bestScore: 0,
          consistency: 0,
        },
        trends: {
          scoreImprovement: 0,
          activityChange: 0,
          efficiencyChange: 0,
          consistencyChange: 0,
        },
        milestones: [],
      };
    }

    const now = new Date();
    let periodStart: Date;
    let previousPeriodStart: Date;

    switch (timeframe) {
      case "week":
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          now.getTime() - 14 * 24 * 60 * 60 * 1000
        );
        break;
      case "month":
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          now.getTime() - 60 * 24 * 60 * 60 * 1000
        );
        break;
      default: // all_time
        periodStart = new Date(0);
        previousPeriodStart = new Date(0);
    }

    const currentPeriodAttempts = history.filter(
      (h) => new Date(h.completedAt) >= periodStart
    );

    const previousPeriodAttempts =
      timeframe !== "all_time"
        ? history.filter((h) => {
            const date = new Date(h.completedAt);
            return date >= previousPeriodStart && date < periodStart;
          })
        : [];

    const calculatePeriodStats = (attempts: any[]) => {
      if (attempts.length === 0) {
        return {
          averageScore: 0,
          quizzesCompleted: 0,
          totalTimeSpent: 0,
          bestScore: 0,
          consistency: 0,
        };
      }

      const scores = attempts.map((a) => a.score);
      const averageScore =
        scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const variance =
        scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) /
        scores.length;

      return {
        averageScore,
        quizzesCompleted: attempts.length,
        totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
        bestScore: Math.max(...scores),
        consistency: Math.sqrt(variance),
      };
    };

    const currentPeriod = calculatePeriodStats(currentPeriodAttempts);
    const previousPeriod =
      previousPeriodAttempts.length > 0
        ? calculatePeriodStats(previousPeriodAttempts)
        : undefined;

    const trends = previousPeriod
      ? {
          scoreImprovement:
            currentPeriod.averageScore - previousPeriod.averageScore,
          activityChange:
            currentPeriod.quizzesCompleted - previousPeriod.quizzesCompleted,
          efficiencyChange:
            currentPeriod.averageScore / (currentPeriod.totalTimeSpent || 1) -
            previousPeriod.averageScore / (previousPeriod.totalTimeSpent || 1),
          consistencyChange:
            previousPeriod.consistency - currentPeriod.consistency, // Lower is better
        }
      : {
          scoreImprovement: 0,
          activityChange: 0,
          efficiencyChange: 0,
          consistencyChange: 0,
        };

    // Identify milestones
    const milestones: Array<{
      achievement: string;
      date: string;
      significance: "major" | "minor";
    }> = [];
    const scoreThresholds = [50, 60, 70, 80, 90, 95];

    scoreThresholds.forEach((threshold) => {
      const firstAchievement = history.find((h) => h.score >= threshold);
      if (firstAchievement) {
        milestones.push({
          achievement: `First ${threshold}% score`,
          date: firstAchievement.completedAt,
          significance:
            threshold >= 80 ? ("major" as const) : ("minor" as const),
        });
      }
    });

    return {
      timeframe,
      currentPeriod,
      previousPeriod,
      trends,
      milestones: milestones.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  };

  // Compare performance across difficulties
  const compareDifficulties = (history: any[]): DifficultyComparison => {
    const difficulties = ["easy", "medium", "hard"] as const;
    const difficultyStats = {} as DifficultyComparison;

    difficulties.forEach((diff) => {
      const attempts = history.filter((h) => h.difficulty === diff);

      if (attempts.length > 0) {
        const scores = attempts.map((a) => a.score);
        const times = attempts.map((a) => a.timeSpent);

        (difficultyStats as any)[diff] = {
          averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          attempts: attempts.length,
          bestScore: Math.max(...scores),
          averageTime: times.reduce((sum, t) => sum + t, 0) / times.length,
        };
      } else {
        (difficultyStats as any)[diff] = {
          averageScore: 0,
          attempts: 0,
          bestScore: 0,
          averageTime: 0,
        };
      }
    });

    // Generate recommendations
    const recommendations = [];

    if (
      difficultyStats.easy.averageScore < 70 &&
      difficultyStats.easy.attempts > 0
    ) {
      recommendations.push({
        difficulty: "easy" as const,
        action: "focus_more" as const,
        reason: "Strengthen fundamentals with more easy practice",
      });
    }

    if (
      difficultyStats.medium.averageScore >= 80 &&
      difficultyStats.hard.attempts < 3
    ) {
      recommendations.push({
        difficulty: "hard" as const,
        action: "challenge_yourself" as const,
        reason: "Ready for harder challenges based on medium performance",
      });
    }

    return {
      ...difficultyStats,
      recommendations,
    };
  };

  // Compare performance across levels
  const compareLevels = (history: any[]): LevelComparison => {
    const levelMap = new Map<string, any[]>();

    history.forEach((attempt) => {
      if (!levelMap.has(attempt.level)) {
        levelMap.set(attempt.level, []);
      }
      levelMap.get(attempt.level)!.push(attempt);
    });

    const levels = Array.from(levelMap.entries()).map(([level, attempts]) => {
      const scores = attempts.map((a) => a.score);
      const averageScore =
        scores.reduce((sum, s) => sum + s, 0) / scores.length;

      let masteryLevel: "struggling" | "learning" | "proficient" | "mastered";
      if (averageScore < 50) masteryLevel = "struggling";
      else if (averageScore < 70) masteryLevel = "learning";
      else if (averageScore < 85) masteryLevel = "proficient";
      else masteryLevel = "mastered";

      return {
        level,
        averageScore,
        attempts: attempts.length,
        bestScore: Math.max(...scores),
        masteryLevel,
        timeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
        lastAttempt: attempts[0].completedAt, // Most recent
      };
    });

    const sortedByScore = [...levels].sort(
      (a, b) => b.averageScore - a.averageScore
    );
    const strongestLevel = sortedByScore[0]?.level || "";
    const weakestLevel = sortedByScore[sortedByScore.length - 1]?.level || "";

    // Calculate improvement (simplified)
    const mostImprovedLevel =
      levels.reduce((best, current) => {
        return current.averageScore > (best?.averageScore || 0)
          ? current
          : best;
      }, null as any)?.level || "";

    const recommendations = levels
      .filter((l) => l.masteryLevel === "struggling")
      .map((l) => ({
        level: l.level,
        action: "review" as const,
        priority: "high" as const,
        reason: `Average score of ${l.averageScore.toFixed(
          1
        )}% needs improvement`,
      }));

    return {
      levels: levels.sort((a, b) => b.averageScore - a.averageScore),
      strongestLevel,
      weakestLevel,
      mostImprovedLevel,
      recommendations,
    };
  };

  // Calculate all comparisons
  const attemptComparison = historyQuery.data
    ? compareAttempts(historyQuery.data, currentAttemptId)
    : null;

  const peerComparison =
    leaderboardQuery.data && rankingQuery.data && historyQuery.data
      ? comparePeers(
          leaderboardQuery.data,
          rankingQuery.data,
          historyQuery.data[0]?.score || 0
        )
      : null;

  const weeklyComparison = historyQuery.data
    ? compareHistoricalPeriods(historyQuery.data, "week")
    : null;
  const monthlyComparison = historyQuery.data
    ? compareHistoricalPeriods(historyQuery.data, "month")
    : null;
  const allTimeComparison = historyQuery.data
    ? compareHistoricalPeriods(historyQuery.data, "all_time")
    : null;

  const difficultyComparison = historyQuery.data
    ? compareDifficulties(historyQuery.data)
    : null;
  const levelComparison = historyQuery.data
    ? compareLevels(historyQuery.data)
    : null;

  return {
    // Raw data
    history: historyQuery.data,
    leaderboard: leaderboardQuery.data,
    ranking: rankingQuery.data,

    // Loading states
    isLoading:
      historyQuery.isLoading ||
      leaderboardQuery.isLoading ||
      rankingQuery.isLoading,
    error: historyQuery.error || leaderboardQuery.error || rankingQuery.error,

    // Comparison data
    attemptComparison,
    peerComparison,
    historicalComparison: {
      weekly: weeklyComparison,
      monthly: monthlyComparison,
      allTime: allTimeComparison,
    },
    difficultyComparison,
    levelComparison,

    // Utility functions
    refetch: () => {
      historyQuery.refetch();
      leaderboardQuery.refetch();
      rankingQuery.refetch();
    },
  };
}
