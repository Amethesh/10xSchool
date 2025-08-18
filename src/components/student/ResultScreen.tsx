// /src/components/game/ResultsScreen.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { getLeaderboardForLevel } from "@/app/student/play/action";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type LeaderboardEntry = {
  username: string;
  score: number;
};

type Props = {
  status: "completed" | "failed";
  score: number;
  levelId: number;
  username: string;
  onRestart: () => void;
};

export default function ResultsScreen({
  status,
  score,
  levelId,
  username,
  onRestart,
}: Props) {
  const { width, height } = useWindowSize();
  const {
    data: leaderboard,
    isLoading,
    error,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", levelId],
    queryFn: () => Promise.resolve([]), // TODO: Implement leaderboard fetching
  });

  const isCompleted = status === "completed";

  return (
    <div className="pixel-font flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {isCompleted && (
        <Confetti width={width} height={height} recycle={false} />
      )}

      <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-lg shadow-lg text-center max-w-2xl w-full">
        <h1
          className={`text-5xl font-bold mb-4 ${
            isCompleted ? "text-yellow-400" : "text-red-500"
          }`}
        >
          {isCompleted ? "Level Completed!" : "Game Over"}
        </h1>

        <p className="text-2xl mb-6">
          {isCompleted ? "Great job, you aced it!" : "Better luck next time!"}
        </p>

        <div className="text-3xl mb-8">
          Your Score: <span className="text-green-400 font-bold">{score}</span>
        </div>

        <div className="w-full bg-gray-900 p-4 rounded-md">
          <h2 className="text-2xl mb-4 border-b-2 border-gray-500 pb-2">
            Leaderboard
          </h2>
          {isLoading && <p>Loading high scores...</p>}
          {error && <p className="text-red-400">Could not load scores.</p>}
          {leaderboard && (
            <ul className="space-y-2 text-left">
              {leaderboard.map((entry, index) => (
                <li
                  key={index}
                  className={`flex justify-between p-2 rounded ${
                    entry.username === username
                      ? "bg-yellow-600"
                      : "bg-gray-700"
                  }`}
                >
                  <span>
                    {index + 1}. {entry.username}
                  </span>
                  <span className="font-bold">{entry.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={onRestart}
          className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg border-b-4 border-blue-800 active:border-b-0 transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
