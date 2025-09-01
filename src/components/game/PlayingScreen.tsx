// src/components/PlayingScreen.tsx
"use client";
import React from "react";
import HUD from "./HUD";
import { Question } from "@/types/types";
import Image from "next/image";

interface PlayingScreenProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  username: string;
  lives: number;
  score: number;
  timeLeft: number;
  combo: number;
  selectedAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  handleAnswerSelect: (answer: string) => void;
  shake: boolean;
}

const PlayingScreen: React.FC<PlayingScreenProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  username,
  lives,
  score,
  timeLeft,
  combo,
  selectedAnswer,
  showResult,
  isCorrect,
  handleAnswerSelect,
  shake,
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden ${
        shake ? "animate-pulse" : ""
      }`}
      style={{
        fontFamily: '"Tahoma", sans-serif',
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none",
        fontSmooth: "never",
      }}
    >
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />

      {/* Pixel overlay pattern */}
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

      <div className="relative z-10 p-4 h-screen flex flex-col">
        {/* Gaming HUD Header */}
        <HUD
          username={username}
          lives={lives}
          score={score}
          timeLeft={timeLeft}
          combo={combo}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />

        {/* Main Question Area */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="relative w-full max-w-4xl bg-[#1a2b4a]/50 backdrop-blur-sm"
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

            <div className="text-center mb-8">
              <div
                className="text-4xl font-bold mb-6 leading-tight"
                style={{
                  color: "#4fc3f7",
                  textShadow:
                    "3px 3px 0px #1565c0, 6px 6px 0px rgba(13, 71, 161, 0.5)",
                }}
              >
                {currentQuestion.question}
              </div>
              <div
                className="text-sm font-bold"
                style={{
                  color: "#81c784",
                  textShadow: "2px 2px 0px #388e3c",
                }}
              >
                SELECT YOUR ANSWER, WARRIOR! ⚡
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const optionText = key === 'A' ? currentQuestion.option_a :
                                 key === 'B' ? currentQuestion.option_b :
                                 key === 'C' ? currentQuestion.option_c :
                                 currentQuestion.option_d;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showResult}
                    className={`
                      relative p-4 font-bold text-2xl transition-all transform
                      ${
                        showResult
                          ? "pointer-events-none"
                          : "hover:scale-105 cursor-pointer"
                      }
                    `}
                    style={{
                      fontFamily: '"Tahoma", sans-serif',
                      fontSize: "28px",
                      lineHeight: "1.4",
                      background: showResult
                        ? selectedAnswer === key
                          ? isCorrect
                            ? "linear-gradient(to bottom, #66bb6a 0%, #4caf50 100%)"
                            : "linear-gradient(to bottom, #f44336 0%, #d32f2f 100%)"
                          : optionText === currentQuestion.correct_answer
                          ? "linear-gradient(to bottom, #66bb6a 0%, #4caf50 100%)"
                          : "linear-gradient(to bottom, #455a64 0%, #263238 100%)"
                        : "linear-gradient(to bottom, #4fc3f7 0%, #29b6f6 100%)",
                      border: "3px solid",
                      borderColor: showResult
                        ? selectedAnswer === key
                          ? isCorrect
                            ? "#4caf50"
                            : "#f44336"
                          : optionText === currentQuestion.correct_answer
                          ? "#4caf50"
                          : "#607d8b"
                        : "#1565c0",
                      color:
                        showResult &&
                        selectedAnswer !== key &&
                        optionText !== currentQuestion.correct_answer
                          ? "#757575"
                          : "#ffffff",
                      boxShadow: showResult
                        ? "inset 2px 2px 0px rgba(0,0,0,0.3)"
                        : `
                            inset -3px -3px 0px #1565c0,
                            inset 3px 3px 0px #81d4fa,
                            3px 3px 0px #0d47a1
                          `,
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                    }}
                    onMouseEnter={(e) => {
                      if (!showResult) {
                        e.currentTarget.style.background =
                          "linear-gradient(to bottom, #81d4fa 0%, #4fc3f7 100%)";
                        e.currentTarget.style.transform =
                          "scale(1.05) translate(-1px, -1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showResult) {
                        e.currentTarget.style.background =
                          "linear-gradient(to bottom, #4fc3f7 0%, #29b6f6 100%)";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* <div
                        className="w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: "#81c784",
                          color: "#1b5e20",
                          border: "2px solid #4caf50",
                          boxShadow:
                            "inset 1px 1px 0px #a5d6a7, 1px 1px 0px #2e7d32",
                        }}
                      >
                        {key}
                      </div> */}
                      <span className="text-left flex-1">
                        {optionText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="text-center mt-8">
                <div
                  className="text-lg font-bold mb-3"
                  style={{
                    color:
                      timeLeft === 0
                        ? "#f44336"
                        : isCorrect
                        ? "#4caf50"
                        : "#f44336",
                    textShadow: "2px 2px 0px rgba(0,0,0,0.8)",
                    animation: isCorrect ? "pulse 1s infinite" : "none",
                  }}
                >
                  {timeLeft === 0
                    ? "⏰ TIME'S UP!"
                    : isCorrect
                    ? "🎉 PERFECT!"
                    : "💥 MISS!"}
                </div>
                {!isCorrect && (
                  <div
                    className="text-xs font-bold mb-2"
                    style={{
                      color: "#81d4fa",
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                    }}
                  >
                    CORRECT ANSWER:{" "}
                    <span style={{ color: "#4caf50" }}>
                      {currentQuestion.correct_answer}
                    </span>
                  </div>
                )}
                {isCorrect && combo > 1 && (
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: "#ffc107",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.8)",
                      animation: "bounce 1s infinite",
                    }}
                  >
                    +{Math.min(combo * 2, 20)} COMBO BONUS! 🔥
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Tahoma&display=swap");

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translateY(0);
          }
          40%,
          43% {
            transform: translateY(-10px);
          }
          70% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default PlayingScreen;
