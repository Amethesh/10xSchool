// components/result/LeaderboardDisplay.tsx
"use client";
import React from "react";
import { Trophy } from "lucide-react";

// NOTE: You might need to define this type in your @/types/types.ts file
export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  rank: number;
  score: number;
}

interface LeaderboardDisplayProps {
  leaderboard: LeaderboardEntry[] | null;
  isLoading: boolean;
  currentStudentId: string;
}

export function LeaderboardDisplay({
  leaderboard,
  isLoading,
  currentStudentId,
}: LeaderboardDisplayProps) {
  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-500";
    if (index === 1) return "bg-gray-400";
    if (index === 2) return "bg-orange-600";
    return "bg-gray-600";
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48 pixel-font text-xs text-cyan-300">
          LOADING LEADERBOARD...
        </div>
      );
    }

    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 pixel-font text-xs text-cyan-300">
          BE THE FIRST TO SET A SCORE!
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.studentId}
            className={`p-3 transition-all duration-300 pixel-panel ${
              entry.studentId === currentStudentId
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-cyan-400 bg-cyan-400/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getRankColor(
                    index
                  )}`}
                >
                  <span className="pixel-font text-xs text-white">
                    {entry.rank}
                  </span>
                </div>
                <span className="text-base font-semibold text-white">
                  {entry.studentId === currentStudentId
                    ? "YOU"
                    : entry.studentName.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  {entry.score}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pixel-panel p-4 sm:p-6 backdrop-blur-lg bg-black/20 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-yellow-400/20 text-yellow-400 mr-2">
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="pixel-font text-sm text-white">LEADERBOARD</h3>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}