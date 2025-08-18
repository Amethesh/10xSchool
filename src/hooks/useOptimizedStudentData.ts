"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

// Custom hook to get current user with caching
function useUser() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return user;
}

/**
 * Optimized hook for student profile data with caching
 */
export function useStudentProfile() {
  const user = useUser();
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('students')
        .select('id, fullName, level, totalScore, rank, email')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    
    // Profile data changes less frequently
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Optimized hook for student quiz attempts with pagination and caching
 */
export function useStudentQuizAttempts(studentId: string, limit = 50) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['student-quiz-attempts', studentId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          level,
          week_no,
          difficulty,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          created_at
        `)
        .eq('student_id', studentId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
    
    // Quiz attempts change frequently, shorter cache
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for optimistic quiz attempt updates
 */
export function useOptimisticQuizAttempt() {
  const queryClient = useQueryClient();
  const user = useUser();
  
  const updateAttemptOptimistically = (
    attemptId: string,
    updates: Partial<{
      correct_answers: number;
      score: number;
      time_spent: number;
      completed_at: string;
    }>
  ) => {
    if (!user?.id) return;
    
    // Optimistically update the cache
    queryClient.setQueryData(
      ['student-quiz-attempts', user.id, 50],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(attempt => 
          attempt.id === attemptId 
            ? { ...attempt, ...updates }
            : attempt
        );
      }
    );
  };
  
  const rollbackOptimisticUpdate = () => {
    if (!user?.id) return;
    
    // Invalidate to refetch fresh data
    queryClient.invalidateQueries({
      queryKey: ['student-quiz-attempts', user.id]
    });
  };
  
  return {
    updateAttemptOptimistically,
    rollbackOptimisticUpdate,
  };
}

/**
 * Hook for batch prefetching student-related data
 */
export function usePrefetchStudentData() {
  const queryClient = useQueryClient();
  const user = useUser();
  
  const prefetchStudentData = async () => {
    if (!user?.id) return;
    
    const prefetchPromises = [
      // Prefetch profile
      queryClient.prefetchQuery({
        queryKey: ['student-profile', user.id],
        queryFn: async () => {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('students')
            .select('id, fullName, level, totalScore, rank, email')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          return data;
        },
        staleTime: 5 * 60 * 1000,
      }),
      
      // Prefetch recent quiz attempts
      queryClient.prefetchQuery({
        queryKey: ['student-quiz-attempts', user.id, 50],
        queryFn: async () => {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('quiz_attempts')
            .select(`
              id, level, week_no, difficulty, total_questions,
              correct_answers, score, time_spent, completed_at, created_at
            `)
            .eq('student_id', user.id)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          return data || [];
        },
        staleTime: 2 * 60 * 1000,
      }),
    ];
    
    await Promise.all(prefetchPromises);
  };
  
  return { prefetchStudentData };
}