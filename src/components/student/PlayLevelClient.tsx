// src/components/PlayLevelClient.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizForLevel, recordGameResult } from "@/app/student/play/action";
import { useQuizQuestions, usePrefetchQuestions } from "@/hooks/useQuizQuestions";
import { useOptimizedStudentData } from "@/hooks/useOptimizedStudentData";
import { QuizQuestionSkeleton } from "@/components/quiz/QuizSkeletons";
import PlayingScreen from "../game/PlayingScreen";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GameOverScreen from "./GameOverScreen";

// --- Type Definitions ---
type RawQuestionRow = {
  id: string | number;
  question_text: string;
  options: any;
  correct_answer: string;
  points: number;
  set_number: number;
  level: string | null;
  level_id?: number | null;
  lessons?: number;
};

type QuestionForUI = {
  id: string | number;
  question_text: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correct_key: "A" | "B" | "C" | "D";
  points: number;
  set_number: number;
};

// New type for a leaderboard entry
type LeaderboardEntry = {
  username: string | null;
  score: number;
};

export type GameResult = {
  finalScore: number;
  levelUp: boolean;
  newLevel: number;
  leaderboard: LeaderboardEntry[]; // Add leaderboard to result
};



// shuffleArray function remains the same...
function shuffleArray<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlayLevelClient({ level }: { level: string }) {
  const router = useRouter();
  
  // Use optimized data fetching with better caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quiz", level],
    queryFn: () => getQuizForLevel(level),
    staleTime: 10 * 60 * 1000, // 10 minutes - questions don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
  
  // Prefetch related data for better navigation
  const { prefetchQuestions } = usePrefetchQuestions();
  const { data: studentProfile } = useOptimizedStudentData();

  // --- State ---
  const [questions, setQuestions] = useState<QuestionForUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<
    "A" | "B" | "C" | "D" | ""
  >("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [shake, setShake] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const timerRef = useRef<number | null>(null);
  const advanceTimeoutRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Handlers for play again/back to levels
  const handlePlayAgain = () => {
    queryClient.invalidateQueries({ queryKey: ["quiz", level] });
    refetch();
  };
  const handleBackToLevels = () => {
    router.push("/student/levels"); // Adjust this route if needed
  };

  const { mutate: saveResult } = useMutation({
    mutationFn: recordGameResult,
    onSuccess: (data) => setGameResult(data as GameResult),
    onError: (err) => {
      console.error("Failed to save game result:", err);
      setGameResult({
        finalScore: score,
        levelUp: false,
        newLevel: data?.profile?.level ?? 1,
        leaderboard: [],
      });
    },
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (advanceTimeoutRef.current)
        window.clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  const endGame = () => {
    if (isGameOver) return;

    if (timerRef.current) window.clearInterval(timerRef.current);
    if (advanceTimeoutRef.current)
      window.clearTimeout(advanceTimeoutRef.current);

    setIsGameOver(true);
    const isCompleted = currentIndex + 1 >= questions.length && lives > 0;

    if (data?.set_number) {
      saveResult({
        levelName: level,
        setNumber: data.set_number,
        score,
        isCompleted,
      });
    }
  };

  const goNext = () => {
    setShowResult(false);
    setSelectedAnswer("");
    setIsCorrect(false);
    setCurrentIndex((i) => i + 1);
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setSelectedAnswer("");
    setIsCorrect(false);
    setCombo(0);
    setShake(true);
    setTimeout(() => setShake(false), 350);

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setTimeout(endGame, 1200);
    } else {
      advanceTimeoutRef.current = window.setTimeout(goNext, 1200);
    }
  };

  const handleAnswerSelect = (key: "A" | "B" | "C" | "D") => {
    if (showResult || isGameOver) return;
    const q = questions[currentIndex];
    setSelectedAnswer(key);

    const correct = key === q.correct_key;
    setIsCorrect(correct);
    setShowResult(true);
    if (timerRef.current) window.clearInterval(timerRef.current);

    if (correct) {
      setScore((s) => s + (q.points || 1));
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
      setLives((L) => Math.max(0, L - 1));
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }

    const isLastQuestion = currentIndex + 1 >= questions.length;
    const outOfLives = !correct && lives <= 1;

    if (isLastQuestion || outOfLives) {
      setTimeout(endGame, 1000 + (correct ? 400 : 800));
    } else {
      advanceTimeoutRef.current = window.setTimeout(
        goNext,
        1000 + (correct ? 400 : 800)
      );
    }
  };
  // --- Effects ---
  useEffect(() => {
    if (!data?.questions) return;
    const raw: RawQuestionRow[] = data.questions;

    const uiQuestions: QuestionForUI[] = raw.map((r) => {
      const rawOpts =
        typeof r.options === "string" ? JSON.parse(r.options) : r.options || {};
      const values = Object.values(rawOpts).map((v: any) => String(v));
      const shuffled = shuffleArray(values);
      const optionsMap: Record<"A" | "B" | "C" | "D", string> = {
        A: shuffled[0] ?? "",
        B: shuffled[1] ?? "",
        C: shuffled[2] ?? "",
        D: shuffled[3] ?? "",
      };
      const correctVal = String(r.correct_answer ?? "").trim();
      const correctKey = (Object.entries(optionsMap).find(
        ([k, v]) => v === correctVal
      )?.[0] ?? "A") as "A" | "B" | "C" | "D";
      return {
        id: r.id,
        question_text: r.question_text,
        options: optionsMap,
        correct_key: correctKey,
        points: Number(r.points) || 1,
        set_number: Number(r.set_number) || 1,
      };
    });

    setQuestions(uiQuestions);
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setCombo(0);
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setTimeLeft(12);
    setIsGameOver(false);
    setGameResult(null);
  }, [data]);

  useEffect(() => {
    if (!questions.length || isGameOver) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(12);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, currentIndex, isGameOver]);

  // Prefetch related data when component loads
  useEffect(() => {
    if (data && level) {
      // Prefetch questions for adjacent levels for better navigation
      const levelNum = parseInt(level);
      if (!isNaN(levelNum)) {
        prefetchQuestions(`${levelNum + 1}`, [1, 2]);
        prefetchQuestions(`${levelNum - 1}`, [1, 2]);
      }
    }
  }, [data, level, prefetchQuestions]);

  // --- Render Logic ---
  if (isLoading) {
    return <QuizQuestionSkeleton />;
  }
  if (error)
    return (
      <div className="pixel-font text-red-500 p-8 text-center">
        ERROR: {(error as any).message}
      </div>
    );

  if (isGameOver) {
    return gameResult ? (
      <GameOverScreen
        result={gameResult}
        levelName={level}
        setNumber={data?.set_number ?? 0}
        onPlayAgain={handlePlayAgain}
        onBackToLevels={handleBackToLevels}
      />
    ) : (
      <div className="pixel-font text-white p-8 text-center">
        Calculating results...
      </div>
    );
  }

  if (!questions.length || !data)
    return (
      <div className="pixel-font text-white p-8 text-center">
        No questions found for level: {level}
      </div>
    );

  const currentQuestion = questions[currentIndex];
  const playingQuestion = {
    ...currentQuestion,
    correct_answer: currentQuestion.correct_key,
  };

  return (
    <PlayingScreen
      currentQuestion={playingQuestion as any}
      currentQuestionIndex={currentIndex + 1}
      totalQuestions={questions.length}
      username={data?.profile?.fullName ?? "Player"}
      lives={lives}
      score={score}
      timeLeft={timeLeft}
      combo={combo}
      selectedAnswer={selectedAnswer}
      showResult={showResult}
      isCorrect={isCorrect}
      handleAnswerSelect={(k) => handleAnswerSelect(k as any)}
      shake={shake}
    />
  );
}
