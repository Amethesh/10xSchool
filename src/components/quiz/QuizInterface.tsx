'use client';

import React, { useEffect, useReducer, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Question, QuizDifficulty, Answer, QuizResults } from '@/types/types';
import { quizReducer, initialState, QuizState } from '@/lib/quiz/quizReducer';
import { QuestionDisplay } from './QuestionDisplay';
import { QuizNavigation } from './QuizNavigation';
import { LivesDisplay } from './LivesDisplay';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import {
  createQuizAttempt,
  updateQuizAttempt,
  saveQuizAnswers,
} from '@/lib/quiz/data-access';
import { calculateQuizScore } from '@/lib/quiz/data-access-utils';
import { QuizError } from '@/lib/quiz/errors';
import { ErrorNotification, useErrorNotification } from './ErrorNotification';
import { QuizErrorBoundary } from './ErrorBoundary';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { formatLevelName } from '@/lib/quiz/level-access-utils';
import { motion, AnimatePresence } from 'motion/react';

interface QuizInterfaceProps {
  questions: Question[];
  difficulty: QuizDifficulty;
  levelId: number;
  levelName: string;
  weekNo: number;
  studentId: string;
  onComplete: (results: QuizResults) => void;
  onExit?: () => void;
}

// Helper to initialize reducer state with props
const initializer = (props: QuizInterfaceProps): QuizState => ({
  ...initialState,
  questions: props.questions,
});

