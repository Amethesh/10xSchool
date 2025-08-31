"use client";

import React from "react";

interface HUDProps {
  username: string;
  lives: number;
  score: number;
  timeLeft: number;
  combo: number;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const HUD: React.FC<HUDProps> = ({
  username,
  lives,
  score,
  timeLeft,
  combo,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // 8-bit pixel heart component
  const PixelHeart: React.FC<{ filled: boolean }> = ({ filled }) => (
    <div
      className={`w-6 h-6 relative ${filled ? "animate-pulse" : ""}`}
      style={{
        background: filled
          ? `
            radial-gradient(circle at 2px 2px, #ff6b6b 0%, #ff6b6b 1px, transparent 1px),
            radial-gradient(circle at 4px 2px, #ff6b6b 0%, #ff6b6b 1px, transparent 1px),
            linear-gradient(45deg, #ff6b6b 0%, #e53e3e 100%)
          `
          : `
            radial-gradient(circle at 2px 2px, #4a5568 0%, #4a5568 1px, transparent 1px),
            radial-gradient(circle at 4px 2px, #4a5568 0%, #4a5568 1px, transparent 1px),
            #2d3748
          `,
        imageRendering: "pixelated",
        clipPath:
          "polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)",
      }}
    />
  );

  return (
    <div
      className="relative mb-6 bg-[#1a2b4a]/50"
      style={{
        border: "3px solid #4fc3f7",
        imageRendering: "pixelated",
      }}
    >
      <div className="p-4">
        <div className="md:flex justify-between items-center mb-3 ">
          <div className="flex items-center gap-4 mb-3">
            {/* Username with 8-bit text styling */}
            <div
              className="font-bold text-lg"
              style={{
                fontFamily: "'Courier New', monospace",
                color: "#4fc3f7",
                textShadow: "2px 2px 0px #1565c0",
                letterSpacing: "1px",
              }}
            >
              {username.toUpperCase()}
            </div>

            {/* 8-bit pixel hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <PixelHeart key={i} filled={i < lives} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Combo indicator */}
            {combo > 1 && (
              <div
                className="px-3 py-1 font-bold text-sm animate-bounce"
                style={{
                  background:
                    "linear-gradient(to bottom, #66bb6a 0%, #4caf50 100%)",
                  color: "#1b5e20",
                  fontFamily: "'Courier New', monospace",
                  boxShadow: `
                    inset -2px -2px 0px #2e7d32,
                    inset 2px 2px 0px #81c784,
                    2px 2px 0px #1b5e20
                  `,
                  letterSpacing: "1px",
                }}
              >
                {combo}X COMBO!
              </div>
            )}

            {/* Score display */}
            <div
              className="text-xl font-bold px-3 py-1"
              style={{
                background: "#263238",
                border: "2px solid #81c784",
                color: "#81c784",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "1px",
              }}
            >
              {score.toLocaleString()} PTS
            </div>

            {/* Timer with 8-bit styling */}
            <div
              className="flex items-center gap-2 px-4 py-2 font-bold text-lg"
              style={{
                background:
                  timeLeft <= 5
                    ? "linear-gradient(to bottom, #f44336 0%, #d32f2f 100%)"
                    : timeLeft <= 10
                    ? "linear-gradient(to bottom, #ff9800 0%, #f57c00 100%)"
                    : "linear-gradient(to bottom, #66bb6a 0%, #4caf50 100%)",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                boxShadow: `
                  inset -2px -2px 0px ${
                    timeLeft <= 5
                      ? "#c62828"
                      : timeLeft <= 10
                      ? "#e65100"
                      : "#2e7d32"
                  },
                  inset 2px 2px 0px ${
                    timeLeft <= 5
                      ? "#ef5350"
                      : timeLeft <= 10
                      ? "#ffb74d"
                      : "#81c784"
                  },
                  2px 2px 0px ${
                    timeLeft <= 5
                      ? "#b71c1c"
                      : timeLeft <= 10
                      ? "#bf360c"
                      : "#1b5e20"
                  }
                `,
                animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none",
              }}
            >
              <span style={{ fontSize: "16px" }}>⏰</span>
              {timeLeft.toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* 8-bit progress bar */}
        <div
          className="h-4 mb-2 relative overflow-hidden "
          style={{
            background: "#263238",
            border: "2px solid #4fc3f7",
            imageRendering: "pixelated",
          }}
        >
          <div
            className="h-full transition-all duration-500 relative"
            style={{
              background:
                "linear-gradient(to right, #29b6f6 0%, #2196f3 50%, #1976d2 100%)",
              width: `${progress}%`,
            }}
          >
            {/* Add shine effect */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: "#64b5f6" }}
            />
          </div>
        </div>

        {/* Question counter */}
        <div
          className="text-center font-bold text-sm"
          style={{
            color: "#4fc3f7",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "2px",
          }}
        >
          MISSION {(currentQuestionIndex + 1).toString().padStart(2, "0")} OF{" "}
          {totalQuestions.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
};

export default HUD;
