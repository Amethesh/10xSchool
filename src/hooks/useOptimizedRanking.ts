"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  calculateStudentRankingOptimized, 
  getQuizLeaderboardOptimized,
  getBatchStudentRankings 
} from "@/lib/quiz/optimized-queries";
import { StudentRanking } from "@/types/types";

/**
 * Optimized hook for student ranking with better caching
 */
export function useOptimizedStudentRanking(
  studentId: string,
  level: string,
  weekNo: number,
  difficulty: string
) {
  return useQuery<StudentRanking | null>({
    queryKey: ['optimized-ranking', studentId, level, weekNo, difficulty],
    queryFn: () => calculateStudentRankingOptimized(studentId, level, weekNo, difficulty),
    enabled: !!studentId && !!level && !!weekNo && !!difficulty,
    
    // Rankings change less frequently, cache longer
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    
    // Reduce background refetching for rankings
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Optimized hook for quiz leaderboard with better caching
 */
export function useOptimizedLeaderboard(
  level: string,
  weekNo: number,
  difficulty: string,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['optimized-leaderboard', level, weekNo, difficulty, limit],
    queryFn: () => getQuizLeaderboardOptimized(level, weekNo, difficulty, limit),
    enabled: !!level && !!weekNo && !!difficulty,
    
    // Leaderboards change less frequently
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
  });
}

/**
 * Hook for batch ranking queries - more efficient for multiple students
 */
export function useBatchStudentRankings(
  studentIds: string[],
  level: string,
  weekNo: number,
  difficulty: string
) {
  return useQuery({
    queryKey: ['batch-rankings', studentIds.sort(), level, weekNo, difficulty],
    queryFn: () => getBatchStudentRankings(studentIds, level, weekNo, difficulty),
    enabled: studentIds.length > 0 && !!level && !!weekNo && !!difficulty,
    
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for optimistic ranking updates during quiz completion
 */
export function useOptimisticRankingUpdates() {
  const queryClient = useQueryClient();
  
  const updateRankingOptimistically = (
    studentId: string,
    level: string,
    weekNo: number,
    difficulty: string,
    newScore: number
  ) => {
    // Update individual ranking cache
    queryClient.setQueryData(
      ['optimized-ranking', studentId, level, weekNo, difficulty],
      (oldData: StudentRanking | null | undefined) => {
        if (!oldData) return null;
        
        // Optimistically assume the score improved the ranking
        const estimatedRank = Math.max(1, Math.floor(oldData.rank * 0.8));
        
        return {
          ...oldData,
          score: newScore,
          rank: estimatedRank,
          percentile: Math.round(((oldData.totalStudents - estimatedRank) / oldData.totalStudents) * 100),
        };
      }
    );
    
    // Update leaderboard cache optimistically
    queryClient.setQueryData(
      ['optimized-leaderboard', level, weekNo, difficulty, 10],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        
        // Add or update student in leaderboard
        const existingIndex = oldData.findIndex(entry => entry.studentId === studentId);
        
        if (existingIndex >= 0) {
          // Update existing entry
          const updatedData = [...oldData];
          updatedData[existingIndex] = {
            ...updatedData[existingIndex],
            score: newScore,
          };
          
          // Re-sort and re-rank
          return updatedData
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({ ...entry, rank: index + 1 }))
            .slice(0, 10);
        } else {
          // Add new entry if it would make the top 10
          const wouldMakeTop10 = oldData.length < 10 || newScore > oldData[oldData.length - 1].score;
          
          if (wouldMakeTop10) {
            const newEntry = {
              studentId,
              studentName: 'You', // Placeholder
              score: newScore,
              rank: 1,
              completedAt: new Date().toISOString(),
            };
            
            return [...oldData, newEntry]
              .sort((a, b) => b.score - a.score)
              .map((entry, index) => ({ ...entry, rank: index + 1 }))
              .slice(0, 10);
          }
        }
        
        return oldData;
      }
    );
  };
  
  const rollbackOptimisticUpdates = (
    studentId: string,
    level: string,
    weekNo: number,
    difficulty: string
  ) => {
    // Invalidate to refetch fresh data
    queryClient.invalidateQueries({
      queryKey: ['optimized-ranking', studentId, level, weekNo, difficulty]
    });
    
    queryClient.invalidateQueries({
      queryKey: ['optimized-leaderboard', level, weekNo, difficulty]
    });
  };
  
  return {
    updateRankingOptimistically,
    rollbackOptimisticUpdates,
  };
}

/**
 * Hook for prefetching rankings for better navigation performance
 */
export function usePrefetchRankings() {
  const queryClient = useQueryClient();
  
  const prefetchRankings = async (
    studentId: string,
    quizConfigs: Array<{
      level: string;
      weekNo: number;
      difficulty: string;
    }>
  ) => {
    const prefetchPromises = quizConfigs.map(({ level, weekNo, difficulty }) => [
      // Prefetch ranking
      queryClient.prefetchQuery({
        queryKey: ['optimized-ranking', studentId, level, weekNo, difficulty],
        queryFn: () => calculateStudentRankingOptimized(studentId, level, weekNo, difficulty),
        staleTime: 2 * 60 * 1000,
      }),
      
      // Prefetch leaderboard
      queryClient.prefetchQuery({
        queryKey: ['optimized-leaderboard', level, weekNo, difficulty, 10],
        queryFn: () => getQuizLeaderboardOptimized(level, weekNo, difficulty, 10),
        staleTime: 2 * 60 * 1000,
      }),
    ]).flat();
    
    await Promise.all(prefetchPromises);
  };
  
  return { prefetchRankings };
}

/**
 * Combined hook for ranking and leaderboard with loading states
 */
export function useOptimizedQuizStats(
  studentId: string,
  level: string,
  weekNo: number,
  difficulty: string
) {
  const rankingQuery = useOptimizedStudentRanking(studentId, level, weekNo, difficulty);
  const leaderboardQuery = useOptimizedLeaderboard(level, weekNo, difficulty, 10);
  
  return {
    ranking: rankingQuery.data,
    leaderboard: leaderboardQuery.data,
    
    isLoading: rankingQuery.isLoading || leaderboardQuery.isLoading,
    isError: rankingQuery.isError || leaderboardQuery.isError,
    error: rankingQuery.error || leaderboardQuery.error,
    
    refetch: () => {
      rankingQuery.refetch();
      leaderboardQuery.refetch();
    },
  };
}