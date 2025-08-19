"use client";
import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";
import { PerformanceInsights } from "./PerformanceInsights";

interface PerformanceData {
  attemptId: string;
  levelId: number;
  levelName: string;
  weekNo: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

interface PerformanceTrackerProps {
  history: PerformanceData[];
  isLoading?: boolean;
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <motion.div
    className="pixel-panel !p-3 flex flex-col items-center justify-center text-center bg-cyan-900/30"
    variants={fadeInVariants}
  >
    <div className="flex gap-2 items-center">
      <div className="text-cyan-300">{icon}</div>
      <div className="text-2xl sm:text-2xl text-white font-bold">{value}</div>
    </div>
    <div className="font-bold text-sm text-cyan-300/70 tracking-wider mt-1">{label}</div>
  </motion.div>
);

export function PerformanceTracker({
  history,
  isLoading,
}: PerformanceTrackerProps) {
  if (isLoading) {
    return (
      <div className="pixel-panel p-3 sm:p-4 md:p-6 backdrop-blur-sm bg-black/20">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="p-1 sm:p-2 rounded bg-blue-400/20 text-blue-400 mr-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className=" text-xs sm:text-sm text-blue-400">PERFORMANCE TRACKING</h3>
        </div>
        <div className="text-center py-6 sm:py-8  text-xs text-cyan-300">
          LOADING PERFORMANCE DATA...
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="pixel-panel p-3 sm:p-4 md:p-6 backdrop-blur-sm bg-black/20">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="p-1 sm:p-2 rounded bg-blue-400/20 text-blue-400 mr-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className=" text-xs sm:text-sm text-blue-400">PERFORMANCE TRACKING</h3>
        </div>
        <div className="text-center py-6 sm:py-8  text-xs text-cyan-300">
          COMPLETE MORE QUESTS TO SEE TRENDS!
        </div>
      </div>
    );
  }

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalAttempts = history.length;
    const averageScore = Math.round(
      history.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
    );
    const bestScore = Math.max(...history.map((attempt) => attempt.score));
    const recentScores = history.slice(0, 5).map((attempt) => attempt.score);

    // Calculate trend (comparing recent 3 vs previous 3)
    let trend: "stable" | "improving" | "declining" = "stable";
    if (history.length >= 6) {
      const recent3 =
        history.slice(0, 3).reduce((sum, attempt) => sum + attempt.score, 0) / 3;
      const previous3 =
        history.slice(3, 6).reduce((sum, attempt) => sum + attempt.score, 0) / 3;
      const difference = recent3 - previous3;

      if (difference > 5) trend = "improving";
      else if (difference < -5) trend = "declining";
    }

    // Calculate consistency (standard deviation)
    const mean = averageScore;
    const variance =
      history.reduce(
        (sum, attempt) => sum + Math.pow(attempt.score - mean, 2),
        0
      ) / totalAttempts;
    const consistency = Math.round(100 - Math.sqrt(variance));

    return {
      totalAttempts,
      averageScore,
      bestScore,
      recentScores,
      trend,
      consistency: Math.max(0, Math.min(100, consistency)), // Clamp between 0-100
    };
  };

  const metrics = calculateMetrics();

  // Get trend icon and color
  const getTrendDisplay = (trend: string) => {
    switch (trend) {
      case "improving":
        return {
          icon: TrendingUp,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          text: "Improving",
        };
      case "declining":
        return {
          icon: TrendingDown,
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          text: "Needs Focus",
        };
      default:
        return {
          icon: Minus,
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          text: "Stable",
        };
    }
  };

  const trendDisplay = getTrendDisplay(metrics.trend);
  const TrendIcon = trendDisplay.icon;

  // Array for cleaner mapping
  const summaryMetrics = [
    { icon: <BarChart3 className="w-5 h-5" />, label: 'ATTEMPTS', value: metrics.totalAttempts },
    { icon: <Award className="w-5 h-5" />, label: 'AVG SCORE', value: `${metrics.averageScore}%` },
    { icon: <Target className="w-5 h-5" />, label: 'BEST SCORE', value: `${metrics.bestScore}%` },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'CONSISTENCY', value: `${metrics.consistency}%` },
  ];

  return (
    <motion.div
      className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20 space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex items-center" variants={fadeInVariants}>
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 mr-3">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="pixel-font text-sm sm:text-base text-white tracking-wider">PERFORMANCE TRACKING</h3>
      </motion.div>

      {/* Performance Summary Grid - Now uses StatCard for consistency */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        variants={staggerContainer}
      >
        {summaryMetrics.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </motion.div>

      {/* Trend Indicator - Simplified and cleaner design */}
      <motion.div
        className={clsx("pixel-panel !p-3 sm:!p-4 flex items-center justify-between", trendDisplay.bgColor)}
        variants={fadeInVariants}
      >
        <div className="flex items-center gap-3">
          <TrendIcon className={clsx("w-6 h-6", trendDisplay.color)} />
          <div>
            <div className="text-sm font-bold sm:text-sm text-white">PERFORMANCE TREND</div>
            <div className="text-xs text-cyan-300/70">Based on recent attempts</div>
          </div>
        </div>
        <div className={clsx("text-xs px-2 py-1 rounded", trendDisplay.bgColor, trendDisplay.color)}>
          {trendDisplay.text}
        </div>
      </motion.div>
      <PerformanceInsights metrics={metrics} />
    </motion.div>
  );
}
