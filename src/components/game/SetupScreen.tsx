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
  checkOrCreateUser: (name: string) => Promise<boolean>;
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
  checkOrCreateUser,
  usernameCheckStatus,
  usernameMessage,
  userId,
  currentTotalScore,
  setUsernameCheckStatus,
  setUsernameMessage,
  setUserId,
}) => {
  const isUsernameValid = username.trim().length >= 3;

  const handleCheckOrCreateUser = async () => {
    if (isUsernameValid) {
      await checkOrCreateUser(username);
    }
  };

  const canStartGame =
    userId !== null && difficulty !== "" && usernameCheckStatus === "exists";

  return (
    <>
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
                MATH GAME
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
                      handleCheckOrCreateUser();
                    }
                  }}
                />

                <button
                  onClick={handleCheckOrCreateUser}
                  disabled={
                    !isUsernameValid ||
                    usernameCheckStatus === "checking" ||
                    usernameCheckStatus === "exists"
                  }
                  className="pixel-button w-full mt-2 sm:mt-3"
                >
                  {usernameCheckStatus === "checking"
                    ? "LOADING..."
                    : "CONFIRM NAME"}
                </button>
              </div>

              {/* Status Message */}
              {usernameMessage && (
                <div
                  className={`status-message ${
                    usernameCheckStatus === "exists"
                      ? "success"
                      : "error"
                  }`}
                >
                  {usernameMessage}
                </div>
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