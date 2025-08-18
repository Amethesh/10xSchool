// src/components/levels/WeekGrid.tsx

"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Star, Lock, Play, Clock, Trophy, Zap } from "lucide-react";
import clsx from "clsx";
import { ProcessedWeekLesson } from "@/types/types";
import { renderStars } from "@/utils/levelUtils";

// Define the props the component will accept
type WeekGridProps = {
  weeks: ProcessedWeekLesson[];
  onLessonClick: (levelId: number, levelName: string, weekNo: number, hasAccess: boolean) => void;
  levelId: number;
  levelName: string;
};

// --- Framer Motion Animation Variants ---

// Animation for the grid container to stagger the children
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Animation for each card appearing
const itemVariants: Variants = {
  hidden: { 
    y: 30, 
    opacity: 0,
    scale: 0.9,
    rotateX: -15
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 0.6,
    },
  },
};

// Enhanced hover animation variants
const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  },
  hover: {
    scale: 1.05,
    y: -8,
    rotateX: 5,
    rotateY: 2,
    z: 50,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

// Animation for the shimmer effect on hover
const shimmerVariants: Variants = {
  rest: { 
    x: "-110%", 
    opacity: 0 
  },
  hover: {
    x: "110%",
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: "easeInOut",
      delay: 0.1
    },
  },
};

// Pulse animation for the glow effect
const glowVariants: Variants = {
  rest: {
    boxShadow: "0 0 0 rgba(79, 195, 247, 0)",
  },
  pulse: {
    boxShadow: [
      "0 0 0 rgba(79, 195, 247, 0)",
      "0 0 20px rgba(79, 195, 247, 0.4)",
      "0 0 40px rgba(79, 195, 247, 0.2)",
      "0 0 0 rgba(79, 195, 247, 0)",
    ],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// The Main Component
const WeekGrid: React.FC<WeekGridProps> = ({ weeks, onLessonClick, levelId, levelName }) => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      {weeks.map((week) => {
        // Determine the card's state for styling and animations
        const isCompleted = week.completed;
        const isLocked = !week.hasAccess;
        const isAvailable = !isCompleted && !isLocked;

        return (
          <motion.div
            key={week.week_no}
            variants={itemVariants}
            initial="rest"
            animate={isAvailable ? ["visible", "float"] : "visible"}
            whileHover={isLocked ? undefined : "hover"}
            whileTap={isLocked ? undefined : "tap"}
            onClick={() => onLessonClick(levelId, levelName, week.week_no, week.hasAccess)}
            className={clsx(
              "relative h-48 rounded-xl border-2 p-5 overflow-hidden backdrop-blur-sm transition-all duration-300 group",
              {
                // State: Available - Enhanced with gradient and glow
                "bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-cyan-400/60 cursor-pointer hover:border-cyan-400": isAvailable,
                // State: Completed - Enhanced with success gradient
                "bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/15 border-green-400/80 cursor-pointer hover:border-green-300": isCompleted,
                // State: Locked - Enhanced with subtle styling
                "bg-gradient-to-br from-gray-800/20 via-gray-700/10 to-gray-600/15 border-gray-600/40 opacity-60 cursor-not-allowed": isLocked,
              }
            )}
          >
            {/* Enhanced Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              variants={glowVariants}
              initial="rest"
              animate={isAvailable ? "pulse" : "rest"}
            />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 30%, rgba(79, 195, 247, 0.1) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 70%, rgba(129, 199, 132, 0.1) 0%, transparent 50%)`
                }}
              />
            </div>

            {/* Enhanced Hover Card Animation */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              variants={cardHoverVariants}
              style={{
                background: isCompleted
                  ? "linear-gradient(135deg, rgba(129, 199, 132, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)"
                  : isAvailable
                  ? "linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)"
                  : "transparent",
              }}
            />

            {/* Enhanced Shimmer Effect */}
            {!isLocked && (
              <motion.div
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                style={{
                  background: "linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)",
                  transform: "skewX(-15deg)",
                }}
                variants={shimmerVariants}
                initial="rest"
                whileHover="hover"
              />
            )}

            {/* Card Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={clsx("p-2.5 rounded-lg shadow-lg", {
                      "bg-gradient-to-br from-cyan-400/30 to-blue-500/20 text-cyan-300": isAvailable,
                      "bg-gradient-to-br from-green-400/30 to-emerald-500/20 text-green-300": isCompleted,
                      "bg-gradient-to-br from-gray-600/30 to-gray-700/20 text-gray-400": isLocked,
                    })}
                    whileHover={{ 
                      scale: isLocked ? 1 : 1.1, 
                      rotate: isLocked ? 0 : 5 
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {isCompleted ? (
                      <Trophy className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </motion.div>
                  <div>
                    <motion.span 
                      className="pixel-font text-sm font-bold text-white tracking-wide"
                      whileHover={{ scale: 1.05 }}
                    >
                      WEEK {week.week_no}
                    </motion.span>
                    <div className="pixel-font text-xs text-cyan-300/80 mt-1">
                      {week.question_count} QUESTIONS
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {isAvailable && (
                  <motion.div
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-400/20 rounded-full border border-cyan-400/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="pixel-font text-xs text-cyan-400">NEW</span>
                  </motion.div>
                )}
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-grow flex flex-col justify-center space-y-4">
                {isCompleted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(week.stars)}
                      </div>
                      <motion.span 
                        className="pixel-font text-sm text-green-400 font-bold"
                        whileHover={{ scale: 1.1 }}
                      >
                        {week.bestScore}%
                      </motion.span>
                    </div>
                    <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${week.bestScore}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                    </div>
                  </motion.div>
                ) : isLocked ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotateY: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Lock className="w-8 h-8 text-gray-500 mb-3" />
                    </motion.div>
                    <span className="pixel-font text-sm text-gray-500 font-bold tracking-wide">LOCKED</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative mb-3">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity }
                        }}
                      >
                        <Play className="w-8 h-8 text-cyan-400" />
                      </motion.div>
                      <motion.div 
                        className="absolute inset-0 bg-cyan-400/30 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <motion.span 
                      className="pixel-font text-sm text-cyan-400 font-bold tracking-wider"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      START QUEST
                    </motion.span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
              <div className={clsx("absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-30", {
                "bg-gradient-to-br from-cyan-400 to-blue-500": isAvailable,
                "bg-gradient-to-br from-green-400 to-emerald-500": isCompleted,
                "bg-gradient-to-br from-gray-600 to-gray-700": isLocked,
              })} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default WeekGrid;