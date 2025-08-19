"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuizNavigation } from "@/hooks/useQuizNavigation";
import { ResultsDisplay, ResultsDisplayExample } from "@/components/quiz";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { QuizResults } from "@/types/types";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface QuizResultsPageContentProps {
  paramsData: {
    level: string;
    week: string;
  };
}

export function QuizResultsPageContent({ paramsData }: QuizResultsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigateToQuiz, navigateToLevels } = useQuizNavigation();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [studentId, setStudentId] = useState<string>("");

  // Props are already resolved, so we can use them directly.
  const levelId = parseInt(decodeURIComponent(paramsData.level));
  const weekNo = parseInt(paramsData.week);

  // Get query parameters from the URL
  const difficulty = searchParams.get('difficulty') || 'medium';
  const score = searchParams.get('score');
  const correctAnswers = searchParams.get('correctAnswers');
  const totalQuestions = searchParams.get('totalQuestions');
  const timeSpent = searchParams.get('timeSpent');
  const levelName = searchParams.get('levelName');

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStudentId(user.id);
      } else {
        router.push('/login');
      }
    };

    getCurrentUser();
  }, [router]);

  useEffect(() => {
    if (studentId && score && correctAnswers && totalQuestions && timeSpent) {
      const difficultySettings = {
        easy: { name: 'easy' as const, timeLimit: 15, label: 'Easy (15s)' },
        medium: { name: 'medium' as const, timeLimit: 10, label: 'Medium (10s)' },
        hard: { name: 'hard' as const, timeLimit: 5, label: 'Hard (5s)' },
      };

      const difficultyObj = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

      const quizResults: QuizResults = {
        studentId,
        levelId: levelId,
        levelName: levelName || "",
        weekNo,
        difficulty: difficultyObj,
        totalQuestions: parseInt(totalQuestions),
        correctAnswers: parseInt(correctAnswers),
        score: parseInt(score),
        timeSpent: parseInt(timeSpent),
        answers: [], // This would be populated from the quiz session
        completedAt: new Date(),
        endReason: "completed",
        livesUsed: 2
      };

      setResults(quizResults);
    }
  }, [studentId, paramsData.level, weekNo, difficulty, score, correctAnswers, totalQuestions, timeSpent]);

  const handleRetry = () => {
    navigateToQuiz({
      levelId: levelId,
      levelName: levelName || "",
      weekNo: weekNo,
      difficulty
    });
  };

  const handleBackToLevels = () => {
    navigateToLevels();
  };

  if (!results || !studentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-fill"
        />
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      <div className="relative z-10 p-4">
        <QuizNavigation
          levelName={levelName || ""}
          weekNo={weekNo}
          currentPage="results"
          className="mb-4"
        />
        <ResultsDisplay
          results={results}
          onRetry={handleRetry}
          onBackToLevels={handleBackToLevels}
        />
      </div>
    </div>
  );
}