export function QuizInterface({
  questions,
  difficulty,
  levelId,
  levelName,
  weekNo,
  studentId,
  onComplete,
  onExit
}: QuizInterfaceProps) {
  const router = useRouter();
  const { error, showError, clearError, retry } = useErrorNotification();
  const [saveErrors, setSaveErrors] = React.useState<string[]>([]);
  const hasFinalized = useRef(false);

  const [state, dispatch] = useReducer(
    quizReducer,
    { questions, difficulty, levelId, levelName, weekNo, studentId, onComplete, onExit },
    initializer
  );
  const {
    status,
    currentQuestionIndex,
    livesRemaining,
    selectedAnswer,
    answers,
    attemptId,
    error: stateError,
  } = state;

  // == REACT QUERY MUTATIONS for seamless data handling ==

  const { mutate: createAttempt, isPending: isCreatingAttempt } = useMutation({
    mutationFn: () => createQuizAttempt(studentId, levelId, weekNo, difficulty.name, questions.length),
    onSuccess: (newAttemptId) => {
      dispatch({ type: 'INITIALIZE_SUCCESS', payload: { attemptId: newAttemptId, questions } });
    },
    onError: (err) => {
      const quizError = QuizError.fromError(err as Error);
      showError(quizError);
      dispatch({ type: 'INITIALIZE_FAILURE', payload: quizError.userMessage });
    },
  });

  const { mutate: saveAnswerMutation } = useMutation({
    mutationFn: (answer: Answer) => {
      if (!attemptId) throw new Error("Attempt ID is missing");
      return saveQuizAnswers(attemptId, [answer]);
    },
    onError: (err) => {
      const quizError = QuizError.save("Answer might not be saved, but progress is safe locally.");
      showError(quizError);
      setSaveErrors(prev => [...prev, quizError.userMessage]);
    },
  });

  const { mutate: finalizeQuiz, isPending: isFinalizing } = useMutation({
    mutationFn: (results: QuizResults) => {
      if (!attemptId) throw new Error("Attempt ID is missing");
      return updateQuizAttempt(attemptId, results.correctAnswers, results.score, results.timeSpent);
    },
    onSuccess: (_, results) => onComplete(results),
    onError: (err, results) => {
      const quizError = QuizError.save("Failed to save final results. Don't worry, we have a local copy.");
      showError(quizError);
      onComplete(results); // Still complete with local data
    },
  });



  const calculateFinalResults = useCallback((): QuizResults => {
    const quizEndTime = new Date();
    const totalTimeSpent = Math.round((quizEndTime.getTime() - state.quizStartTime) / 1000);
    const scoreData = calculateQuizScore(questions, answers);

    return {
      studentId,
      levelId: levelId,
      levelName: levelName,
      weekNo,
      difficulty,
      totalQuestions: questions.length,
      correctAnswers: scoreData.correctAnswers,
      score: scoreData.score,
      timeSpent: totalTimeSpent,
      answers,
      completedAt: quizEndTime,
      livesUsed: 3 - livesRemaining,
      endReason: livesRemaining <= 0 ? 'no_lives' : 'completed'
    };
  }, [
    answers, difficulty, levelName, livesRemaining, questions, state.quizStartTime, 
    studentId, weekNo
  ]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const { 
    timeRemaining, 
    progress,
    isTimeUp,
    pauseTimer, 
    resumeTimer
  } = useQuizTimer({
    timeLimit: difficulty.timeLimit,
    onTimeUp: useCallback(() => dispatch({ type: 'TIME_UP', payload: { question: currentQuestion } }), [currentQuestion]),
    isActive: status === 'active',
  });
  
  // == STATE-DRIVEN EFFECTS for quiz flow ==

  useEffect(() => {
    // Initialize quiz on mount if not already done
    if (questions.length > 0 && !attemptId && status === 'loading') {
      createAttempt();
    }
  }, [questions, attemptId, status, createAttempt]);

  useEffect(() => {
    // Seamlessly transition to the next question after feedback
    if (status === 'feedback') {
      const lastAnswer = answers[answers.length - 1];
      if (lastAnswer) {
        saveAnswerMutation(lastAnswer);
      }

      const timer = setTimeout(() => {
        dispatch({ type: 'NEXT_QUESTION' });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, answers, saveAnswerMutation]);

    // Finalize quiz when completed - runs only ONCE.
  useEffect(() => {
    if (status === 'completed' && !isFinalizing && !hasFinalized.current) {
      console.log("QUIZ COMPLETED - Finalizing...");
      hasFinalized.current = true; // Mark as finalized to prevent re-runs
      
      const results = calculateFinalResults();
      finalizeQuiz(results);
    }
  }, [status, isFinalizing, finalizeQuiz, calculateFinalResults]);

  // == EVENT HANDLERS (dispatch actions) ==
  const handleAnswerSelect = useCallback((answer: string) => {
    if (status === 'active') {
      // Important: Pause the timer immediately on answer selection
      pauseTimer(); 
      dispatch({ type: 'SELECT_ANSWER', payload: { answer, question: currentQuestion } });
    }
  }, [status, currentQuestion, pauseTimer]);

  const startQuiz = useCallback(() => dispatch({ type: 'START_QUIZ' }), []);
  const togglePause = useCallback(() => {
    if (status === 'paused') {
      resumeTimer();
      dispatch({ type: 'TOGGLE_PAUSE' });
    } else if (status === 'active') {
      pauseTimer();
      dispatch({ type: 'TOGGLE_PAUSE' });
    }
  }, [status, pauseTimer, resumeTimer]);
  const restartQuiz = useCallback(() => {
    dispatch({ type: 'RESTART', payload: { questions } });
    // Re-create the attempt
    createAttempt();
  }, [questions, createAttempt]);
  const exitQuiz = useCallback(() => onExit ? onExit() : router.push('/student/levels'), [onExit, router]);

  const overallProgress = useMemo(() => ((currentQuestionIndex + 1) / questions.length) * 100, [currentQuestionIndex, questions.length]);

  // == RENDER LOGIC based on status ==

  if (status === 'loading' || isCreatingAttempt) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
         <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-cover"
        />
        <div className="pixel-panel p-6 text-center">
          <div className="pixel-font text-white mb-4">Loading Quiz...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="pixel-panel p-8 text-center max-w-md">
          <div className="pixel-font text-xl text-white mb-4">Unable to Start Quiz</div>
          <div className="pixel-font text-sm text-gray-400 mb-6">{stateError}</div>
          <div className="space-y-3">
            <button onClick={retry} className="pixel-button w-full">TRY AGAIN</button>
            <button onClick={exitQuiz} className="pixel-button-secondary w-full">GO BACK</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    const isGameOver = livesRemaining <= 0;
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-fill"
      />
        <div className="pixel-panel p-8 text-center max-w-md">
          {isGameOver ? (
            <>
              <div className="pixel-font text-3xl mb-4">💀</div>
              <h2 className="pixel-font text-xl text-white mb-4">Game Over!</h2>
              <div className="pixel-font text-sm text-red-300 mb-6">You ran out of lives.</div>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="pixel-font text-xl text-white mb-4">Quiz Complete!</h2>
            </>
          )}
          <div className="pixel-font text-sm text-cyan-300 mb-6">Processing your results...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="bg-black p-4 flex flex-col">
         <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-cover"
        />
        <QuizNavigation levelName={levelName} weekNo={weekNo} currentPage="quiz" />
        <div className="flex-grow flex items-center justify-center">
          <div className="pixel-panel p-8 text-center max-w-md w-full">
            <h2 className="pixel-font text-xl text-white mb-4">Ready to Start?</h2>
            <div className="pixel-font text-sm text-cyan-300 mb-2">{levelName.toUpperCase()} - Week {weekNo}</div>
            <div className="pixel-font text-sm text-yellow-400 mb-6">{difficulty.label}</div>
            <div className="pixel-font text-xs text-gray-400 mb-8 leading-relaxed">{questions.length} questions • {difficulty.timeLimit}s per question</div>
            <div className="space-y-4">
              <button onClick={startQuiz} className="pixel-button w-full flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" /> <span>START QUIZ</span>
              </button>
              <button onClick={exitQuiz} className="pixel-button-secondary w-full">EXIT</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizErrorBoundary>
      <div className="w-screen flex flex-col p-2 sm:p-4 overflow-hidden">
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-fill"
      />
      
      {/* --- Quiz Header --- */}
      <motion.section 
        className="flex-shrink-0 mb-2 sm:mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="pixel-panel backdrop-blur-sm p-3 sm:p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Level Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="pixel-font text-xs sm:text-sm text-cyan-300 whitespace-nowrap">
                {formatLevelName(levelName)} - W{weekNo}
              </div>
            </div>
            {/* Right side: Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={togglePause} className="pixel-button-small flex gap-2 items-center" disabled={status === 'feedback'}>
                {status === 'paused' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span className="hidden sm:inline">{status === 'paused' ? 'RESUME' : 'PAUSE'}</span>
              </button>
              <button onClick={exitQuiz} className="pixel-button-secondary-small">EXIT</button>
            </div>
          </div>
          {saveErrors.length > 0 && (
              <div className="mt-2 p-2 border border-yellow-400 bg-yellow-900/20 rounded">
                <div className="pixel-font text-xs text-yellow-400">⚠ Network issue detected. Progress is saved locally.</div>
              </div>
          )}
          {/* Overall Progress Bar with Lives */}
          <div className="mt-4">
            <div className="flex justify-between items-center pixel-font text-[10px] sm:text-xs text-cyan-300/80 mb-1">
              <span>PROGRESS</span>
              <div className="flex items-center gap-3">
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
                <LivesDisplay livesRemaining={livesRemaining} />
            </div>
            </div>
            <div className="w-full bg-cyan-900/40 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- Main Content Area (Question or Paused Screen) --- */}
      <main className="flex-grow flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {status === 'paused' ? (
            <motion.div 
              key="paused-screen"
              className="pixel-panel flex-grow flex flex-col items-center justify-center p-4 sm:p-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Pause className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mb-4" />
              <h3 className="pixel-font text-lg sm:text-xl text-white mb-6">QUIZ PAUSED</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={togglePause} className="pixel-button">RESUME</button>
                <button onClick={restartQuiz} className="pixel-button-secondary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>RESTART</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={currentQuestionIndex} // This makes it re-animate for each question
              className="flex-grow flex flex-col"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <QuestionDisplay
                question={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                timeRemaining={timeRemaining}
                timeLimit={difficulty.timeLimit}
                progress={progress}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                isTimeUp={isTimeUp}
              showAnswerFeedback={status === 'feedback'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
      <ErrorNotification error={error} onRetry={retry} onDismiss={clearError} autoHide={true} />
    </QuizErrorBoundary>
  );
}