'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuizNavigation } from '@/hooks/useQuizNavigation';
import { QuizInterface } from '@/components/quiz/QuizInterface';
import { DifficultyModal } from '@/components/quiz/DifficultyModal';
import { QuizNavigation } from '@/components/quiz/QuizNavigation';
import { RouteProtection } from '@/components/quiz/RouteProtection';
import { Question, QuizDifficulty, QuizResults } from '@/types/types';
import { fetchQuestionsByLevelAndWeek } from '@/lib/quiz/data-access';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

function QuizPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { navigateToResults, navigateToLevels } = useQuizNavigation();
  const levelId = parseInt(decodeURIComponent(params.level as string));
  const levelName = searchParams.get("levelName");
  const weekNo = parseInt(params.week as string);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | null>(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentCourse, setStudentCourse] = useState<string | null>(null);
  const [finalQuizResults, setFinalQuizResults] = useState<QuizResults | null>(null);

  // Fetch user + course together so both state values are set in the same render.
  // This prevents the loadQuestions effect from running with the stale default course.
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: studentData } = await supabase
        .from('students')
        .select('course')
        .eq('id', user.id)
        .single();

      // Set both together — React 18 batches these into one render,
      // so loadQuestions won't fire until studentCourse is resolved.
      setStudentId(user.id);
      setStudentCourse(studentData?.course || 'm3-genius-program');
    };

    getCurrentUser();
  }, [router]);

  // Load questions — only runs once both studentId and studentCourse are resolved
  useEffect(() => {
    const loadQuestions = async () => {
      if (!levelId || !weekNo || !studentId || studentCourse === null) return;

      try {
        setLoading(true);
        const fetchedQuestions = await fetchQuestionsByLevelAndWeek(levelId, weekNo, studentCourse);
        if (fetchedQuestions.length === 0) {
          setError('No questions found for this level and week.');
          return;
        }

        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load quiz questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [levelId, weekNo, studentId, studentCourse]);

  useEffect(() => {
    if (finalQuizResults) {
      console.log("Results state updated. Navigating via useEffect...");
      navigateToResults({
        levelId,
        levelName: levelName || "",
        weekNo,
        difficulty: finalQuizResults.difficulty.name,
        score: finalQuizResults.score,
        correctAnswers: finalQuizResults.correctAnswers,
        totalQuestions: finalQuizResults.totalQuestions,
        timeSpent: finalQuizResults.timeSpent
      });
    }
  }, [finalQuizResults, levelId, levelName, weekNo, navigateToResults]);

  const handleDifficultySelect = (difficulty: QuizDifficulty) => {
    setSelectedDifficulty(difficulty);
    setShowDifficultyModal(false);
  };

  const handleQuizComplete = (results: QuizResults) => {
    console.log("Quiz completed! Setting results state to trigger navigation effect.");
    setFinalQuizResults(results);
  };

  const handleExit = () => {
    navigateToLevels();
  };

  const handleModalClose = () => {
    navigateToLevels();
  };

  // Loading state
  if (loading || !studentId || studentCourse === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-cover"
        />
        <div className="pixel-panel p-8 text-center">
          <div className="pixel-font text-white mb-4">Loading Quiz...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="pixel-panel p-8 text-center max-w-md">
          <div className="pixel-font text-red-400 mb-4">Error</div>
          <div className="pixel-font text-sm text-white mb-6">{error}</div>
          <button
            onClick={handleExit}
            className="pixel-button"
          >
            BACK TO LEVELS
          </button>
        </div>
      </div>
    );
  }

  if (finalQuizResults) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="pixel-panel p-8 text-center">
          <div className="pixel-font text-white mb-4">Quiz Complete! Loading results...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show difficulty selection modal
  if (showDifficultyModal) {
    return (
      <div className="bg-black">
         <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />
        <div className="p-4 z-50">
          <QuizNavigation
            levelName={levelName || ""}
            weekNo={weekNo}
            currentPage="quiz"
          />
        </div>
        <DifficultyModal
          levelName={levelName || ""}
          weekNo={weekNo}
          onSelect={handleDifficultySelect}
          onClose={handleModalClose}
          isOpen={true}
        />
      </div>
    );
  }

  // Show quiz interface
  if (selectedDifficulty && questions.length > 0) {
    return (
      <QuizInterface
        questions={questions}
        difficulty={selectedDifficulty}
        levelId={levelId}
        levelName={levelName || ""}
        weekNo={weekNo}
        studentId={studentId}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  return null;
}

export default function QuizPage() {
  const params = useParams();
  const level = parseInt(decodeURIComponent(params.level as string));

  return (
    <RouteProtection level={level}>
      <QuizPageContent />
    </RouteProtection>
  );
}