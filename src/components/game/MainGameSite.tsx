// app/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SetupScreen from "./SetupScreen";
import PlayingScreen from "./PlayingScreen";
import GameOverScreen from "./GameOverScreen";
import {
  Question,
  DifficultySettings,
  Particle,
  LeaderboardEntry,
} from "@/types/types";
import useSound from "@/hooks/useSound";

const difficultySettings: DifficultySettings = {
  easy: {
    time: 15,
    label: "EASY",
    color: "from-green-400 to-green-600",
    icon: "🌟",
  },
  medium: {
    time: 10,
    label: "MEDIUM",
    color: "from-orange-400 to-red-500",
    icon: "⚡",
  },
  hard: {
    time: 5,
    label: "HARD",
    color: "from-purple-500 to-pink-600",
    icon: "🔥",
  },
};

const MathGameSite: React.FC = () => {
  // Game states
  const [gameState, setGameState] = useState<"setup" | "playing" | "gameOver">(
    "setup"
  );
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null); // State to store the user's UUID from Supabase
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">(
    ""
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<
    keyof Question["options"] | ""
  >("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shake, setShake] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [currentQuestionSet, setCurrentQuestionSet] = useState<number>(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // States for the username check/creation flow in SetupScreen
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<
    "idle" | "checking" | "exists" | "not-exists" | "error"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [currentTotalScore, setCurrentTotalScore] = useState<number>(0); // User's accumulated score

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Sound Hooks ---
  const { play: playCorrectSound } = useSound("/sounds/correct.mp3", {
    volume: 0.7,
  });
  const { play: playWrongSound } = useSound("/sounds/wrong.mp3", {
    volume: 0.7,
  });
  const { play: playGameOverSound } = useSound("/sounds/gameOver.mp3", {
    volume: 0.8,
  });
  const { play: playLifeLostSound } = useSound("/sounds/lifeLost.mp3", {
    volume: 0.6,
  });
  const { play: playGameStart } = useSound("/sounds/gamestart.mp3", {
    volume: 0.6,
  });

  // Add more sounds as needed, e.g., for button clicks
  const { play: playClickSound } = useSound("/sounds/click.mp3", {
    volume: 0.5,
  });

  // Particle system for celebrations
  const createParticles = (count: number = 20) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][
          Math.floor(Math.random() * 5)
        ],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // --- API Calls orchestrated from Frontend ---

  const checkUsername = useCallback(async (name: string) => {
    setUsernameCheckStatus("checking");
    setUsernameMessage("");
    setUserId(null); // Clear previous userId
    setCurrentTotalScore(0);
    try {
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(name.trim())}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to check username.");
      }

      if (data.exists) {
        setUsernameCheckStatus("exists");
        setUsernameMessage(
          `Welcome back, ${name}! Your total score: ${data.totalScore} pts.`
        );
        setUserId(data.userId);
        setCurrentTotalScore(data.totalScore);
        return true;
      } else {
        setUsernameCheckStatus("not-exists");
        setUsernameMessage(
          `Username "${name}" does not exist. Click "Create User" to register.`
        );
        return false;
      }
    } catch (error: any) {
      console.error("Frontend: Error checking username:", error.message);
      setUsernameCheckStatus("error");
      setUsernameMessage(`Error: ${error.message}`);
      return false;
    }
  }, []);

  const createUser = useCallback(async (name: string) => {
    setUsernameCheckStatus("checking"); // Indicate loading during creation
    setUsernameMessage("");
    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user.");
      }
      setUsernameCheckStatus("exists"); // Treat creation as success, user now "exists"
      setUsernameMessage(`User "${name}" created successfully!`);
      setUserId(data.userId);
      setCurrentTotalScore(0); // New user starts with 0 total score
      return true;
    } catch (error: any) {
      console.error("Frontend: Error creating user:", error.message);
      setUsernameCheckStatus("error");
      setUsernameMessage(`Error creating user: ${error.message}`);
      return false;
    }
  }, []);

  const fetchQuestions = useCallback(
    async (setNum: number): Promise<Question[]> => {
      try {
        const response = await fetch(`/api/questions?set=${setNum}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Unknown error fetching questions."
          );
        }
        const data: Question[] = await response.json();
        return data;
      } catch (error: any) {
        console.error("Frontend: Error fetching questions:", error.message);
        alert(`Error loading questions: ${error.message}`);
        setGameState("setup"); // Go back to setup on critical error
        return [];
      }
    },
    []
  );

  const submitGameResult = useCallback(
    async (scoreToSubmit: number, playedSet: number) => {
      if (!userId) {
        // Ensure userId is available before submitting
        console.error(
          "Cannot submit game result: userId is missing. This should not happen if game started correctly."
        );
        alert(
          "A user error occurred. Please try logging in or creating a user again."
        );
        setGameState("setup");
        return;
      }
      try {
        console.log(username, scoreToSubmit, playedSet, userId);
        const response = await fetch("/api/submit-game-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            finalScore: scoreToSubmit,
            playedSetNumber: playedSet,
            userId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Unknown error submitting game result."
          );
        }
        const result = await response.json();
        console.log("Game result submitted:", result);
      } catch (error: any) {
        console.error("Frontend: Error submitting game result:", error.message);
        alert(`Error submitting score: ${error.message}. Please try again.`);
      }
    },
    [username, userId]
  ); // Dependencies for useCallback

  const fetchLeaderboard = useCallback(async (setNum: number) => {
    try {
      const response = await fetch(`/api/leaderboard?set=${setNum}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Unknown error fetching leaderboard."
        );
      }
      const data: LeaderboardEntry[] = await response.json();
      setLeaderboard(data);
    } catch (error: any) {
      console.error("Frontend: Error fetching leaderboard:", error.message);
      setLeaderboard([]); // Clear leaderboard on error
    }
  }, []);

  // --- Game Logic ---

  const handleStartGame = async () => {
    // Ensure username is checked/created and difficulty is selected
    if (
      !username.trim() ||
      !difficulty ||
      !userId ||
      usernameCheckStatus !== "exists"
    ) {
      alert(
        "Please ensure your gamer tag is checked and a difficulty is selected."
      );
      return;
    }

    const initialSet = 1; // You can make this dynamic later, e.g., user selects set
    setCurrentQuestionSet(initialSet);

    const fetchedQuestions = await fetchQuestions(initialSet);
    if (fetchedQuestions.length === 0) {
      return; // Error already handled in fetchQuestions, will revert to setup.
    }

    // Randomize the order of fetched questions for variety
    const shuffledQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);

    playGameStart();
    setGameQuestions(shuffledQuestions);
    setGameState("playing");
    setCurrentQuestionIndex(0);
    setLives(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(difficultySettings[difficulty].time);
    setSelectedAnswer("");
    setShowResult(false);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLives((prev) => prev - 1);
    setMaxCombo((prev) => Math.max(prev, combo));
    setCombo(0);
    setShowResult(true);
    setIsCorrect(false);
    setShake(true);
    playWrongSound(); // Play wrong sound on time up
    playLifeLostSound(); // Play life lost sound
    setTimeout(() => setShake(false), 500);
    console.log("Times Up")
    setTimeout(() => {
      if (lives - 1 <= 0) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswerSelect = (answer: keyof Question["options"]) => {
    if (showResult || timeLeft <= 0) return;
    
    console.log("Answer select")
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answer);

    const currentQuestion = gameQuestions[currentQuestionIndex];
    const correct = answer === currentQuestion.correct_answer; // Use correct_answer from DB
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const bonusPoints = Math.min((combo + 1) * 2, 20); // Max bonus points cap
      setScore((prev) => prev + currentQuestion.points + bonusPoints);
      setCombo((prev) => prev + 1);
      setMaxCombo((prev) => Math.max(prev, combo + 1));
      createParticles(15);
      playCorrectSound(); // Play correct sound
    } else {
      setLives((prev) => prev - 1);
      setMaxCombo((prev) => Math.max(prev, combo));
      setCombo(0);
      setShake(true);
      playWrongSound(); // Play wrong sound
      playLifeLostSound(); // Play life lost sound
      setTimeout(() => setShake(false), 500);
    }

    setTimeout(() => {
      if (!correct && lives - 1 <= 0) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= gameQuestions.length) {
      endGame();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(difficultySettings[difficulty].time);
    setSelectedAnswer("");
    setShowResult(false);
    startTimer();
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("gameOver");
    playGameOverSound(); // Play game over sound

    // Submit score and fetch leaderboard concurrently
    await Promise.all([
      submitGameResult(score, currentQuestionSet),
      fetchLeaderboard(currentQuestionSet),
    ]);
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("setup");
    setUsername("");
    setUserId(null); // Clear userId
    setDifficulty("");
    setCurrentQuestionIndex(0);
    setLives(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(0);
    setSelectedAnswer("");
    setShowResult(false);
    setGameQuestions([]);
    setParticles([]);
    setLeaderboard([]);
    setCurrentQuestionSet(1);
    setUsernameCheckStatus("idle"); // Reset check status
    setUsernameMessage(""); // Clear message
    setCurrentTotalScore(0); // Reset total score
  };

  // Particle animation logic
  useEffect(() => {
    let particleInterval: NodeJS.Timeout | null = null;
    if (particles.length > 0) {
      particleInterval = setInterval(() => {
        setParticles((prev) =>
          prev
            .map((particle) => ({
              ...particle,
              x: particle.x + particle.speedX,
              y: particle.y + particle.speedY,
              life: particle.life - 0.02,
            }))
            .filter((particle) => particle.life > 0)
        );
      }, 50);
    }
    return () => {
      if (particleInterval) clearInterval(particleInterval);
    };
  }, [particles]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Global Particle System */}
      {particles.map((particle: Particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none z-30"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      {gameState === "setup" && (
        <SetupScreen
          username={username}
          setUsername={setUsername}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          difficultySettings={difficultySettings}
          startGame={handleStartGame} // Pass the handler from here
          checkUsername={checkUsername}
          createUser={createUser}
          usernameCheckStatus={usernameCheckStatus}
          usernameMessage={usernameMessage}
          userId={userId} // Pass userId to disable start if not set
          currentTotalScore={currentTotalScore}
          setUserId={setUserId}
          setUsernameCheckStatus={setUsernameCheckStatus}
          setUsernameMessage={setUsernameMessage}
        />
      )}

      {gameState === "playing" && gameQuestions.length > 0 && (
        <PlayingScreen
          currentQuestion={gameQuestions[currentQuestionIndex]}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={gameQuestions.length}
          username={username}
          lives={lives}
          score={score}
          timeLeft={timeLeft}
          combo={combo}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          difficultySettings={difficultySettings}
          difficulty={difficulty}
          handleAnswerSelect={handleAnswerSelect}
          shake={shake}
        />
      )}

      {gameState === "gameOver" && (
        <GameOverScreen
          username={username}
          score={score}
          questionsAnswered={currentQuestionIndex + (lives === 0 ? 1 : 0)}
          totalQuestions={gameQuestions.length}
          maxCombo={maxCombo}
          difficulty={difficulty}
          difficultySettings={difficultySettings}
          resetGame={resetGame}
          leaderboard={leaderboard}
          questionSetPlayed={currentQuestionSet}
        />
      )}
    </div>
  );
};

export default MathGameSite;
