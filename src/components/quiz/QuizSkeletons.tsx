"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton for quiz question loading
 */
export function QuizQuestionSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 bg-gray-700" />
          <Skeleton className="h-6 w-16 bg-gray-700" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question text */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-3/4 mx-auto bg-gray-700" />
          <Skeleton className="h-6 w-1/2 mx-auto bg-gray-700" />
        </div>
        
        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-gray-700" />
          ))}
        </div>
        
        {/* Timer */}
        <div className="text-center">
          <Skeleton className="h-4 w-24 mx-auto bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for quiz results loading
 */
export function QuizResultsSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <Skeleton className="h-8 w-48 mx-auto bg-gray-700" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-16 w-32 mx-auto bg-gray-700" />
            <Skeleton className="h-6 w-40 mx-auto bg-gray-700" />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto bg-gray-700" />
                <Skeleton className="h-4 w-16 mx-auto bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Ranking card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24 bg-gray-700" />
              <Skeleton className="h-5 w-16 bg-gray-700" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32 bg-gray-700" />
              <Skeleton className="h-5 w-12 bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton for leaderboard loading
 */
export function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-gray-700" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24 bg-gray-600" />
                  <Skeleton className="h-3 w-16 bg-gray-600" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 bg-gray-600" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for level selection loading
 */
export function LevelSelectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto bg-gray-700" />
        <Skeleton className="h-4 w-64 mx-auto bg-gray-700" />
      </div>
      
      {/* Tabs */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 bg-gray-700" />
        ))}
      </div>
      
      {/* Week cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-20 bg-gray-700" />
              <Skeleton className="h-4 w-16 bg-gray-700" />
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-4 rounded-full bg-gray-700" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for performance analytics loading
 */
export function PerformanceAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-16 bg-gray-700" />
              <Skeleton className="h-3 w-20 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart area */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full bg-gray-700" />
        </CardContent>
      </Card>
      
      {/* Recent attempts */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-700/50">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 bg-gray-600" />
                  <Skeleton className="h-3 w-24 bg-gray-600" />
                </div>
                <Skeleton className="h-6 w-12 bg-gray-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}