// src/components/results/ResultsHeader.tsx
import React from 'react';
import { QuizResults } from '@/types/types';
import { LucideIcon } from 'lucide-react';
import { motion, Variants } from 'motion/react';

interface ResultHeaderProps {
  performanceBadge: {
    text: string;
    color: string;
    icon: LucideIcon;
  };
  results: QuizResults;
}

const containerVariants : Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 22,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants : Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
};

export const ResultsHeader = ({ performanceBadge, results }: ResultHeaderProps) => (
  <motion.div
    className="text-center pb-3 sm:pb-4 border-b border-cyan-400/20 px-3 sm:px-0"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {/* Performance badge */}
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-center mb-3 sm:mb-4"
    >
      <div
        className={`${performanceBadge.color} text-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded border-2 border-current flex items-center shadow-sm`}
        aria-label={`Performance: ${performanceBadge.text}`}
      >
        <performanceBadge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        <span className="pixel-font tracking-wider">{performanceBadge.text}</span>
      </div>
    </motion.div>

    {/* Title */}
    <motion.h1
      variants={itemVariants}
      className="pixel-font text-base sm:text-3xl text-white mb-1.5 sm:mb-2"
    >
      QUEST COMPLETE!
    </motion.h1>

    {/* Subheading */}
    <motion.div
      variants={itemVariants}
      className="pixel-font text-[8px] sm:text-xs text-cyan-300"
    >
      {results.levelName.toUpperCase()} - WEEK {results.weekNo} ({results.difficulty.name.toUpperCase()})
    </motion.div>

    {/* Score with pop-in animation and hover pulse */}
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.25 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="text-5xl sm:text-7xl pixel-font text-yellow-300 mt-5 sm:mt-6 leading-none"
      aria-label={`Score: ${results.score} percent`}
    >
      {results.score}
      <span className="text-2xl sm:text-5xl align-top pl-1">%</span>
    </motion.div>

    {/* Correct/Total */}
    <motion.div
      variants={itemVariants}
      className="pixel-font text-xs sm:text-sm text-cyan-300 mt-2"
      aria-label={`${results.correctAnswers} out of ${results.totalQuestions} correct`}
    >
      {results.correctAnswers} / {results.totalQuestions} CORRECT
    </motion.div>
  </motion.div>
);
