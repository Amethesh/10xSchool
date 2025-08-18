"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuizQuestions, usePrefetchQuestions } from "@/hooks/useQuizQuestions";
import { useOptimizedStudentData } from "@/hooks/useOptimizedStudentData";
import { useOptimisticQuizAnswers } from "@/hooks/useOptimisticQuizAnswers";
import { useOptimizedQuizStats } from "@/hooks/useOptimizedRanking";
import { QuizQuestionSkeleton, QuizResultsSkeleton } from "./QuizSkeletons";
import { Question, QuizDifficulty, QuizResults } from "@/types/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OptimizedQuizInterfaceProps {
  level: string;
  weekNo: number;
  difficulty: QuizDifficulty;
  attemptId: string;
  onComplete: (results: QuizResults) => void;
}

export function OptimizedQuizInterface({
  level,
  weekNo,
  difficulty,
  attemptId,
  onComplete,
}: OptimizedQuizInterfaceProps) {
  const router = useRouter();
  
  // Optimized data fetching
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuizQuestions(level, weekNo);
  const { data: studentProfile } = useOptimizedStudentData();
  const { prefetchQuestions } = usePrefetchQuestions();
  
  // Optimistic updates
  const {
    saveAnswer,
    completeQuiz,
    getQuizProgress,
    initializeQuizProgress,
    updateTimeSpent,
    isSavingAnswer,
    isCompletingQuiz,
  } = useOptimisticQuizAnswers(
    attemptId,
    studentProfile?.id || '',
    level,
    weekNo,
    difficulty.name
  );
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(difficulty.timeLimit);
  const [quizStartTime] = useState(new Date());
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  
  // Initialize quiz progress when questions load
  useEffect(() => {
    if (questions && questions.length > 0) {
      initializeQuizProgress(questions.length);
      
      // Prefetch questions for next week for better navigation
      const nextWeek = weekNo + 1;
      prefetchQuestions(level, [nextWeek, nextWeek + 1]);
    }
  }, [questions, initializeQuizProgress, prefetchQuestions, level, weekNo]);
  
  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || isQuizComplete) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up, auto-submit current question
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, isQuizComplete]);
  
  // Handle answer selection
  const handleAnswerSelect = useCallback((selectedAnswer: string) => {
    if (!questions || isQuizComplete) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const timeTaken = difficulty.timeLimit - timeRemaining;
    
    // Save answer optimistically
    saveAnswer({
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeTaken,
    });
    
    // Update time spent optimistically
    updateTimeSpent(timeTaken);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(difficulty.timeLimit);
    } else {
      completeQuizHandler();
    }
  }, [
    questions,
    currentQuestionIndex,
    difficulty.timeLimit,
    timeRemaining,
    isQuizComplete,
    saveAnswer,
    updateTimeSpent,
  ]);
  
  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!questions || isQuizComplete) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = difficulty.timeLimit;
    
    // Save as incorrect answer
    saveAnswer({
      questionId: currentQuestion.id,
      selectedAnswer: null,
      isCorrect: false,
      timeTaken,
    });
    
    updateTimeSpent(timeTaken);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(difficulty.timeLimit);
    } else {
      completeQuizHandler();
    }
  }, [
    questions,
    currentQuestionIndex,
    difficulty.timeLimit,
    isQuizComplete,
    saveAnswer,
    updateTimeSpent,
  ]);
  
  // Complete quiz
  const completeQuizHandler = useCallback(() => {
    if (!questions || !studentProfile) return;
    
    setIsQuizComplete(true);
    
    const progress = getQuizProgress();
    if (!progress) return;
    
    const results: QuizResults = {
      studentId: studentProfile.id,
      level,
      weekNo,
      difficulty,
      totalQuestions: questions.length,
      correctAnswers: progress.score,
      score: (progress.score / questions.length) * 100,
      timeSpent: progress.timeSpent,
      answers: progress.answers,
      completedAt: new Date(),
    };
    
    // Complete quiz with optimistic updates
    completeQuiz(results);
    onComplete(results);
  }, [
    questions,
    studentProfile,
    level,
    weekNo,
    difficulty,
    getQuizProgress,
    completeQuiz,
    onComplete,
  ]);
  
  // Loading states
  if (questionsLoading) {
    return <QuizQuestionSkeleton />;
  }
  
  if (questionsError) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-red-900/20 border-red-500">
        <CardContent className="p-6 text-center">
          <h3 className="text-red-400 text-lg font-semibold mb-2">
            Failed to Load Quiz
          </h3>
          <p className="text-gray-300 mb-4">
            There was an error loading the quiz questions.
          </p>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-yellow-900/20 border-yellow-500">
        <CardContent className="p-6 text-center">
          <h3 className="text-yellow-400 text-lg font-semibold mb-2">
            No Questions Available
          </h3>
          <p className="text-gray-300 mb-4">
            No questions found for {level} Week {weekNo}.
          </p>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (isQuizComplete) {
    return <OptimizedQuizResults 
      studentId={studentProfile?.id || ''}
      level={level}
      weekNo={weekNo}
      difficulty={difficulty.name}
    />;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Question card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Time:</span>
              <span className={`font-mono text-lg ${
                timeRemaining <= 5 ? 'text-red-400' : 'text-blue-400'
              }`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentQuestion.question}
            </h2>
          </div>
          
          {/* Answer options */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'A', value: currentQuestion.option_a },
              { key: 'B', value: currentQuestion.option_b },
              { key: 'C', value: currentQuestion.option_c },
              { key: 'D', value: currentQuestion.option_d },
            ].map(({ key, value }) => (
              <Button
                key={key}
                onClick={() => handleAnswerSelect(key)}
                disabled={isSavingAnswer}
                className="h-auto p-4 text-left justify-start bg-gray-700 hover:bg-blue-600 border-gray-600 hover:border-blue-500"
                variant="outline"
              >
                <span className="font-bold mr-2">{key}.</span>
                <span>{value}</span>
              </Button>
            ))}
          </div>
          
          {/* Loading indicator */}
          {isSavingAnswer && (
            <div className="text-center text-gray-400">
              Saving answer...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Optimized quiz results component with caching
 */
function OptimizedQuizResults({
  studentId,
  level,
  weekNo,
  difficulty,
}: {
  studentId: string;
  level: string;
  weekNo: number;
  difficulty: string;
}) {
  const { ranking, leaderboard, isLoading } = useOptimizedQuizStats(
    studentId,
    level,
    weekNo,
    difficulty
  );
  
  if (isLoading) {
    return <QuizResultsSkeleton />;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Results display would go here */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-white">
            Quiz Complete!
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {ranking && (
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                #{ranking.rank}
              </div>
              <div className="text-gray-300">
                out of {ranking.totalStudents} students
              </div>
              <div className="text-sm text-gray-400">
                {ranking.percentile}th percentile
              </div>
            </div>
          )}
          
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.studentId}
                    className={`flex justify-between items-center p-2 rounded ${
                      entry.studentId === studentId 
                        ? 'bg-blue-600/20 border border-blue-500' 
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">#{entry.rank}</span>
                      <span>{entry.studentName}</span>
                    </div>
                    <span className="font-semibold">{entry.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}