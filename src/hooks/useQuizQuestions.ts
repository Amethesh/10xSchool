"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQuestionsByLevelAndWeek } from "@/lib/quiz/data-access";
import { Question } from "@/types/types";

/**
 * Optimized hook for fetching quiz questions with aggressive caching
 * Questions rarely change, so we cache them for longer periods
 */
export function useQuizQuestions(level: string, weekNo: number) {
  return useQuery<Question[]>({
    queryKey: ['quiz-questions', level, weekNo],
    queryFn: () => fetchQuestionsByLevelAndWeek(level, weekNo),
    enabled: !!level && !!weekNo,
    
    // Questions rarely change, cache for 30 minutes
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    
    // Reduce network requests
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook to prefetch questions for multiple weeks to improve navigation performance
 */
export function usePrefetchQuestions() {
  const queryClient = useQueryClient();
  
  const prefetchQuestions = async (level: string, weekNumbers: number[]) => {
    const prefetchPromises = weekNumbers.map(weekNo => 
      queryClient.prefetchQuery({
        queryKey: ['quiz-questions', level, weekNo],
        queryFn: () => fetchQuestionsByLevelAndWeek(level, weekNo),
        staleTime: 30 * 60 * 1000, // 30 minutes
      })
    );
    
    await Promise.all(prefetchPromises);
  };
  
  return { prefetchQuestions };
}

/**
 * Hook to get cached questions without triggering a network request
 * Useful for optimistic UI updates
 */
export function useCachedQuestions(level: string, weekNo: number) {
  const queryClient = useQueryClient();
  
  const getCachedQuestions = (): Question[] | undefined => {
    return queryClient.getQueryData(['quiz-questions', level, weekNo]);
  };
  
  const setCachedQuestions = (questions: Question[]) => {
    queryClient.setQueryData(['quiz-questions', level, weekNo], questions);
  };
  
  return { getCachedQuestions, setCachedQuestions };
}