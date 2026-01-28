"use client";

import React from "react";
import { Clock, Zap, Timer, Snail, TrendingUp, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// --- Type Definitions based on your JSON ---
interface QuizMetric {
  weekNo: number;
  timeSpent: number;
  score: number;
}

interface DifficultyMetric {
  difficulty: "easy" | "medium" | "hard" | string;
  averageTime: number;
  attempts: number;
}

interface TimeAnalysisData {
  timeEfficiency: number;
  fastestQuizzes: QuizMetric[];
  slowestQuizzes: QuizMetric[];
  averageTimeByDifficulty: DifficultyMetric[];
}

interface TimeAnalysisDisplayProps {
  analytics: { timeAnalysis: TimeAnalysisData } | null;
}

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  if (seconds === 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const getEfficiencyColor = (score: number) => {
  if (score >= 50) return "text-emerald-400";
  if (score >= 20) return "text-yellow-400";
  return "text-rose-400";
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "hard": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    default: return "bg-slate-500/20 text-slate-300";
  }
};

export function TimeAnalysisDisplay({ analytics }: TimeAnalysisDisplayProps) {
  const timeAnalysis = analytics?.timeAnalysis;

  if (!timeAnalysis) {
    return (
      <Card className="border-cyan-500/20 bg-slate-950/50">
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-2 text-cyan-300/50">
            <Clock className="w-8 h-8 opacity-50" />
            <p className="pixel-font text-sm">No time analysis data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max time for relative progress bars
  const maxAvgTime = Math.max(...timeAnalysis.averageTimeByDifficulty.map(d => d.averageTime)) || 1;

  return (
    <Card className="border-cyan-500/20 bg-slate-950/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 flex-col border-b border-cyan-500/10">
        <CardTitle className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-cyan-100">Time Analytics</span>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 pixel-font">
            <TrendingUp className="w-3 h-3 mr-1" />
            Eff: {timeAnalysis.timeEfficiency.toFixed(1)}
          </Badge>
        </CardTitle>
        <CardDescription className="!text-sm text-cyan-300/60">
          Breakdown of speed, efficiency, and difficulty handling.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        
        {/* Section 1: Average Time by Difficulty (Visual Bars) */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium text-cyan-300/80 uppercase tracking-wider text-xs">
            <Timer className="w-4 h-4" /> Average Pace by Difficulty
          </h4>
          <div className="grid gap-4">
            {timeAnalysis.averageTimeByDifficulty.map((item) => (
              <div key={item.difficulty} className="relative group">
                <div className="flex justify-between items-end mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border capitalize ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                  <span className="text-xs text-cyan-300/70 pixel-font">
                    {formatTime(item.averageTime)} <span className="opacity-50 mx-1">/</span> {item.attempts} attempts
                  </span>
                </div>
                {/* Custom Progress Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.difficulty === 'hard' ? 'bg-rose-500' : 
                      item.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(item.averageTime / maxAvgTime) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-cyan-500/10" />

        {/* Section 2: Split View - Fastest vs Slowest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Fastest List */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-400/90 mb-4 uppercase tracking-wider text-xs">
              <Zap className="w-4 h-4" /> Speed Runs (Top 3)
            </h4>
            <div className="space-y-3">
              {timeAnalysis.fastestQuizzes
                .filter(q => q.timeSpent > 0) // Optional: Hide invalid 0s attempts if desired, or keep to show skipped
                .slice(0, 3)
                .map((quiz, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-emerald-100">Week {quiz.weekNo}</span>
                    <span className="text-xs text-emerald-400/60">Score: {quiz.score}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-300 pixel-font">{formatTime(quiz.timeSpent)}</span>
                  </div>
                </div>
              ))}
              {timeAnalysis.fastestQuizzes.filter(q => q.timeSpent > 0).length === 0 && (
                 <div className="text-center py-4 text-xs text-cyan-300/40 italic">
                   No completed speed runs recorded.
                 </div>
              )}
            </div>
          </div>

          {/* Slowest List */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-rose-400/90 mb-4 uppercase tracking-wider text-xs">
              <Snail className="w-4 h-4" /> Deep Dives (Top 3)
            </h4>
            <div className="space-y-3">
              {timeAnalysis.slowestQuizzes.slice(0, 3).map((quiz, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-rose-100">Week {quiz.weekNo}</span>
                    <span className="text-xs text-rose-400/60">Score: {quiz.score}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-300 pixel-font">{formatTime(quiz.timeSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Insight */}
        {/* <div className="bg-cyan-950/30 p-3 rounded border border-cyan-500/10 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-xs text-cyan-300/80">
              <span className="font-bold text-cyan-200">Insight:</span> A High Efficiency score ({timeAnalysis.timeEfficiency}) combined with low 'Hard' difficulty times suggests you might be rushing difficult questions.
            </p>
        </div> */}
      </CardContent>
    </Card>
  );
}