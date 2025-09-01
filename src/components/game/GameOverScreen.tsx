// src/components/GameOverScreen.tsx
"use client"; // This component needs to be a client component

import React from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { DifficultySettings, LeaderboardEntry } from "@/types/types";
import Image from "next/image";

interface GameOverScreenProps {
  username: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  maxCombo: number;
  difficulty: "easy" | "medium" | "hard" | "";
  difficultySettings: DifficultySettings;
  resetGame: () => void;
  leaderboard: LeaderboardEntry[]; // New prop for fetched leaderboard data
  questionSetPlayed: number; // New prop for the set number just played
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  username,
  score,
  questionsAnswered,
  totalQuestions,
  maxCombo,
  difficulty,
  difficultySettings,
  resetGame,
  leaderboard,
  questionSetPlayed,
}) => {
  return (
    <>

      {/* Main container for the background image and stars */}
      <div className="min-h-screen bg-black relative">
        <Image
          src={"/images/8bitBG.png"}
          fill
          alt="BG"
          className="object-cover"
        />

        {/* 8-bit style floating stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="pixel-stars absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* This wrapper helps center the content panel vertically and horizontally, and provides overall padding */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          {/* The main content panel - now with controlled height and scroll */}
          <div
            className="pixel-panel p-6 sm:p-8 w-full max-w-lg mx-auto overflow-y-auto custom-scrollbar"
            style={{
              maxHeight: "calc(100vh - 32px)", // Max height to fit within viewport, accounting for p-4
            }}
          >
            <div className="mb-4 sm:mb-6 flex-shrink-0">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-yellow-400 mb-2 sm:mb-4 animate-bounce" />
              <h2 className="text-3xl sm:text-4xl tahoma-font bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1">
                GAME OVER
              </h2>
              <p className="tahoma-font text-sm sm:text-lg text-purple-300">
                {username}, you're a math warrior!
              </p>
            </div>

            {/* Score & Stats Section - now a pixel-panel */}
            <div className="pixel-panel pixel-panel-inner p-4 sm:p-6 mb-4 sm:mb-8 border-cyan-400/50">
              <div className="text-2xl sm:text-2xl tahoma-font text-yellow-400 mb-2 flex items-center">
                <span className="text-3xl pb-3">⭐</span>
                {score} POINTS
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[10px] sm:text-sm">
                <div className="pixel-panel-inner p-2 sm:p-3">
                  <div className="text-cyan-300 tahoma-font">
                    Questions Answered
                  </div>
                  <div className="text-white tahoma-font">
                    {questionsAnswered} / {totalQuestions}
                  </div>
                </div>
                <div className="pixel-panel-inner p-2 sm:p-3">
                  <div className="text-cyan-300 tahoma-font">Best Combo</div>
                  <div className="text-white tahoma-font">{maxCombo}x</div>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-purple-300 tahoma-font mb-2 sm:mb-4 text-[10px] sm:text-base">
                Difficulty: {difficultySettings[difficulty]?.label || "N/A"}
              </div>

              {/* Leaderboard Section - also a pixel-panel */}
              <div className="pixel-panel pixel-panel-inner p-3 sm:p-4 mt-4 border-cyan-400/50">
                <h3 className="text-yellow-300 tahoma-font text-sm sm:text-lg mb-2 sm:mb-3">
                  TOP 10 SCORES (SET {questionSetPlayed})
                </h3>
                {leaderboard.length > 0 ? (
                  <ul className="text-left space-y-1 sm:space-y-2 text-[10px] sm:text-base">
                    {leaderboard.map((entry, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-white"
                      >
                        <span className="tahoma-font">
                          #{index + 1} {entry.username}
                        </span>
                        <span className="tahoma-font text-yellow-200">
                          {entry.score} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 tahoma-font text-[10px] sm:text-sm">
                    No scores yet for this set. Be the first!
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons - using pixel-button style */}
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="pixel-button pixel-button-green w-full text-center"
                style={{ padding: "14px 20px" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-3 h-3 sm:w-5 sm:h-5" />
                  TRY AGAIN
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // Add your book demo logic here
                    window.open("/book-demo", "_blank");
                  }}
                  className="pixel-button w-full text-center"
                  style={{ padding: "12px 16px" }}
                >
                  <div className="flex items-center justify-center gap-1">
                    📚
                    <span className="text-[8px] sm:text-[10px]">BOOK DEMO</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Add your exit logic here - could navigate to home page
                    window.location.href = "/";
                  }}
                  className="pixel-button w-full text-center"
                  style={{ padding: "12px 16px" }}
                >
                  <div className="flex items-center justify-center gap-1">
                    🚪
                    <span className="text-[8px] sm:text-[10px]">EXIT</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameOverScreen;
