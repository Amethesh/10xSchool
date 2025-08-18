"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceDataPoint {
  date: string;
  score: number;
  level: string;
  weekNo: number;
  difficulty: string;
  timeSpent: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
  showTrend?: boolean;
  height?: number;
}

export function PerformanceChart({ 
  data, 
  title = "Performance Over Time",
  showTrend = true,
  height = 200 
}: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate chart dimensions and scaling
  const maxScore = Math.max(...sortedData.map(d => d.score));
  const minScore = Math.min(...sortedData.map(d => d.score));
  const scoreRange = maxScore - minScore || 1;
  
  const chartWidth = 400;
  const chartHeight = height;
  const padding = 40;
  
  // Calculate points for the line chart
  const points = sortedData.map((point, index) => {
    const x = padding + (index / (sortedData.length - 1)) * (chartWidth - 2 * padding);
    const y = padding + ((maxScore - point.score) / scoreRange) * (chartHeight - 2 * padding);
    return { x, y, ...point };
  });

  // Calculate trend line if requested
  let trendLine = null;
  if (showTrend && sortedData.length > 1) {
    // Simple linear regression
    const n = sortedData.length;
    const sumX = sortedData.reduce((sum, _, i) => sum + i, 0);
    const sumY = sortedData.reduce((sum, d) => sum + d.score, 0);
    const sumXY = sortedData.reduce((sum, d, i) => sum + i * d.score, 0);
    const sumXX = sortedData.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const trendStart = intercept;
    const trendEnd = slope * (n - 1) + intercept;
    
    const trendStartY = padding + ((maxScore - trendStart) / scoreRange) * (chartHeight - 2 * padding);
    const trendEndY = padding + ((maxScore - trendEnd) / scoreRange) * (chartHeight - 2 * padding);
    
    trendLine = {
      x1: padding,
      y1: trendStartY,
      x2: chartWidth - padding,
      y2: trendEndY,
      slope
    };
  }

  // Create path string for the line
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // yellow
      case 'hard': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {trendLine && (
            <Badge variant={trendLine.slope > 0 ? 'default' : 'destructive'}>
              {trendLine.slope > 0 ? '↗ Improving' : '↘ Declining'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="border rounded">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map(score => {
              const y = padding + ((maxScore - score) / scoreRange) * (chartHeight - 2 * padding);
              return (
                <g key={score}>
                  <line 
                    x1={padding - 5} 
                    y1={y} 
                    x2={padding} 
                    y2={y} 
                    stroke="#6b7280" 
                    strokeWidth="1"
                  />
                  <text 
                    x={padding - 10} 
                    y={y + 4} 
                    textAnchor="end" 
                    fontSize="12" 
                    fill="#6b7280"
                  >
                    {score}%
                  </text>
                </g>
              );
            })}
            
            {/* Trend line */}
            {trendLine && (
              <line
                x1={trendLine.x1}
                y1={trendLine.y1}
                x2={trendLine.x2}
                y2={trendLine.y2}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            )}
            
            {/* Performance line */}
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill={getDifficultyColor(point.difficulty)}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-8 transition-all cursor-pointer"
                />
                
                {/* Tooltip on hover */}
                <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <rect
                    x={point.x - 40}
                    y={point.y - 50}
                    width="80"
                    height="40"
                    fill="black"
                    fillOpacity="0.8"
                    rx="4"
                  />
                  <text
                    x={point.x}
                    y={point.y - 35}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                  >
                    {point.score}%
                  </text>
                  <text
                    x={point.x}
                    y={point.y - 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                  >
                    {point.level} W{point.weekNo}
                  </text>
                </g>
              </g>
            ))}
          </svg>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Hard</span>
            </div>
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Latest</p>
              <p className="font-bold">{sortedData[sortedData.length - 1]?.score}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="font-bold">
                {(sortedData.reduce((sum, d) => sum + d.score, 0) / sortedData.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Best</p>
              <p className="font-bold">{maxScore}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}