"use client";

import React from 'react';
import { PerformanceDashboard } from './PerformanceDashboard';
import { PerformanceChart } from './PerformanceChart';
import { PerformanceInsights, generatePerformanceInsights } from './PerformanceInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceExampleProps {
  studentId: string;
  showDashboard?: boolean;
  showChart?: boolean;
  showInsights?: boolean;
}

export function PerformanceExample({ 
  studentId, 
  showDashboard = true,
  showChart = true,
  showInsights = true
}: PerformanceExampleProps) {
  // Example data for demonstration
  const examplePerformanceData = [
    {
      date: '2024-01-15',
      score: 65,
      level: 'Beginner',
      weekNo: 1,
      difficulty: 'easy',
      timeSpent: 180
    },
    {
      date: '2024-01-16',
      score: 72,
      level: 'Beginner',
      weekNo: 1,
      difficulty: 'medium',
      timeSpent: 165
    },
    {
      date: '2024-01-17',
      score: 78,
      level: 'Beginner',
      weekNo: 2,
      difficulty: 'easy',
      timeSpent: 150
    },
    {
      date: '2024-01-18',
      score: 85,
      level: 'Beginner',
      weekNo: 2,
      difficulty: 'medium',
      timeSpent: 140
    },
    {
      date: '2024-01-19',
      score: 82,
      level: 'Beginner',
      weekNo: 2,
      difficulty: 'hard',
      timeSpent: 160
    }
  ];

  // Generate example insights
  const exampleInsights = generatePerformanceInsights(
    85, // current score
    78, // previous score
    76, // average score
    90, // target score
    8.5, // consistency (low variance = good)
    1.8, // speed (questions per minute)
    85 // accuracy percentage
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Tracking System Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demonstrates the comprehensive performance tracking and analytics system 
            for the student quiz platform. The system provides detailed insights into 
            student progress, performance trends, and personalized recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Performance Tracking</h4>
              <p className="text-sm text-blue-700">
                Comprehensive metrics including scores, speed, accuracy, and consistency analysis
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Progress Analytics</h4>
              <p className="text-sm text-green-700">
                Learning path analysis, milestone tracking, and skill progression monitoring
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Smart Insights</h4>
              <p className="text-sm text-purple-700">
                AI-powered recommendations and personalized feedback based on performance patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showChart && (
        <PerformanceChart 
          data={examplePerformanceData}
          title="Performance Trend (Last 5 Attempts)"
          showTrend={true}
        />
      )}

      {showInsights && (
        <PerformanceInsights 
          insights={exampleInsights}
          title="Personalized Performance Insights"
          maxInsights={8}
          showCategories={true}
        />
      )}

      {showDashboard && (
        <PerformanceDashboard 
          studentId={studentId}
          level="Beginner"
          weekNo={2}
          difficulty="medium"
        />
      )}
    </div>
  );
}