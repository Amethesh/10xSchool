"use client";
import React from "react";
import Image from "next/image";
import { GameResult } from "./PlayLevelClient";

interface GameOverScreenProps {
  result: GameResult;
  levelName: string;
  setNumber: number;
  onPlayAgain: () => void;
  onBackToLevels: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  result,
  levelName,
  setNumber,
  onPlayAgain,
  onBackToLevels,
}) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden animate-fade-in"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        imageRendering: "pixelated",
      }}
    >
      {/* Background Image */}
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />

      {/* Pixel overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 25%, rgba(79, 195, 247, 0.1) 25%, rgba(79, 195, 247, 0.1) 50%, transparent 50%, transparent 75%, rgba(79, 195, 247, 0.1) 75%),
            linear-gradient(-45deg, transparent 25%, rgba(129, 199, 132, 0.1) 25%, rgba(129, 199, 132, 0.1) 50%, transparent 50%, transparent 75%, rgba(129, 199, 132, 0.1) 75%)
          `,
          backgroundSize: "4px 4px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Retro Box */}
        <div
          className="relative w-full max-w-2xl bg-[#1a2b4a]/60 backdrop-blur-sm text-center"
          style={{
            border: "4px solid #4fc3f7",
            padding: "32px",
            boxShadow: `
              inset -4px -4px 0px #1565c0,
              inset 4px 4px 0px #81d4fa,
              4px 4px 0px #0d47a1,
              8px 8px 0px rgba(13, 71, 161, 0.5)
            `,
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-400"></div>

          {/* Title */}
          <h1
            className="mb-4"
            style={{
              fontSize: "32px",
              color: result.levelUp ? "#ffc107" : "#f44336",
              textShadow: "3px 3px 0px #000, 6px 6px 0px rgba(0,0,0,0.5)",
            }}
          >
            {result.levelUp ? "LEVEL COMPLETE!" : "GAME OVER"}
          </h1>

          {/* Stats */}
          <p style={{ color: "#81d4fa" }}>Level: {levelName}</p>
          <p
            className="my-4"
            style={{
              fontSize: "24px",
              color: "#4fc3f7",
              textShadow: "2px 2px 0px #1565c0",
            }}
          >
            Final Score: {result.finalScore}
          </p>

          {result.levelUp && (
            <p
              style={{
                color: "#4caf50",
                animation: "pulse 1s infinite",
              }}
            >
              Congratulations! You've reached level {result.newLevel}!
            </p>
          )}

          {/* Leaderboard */}
          <div className="mt-6 bg-black/50 border-2 border-gray-600 p-4 rounded-lg">
            <h2 style={{ color: "#4fc3f7", fontSize: "20px" }}>Leaderboard</h2>
            <h3 className="mb-4" style={{ fontSize: "12px", color: "#aaa" }}>
              Top Scores for Set {setNumber}
            </h3>
            {result.leaderboard?.length ? (
              <ol className="text-left space-y-2">
                {result.leaderboard.map((entry, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center p-2 rounded ${
                      index % 2 === 0 ? "bg-gray-700/50" : "bg-gray-800/50"
                    }`}
                  >
                    <span style={{ color: "#ffc107" }}>{index + 1}.</span>
                    <span
                      className="flex-1 truncate px-2"
                      style={{ color: "#fff" }}
                    >
                      {entry.username ?? "Anonymous"}
                    </span>
                    <span style={{ color: "#4caf50" }}>{entry.score}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ color: "#888" }}>Be the first to set a high score!</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 font-bold"
              style={{
                background: "linear-gradient(to bottom, #4fc3f7, #29b6f6)",
                border: "3px solid #1565c0",
                boxShadow:
                  "inset -3px -3px 0px #1565c0, inset 3px 3px 0px #81d4fa, 3px 3px 0px #0d47a1",
              }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={onBackToLevels}
              className="px-6 py-3 font-bold"
              style={{
                background: "linear-gradient(to bottom, #9e9e9e, #616161)",
                border: "3px solid #424242",
                boxShadow:
                  "inset -3px -3px 0px #424242, inset 3px 3px 0px #bdbdbd, 3px 3px 0px #212121",
              }}
            >
              BACK TO LEVELS
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
