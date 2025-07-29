"use client";
import React from "react";
import { Play } from "lucide-react";
import { DifficultySettings } from "@/types/types";
import Image from "next/image";

interface SetupScreenProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  difficulty: "easy" | "medium" | "hard" | "";
  setDifficulty: React.Dispatch<
    React.SetStateAction<"easy" | "medium" | "hard" | "">
  >;
  difficultySettings: DifficultySettings;
  startGame: () => void;
  checkUsername: (name: string) => Promise<boolean>;
  createUser: (name: string) => Promise<boolean>;
  usernameCheckStatus: "idle" | "checking" | "exists" | "not-exists" | "error";
  usernameMessage: string;
  userId: string | null;
  currentTotalScore: number;
  setUsernameCheckStatus: React.Dispatch<
    React.SetStateAction<
      "idle" | "checking" | "exists" | "not-exists" | "error"
    >
  >;
  setUsernameMessage: React.Dispatch<React.SetStateAction<string>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  username,
  setUsername,
  difficulty,
  setDifficulty,
  difficultySettings,
  startGame,
  checkUsername,
  createUser,
  usernameCheckStatus,
  usernameMessage,
  userId,
  currentTotalScore,
  setUsernameCheckStatus,
  setUsernameMessage,
  setUserId,
}) => {
  const isUsernameValid = username.trim().length >= 3;

  const handleCheckUsername = async () => {
    if (isUsernameValid) {
      await checkUsername(username);
    }
  };

  const handleCreateUser = async () => {
    if (isUsernameValid) {
      await createUser(username);
    }
  };

  const canStartGame =
    userId !== null && difficulty !== "" && usernameCheckStatus === "exists";

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

        .pixel-font {
          font-family: "Press Start 2P", cursive;
        }

        .pixel-button {
          background: linear-gradient(to bottom, #4fc3f7 0%, #29b6f6 100%);
          border: none;
          color: #fff;
          padding: 12px 24px;
          font-family: "Press Start 2P", cursive;
          font-size: 8px; /* Consider if this needs to be slightly larger on tiny screens */
          cursor: pointer;
          box-shadow: inset -3px -3px 0px #1565c0, inset 3px 3px 0px #81d4fa,
            3px 3px 0px #0d47a1;
          transition: all 0.1s;
          text-transform: uppercase;
        }

        .pixel-button:hover:not(:disabled) {
          background: linear-gradient(to bottom, #81d4fa 0%, #4fc3f7 100%);
          transform: translate(1px, 1px);
          box-shadow: inset -3px -3px 0px #1565c0, inset 3px 3px 0px #b3e5fc,
            2px 2px 0px #0d47a1;
        }

        .pixel-button:active:not(:disabled) {
          background: linear-gradient(to bottom, #29b6f6 0%, #1565c0 100%);
          transform: translate(3px, 3px);
          box-shadow: inset 3px 3px 0px #0d47a1;
        }

        .pixel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #666;
        }

        .pixel-button-green {
          background: linear-gradient(to bottom, #66bb6a 0%, #4caf50 100%);
          box-shadow: inset -3px -3px 0px #2e7d32, inset 3px 3px 0px #81c784,
            3px 3px 0px #1b5e20;
        }

        .pixel-button-green:hover:not(:disabled) {
          background: linear-gradient(to bottom, #81c784 0%, #66bb6a 100%);
          box-shadow: inset -3px -3px 0px #2e7d32, inset 3px 3px 0px #a5d6a7,
            2px 2px 0px #1b5e20;
        }

        .pixel-button-purple {
          background: linear-gradient(to bottom, #ab47bc 0%, #9c27b0 100%);
          box-shadow: inset -3px -3px 0px #6a1b9a, inset 3px 3px 0px #ce93d8,
            3px 3px 0px #4a148c;
        }

        .pixel-button-purple:hover:not(:disabled) {
          background: linear-gradient(to bottom, #ce93d8 0%, #ab47bc 100%);
          box-shadow: inset -3px -3px 0px #6a1b9a, inset 3px 3px 0px #e1bee7,
            2px 2px 0px #4a148c;
        }

        .pixel-input {
          background: #263238;
          border: 3px solid #4fc3f7;
          color: #e1f5fe;
          padding: 12px 16px;
          font-family: "Press Start 2P", cursive;
          font-size: 10px; /* Consider if this needs to be slightly larger on tiny screens */
          width: 100%;
          outline: none;
          text-transform: uppercase;
        }

        .pixel-input:focus {
          border-color: #81d4fa;
          box-shadow: 0 0 0 2px #4fc3f7;
        }

        .pixel-input::placeholder {
          color: #607d8b;
          opacity: 1;
        }

        .difficulty-button {
          background: #263238;
          border: 3px solid #4fc3f7;
          color: #e1f5fe;
          padding: 16px;
          font-family: "Press Start 2P", cursive;
          font-size: 8px; /* Consider if this needs to be slightly larger on tiny screens */
          cursor: pointer;
          transition: all 0.1s;
          text-transform: uppercase;
          width: 100%;
          margin-bottom: 8px;
        }

        .difficulty-button:hover {
          background: #4fc3f7;
          color: #0d47a1;
          transform: translate(1px, 1px);
        }

        .difficulty-button.selected {
          background: #81c784;
          color: #1b5e20;
          border-color: #66bb6a;
        }

        .pixel-panel {
          background: #1a2b4a80;
          border: 3px solid #4fc3f7;
          position: relative;
        }

        .status-message {
          font-family: "Press Start 2P", cursive;
          font-size: 8px;
          text-transform: uppercase;
          text-align: center;
          padding: 8px;
          margin: 8px 0;
        }

        .status-message.success {
          color: #81c784;
          background: #1b5e20;
          border: 2px solid #66bb6a;
        }

        .status-message.warning {
          color: #ffb74d;
          background: #e65100;
          border: 2px solid #ff9800;
        }

        .status-message.error {
          color: #ef5350;
          background: #c62828;
          border: 2px solid #f44336;
        }

        .pixel-stars {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #81d4fa;
          animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        .blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        /* Custom scrollbar for Webkit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a2b4a;
          border-left: 1px solid #4fc3f7;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4fc3f7;
          border-radius: 10px;
          border: 1px solid #1a2b4a;
        }
      `}</style>

      {/* Main container for the background image and stars */}
      <div className="min-h-screen bg-black relative">
        <Image src={"/images/8bitBG2.png"} fill alt="BG" className="object-cover" /> {/* Added object-cover to ensure it fills */}

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
            className="pixel-panel p-6 sm:p-8 w-full max-w-lg mx-auto overflow-y-auto custom-scrollbar backdrop-blur-md"
            style={{
              maxHeight: 'calc(100vh - 32px)', // Max height to fit within viewport, accounting for p-4 (16px top + 16px bottom)
            }}
          >
            <div className="text-center mb-6 sm:mb-8 flex-shrink-0"> {/* flex-shrink-0 prevents title from shrinking */}
              <h1 className="pixel-font text-3xl sm:text-4xl text-white mb-2 sm:mb-4 tracking-wider">
                MATH QUIZ
              </h1>
              <div className="pixel-font text-xs text-cyan-300 blink">
                ENTER YOU USERNAME TO BEGIN
              </div>
            </div>

            {/* Content area that might scroll */}
            <div className="space-y-4 sm:space-y-6 flex-grow"> {/* flex-grow allows this section to fill remaining height if needed */}
              {/* Username Input Section */}
              <div>
                <div className="pixel-font text-xs text-white mb-2 sm:mb-3 text-center">
                  ENTER YOUR NAME:
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value.toUpperCase());
                    setUsernameCheckStatus("idle");
                    setUsernameMessage("");
                    setUserId(null);
                  }}
                  placeholder="PLAYER NAME"
                  className="pixel-input"
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      isUsernameValid &&
                      usernameCheckStatus === "idle"
                    ) {
                      handleCheckUsername();
                    }
                  }}
                />

                <button
                  onClick={handleCheckUsername}
                  disabled={
                    !isUsernameValid ||
                    usernameCheckStatus === "checking" ||
                    usernameCheckStatus === "exists"
                  }
                  className="pixel-button w-full mt-2 sm:mt-3"
                >
                  {usernameCheckStatus === "checking"
                    ? "CHECKING..."
                    : "CHECK NAME"}
                </button>
              </div>

              {/* Status Message */}
              {usernameMessage && (
                <div
                  className={`status-message ${
                    usernameCheckStatus === "exists"
                      ? "success"
                      : usernameCheckStatus === "not-exists"
                      ? "warning"
                      : "error"
                  }`}
                >
                  {usernameMessage}
                  {usernameCheckStatus === "exists" &&
                    currentTotalScore > 0 &&
                    ` TOTAL: ${currentTotalScore} PTS`}
                </div>
              )}

              {/* Create User Button */}
              {usernameCheckStatus === "not-exists" && (
                <button
                  onClick={handleCreateUser}
                  disabled={!isUsernameValid}
                  className="pixel-button pixel-button-purple w-full"
                >
                  CREATE USER "{username.trim()}"
                </button>
              )}

              {/* Difficulty Selection */}
              <div>
                <div className="pixel-font text-xs text-white mb-3 sm:mb-4 text-center">
                  SELECT DIFFICULTY:
                </div>
                <div className="space-y-1 sm:space-y-2">
                  {Object.entries(difficultySettings).map(([key, setting]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setDifficulty(key as "easy" | "medium" | "hard")
                      }
                      className={`difficulty-button ${
                        difficulty === key ? "selected" : ""
                      }`}
                    >
                      <div className="flex justify-between text-xs sm:text-sm items-center">
                        <span>
                          {setting.icon} {setting.label}
                        </span>
                        <span className="">{setting.time}S</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Game Button */}
              <button
                onClick={startGame}
                disabled={!canStartGame}
                className="pixel-button pixel-button-green w-full text-center"
                style={{ padding: "14px 20px" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" /> {/* Adjusted icon size */}
                  ENTER ARENA
                </div>
              </button>

              {/* Game Rules */}
              <div className="pixel-panel p-3 sm:p-4 mt-4 sm:mt-6">
                <div className="pixel-font text-xs text-white text-center mb-1 sm:mb-2">
                  GAME RULES:
                </div>
                <div className="pixel-font text-[8px] sm:text-xs text-cyan-300 leading-relaxed"> {/* Made font size slightly smaller for rules on tiny screens */}
                  • SOLVE MATH PROBLEMS
                  <br />
                  • BEAT THE TIMER
                  <br />
                  • BUILD COMBOS FOR BONUS
                  <br />
                  • 3 LIVES PER GAME
                  <br />• BECOME THE CHAMPION!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetupScreen;