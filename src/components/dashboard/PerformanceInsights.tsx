"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'achievement' | 'improvement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'consistency' | 'speed' | 'accuracy' | 'progress';
  data?: {
    current: number;
    previous?: number;
    target?: number;
    change?: number;
  };
}

interface PerformanceInsightsProps {
  insights: Insight[];
  title?: string;
  maxInsights?: number;
  showCategories?: boolean;
}

export function PerformanceInsights({ 
  insights, 
  title = "Performance Insights",
  maxInsights = 10,
  showCategories = true
}: PerformanceInsightsProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'improvement':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-300/20 border-yellow-200/50';
      case 'improvement':
        return 'bg-green-300/20 border-green-200/50';
      case 'warning':
        return 'bg-red-300/20 border-red-200/50';
      case 'suggestion':
        return 'bg-blue-300/20 border-blue-200/50';
      case 'milestone':
        return 'bg-purple-300/20 border-purple-200/50';
      default:
        return 'bg-gray-300/20 border-gray-200/50';
    }
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'consistency':
        return <Target className="h-4 w-4" />;
      case 'speed':
        return <Clock className="h-4 w-4" />;
      case 'accuracy':
        return <CheckCircle className="h-4 w-4" />;
      case 'progress':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Sort insights by priority and type
  const sortedInsights = [...insights]
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const typeOrder = { warning: 5, suggestion: 4, improvement: 3, achievement: 2, milestone: 1 };
      
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return typeOrder[b.type] - typeOrder[a.type];
    })
    .slice(0, maxInsights);

  // Group insights by category if requested
  const groupedInsights = showCategories 
    ? sortedInsights.reduce((groups, insight) => {
        const category = insight.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(insight);
        return groups;
      }, {} as Record<string, Insight[]>)
    : { all: sortedInsights };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm">Complete more quizzes to get personalized insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline" className='text-white text-nowrap font-mono'>
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
            <div key={category}>
              {showCategories && category !== 'all' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  {getCategoryIcon(category as Insight['category'])}
                  <h4 className="font-medium capitalize">{category}</h4>
                </div>
              )}
              
              <div className="space-y-3">
                {categoryInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border-2 backdrop-blur- ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-xl">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(insight.priority)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-white mb-3">
                          {insight.description}
                        </p>
                        
                        {/* Data visualization if available */}
                        {insight.data && (
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-white">Current:</span>
                              <span className="font-medium">{insight.data.current}%</span>
                            </div>
                            
                            {insight.data.previous !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">Previous:</span>
                                <span className="font-medium">{insight.data.previous}%</span>
                                {insight.data.change !== undefined && (
                                  <span className={`flex items-center gap-1 ${
                                    insight.data.change > 0 ? 'text-green-600' : 
                                    insight.data.change < 0 ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {insight.data.change > 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : insight.data.change < 0 ? (
                                      <TrendingDown className="h-3 w-3" />
                                    ) : null}
                                    {Math.abs(insight.data.change).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {insight.data.target !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-white">Target:</span>
                                <span className="font-medium">{insight.data.target}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {insights.length > maxInsights && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-white">
              Showing {maxInsights} of {insights.length} insights
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to generate insights from performance data
export function generatePerformanceInsights(
  currentScore: number,
  previousScore?: number,
  averageScore?: number,
  targetScore?: number,
  consistency?: number,
  speed?: number,
  accuracy?: number
): Insight[] {
  const insights: Insight[] = [];
  let insightId = 0;

  // Score-based insights
  if (previousScore !== undefined) {
    const scoreChange = currentScore - previousScore;
    
    if (scoreChange >= 10) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'improvement',
        title: 'Significant Score Improvement',
        description: `Your score improved by ${scoreChange.toFixed(1)}% from your previous attempt. Great progress!`,
        actionable: false,
        priority: 'medium',
        category: 'performance',
        data: {
          current: currentScore,
          previous: previousScore,
          change: scoreChange
        }
      });
    } else if (scoreChange <= -10) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'warning',
        title: 'Score Decline',
        description: `Your score decreased by ${Math.abs(scoreChange).toFixed(1)}%. Consider reviewing the material before your next attempt.`,
        actionable: true,
        action: {
          label: 'Review Material',
          onClick: () => console.log('Navigate to review')
        },
        priority: 'high',
        category: 'performance',
        data: {
          current: currentScore,
          previous: previousScore,
          change: scoreChange
        }
      });
    }
  }

  // Achievement insights
  if (currentScore >= 90) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'achievement',
      title: 'Excellent Performance',
      description: 'Outstanding! You scored 90% or higher. You\'ve mastered this material.',
      actionable: true,
      action: {
        label: 'Try Harder Difficulty',
        onClick: () => console.log('Navigate to harder difficulty')
      },
      priority: 'low',
      category: 'performance',
      data: {
        current: currentScore
      }
    });
  } else if (currentScore >= 75) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'improvement',
      title: 'Good Performance',
      description: 'Well done! You\'re performing above average. Keep up the good work.',
      actionable: false,
      priority: 'low',
      category: 'performance',
      data: {
        current: currentScore
      }
    });
  }

  // Target-based insights
  if (targetScore !== undefined) {
    const progressToTarget = (currentScore / targetScore) * 100;
    
    if (currentScore >= targetScore) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'milestone',
        title: 'Target Achieved',
        description: `Congratulations! You've reached your target score of ${targetScore}%.`,
        actionable: true,
        action: {
          label: 'Set New Target',
          onClick: () => console.log('Set new target')
        },
        priority: 'medium',
        category: 'progress',
        data: {
          current: currentScore,
          target: targetScore
        }
      });
    } else if (progressToTarget >= 80) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'suggestion',
        title: 'Close to Target',
        description: `You're ${(100 - progressToTarget).toFixed(1)}% away from your target. One more good attempt should get you there!`,
        actionable: false,
        priority: 'medium',
        category: 'progress',
        data: {
          current: currentScore,
          target: targetScore
        }
      });
    }
  }

  // Consistency insights
  if (consistency !== undefined) {
    if (consistency < 10) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'achievement',
        title: 'Highly Consistent',
        description: 'Your performance is very consistent across attempts. This shows strong understanding of the material.',
        actionable: false,
        priority: 'low',
        category: 'consistency'
      });
    } else if (consistency > 25) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'suggestion',
        title: 'Improve Consistency',
        description: 'Your scores vary significantly between attempts. Focus on steady practice to improve consistency.',
        actionable: true,
        action: {
          label: 'Practice Regularly',
          onClick: () => console.log('Navigate to practice')
        },
        priority: 'medium',
        category: 'consistency'
      });
    }
  }

  // Speed insights
  if (speed !== undefined) {
    if (speed > 2) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'achievement',
        title: 'Fast Problem Solver',
        description: `You're answering ${speed.toFixed(1)} questions per minute. Excellent speed!`,
        actionable: false,
        priority: 'low',
        category: 'speed'
      });
    } else if (speed < 0.5) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'suggestion',
        title: 'Work on Speed',
        description: 'Consider practicing with easier questions to build up your speed and confidence.',
        actionable: true,
        action: {
          label: 'Practice Speed',
          onClick: () => console.log('Navigate to speed practice')
        },
        priority: 'medium',
        category: 'speed'
      });
    }
  }

  // Accuracy insights
  if (accuracy !== undefined) {
    if (accuracy >= 90) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'achievement',
        title: 'High Accuracy',
        description: `${accuracy.toFixed(1)}% accuracy shows excellent understanding. Great job!`,
        actionable: false,
        priority: 'low',
        category: 'accuracy'
      });
    } else if (accuracy < 60) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'warning',
        title: 'Low Accuracy',
        description: 'Focus on understanding the concepts rather than speed. Accuracy is more important than speed.',
        actionable: true,
        action: {
          label: 'Review Concepts',
          onClick: () => console.log('Navigate to concept review')
        },
        priority: 'high',
        category: 'accuracy'
      });
    }
  }

  return insights;
}