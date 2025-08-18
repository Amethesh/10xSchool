"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getStudentQuizAttempts
} from "@/lib/quiz/data-access";
import { getStudentQuizHistory } from "@/lib/quiz/data-access-utils";

interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  achieved: boolean;
  achievedAt?: string;
  category: 'score' | 'consistency' | 'speed' | 'completion';
  icon: string;
}

interface LearningPath {
  currentLevel: string;
  currentWeek: number;
  completedLevels: string[];
  completedWeeks: Array<{ level: string; week: number; bestScore: number }>;
  suggestedNext: Array<{ level: string; week: number; reason: string }>;
  masteredTopics: Array<{ level: string; week: number; masteryScore: number }>;
  strugglingTopics: Array<{ level: string; week: number; averageScore: number; attempts: number }>;
}

interface ProgressSession {
  date: string;
  quizzesCompleted: number;
  totalScore: number;
  averageScore: number;
  timeSpent: number;
  improvements: Array<{
    metric: string;
    change: number;
    isPositive: boolean;
  }>;
}

interface SkillProgression {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  recentTrend: 'improving' | 'stable' | 'declining';
  evidence: Array<{
    type: 'quiz_score' | 'consistency' | 'speed_improvement';
    value: number;
    date: string;
  }>;
  nextMilestone: {
    description: string;
    target: number;
    estimatedTime: string;
  };
}

interface WeeklyGoals {
  week: string; // ISO week string
  goals: Array<{
    id: string;
    type: 'score_target' | 'quiz_count' | 'consistency' | 'speed';
    description: string;
    target: number;
    current: number;
    completed: boolean;
  }>;
  overallProgress: number; // 0-100
}

