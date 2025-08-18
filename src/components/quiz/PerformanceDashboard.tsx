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
    weeklyProgress,
    compareAttempts,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{metrics?.averageScore || 0}%</p>
              </div>
              <div className="flex items-center">
                {getTrendIcon(metrics?.improvementTrend || 'stable')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold">{metrics?.totalQuizzes || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{metrics?.streakCount || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Speed Score</p>
                <p className="text-2xl font-bold">{metrics?.speedScore || 0}</p>
                <p className="text-xs text-gray-500">questions/min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attemptComparison && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Latest Score</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{attemptComparison.current.score}%</span>
                        {attemptComparison.previous && (
                          <div className="flex items-center gap-1">
                            {getChangeIcon(attemptComparison.improvements.scoreChange)}
                            <span className="text-sm">
                              {Math.abs(attemptComparison.improvements.scoreChange).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {attemptComparison.insights.map((insight, index) => (
                        <div key={index} className={`p-2 rounded text-sm ${
                          insight.type === 'improvement' ? 'bg-green-50 text-green-700' :
                          insight.type === 'regression' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {insight.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones?.slice(0, 5).map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        milestone.achieved ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-lg">{milestone.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          milestone.achieved ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {milestone.title}
                        </p>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                        {milestone.achieved && milestone.achievedAt && (
                          <p className="text-xs text-green-600">
                            Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {milestone.achieved && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelProgress?.map((level) => (
                  <div key={level.level} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{level.level}</h4>
                      <Badge variant="outline">{level.quizzesCompleted} quizzes</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average</span>
                        <span>{level.averageScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Best</span>
                        <span>{level.bestScore}%</span>
                      </div>
                      <Progress value={level.averageScore} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                {learningPath && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Position</h4>
                      <p className="text-sm text-gray-600">
                        {learningPath.currentLevel} - Week {learningPath.currentWeek}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Mastered Topics</h4>
                      <div className="space-y-1">
                        {learningPath.masteredTopics.slice(0, 3).map((topic, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{topic.level} Week {topic.week}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {topic.masteryScore.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Suggested Next</h4>
                      <div className="space-y-2">
                        {learningPath.suggestedNext.slice(0, 2).map((suggestion, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                            <p className="font-medium">{suggestion.level} Week {suggestion.week}</p>
                            <p className="text-gray-600">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Progression */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillProgression?.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            skill.level === 'expert' ? 'default' :
                            skill.level === 'advanced' ? 'secondary' :
                            skill.level === 'intermediate' ? 'outline' : 'destructive'
                          }>
                            {skill.level}
                          </Badge>
                          {getTrendIcon(skill.recentTrend)}
                        </div>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                      <div className="text-sm text-gray-600">
                        Next: {skill.nextMilestone.description} ({skill.nextMilestone.estimatedTime})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressSessions?.slice(0, 5).map((session) => (
                  <div key={session.date} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {session.quizzesCompleted} quizzes • {session.averageScore.toFixed(1)}% avg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s
                      </p>
                      {session.improvements.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {session.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-center gap-1">
                              {getChangeIcon(improvement.change)}
                              <span className="text-xs">
                                {Math.abs(improvement.change).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Peer Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Peer Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {peerComparison && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">#{peerComparison.studentRank}</p>
                      <p className="text-sm text-gray-600">
                        out of {peerComparison.totalStudents} students
                      </p>
                      <p className="text-sm text-blue-600">
                        {peerComparison.percentile}th percentile
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Top Performers</h4>
                      <div className="space-y-1">
                        {peerComparison.topPerformers.map((performer) => (
                          <div key={performer.rank} className="flex justify-between text-sm">
                            <span>#{performer.rank} {performer.studentName}</span>
                            <span>{performer.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Similar Performers</h4>
                      <div className="space-y-1">
                        {peerComparison.similarPerformers.map((performer) => (
                          <div key={performer.rank} className="flex justify-between text-sm">
                            <span>#{performer.rank} {performer.studentName}</span>
                            <div className="flex items-center gap-1">
                              <span>{performer.score}%</span>
                              {getChangeIcon(performer.scoreDifference)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Difficulty Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {difficultyComparison && (
                  <div className="space-y-4">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => {
                      const data = difficultyComparison[diff];
                      return (
                        <div key={diff} className="p-3 border rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium capitalize">{diff}</span>
                            <Badge variant="outline">{data.attempts} attempts</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Average</span>
                              <span>{data.averageScore.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Best</span>
                              <span>{data.bestScore}%</span>
                            </div>
                            <Progress value={data.averageScore} className="h-1" />
                          </div>
                        </div>
                      );
                    })}

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <div className="space-y-1">
                        {difficultyComparison.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm p-2 bg-yellow-50 rounded">
                            <span className="font-medium capitalize">{rec.difficulty}:</span> {rec.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historical Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['week', 'month', 'all_time'] as const).map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe === 'all_time' ? 'All Time' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </Button>
                  ))}
                </div>

                {(() => {
                  const selectedData = getSelectedHistoricalData();
                  if (!selectedData) return null;
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {selectedData.currentPeriod.averageScore.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Average Score</p>
                        {selectedData.previousPeriod && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {getChangeIcon(selectedData.trends.scoreImprovement)}
                            <span className="text-xs">
                              {Math.abs(selectedData.trends.scoreImprovement).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {selectedData.currentPeriod.quizzesCompleted}
                        </p>
                        <p className="text-sm text-gray-600">Quizzes</p>
                        {selectedData.previousPeriod && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {getChangeIcon(selectedData.trends.activityChange)}
                            <span className="text-xs">
                              {Math.abs(selectedData.trends.activityChange)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {selectedData.currentPeriod.bestScore}%
                        </p>
                        <p className="text-sm text-gray-600">Best Score</p>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {selectedData.currentPeriod.consistency.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-600">Consistency</p>
                        {selectedData.previousPeriod && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {getChangeIcon(-selectedData.trends.consistencyChange)}
                            <span className="text-xs">
                              {Math.abs(selectedData.trends.consistencyChange).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Strengths and Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle>Strengths & Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Strong Levels</h4>
                      <div className="space-y-1">
                        {analytics.strengthsAndWeaknesses.strongLevels.map((level) => (
                          <div key={level.level} className="flex justify-between text-sm">
                            <span>{level.level}</span>
                            <span className="text-green-600">{level.averageScore.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Areas for Improvement</h4>
                      <div className="space-y-1">
                        {analytics.strengthsAndWeaknesses.weakLevels.map((level) => (
                          <div key={level.level} className="flex justify-between text-sm">
                            <span>{level.level}</span>
                            <span className="text-red-600">{level.averageScore.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <p className="text-lg font-bold text-purple-600">
                        {analytics.timeAnalysis.timeEfficiency.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Score per minute</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Fastest Quizzes</h4>
                      <div className="space-y-1">
                        {analytics.timeAnalysis.fastestQuizzes.slice(0, 3).map((quiz, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{quiz.level} W{quiz.weekNo}</span>
                            <span>{Math.floor(quiz.timeSpent / 60)}:{(quiz.timeSpent % 60).toString().padStart(2, '0')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Average Time by Difficulty</h4>
                      <div className="space-y-1">
                        {analytics.timeAnalysis.averageTimeByDifficulty.map((diff) => (
                          <div key={diff.difficulty} className="flex justify-between text-sm">
                            <span className="capitalize">{diff.difficulty}</span>
                            <span>{Math.floor(diff.averageTime / 60)}:{(diff.averageTime % 60).toString().padStart(2, '0')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consistency Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Consistency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-lg font-bold text-blue-600 capitalize">
                        {analytics.consistencyMetrics.consistencyRating}
                      </p>
                      <p className="text-sm text-gray-600">Consistency Rating</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Most Consistent</p>
                        <p className="text-green-600">{analytics.consistencyMetrics.mostConsistentLevel || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Least Consistent</p>
                        <p className="text-red-600">{analytics.consistencyMetrics.leastConsistentLevel || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        Score Variance: {analytics.consistencyMetrics.scoreVariance.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {getTrendIcon(analytics.progressTrends.overallTrend)}
                          <span className="font-medium">Overall</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {analytics.progressTrends.overallTrend}
                        </p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {getTrendIcon(analytics.progressTrends.recentTrend)}
                          <span className="font-medium">Recent</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {analytics.progressTrends.recentTrend}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyGoals && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Progress value={weeklyGoals.overallProgress} className="h-3 mb-2" />
                      <p className="text-sm text-gray-600">
                        {weeklyGoals.overallProgress.toFixed(0)}% Complete
                      </p>
                    </div>

                    <div className="space-y-3">
                      {weeklyGoals.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{goal.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={(goal.current / goal.target) * 100} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-sm text-gray-600">
                                {goal.current}/{goal.target}
                              </span>
                            </div>
                          </div>
                          {goal.completed && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
                              ✓
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goal Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.goalTracking && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
                      <p className="text-sm text-gray-600">Target Score</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics.goalTracking.targetScore}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Current: {analytics.goalTracking.currentAverage}%
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress to Target</span>
                        <span className="text-sm text-gray-600">
                          {analytics.goalTracking.progressToTarget.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analytics.goalTracking.progressToTarget} className="h-3" />
                    </div>

                    {analytics.goalTracking.estimatedAttemptsToTarget > 0 && (
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-700">
                          Estimated {analytics.goalTracking.estimatedAttemptsToTarget} more attempts to reach target
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {analytics.goalTracking.recommendations.map((rec, index) => (
                          <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}