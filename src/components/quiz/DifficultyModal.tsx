// src/components/modals/DifficultyModal.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { QuizDifficulty } from '@/types/types';
import clsx from 'clsx';

// --- Prop Types ---
interface DifficultyModalProps {
  levelName: string;
  weekNo: number;
  onSelect: (difficulty: QuizDifficulty) => void;
  onClose: () => void;
  isOpen: boolean;
}

// --- Constants ---
const DIFFICULTY_OPTIONS: QuizDifficulty[] = [
  { name: 'easy', timeLimit: 1500, label: 'Easy - 15 seconds per question' },
  { name: 'medium', timeLimit: 10, label: 'Medium - 10 seconds per question' },
  { name: 'hard', timeLimit: 5, label: 'Hard - 5 seconds per question' }
];

// --- Animation Variants ---
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// --- Helper Functions ---
const formatLevelName = (name: string) => name.replace(/_/g, " ").toUpperCase();

const getDifficultyStyles = (difficulty: QuizDifficulty['name']) => {
    // Shared styles
    const base = "border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
    const hover = "hover:shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0";

    switch (difficulty) {
        case 'easy': return `${base} ${hover} border-green-400 text-green-300 hover:bg-green-400/10 focus:ring-green-400`;
        case 'medium': return `${base} ${hover} border-yellow-400 text-yellow-300 hover:bg-yellow-400/10 focus:ring-yellow-400`;
        case 'hard': return `${base} ${hover} border-red-400 text-red-300 hover:bg-red-400/10 focus:ring-red-400`;
        default: return `${base} ${hover} border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 focus:ring-cyan-400`;
    }
};

// --- The Main Component ---
export function DifficultyModal({
  levelName,
  weekNo,
  onSelect,
  onClose,
  isOpen
}: DifficultyModalProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0   flex items-center justify-center p-4 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="difficulty-modal-title"
        >
          <motion.div
            className="pixel-panel p-4 sm:p-6 max-w-md w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="text-center flex-1">
                <h3 id="difficulty-modal-title" className="pixel-font text-sm sm:text-lg text-white mb-2 tracking-wider">
                  SELECT DIFFICULTY
                </h3>
                <div className="pixel-font text-[8px] sm:text-sm text-cyan-300">
                  {formatLevelName(levelName)} - WEEK {weekNo}
                </div>
              </div>
            </div>

            {/* Difficulty Options */}
            <div className="space-y-4 mb-6">
              {DIFFICULTY_OPTIONS.map((difficulty, index) => (
                <button
                  key={difficulty.name}
                  ref={index === 0 ? firstButtonRef : null}
                  onClick={() => onSelect(difficulty)}
                  className={clsx(
                    "w-full p-4 pixel-font text-left flex items-center justify-between rounded-xl",
                    getDifficultyStyles(difficulty.name)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm opacity-60">({index + 1})</span>
                    <div>
                      <div className="text-sm tracking-widest">{difficulty.name.toUpperCase()}</div>
                      <div className="text-[10px] opacity-80 mt-1">
                        {difficulty.timeLimit} SECONDS
                      </div>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Footer / Cancel Button */}
            <div className="text-center border-t border-cyan-400/20 pt-4">
              <button
                onClick={onClose}
                className="pixel-button pixel-button-secondary"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}