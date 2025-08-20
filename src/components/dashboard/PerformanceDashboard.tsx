"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award, 
  BarChart3,
  Users,
  Calendar,
  Zap,
  BookOpen,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { usePerformanceComparison } from '@/hooks/usePerformanceComparison';
import { AchievementsDisplay } from './AchievementsDisplay';
import { LevelProgressDisplay } from './LevelProgressDisplay';
import { LearningPathDisplay } from './LearningPathDisplay';
import { SkillProgressionDisplay } from './SkillProgressionDisplay';
import { RecentSessionsDisplay } from './RecentSessionDisplay';
import { WeeklyGoalsDisplay } from './WeeklyGoalsDisplay';
import { TimeAnalysisDisplay } from './TimeAnalysisDisplay';
import { PeerComparisonDisplay } from './PeerComparisonDisplay';

interface PerformanceDashboardProps {
  studentId: string;
  currentAttemptId?: string;
  level?: string;
  weekNo?: number;
  difficulty?: string;
}

export function PerformanceDashboard({
  studentId,
  currentAttemptId,
  level,
  weekNo,
  difficulty
}: PerformanceDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all_time'>('week');

  const {
    metrics,
    levelProgress,
    isLoading: performanceLoading,
    error: performanceError
  } = usePerformanceTracking(studentId);

  const {
    analytics,
    isLoading: analyticsLoading,
    error: analyticsError
  } = usePerformanceAnalytics(studentId);

  const {
    milestones,
    learningPath,
    progressSessions,
    skillProgression,
    weeklyGoals,
    isLoading: progressLoading,
    error: progressError
  } = useProgressTracking(studentId);

  const {
    attemptComparison,
    peerComparison,
    historicalComparison,
    difficultyComparison,
    levelComparison,
    isLoading: comparisonLoading,
    error: comparisonError
  } = usePerformanceComparison(studentId, currentAttemptId, level, weekNo, difficulty);

  const isLoading = performanceLoading || analyticsLoading || progressLoading || comparisonLoading;
  const error = performanceError || analyticsError || progressError || comparisonError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading performance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading performance data. Please try again.</p>
      </div>
    );
  }

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getSelectedHistoricalData = () => {
    if (!historicalComparison) return null;
    switch (selectedTimeframe) {
      case 'week': return historicalComparison.weekly;
      case 'month': return historicalComparison.monthly;
      case 'all_time': return historicalComparison.allTime;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Average Score</p>
                <p className="text-2xl font-bold">{metrics?.averageScore || 0}%</p>
              </div>
              <div className="flex items-center">
                {getTrendIcon(metrics?.improvementTrend || 'stable')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Total Quizzes</p>
                <p className="text-2xl font-bold">{metrics?.totalQuizzes || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Current Streak</p>
                <p className="text-2xl font-bold">{metrics?.streakCount || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Speed Score</p>
                <p className="text-2xl font-bold">{metrics?.speedScore || 0}</p>
                <p className="text-xs text-gray-200">questions/min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 backdrop-blur-md rounded-t-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">\
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <AchievementsDisplay milestones={milestones} />
            <WeeklyGoalsDisplay weeklyGoals={weeklyGoals} />
        </div>
          <LevelProgressDisplay levelProgress={levelProgress} />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LearningPathDisplay learningPath={learningPath} />
						<SkillProgressionDisplay skillProgression={skillProgression} />
          </div>
					<RecentSessionsDisplay progressSessions={progressSessions} />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="analytics" className="space-y-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeAnalysisDisplay analytics={analytics} />
          <PeerComparisonDisplay peerComparison={peerComparison} />
          </div>
        </div>
        </TabsContent>

        {/* Analytics Tab */}
        
      </Tabs>
    </div>
  );
}