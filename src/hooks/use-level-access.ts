import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// Custom hook to get current user
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
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return user;
}
import {
  checkStudentLevelAccess,
  getStudentAccessibleLevels,
  createAccessRequest,
  getStudentAccessRequests,
  hasPendingAccessRequest,
  getAccessRequestStatus,
} from '@/lib/quiz/level-access';
import { AccessRequest } from '@/types/types';

/**
 * Hook to check if current user has access to a specific level
 */
export function useLevelAccess(level: string) {
  const user = useUser();
  
  return useQuery({
    queryKey: ['level-access', user?.id, level],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return checkStudentLevelAccess(user.id, level);
    },
    enabled: !!user?.id && !!level,
    staleTime: 10 * 60 * 1000, // 10 minutes - level access changes infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus for level access
  });
}

/**
 * Hook to get all levels the current user has access to
 */
export function useAccessibleLevels() {
  const user = useUser();
  
  return useQuery({
    queryKey: ['accessible-levels', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getStudentAccessibleLevels(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - accessible levels change infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get access requests for the current user
 */
export function useAccessRequests(status?: 'pending' | 'approved' | 'denied') {
  const user = useUser();
  
  return useQuery({
    queryKey: ['access-requests', user?.id, status],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getStudentAccessRequests(user.id, status);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to check if user has a pending access request for a level
 */
export function usePendingAccessRequest(level: string) {
  const user = useUser();
  
  return useQuery({
    queryKey: ['pending-access-request', user?.id, level],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return hasPendingAccessRequest(user.id, level);
    },
    enabled: !!user?.id && !!level,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get access request status for a level
 */
export function useAccessRequestStatus(level: string) {
  const user = useUser();
  
  return useQuery({
    queryKey: ['access-request-status', user?.id, level],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getAccessRequestStatus(user.id, level);
    },
    enabled: !!user?.id && !!level,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create an access request
 */
export function useCreateAccessRequest() {
  const user = useUser();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (level: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return createAccessRequest(user.id, level);
    },
    onSuccess: (_, level) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['access-requests', user?.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pending-access-request', user?.id, level] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['access-request-status', user?.id, level] 
      });
    },
  });
}

/**
 * Hook to check multiple levels access at once
 */
export function useMultipleLevelAccess(levels: string[]) {
  const user = useUser();
  
  return useQuery({
    queryKey: ['multiple-level-access', user?.id, levels.sort()],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const results: Record<string, boolean> = {};
      
      for (const level of levels) {
        results[level] = await checkStudentLevelAccess(user.id, level);
      }
      
      return results;
    },
    enabled: !!user?.id && levels.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook for level access with loading and error states
 */
export function useLevelAccessWithStates(level: string) {
  const accessQuery = useLevelAccess(level);
  const pendingQuery = usePendingAccessRequest(level);
  const statusQuery = useAccessRequestStatus(level);
  
  return {
    hasAccess: accessQuery.data ?? false,
    hasPendingRequest: pendingQuery.data ?? false,
    requestStatus: statusQuery.data ?? 'none',
    isLoading: accessQuery.isLoading || pendingQuery.isLoading || statusQuery.isLoading,
    error: accessQuery.error || pendingQuery.error || statusQuery.error,
    refetch: () => {
      accessQuery.refetch();
      pendingQuery.refetch();
      statusQuery.refetch();
    },
  };
}

/**
 * Hook for managing level access state in components
 */
export function useLevelAccessManager(level: string) {
  const accessStates = useLevelAccessWithStates(level);
  const createRequest = useCreateAccessRequest();
  
  const handleRequestAccess = async () => {
    try {
      await createRequest.mutateAsync(level);
      // Refetch to get updated states
      accessStates.refetch();
    } catch (error) {
      console.error('Failed to request access:', error);
      throw error;
    }
  };
  
  const canRequestAccess = () => {
    return !accessStates.hasAccess && 
           !accessStates.hasPendingRequest && 
           accessStates.requestStatus !== 'denied';
  };
  
  const getAccessButtonText = () => {
    if (accessStates.hasAccess) return 'Access Granted';
    if (accessStates.hasPendingRequest) return 'Request Pending';
    if (accessStates.requestStatus === 'denied') return 'Request Denied';
    return 'Request Access';
  };
  
  const getAccessButtonState = () => {
    if (accessStates.hasAccess) return 'granted';
    if (accessStates.hasPendingRequest) return 'pending';
    if (accessStates.requestStatus === 'denied') return 'denied';
    return 'available';
  };
  
  return {
    ...accessStates,
    handleRequestAccess,
    canRequestAccess: canRequestAccess(),
    buttonText: getAccessButtonText(),
    buttonState: getAccessButtonState(),
    isRequesting: createRequest.isPending,
    requestError: createRequest.error,
  };
}