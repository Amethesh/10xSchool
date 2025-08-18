"use client";
import React from "react";
import { motion, Variants } from "motion/react";
import { Trophy, Star, Play, Lock } from "lucide-react";
import { ProcessedWeekLesson } from "@/types/types";
import clsx from "clsx";

// --- Props Definition ---
type LevelStatisticsProps = {
  weeks: ProcessedWeekLesson[];
};

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly increased stagger for better effect
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// --- Reusable Stat Item Sub-component (Mobile-First) ---
type StatItemProps = {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: 'green' | 'yellow' | 'cyan' | 'gray';
    animationDelay: number;
};

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color, animationDelay }) => {
    const colorClasses = {
        green: {
            bg: "bg-green-500/15", border: "border-green-400", text: "text-green-400",
            badgeBg: "bg-green-400", badgeText: "text-black",
        },
        yellow: {
            bg: "bg-yellow-500/15", border: "border-yellow-400", text: "text-yellow-400",
            badgeBg: "bg-yellow-400", badgeText: "text-black",
        },
        cyan: {
            bg: "bg-cyan-500/15", border: "border-cyan-400", text: "text-cyan-400",
            badgeBg: "bg-cyan-400", badgeText: "text-black",
        },
        gray: {
            bg: "bg-gray-600/20", border: "border-gray-600", text: "text-gray-400",
            badgeBg: "bg-gray-600", badgeText: "text-white",
        },
    };
    
    const styles = colorClasses[color];

    return (
        <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="relative mb-3">
                {/* Main Icon Circle with a subtle pulse animation */}
                <motion.div 
                    className={clsx("w-16 h-16 rounded-full border-2 flex items-center justify-center", styles.bg, styles.border)}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: animationDelay, // Staggered delay for a more organic feel
                    }}
                >
                    {icon}
                </motion.div>
                
                {/* FIX: Badge is now larger with bigger, bolder text to look correct */}
                <div className={clsx(
                    "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg", 
                    styles.badgeBg, 
                    styles.badgeText
                )}>
                    <span className="pixel-font text-xl font-black leading-none pt-1">
                        {value}
                    </span>
                </div>
            </div>
            <div className="pixel-font text-xs text-white uppercase tracking-wider">{label}</div>
        </motion.div>
    );
};


// --- Main Statistics Component ---
const LevelStatistics: React.FC<LevelStatisticsProps> = ({ weeks }) => {
  // Pre-calculate statistics
  const completedCount = weeks.filter((w) => w.completed).length;
  const perfectCount = weeks.filter((w) => w.stars === 3).length;
  const availableCount = weeks.filter((w) => w.hasAccess && !w.completed).length;
  const lockedCount = weeks.filter((w) => !w.hasAccess).length;
  const totalWeeks = weeks.length;
  const progressPercentage = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

  // Data array for cleaner mapping
  const statsData = [
    { icon: <Trophy className="w-7 h-7 text-green-400" />, value: completedCount, label: "Completed", color: "green" as const, delay: 0 },
    { icon: <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />, value: perfectCount, label: "Perfect", color: "yellow" as const, delay: 0.2 },
    { icon: <Play className="w-7 h-7 text-cyan-400" />, value: availableCount, label: "Available", color: "cyan" as const, delay: 0.4 },
    { icon: <Lock className="w-7 h-7 text-gray-400" />, value: lockedCount, label: "Locked", color: "gray" as const, delay: 0.6 },
  ];

  return (
    <motion.div
      className="mt-8 p-6 rounded-lg bg-gradient-to-r from-black/40 to-black/20 border border-cyan-400/30 backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h4 className="pixel-font text-lg text-white mb-6 text-center tracking-widest">
        LEVEL STATISTICS
      </h4>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
        {statsData.map(stat => (
            <StatItem 
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
                animationDelay={stat.delay}
            />
        ))}
      </div>

      {/* Level Progress Bar */}
      <div className="mt-8 pt-6 border-t border-cyan-400/30">
        <div className="flex justify-between items-center mb-2">
          <span className="pixel-font text-xs text-white">LEVEL PROGRESS</span>
          <span className="pixel-font text-xs text-cyan-300 font-bold text-right">
            {completedCount}/{totalWeeks} WEEKS
          </span>
        </div>
        <div className="w-full bg-cyan-900/40 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300/40 via-teal-300/60 to-cyan-300/80"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LevelStatistics;