'use client';

import { useState, useCallback, useEffect } from 'react';
import { Question, Answer, QuizDifficulty, QuizResults } from '@/types/types';
import { checkAnswer, calculateQuizScore } from '@/lib/quiz/data-access';

interface UseQuizManagerProps {
  questions: Question[];
  difficulty: QuizDifficulty;
  studentId: string;
  level: string;
  weekNo: number;
  onQuizComplete: (results: QuizResults) => void;
}

interface UseQuizManagerReturn {
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answers: Answer[];
  selectedAnswer: string | null;
  isQuizCompleted: boolean;
  quizStartTime: Date;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  handleTimeUp: () => void;
  resetQuiz: () => void;
  getQuizProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function useQuizManager({
  questions,
  difficulty,
  studentId,
  level,
  weekNo,
  onQuizComplete
}: UseQuizManagerProps): UseQuizManagerReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());

  const currentQuestion = questions[currentQuestionIndex] || null;

  const selectAnswer = useCallback((answer: string) => {
    if (isQuizCompleted || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    
    // Automatically progress to next question after a short delay
    setTimeout(() => {
      nextQuestion();
    }, 500);
  }, [currentQuestion, isQuizCompleted]);

  const nextQuestion = useCallback(() => {
    if (!currentQuestion) return;

    const timeTaken = Math.round((Date.now() - questionStartTime.getTime()) / 1000);
    const isCorrect = selectedAnswer ? checkAnswer(currentQuestion, selectedAnswer) : false;

    // Save the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeTaken
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(new Date());
    } else {
      completeQuiz([...answers, newAnswer]);
    }
  }, [currentQuestion, selectedAnswer, currentQuestionIndex, questions.length, answers, questionStartTime]);

  const handleTimeUp = useCallback(() => {
    if (isQuizCompleted || !currentQuestion) return;
    
    // Auto-submit with no answer when time is up
    setSelectedAnswer(null);
    nextQuestion();
  }, [currentQuestion, isQuizCompleted, nextQuestion]);

  const completeQuiz = useCallback((finalAnswers: Answer[]) => {
    if (isQuizCompleted) return;

    setIsQuizCompleted(true);
    
    const timeSpent = Math.round((Date.now() - quizStartTime.getTime()) / 1000);
    const scoreData = calculateQuizScore(questions, finalAnswers);

    const results: QuizResults = {
      studentId,
      level,
      weekNo,
      difficulty,
      totalQuestions: questions.length,
      correctAnswers: scoreData.correctAnswers,
      score: scoreData.score,
      timeSpent,
      answers: finalAnswers,
      completedAt: new Date()
    };

    onQuizComplete(results);
  }, [
    isQuizCompleted,
    quizStartTime,
    questions,
    studentId,
    level,
    weekNo,
    difficulty,
    onQuizComplete
  ]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsQuizCompleted(false);
    setQuestionStartTime(new Date());
  }, []);

  const getQuizProgress = useCallback(() => {
    return {
      completed: currentQuestionIndex + (selectedAnswer ? 1 : 0),
      total: questions.length,
      percentage: questions.length > 0 
        ? Math.round(((currentQuestionIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100)
        : 0
    };
  }, [currentQuestionIndex, selectedAnswer, questions.length]);

  // Reset question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  return {
    currentQuestionIndex,
    currentQuestion,
    answers,
    selectedAnswer,
    isQuizCompleted,
    quizStartTime,
    selectAnswer,
    nextQuestion,
    handleTimeUp,
    resetQuiz,
    getQuizProgress
  };
}