export function useProgressTracking(studentId: string) {
  const queryClient = useQueryClient();

  // Get comprehensive quiz history for progress analysis
  const historyQuery = useQuery({
    queryKey: ['progress-tracking', studentId],
    queryFn: () => getStudentQuizHistory(studentId, 200), // Extended history for better progress tracking
    enabled: !!studentId,
    staleTime: 300000, // 5 minutes
  });

  // Calculate progress milestones
  const calculateMilestones = (history: any[]): ProgressMilestone[] => {
    if (!history || history.length === 0) return [];

    const milestones: ProgressMilestone[] = [];
    
    // Score-based milestones
    const scores = history.map(h => h.score);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    milestones.push(
      {
        id: 'first_quiz',
        title: 'First Quiz Completed',
        description: 'Complete your first quiz',
        target: 1,
        current: history.length > 0 ? 1 : 0,
        achieved: history.length > 0,
        achievedAt: history.length > 0 ? history[history.length - 1].completedAt : undefined,
        category: 'completion',
        icon: '🎯'
      },
      {
        id: 'score_50',
        title: 'Half Century',
        description: 'Score 50% or higher',
        target: 50,
        current: maxScore,
        achieved: maxScore >= 50,
        achievedAt: history.find(h => h.score >= 50)?.completedAt,
        category: 'score',
        icon: '📈'
      },
      {
        id: 'score_75',
        title: 'Three Quarters',
        description: 'Score 75% or higher',
        target: 75,
        current: maxScore,
        achieved: maxScore >= 75,
        achievedAt: history.find(h => h.score >= 75)?.completedAt,
        category: 'score',
        icon: '⭐'
      },
      {
        id: 'score_90',
        title: 'Excellence',
        description: 'Score 90% or higher',
        target: 90,
        current: maxScore,
        achieved: maxScore >= 90,
        achievedAt: history.find(h => h.score >= 90)?.completedAt,
        category: 'score',
        icon: '🏆'
      },
      {
        id: 'consistency_70',
        title: 'Consistent Performer',
        description: 'Maintain 70%+ average over 5 quizzes',
        target: 70,
        current: avgScore,
        achieved: avgScore >= 70 && history.length >= 5,
        achievedAt: history.length >= 5 && avgScore >= 70 ? history[4].completedAt : undefined,
        category: 'consistency',
        icon: '🎖️'
      }
    );

    // Quiz count milestones
    const quizCounts = [10, 25, 50, 100];
    quizCounts.forEach(count => {
      milestones.push({
        id: `quiz_count_${count}`,
        title: `${count} Quizzes`,
        description: `Complete ${count} quizzes`,
        target: count,
        current: history.length,
        achieved: history.length >= count,
        achievedAt: history.length >= count ? history[history.length - count].completedAt : undefined,
        category: 'completion',
        icon: count >= 50 ? '🏅' : '📚'
      });
    });

    return milestones.sort((a, b) => a.target - b.target);
  };

  // Analyze learning path
  const analyzeLearningPath = (history: any[]): LearningPath => {
    if (!history || history.length === 0) {
      return {
        currentLevel: '',
        currentWeek: 0,
        completedLevels: [],
        completedWeeks: [],
        suggestedNext: [],
        masteredTopics: [],
        strugglingTopics: [],
      };
    }

    // Group by level and week
    const topicMap = new Map<string, { scores: number[]; attempts: number; bestScore: number }>();
    
    history.forEach(attempt => {
      const key = `${attempt.level}-${attempt.weekNo}`;
      if (!topicMap.has(key)) {
        topicMap.set(key, { scores: [], attempts: 0, bestScore: 0 });
      }
      const topic = topicMap.get(key)!;
      topic.scores.push(attempt.score);
      topic.attempts++;
      topic.bestScore = Math.max(topic.bestScore, attempt.score);
    });

    // Analyze completed weeks and mastery
    const completedWeeks: Array<{ level: string; week: number; bestScore: number }> = [];
    const masteredTopics: Array<{ level: string; week: number; masteryScore: number }> = [];
    const strugglingTopics: Array<{ level: string; week: number; averageScore: number; attempts: number }> = [];

    topicMap.forEach((stats, key) => {
      const [level, weekStr] = key.split('-');
      const week = parseInt(weekStr);
      const averageScore = stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length;

      completedWeeks.push({ level, week, bestScore: stats.bestScore });

      if (averageScore >= 85 && stats.attempts >= 2) {
        masteredTopics.push({ level, week, masteryScore: averageScore });
      } else if (averageScore < 60 && stats.attempts >= 2) {
        strugglingTopics.push({ level, week, averageScore, attempts: stats.attempts });
      }
    });

    // Determine current position and suggestions
    const mostRecent = history[0]; // Most recent attempt
    const currentLevel = mostRecent.level;
    const currentWeek = mostRecent.weekNo;

    // Simple suggestion logic - suggest next week or review struggling topics
    const suggestedNext = [];
    
    if (strugglingTopics.length > 0) {
      strugglingTopics.slice(0, 2).forEach(topic => {
        suggestedNext.push({
          level: topic.level,
          week: topic.week,
          reason: `Review this topic - average score: ${topic.averageScore.toFixed(1)}%`
        });
      });
    }

    // Suggest next week if current performance is good
    if (mostRecent.score >= 70) {
      suggestedNext.push({
        level: currentLevel,
        week: currentWeek + 1,
        reason: 'Continue to next week based on good performance'
      });
    }

    const completedLevels = Array.from(new Set(completedWeeks.map(w => w.level)));

    return {
      currentLevel,
      currentWeek,
      completedLevels,
      completedWeeks: completedWeeks.sort((a, b) => {
        if (a.level !== b.level) return a.level.localeCompare(b.level);
        return a.week - b.week;
      }),
      suggestedNext,
      masteredTopics: masteredTopics.sort((a, b) => b.masteryScore - a.masteryScore),
      strugglingTopics: strugglingTopics.sort((a, b) => a.averageScore - b.averageScore),
    };
  };

  // Track daily/weekly progress sessions
  const analyzeProgressSessions = (history: any[]): ProgressSession[] => {
    if (!history || history.length === 0) return [];

    // Group by date
    const sessionMap = new Map<string, any[]>();
    
    history.forEach(attempt => {
      const date = new Date(attempt.completedAt).toISOString().split('T')[0];
      if (!sessionMap.has(date)) {
        sessionMap.set(date, []);
      }
      sessionMap.get(date)!.push(attempt);
    });

    const sessions: ProgressSession[] = [];
    const sortedDates = Array.from(sessionMap.keys()).sort();

    sortedDates.forEach((date, index) => {
      const dayAttempts = sessionMap.get(date)!;
      const totalScore = dayAttempts.reduce((sum, a) => sum + a.score, 0);
      const averageScore = totalScore / dayAttempts.length;
      const timeSpent = dayAttempts.reduce((sum, a) => sum + a.timeSpent, 0);

      // Calculate improvements compared to previous session
      const improvements = [];
      if (index > 0) {
        const previousDate = sortedDates[index - 1];
        const previousSession = sessions.find(s => s.date === previousDate);
        
        if (previousSession) {
          const scoreChange = averageScore - previousSession.averageScore;
          improvements.push({
            metric: 'Average Score',
            change: Math.round(scoreChange * 100) / 100,
            isPositive: scoreChange > 0,
          });

          const efficiencyChange = (totalScore / timeSpent) - (previousSession.totalScore / previousSession.timeSpent);
          improvements.push({
            metric: 'Efficiency',
            change: Math.round(efficiencyChange * 100) / 100,
            isPositive: efficiencyChange > 0,
          });
        }
      }

      sessions.push({
        date,
        quizzesCompleted: dayAttempts.length,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        timeSpent,
        improvements,
      });
    });

    return sessions.reverse(); // Most recent first
  };

  // Analyze skill progression
  const analyzeSkillProgression = (history: any[]): SkillProgression[] => {
    if (!history || history.length === 0) return [];

    // Group by level (representing different skills)
    const skillMap = new Map<string, any[]>();
    
    history.forEach(attempt => {
      if (!skillMap.has(attempt.level)) {
        skillMap.set(attempt.level, []);
      }
      skillMap.get(attempt.level)!.push(attempt);
    });

    const skills: SkillProgression[] = [];

    skillMap.forEach((attempts, skill) => {
      if (attempts.length < 2) return; // Need at least 2 attempts to analyze progression

      const scores = attempts.map(a => a.score);
      const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const maxScore = Math.max(...scores);

      // Determine skill level
      let level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      if (averageScore < 50) level = 'beginner';
      else if (averageScore < 70) level = 'intermediate';
      else if (averageScore < 85) level = 'advanced';
      else level = 'expert';

      // Calculate progress (0-100)
      const progress = Math.min(100, averageScore);

      // Determine trend (compare first half vs second half)
      const midPoint = Math.floor(attempts.length / 2);
      const firstHalf = attempts.slice(midPoint);
      const secondHalf = attempts.slice(0, midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length;
      
      let recentTrend: 'improving' | 'stable' | 'declining';
      const trendDiff = secondHalfAvg - firstHalfAvg;
      if (trendDiff > 5) recentTrend = 'improving';
      else if (trendDiff < -5) recentTrend = 'declining';
      else recentTrend = 'stable';

      // Generate evidence
      const evidence = attempts.slice(0, 5).map(attempt => ({
        type: 'quiz_score' as const,
        value: attempt.score,
        date: attempt.completedAt,
      }));

      // Next milestone
      let nextTarget = 100;
      let nextDescription = 'Perfect mastery';
      
      if (averageScore < 60) {
        nextTarget = 60;
        nextDescription = 'Reach 60% average';
      } else if (averageScore < 75) {
        nextTarget = 75;
        nextDescription = 'Reach 75% average';
      } else if (averageScore < 85) {
        nextTarget = 85;
        nextDescription = 'Reach 85% average';
      }

      const pointsNeeded = nextTarget - averageScore;
      const estimatedTime = pointsNeeded > 0 ? `${Math.ceil(pointsNeeded / 2)} more quizzes` : 'Achieved!';

      skills.push({
        skill,
        level,
        progress,
        recentTrend,
        evidence,
        nextMilestone: {
          description: nextDescription,
          target: nextTarget,
          estimatedTime,
        },
      });
    });

    return skills.sort((a, b) => b.progress - a.progress);
  };

  // Generate weekly goals
  const generateWeeklyGoals = (history: any[]): WeeklyGoals => {
    const currentWeek = new Date().toISOString().slice(0, 10); // Simple week representation
    
    // Get this week's attempts
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    const weekAttempts = history.filter(h => 
      new Date(h.completedAt) >= weekStart
    );

    const goals = [
      {
        id: 'weekly_quizzes',
        type: 'quiz_count' as const,
        description: 'Complete 5 quizzes this week',
        target: 5,
        current: weekAttempts.length,
        completed: weekAttempts.length >= 5,
      },
      {
        id: 'weekly_average',
        type: 'score_target' as const,
        description: 'Maintain 75% average this week',
        target: 75,
        current: weekAttempts.length > 0 
          ? weekAttempts.reduce((sum, a) => sum + a.score, 0) / weekAttempts.length 
          : 0,
        completed: weekAttempts.length > 0 && 
          (weekAttempts.reduce((sum, a) => sum + a.score, 0) / weekAttempts.length) >= 75,
      },
    ];

    const completedGoals = goals.filter(g => g.completed).length;
    const overallProgress = (completedGoals / goals.length) * 100;

    return {
      week: currentWeek,
      goals,
      overallProgress,
    };
  };

  // Derived data
  const milestones = historyQuery.data ? calculateMilestones(historyQuery.data) : [];
  const learningPath = historyQuery.data ? analyzeLearningPath(historyQuery.data) : null;
  const progressSessions = historyQuery.data ? analyzeProgressSessions(historyQuery.data) : [];
  const skillProgression = historyQuery.data ? analyzeSkillProgression(historyQuery.data) : [];
  const weeklyGoals = historyQuery.data ? generateWeeklyGoals(historyQuery.data) : null;

  return {
    // Raw data
    history: historyQuery.data,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,

    // Progress tracking data
    milestones,
    learningPath,
    progressSessions,
    skillProgression,
    weeklyGoals,

    // Utility functions
    refetch: historyQuery.refetch,
  };
}