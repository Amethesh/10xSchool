'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCallback } from 'react';

export interface QuizNavigationOptions {
  levelName?: string;
  levelId?: number;
  weekNo?: number;
  difficulty?: string;
  preserveParams?: boolean;
}

export function useQuizNavigation() {
  const router = useRouter();
  const params = useParams();

  // Navigate to levels page
  const navigateToLevels = useCallback((options?: { error?: string; level?: string }) => {
    let url = '/student/levels';
    const searchParams = new URLSearchParams();
    
    if (options?.error) {
      searchParams.set('error', options.error);
    }
    
    if (options?.level) {
      searchParams.set('level', options.level);
    }
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    router.push(url);
  }, [router]);

  // Navigate to quiz page
  const navigateToQuiz = useCallback((options: QuizNavigationOptions) => {
    const { levelId, levelName, weekNo, difficulty } = options;
    
    if (!levelId || !weekNo) {
      console.error('Level and weekNo are required for quiz navigation');
      return;
    }
    
    let url = `/student/quiz/${encodeURIComponent(levelId)}/${weekNo}`;
    
    if (difficulty) {
      url += `?difficulty=${difficulty}`;
    }
    
    router.push(url);
  }, [router]);

  // Navigate to results page
  const navigateToResults = useCallback((options: QuizNavigationOptions & {
    score?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    timeSpent?: number;
  }) => {
    const { levelId, levelName, weekNo, difficulty, score, correctAnswers, totalQuestions, timeSpent } = options;
    
    if (!levelId || !weekNo) {
      console.error('Level and weekNo are required for results navigation');
      return;
    }

    let url = `/student/quiz/${encodeURIComponent(levelId)}/${weekNo}/results`;
    const searchParams = new URLSearchParams();
    
    if (difficulty) searchParams.set('difficulty', difficulty);
    if (score !== undefined) searchParams.set('score', score.toString());
    if (correctAnswers !== undefined) searchParams.set('correctAnswers', correctAnswers.toString());
    if (totalQuestions !== undefined) searchParams.set('totalQuestions', totalQuestions.toString());
    if (timeSpent !== undefined) searchParams.set('timeSpent', timeSpent.toString());
    if(levelName !== undefined) searchParams.set('levelName', levelName.toString())
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    console.log('Navigating to:', url);
    
    try {
      router.replace(url);
      console.log('Navigation initiated successfully');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }, [router]);

  // Navigate back with fallback
  const navigateBack = useCallback((fallbackPath = '/student/levels') => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  }, [router]);

  // Get current route information
  const getCurrentRoute = useCallback(() => {
    const level = parseInt(decodeURIComponent(params.level as string));
    // const level = params.level ? decodeURIComponent(params.level as string) : undefined;
    const weekNo = params.week ? parseInt(params.week as string) : undefined;
    
    return {
      level,
      weekNo,
      isQuizRoute: !!level && !!weekNo,
      isResultsRoute: window.location.pathname.includes('/results'),
      isLevelsRoute: window.location.pathname.includes('/levels'),
    };
  }, [params]);

  // Check if navigation is safe (user has access)
  const canNavigateToLevel = useCallback(async (level: string): Promise<boolean> => {
    try {
      // This would typically check with the server or local state
      // For now, we'll assume beginner is always accessible
      if (level.toLowerCase() === 'beginner') {
        return true;
      }
      
      // In a real implementation, this would check the user's level access
      // For now, we'll return true and let the route protection handle it
      return true;
    } catch (error) {
      console.error('Error checking navigation access:', error);
      return false;
    }
  }, []);

  // Generate breadcrumb data for current route
  const getBreadcrumbData = useCallback(() => {
    const { level, weekNo, isResultsRoute } = getCurrentRoute();
    
    const breadcrumbs: Array<{
      label: string;
      href?: string;
      current?: boolean;
    }> = [
      { label: 'Levels', href: '/student/levels', current: !level }
    ];
    
    if (level) {
      breadcrumbs.push({
        label: "level",
        href: '/student/levels',
        current: false
      });
      
      if (weekNo) {
        const weekBreadcrumb: {
          label: string;
          href?: string;
          current?: boolean;
        } = {
          label: `Week ${weekNo}`,
          current: !isResultsRoute
        };
        
        if (isResultsRoute && level) {
          weekBreadcrumb.href = `/student/quiz/${level}/${weekNo}`;
        }
        
        breadcrumbs.push(weekBreadcrumb);
        
        if (isResultsRoute) {
          breadcrumbs.push({
            label: 'Results',
            current: true
          });
        }
      }
    }
    
    return breadcrumbs;
  }, [getCurrentRoute]);

  return {
    navigateToLevels,
    navigateToQuiz,
    navigateToResults,
    navigateBack,
    getCurrentRoute,
    canNavigateToLevel,
    getBreadcrumbData,
  };
}