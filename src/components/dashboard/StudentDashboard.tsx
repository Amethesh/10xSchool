"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; 
import { fetchPerformanceHistory, fetchPerformanceStats } from '@/lib/performance';
import { generatePerformanceInsights, PerformanceInsights } from './PerformanceInsights';
import { PerformanceChart } from './PerformanceChart';
import { PerformanceDashboard } from './PerformanceDashboard';

interface StudentDashboardProps {
  studentId: string;
  showDashboard?: boolean;
  showChart?: boolean;
  showInsights?: boolean;
}

// A loading skeleton component for a more polished UI
const PerformanceSectionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export function StudentDashboard({ 
  studentId, 
  showDashboard = true,
  showChart = true,
  showInsights = true
}: StudentDashboardProps) {
  
  // Query to fetch data for the performance chart (last 5 attempts)
  const { 
    data: performanceHistory, 
    isLoading: isLoadingHistory, 
    isError: isErrorHistory,
    error: historyError 
  } = useQuery({
    queryKey: ['performanceHistory', studentId],
    queryFn: () => fetchPerformanceHistory(studentId),
  });

  // Query to fetch data for performance insights (aggregated stats)
  const { 
    data: performanceStats, 
    isLoading: isLoadingStats, 
    isError: isErrorStats,
    error: statsError 
  } = useQuery({
    queryKey: ['performanceStats', studentId],
    queryFn: () => fetchPerformanceStats(studentId),
  });

  // Memoize insights generation to avoid re-calculation on every render
  const insights = React.useMemo(() => {
    if (!performanceStats) return null;

    return generatePerformanceInsights(
      performanceStats.currentScore,
      performanceStats.previousScore,
      performanceStats.averageScore,
      90, // Target score can be a prop or fetched from goals in the future
      performanceStats.consistency,
      performanceStats.speed,
      performanceStats.accuracy
    );
  }, [performanceStats]);

  // Get details of the most recent attempt for the dashboard props
  const latestAttempt = performanceHistory && performanceHistory.length > 0 
    ? performanceHistory[performanceHistory.length - 1] 
    : null;

  const isLoading = isLoadingHistory || isLoadingStats;
  const isError = isErrorHistory || isErrorStats;
  const error = historyError || statsError;
  console.log("LST ONE", latestAttempt)
  return (
    <div className="space-y-6">
      {isError && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load performance data. Please try again later.</p>
            <p className="text-sm text-gray-500 mt-2">{(error as Error)?.message}</p>
          </CardContent>
        </Card>
      )}
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>

      {showChart && (
        isLoading ? (
          <PerformanceSectionSkeleton />
        ) : performanceHistory && performanceHistory.length > 0 ? (
          <PerformanceChart
            data={performanceHistory}
            title="Performance Trend"
            showTrend={true}
          />
        ) : !isError && (
           <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No performance data available. Complete a quiz to see your trend!</p>
            </CardContent>
          </Card>
        )
      )}

      {showInsights && (
        isLoading ? (
          <PerformanceSectionSkeleton />
        ) : insights ? (
          <PerformanceInsights
            insights={insights}
            title="Personalized Performance Insights"
            maxInsights={8}
            showCategories={true}
          />
        ) : !isError && (
           <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Not enough data to generate insights. Keep practicing!</p>
            </CardContent>
          </Card>
        )
      )}
    </div>

      {showDashboard && (
        isLoading ? (
          <PerformanceSectionSkeleton />
        ) : latestAttempt ? (
          <PerformanceDashboard
            studentId={studentId}
            level={latestAttempt.level}
            weekNo={latestAttempt.weekNo}
            difficulty={latestAttempt.difficulty}
          />
        ) : !isError && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Complete a quiz to view your personalized dashboard.</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}