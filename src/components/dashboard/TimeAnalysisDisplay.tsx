// src/components/dashboard/TimeAnalysisDisplay.tsx

"use client";

import React from "react";
import { Clock, Zap, Timer } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// --- Type Definitions ---
interface TimeAnalysisData {
  timeEfficiency: number;
  fastestQuizzes: { level: string; weekNo: number; timeSpent: number; }[];
  averageTimeByDifficulty: { difficulty: string; averageTime: number; }[];
}
interface TimeAnalysisDisplayProps {
  analytics: { timeAnalysis: TimeAnalysisData } | null;
}

// Helper to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function TimeAnalysisDisplay({ analytics }: TimeAnalysisDisplayProps) {
  const timeAnalysis = analytics?.timeAnalysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-cyan-300" />Time Analysis</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!timeAnalysis ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            Time analysis requires more data.
          </div>
        ) : (
          <>
            {/* Time Efficiency */}
            <div className="p-4 text-center bg-purple-500/15 border border-purple-400/30 rounded-lg">
              <p className="pixel-font text-3xl font-bold text-purple-300">
                {timeAnalysis.timeEfficiency.toFixed(1)}
              </p>
              <p className="pixel-font text-xs text-cyan-300/70 mt-1">SCORE PER MINUTE</p>
            </div>
            
            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center gap-2 pixel-font text-sm text-cyan-300/80 mb-2">
                  <Zap className="w-4 h-4" /> Fastest Quizzes
                </h4>
                <div className="space-y-1 pixel-font text-sm text-cyan-300">
                  {timeAnalysis.fastestQuizzes.slice(0, 3).map((quiz, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{quiz.level} W{quiz.weekNo}</span>
                      <span>{formatTime(quiz.timeSpent)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 pixel-font text-sm text-cyan-300/80 mb-2">
                  <Timer className="w-4 h-4" /> Avg Time / Difficulty
                </h4>
                <div className="space-y-1 pixel-font text-sm text-cyan-300">
                  {timeAnalysis.averageTimeByDifficulty.map((diff) => (
                    <div key={diff.difficulty} className="flex justify-between">
                      <span className="capitalize">{diff.difficulty}</span>
                      <span>{formatTime(diff.averageTime)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}