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
import { createClient } from "@/lib/supabase/client";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">(
    ""
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
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
  const [currentTotalScore, setCurrentTotalScore] = useState<number>(0);

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
  const supabase = createClient();
  const checkOrCreateUser = useCallback(async (name: string) => {
    setUsernameCheckStatus("checking");
    setUsernameMessage("");
    setUserId(null);
    setCurrentTotalScore(0);
    try {
      const checkResponse = await fetch(
        `/api/check-username?username=${encodeURIComponent(name.trim())}`
      );
      const checkData = await checkResponse.json();
      if (!checkResponse.ok)
        throw new Error(checkData.error || "Failed to check username.");

      if (checkData.exists) {
        setUsernameCheckStatus("exists");
        setUsernameMessage(
          `Welcome back, ${name}! Your total score: ${checkData.total_score} pts.`
        );
        setUserId(checkData.userId);
        setCurrentTotalScore(checkData.totalScore);
        return true;
      } else {
        const createResponse = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name.trim() }),
        });
        const createData = await createResponse.json();
        if (!createResponse.ok)
          throw new Error(createData.error || "Failed to create user.");

        setUsernameCheckStatus("exists");
        setUsernameMessage(`Welcome, ${name}! New player created.`);
        setUserId(createData.userId);
        setCurrentTotalScore(0);
        return true;
      }
    } catch (error: any) {
      console.error("Frontend: Error checking/creating user:", error.message);
      setUsernameCheckStatus("error");
      setUsernameMessage(`Error: ${error.message}`);
      return false;
    }
  }, []);

  const fetchQuestions = useCallback(async (): Promise<Question[]> => {
    try {
      const { data, error } = await supabase.rpc("get_sample_questions");
      if (error) throw new Error(error.message);
      if (!data || !Array.isArray(data))
        throw new Error("No questions received from database");

      const transformedQuestions: Question[] = data.map(
        (item: any, index: number) => ({
          id: item.question_no || index + 1,
          level_no: 1,
          level: "sample",
          week_no: 1,
          question: item.question,
          option_a: item.option_a || "",
          option_b: item.option_b || "",
          option_c: item.option_c || "",
          option_d: item.option_d || "",
          correct_answer: item.correct_answer,
          points: item.point || 10,
        })
      );
      return transformedQuestions;
    } catch (error: any) {
      console.error("Frontend: Error fetching questions:", error.message);
      alert(`Error loading questions: ${error.message}`);
      setGameState("setup");
      return [];
    }
  }, [supabase]);

  const submitGameResult = useCallback(
    async (scoreToSubmit: number, playedSet: number) => {
      if (!userId) {
        console.error("Cannot submit game result: userId is missing.");
        setGameState("setup");
        return;
      }
      try {
        const { data, error } = await supabase.rpc("update_user_score", {
          user_id: userId,
          score_to_add: scoreToSubmit,
        });
        if (error) throw error;
        console.log("Game result submitted successfully. Rows updated:", data);
      } catch (error: any) {
        console.error("Frontend: Error submitting game result:", error.message);
        alert(`Error submitting score: ${error.message}. Please try again.`);
      }
    },
    [userId, supabase]
  );

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) throw error;
      const transformedLeaderboard: LeaderboardEntry[] = (data ?? []).map(
        (entry: any) => ({
          username: entry.username,
          score: entry.total_score,
        })
      );
      setLeaderboard(transformedLeaderboard);
    } catch (error: any) {
      console.error("Frontend: Error fetching leaderboard:", error.message);
      setLeaderboard([]);
    }
  }, [supabase]);

  // --- Game Logic ---
  const handleStartGame = async () => {
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
    const fetchedQuestions = await fetchQuestions();
    if (fetchedQuestions.length === 0) return;

    const shuffledQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);
    playGameStart();
    setGameQuestions(shuffledQuestions);
    setGameState("playing");
    setCurrentQuestionIndex(0);
    setLives(5);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(difficultySettings[difficulty].time);
    setSelectedAnswer("");
    setShowResult(false);
    setCurrentQuestionSet(1);
    // REMOVED: startTimer() call is now handled by useEffect
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

    // FIX: Check if game is over BEFORE updating state to avoid stale state issues
    const isGameOver = lives <= 1;
    console.log("HANDLE TIME UP");
    setLives((prev) => prev - 1);
    setMaxCombo((prev) => Math.max(prev, combo));
    setCombo(0);
    setShowResult(true);
    setIsCorrect(false);
    setShake(true);
    playWrongSound();
    playLifeLostSound();
    setTimeout(() => setShake(false), 500);

    setTimeout(() => {
      if (isGameOver) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult || timeLeft <= 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(answer);
    const currentQuestion = gameQuestions[currentQuestionIndex];
    const selectedOptionText =
      answer === "A"
        ? currentQuestion.option_a
        : answer === "B"
        ? currentQuestion.option_b
        : answer === "C"
        ? currentQuestion.option_c
        : currentQuestion.option_d;

    const correct = selectedOptionText === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const bonusPoints = Math.min((combo + 1) * 2, 20);
      setScore((prev) => prev + currentQuestion.points + bonusPoints);
      setCombo((prev) => prev + 1);
      setMaxCombo((prev) => Math.max(prev, combo + 1));
      createParticles(15);
      playCorrectSound();
      setTimeout(() => nextQuestion(), 2000);
    } else {
      // FIX: Check if game is over BEFORE updating state
      const isGameOver = lives <= 1;
      setLives((prev) => prev - 1);
      setMaxCombo((prev) => Math.max(prev, combo));
      setCombo(0);
      setShake(true);
      playWrongSound();
      playLifeLostSound();
      setTimeout(() => setShake(false), 500);

      setTimeout(() => {
        if (isGameOver) {
          endGame();
        } else {
          nextQuestion();
        }
      }, 2000);
    }
  };

  const nextQuestion = () => {
    // FIX: Check if we are at the end of the question set
    if (currentQuestionIndex + 1 >= gameQuestions.length) {
      endGame();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(difficultySettings[difficulty].time);
    setSelectedAnswer("");
    setShowResult(false);
    // REMOVED: startTimer() call is now handled by useEffect
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("gameOver");
    playGameOverSound();
    await Promise.all([
      submitGameResult(score, currentQuestionSet),
      fetchLeaderboard(),
    ]);
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("setup");
    setUsername("");
    setUserId(null);
    setDifficulty("");
    setCurrentQuestionIndex(0);
    setLives(5);
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
    setUsernameCheckStatus("idle");
    setUsernameMessage("");
    setCurrentTotalScore(0);
  };

  // --- UseEffect Hooks ---

  // FIX: Centralized timer management to prevent race conditions
  useEffect(() => {
    if (gameState === "playing") {
      startTimer();
    }
    // Cleanup function ensures the timer is cleared when question changes or game state changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, gameState]); // Re-run effect when question or game state changes

  // Particle animation logic
  useEffect(() => {
    let particleInterval: NodeJS.Timeout | null = null;
    if (particles.length > 0) {
      particleInterval = setInterval(() => {
        setParticles((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x + p.speedX,
              y: p.y + p.speedY,
              life: p.life - 0.02,
            }))
            .filter((p) => p.life > 0)
        );
      }, 50);
    }
    return () => {
      if (particleInterval) clearInterval(particleInterval);
    };
  }, [particles]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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
          startGame={handleStartGame}
          checkOrCreateUser={checkOrCreateUser}
          usernameCheckStatus={usernameCheckStatus}
          usernameMessage={usernameMessage}
          userId={userId}
          currentTotalScore={currentTotalScore}
          // Pass these setters to SetupScreen to implement the username desync fix
          // In SetupScreen.tsx, your input's onChange should call these setters to reset the status
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
          handleAnswerSelect={handleAnswerSelect}
          shake={shake}
        />
      )}

      {gameState === "gameOver" && (
        <GameOverScreen
          username={username}
          score={score}
          // FIX: This now accurately reflects the number of questions completed
          questionsAnswered={currentQuestionIndex + 1}
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
