'use client';

import React from 'react';
import { Question } from '@/types/types';
import { Clock } from 'lucide-react';
import { AnswerFeedback } from './AnswerFeedback';
import clsx from 'clsx';
import { motion } from "motion/react"
interface QuestionDisplayProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  timeLimit: number;
  progress: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  isTimeUp: boolean;
  showAnswerFeedback: boolean;
}

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'] as const;

export function QuestionDisplay({
  question,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  timeLimit,
  progress,
  selectedAnswer,
  onAnswerSelect,
  isTimeUp,
  showAnswerFeedback,
}: QuestionDisplayProps) {

  const getAnswerText = (option: string): string => {
    switch (option) {
      case 'A': return question.option_a;
      case 'B': return question.option_b;
      case 'C': return question.option_c;
      case 'D': return question.option_d;
      default: return '';
    }
  };

  const getAnswerButtonClass = (option: string): string => {
    // NEW: Refined styling for better feedback and consistency
    const base = `w-full p-3 sm:p-4 border-2 transition-all duration-200 pixel-font text-lg text-left disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-black/40`;
    const correctAnswerText = question.correct_answer;
    
    if (showAnswerFeedback) {
      if (getAnswerText(option) === correctAnswerText) {
        return `${base} border-green-400 bg-green-900/40 text-green-300 scale-105`; // Correct answer pulsates slightly
      }
      if (getAnswerText(option) === selectedAnswer) {
        return `${base} border-red-400 bg-red-900/40 text-red-300 opacity-70`; // Incorrect selected answer
      }
      return `${base} border-gray-700 bg-black/20 text-gray-500 opacity-60`; // Other incorrect options
    }

    if (getAnswerText(option) === selectedAnswer) {
      return `${base} border-cyan-400 bg-cyan-400/20 text-cyan-300`; // Selected answer before feedback
    }
    return `${base} border-cyan-400/60 hover:border-cyan-400 hover:bg-cyan-900/30 text-cyan-300`; // Default state
  };

  const timerColor = timeRemaining > timeLimit * 0.6 ? 'text-green-300' : timeRemaining > timeLimit * 0.3 ? 'text-yellow-300' : 'text-red-300';

  return (
    // NEW: Flex layout to fill available space
    <div className="pixel-panel backdrop-blur-sm p-4 sm:p-6 flex-grow flex flex-col">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="pixel-font text-xs sm:text-sm text-cyan-300">
          QUESTION {currentQuestionIndex + 1} / {totalQuestions}
        </div>
        <motion.div 
            key={timeRemaining}
            initial={{ scale: 1 }}
            animate={timeRemaining <= 5 ? { scale: [1, 1.2, 1] } : {}}
            transition={timeRemaining <= 5 ? { duration: 1, repeat: Infinity } : {}}
            className={clsx("flex items-center gap-2 pixel-font text-sm sm:text-base", timerColor)}
        >
          <Clock className="w-4 h-4" />
          <span>{timeRemaining}s</span>
        </motion.div>
      </div>
      
      {/* Question Timer Progress Bar */}
      <div className="w-full bg-cyan-900/40 rounded-full h-2.5 overflow-hidden mb-4 flex-shrink-0">
         <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }} // Use linear for consistent timer depletion
         />
      </div>

      {/* Question Text Area (takes up remaining vertical space) */}
      <div className="flex-grow flex items-center justify-center overflow-y-auto my-6">
        <h2 className="pixel-font text-2xl sm:text-2xl text-white text-center leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 flex-shrink-0">
        {ANSWER_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onAnswerSelect(getAnswerText(option))}
            disabled={showAnswerFeedback}
            className={getAnswerButtonClass(option)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 border-2 border-current flex items-center justify-center pixel-font text-xs">
                {option}
              </div>
              <span className="text-base sm:text-sm leading-snug">{getAnswerText(option)}</span>
            </div>
          </button>
        ))}
      </div>

      <AnswerFeedback
        question={question}
        selectedAnswer={selectedAnswer}
        isVisible={showAnswerFeedback}
        isTimeUp={isTimeUp && !selectedAnswer} // Only show time's up if no answer was selected
      />
    </div>
  );
}