// components/result/HistoryDisplay.tsx
"use client";
import React from "react";
import { Star } from "lucide-react";

// NOTE: You might need to define this type in your @/types/types.ts file
export interface HistoryEntry {
  attemptId: string;
  levelName: string;
  weekNo: number;
  difficulty: string;
  timeSpent: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface PerformanceHistoryProps {
  history: HistoryEntry[];
  isLoading: boolean;
}

export function PerformanceHistory({ history, isLoading }: PerformanceHistoryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48 pixel-font text-xs text-cyan-300">
          LOADING HISTORY...
        </div>
      );
    }

    if (!history || history.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 pixel-font text-xs text-cyan-300">
          YOUR FIRST QUEST!
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {history.slice(0, 5).map((attempt, index) => (
          <div
            key={attempt.attemptId}
            className={`p-3 transition-all duration-300 pixel-panel !rounded-lg ${
              index === 0
                ? "border-blue-400 bg-blue-400/10"
                : "border-cyan-400 bg-cyan-400/5"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-bold text-white">
                  {attempt.levelName.toUpperCase()} - WEEK {attempt.weekNo}
                </div>
                <div className="text-xs text-cyan-300">
                  {attempt.difficulty.toUpperCase()} •{" "}
                  {formatTime(attempt.timeSpent)}
                </div>
              </div>
              <div className="text-right flex flex-col justify-center items-center h-full">
                <div className="text-3xl font-bold text-green-400">
                  {attempt.score}%
                </div>
                <div className="text-sm text-cyan-300">
                  {attempt.correctAnswers}/{attempt.totalQuestions}
                </div>
              </div>
            </div>
            {index === 0 && (
              <div className="mt-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded w-fit">
                LATEST
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pixel-panel p-4 sm:p-6 backdrop-blur-lg bg-black/20 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-purple-400/20 text-purple-400 mr-2">
          <Star className="w-5 h-5" />
        </div>
        <h3 className="pixel-font text-sm text-white">
          RECENT PERFORMANCE
        </h3>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}