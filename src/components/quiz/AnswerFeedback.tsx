'use client';

import React from 'react';
import { Question } from '@/types/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnswerFeedbackProps {
  question: Question;
  selectedAnswer: string | null;
  isVisible: boolean;
  isTimeUp?: boolean;
}

export function AnswerFeedback({
  question,
  selectedAnswer,
  isVisible,
  isTimeUp
}: AnswerFeedbackProps) {
  if (!isVisible) return null;

  const isCorrect = selectedAnswer === question.correct_answer;
  const hasAnswer = selectedAnswer !== null;

  type ColorType = 'green' | 'red';

  let feedback: {
    Icon: React.ComponentType<{ className?: string }>;
    text: string;
    color: ColorType;
  };

  if (isTimeUp) {
    feedback = {
      Icon: Clock,
      text: "TIME'S UP!",
      color: "red" as const
    };
  } else if (isCorrect) {
    feedback = {
      Icon: CheckCircle,
      text: "CORRECT!",
      color: "green" as const
    };
  } else {
    feedback = {
      Icon: XCircle,
      text: "INCORRECT",
      color: "red" as const
    };
  }

  const colorClasses: Record<ColorType, string> = {
    green: "border-green-400 bg-green-900/40 text-green-300",
    red: "border-red-400 bg-red-900/40 text-red-300"
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`p-3 sm:p-4 border-2 rounded-lg ${colorClasses[feedback.color]}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          role="status"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <feedback.Icon className="w-5 h-5" />
            <span className="pixel-font text-sm tracking-widest">{feedback.text}</span>
          </div>

          <div className="text-center space-y-2">
            {!isCorrect && (
              <div>
                <div className="pixel-font text-[10px] text-cyan-300/70">Correct Answer</div>
                <div className="pixel-font text-sm text-white font-bold">{question.correct_answer}</div>
              </div>
            )}
            {hasAnswer && !isCorrect && (
              <div>
                <div className="pixel-font text-[10px] text-cyan-300/70">Your Answer</div>
                <div className="pixel-font text-sm">{selectedAnswer}</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}