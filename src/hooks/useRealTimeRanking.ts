"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { calculateStudentRanking, getQuizLeaderboard } from "@/lib/quiz/data-access";
import { StudentRanking } from "@/types/types";

interface UseRealTimeRankingProps {
  studentId: string;
  level: string;
  weekNo: number;
  difficulty: string;
  enabled?: boolean;
}

interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  score: number;
  rank: number;
  completedAt: string;
}

export function useRealTimeRanking({
  studentId,
  level,
  weekNo,
  difficulty,
  enabled = true,
}: UseRealTimeRankingProps) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Query for student ranking with real-time updates
  const rankingQuery = useQuery<StudentRanking | null>({
    queryKey: ['real-time-ranking', studentId, level, weekNo, difficulty],
    queryFn: () => calculateStudentRanking(studentId, level, weekNo, difficulty),
    enabled: enabled && !!studentId && !!level && !!weekNo && !!difficulty,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Query for leaderboard with real-time updates
  const leaderboardQuery = useQuery<LeaderboardEntry[]>({
    queryKey: ['real-time-leaderboard', level, weekNo, difficulty],
    queryFn: () => getQuizLeaderboard(level, weekNo, difficulty, 10),
    enabled: enabled && !!level && !!weekNo && !!difficulty,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Set up real-time subscription for quiz attempts
  useEffect(() => {
    if (!enabled || !level || !weekNo || !difficulty) return;

    const supabase = createClient();

    // Subscribe to quiz_attempts table changes
    const channel = supabase
      .channel('quiz-attempts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `level=eq.${level}`,
        },
        (payload) => {
          console.log('Quiz attempt change detected:', payload);
          
          // Check if this change affects our specific quiz
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          const affectsOurQuiz = 
            (newRecord && newRecord.level === level && newRecord.week_no === weekNo && newRecord.difficulty === difficulty) ||
            (oldRecord && oldRecord.level === level && oldRecord.week_no === weekNo && oldRecord.difficulty === difficulty);

          if (affectsOurQuiz) {
            // Invalidate and refetch ranking and leaderboard queries
            queryClient.invalidateQueries({
              queryKey: ['real-time-ranking', studentId, level, weekNo, difficulty]
            });
            queryClient.invalidateQueries({
              queryKey: ['real-time-leaderboard', level, weekNo, difficulty]
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Real-time ranking subscription active');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log('Real-time ranking subscription closed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [enabled, level, weekNo, difficulty, studentId, queryClient]);

  // Function to manually trigger a refresh
  const refreshRanking = async () => {
    await Promise.all([
      rankingQuery.refetch(),
      leaderboardQuery.refetch(),
    ]);
  };

  // Function to get ranking change notification
  const getRankingChange = (currentRank?: number, previousRank?: number) => {
    if (!currentRank || !previousRank) return null;
    
    const change = previousRank - currentRank;
    if (change > 0) {
      return {
        type: 'improvement' as const,
        change,
        message: `You moved up ${change} position${change > 1 ? 's' : ''}!`,
      };
    } else if (change < 0) {
      return {
        type: 'decline' as const,
        change: Math.abs(change),
        message: `You moved down ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}.`,
      };
    }
    return {
      type: 'same' as const,
      change: 0,
      message: 'Your ranking stayed the same.',
    };
  };

  // Function to get performance tier
  const getPerformanceTier = (ranking?: StudentRanking | null) => {
    if (!ranking) return null;
    
    const percentile = ranking.percentile;
    
    if (percentile >= 90) {
      return {
        tier: 'elite',
        name: 'Elite',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        description: 'Top 10% of students',
      };
    } else if (percentile >= 75) {
      return {
        tier: 'advanced',
        name: 'Advanced',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        description: 'Top 25% of students',
      };
    } else if (percentile >= 50) {
      return {
        tier: 'proficient',
        name: 'Proficient',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        description: 'Above average performance',
      };
    } else if (percentile >= 25) {
      return {
        tier: 'developing',
        name: 'Developing',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        description: 'Making good progress',
      };
    } else {
      return {
        tier: 'beginner',
        name: 'Beginner',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        description: 'Keep practicing!',
      };
    }
  };

  return {
    // Data
    ranking: rankingQuery.data,
    leaderboard: leaderboardQuery.data,
    
    // Loading states
    isRankingLoading: rankingQuery.isLoading,
    isLeaderboardLoading: leaderboardQuery.isLoading,
    
    // Error states
    rankingError: rankingQuery.error,
    leaderboardError: leaderboardQuery.error,
    
    // Real-time connection status
    isConnected,
    
    // Utility functions
    refreshRanking,
    getRankingChange,
    getPerformanceTier,
    
    // Manual refetch functions
    refetchRanking: rankingQuery.refetch,
    refetchLeaderboard: leaderboardQuery.refetch,
  };
}