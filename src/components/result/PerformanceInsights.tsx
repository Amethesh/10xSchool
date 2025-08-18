"use client";
import React from "react";
import { Award, CheckCircle, TrendingUp, BarChart3, Trophy } from "lucide-react";
import { motion, Variants } from "motion/react";

// --- Type Definitions ---
interface InsightMetrics {
  averageScore: number;
  consistency: number;
  trend: "improving" | "declining" | "stable";
  bestScore: number;
  totalAttempts: number;
}

interface PerformanceInsightsProps {
  metrics: InsightMetrics;
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// --- Reusable Sub-Component for a Single Insight ---
interface InsightItemProps {
  icon: React.ReactNode;
  text: string;
  color: "green" | "blue" | "yellow" | "purple";
}

const InsightItem: React.FC<InsightItemProps> = ({ icon, text, color }) => {
  const colorClasses = {
    green: "text-green-300",
    blue: "text-blue-300",
    yellow: "text-yellow-300",
    purple: "text-purple-300",
  };
  
  return (
    <motion.li className="flex items-start gap-3" variants={itemVariants}>
      <span className={`mt-0.5 ${colorClasses[color]}`}>{icon}</span>
      <p className="font-semibold text-sm sm:text-base text-white">{text}</p>
    </motion.li>
  );
};


// --- The Main Component ---
export function PerformanceInsights({ metrics }: PerformanceInsightsProps) {

  // Generate the list of insights based on the metrics
  const generateInsights = () => {
    const insights: InsightItemProps[] = [];

    if (metrics.averageScore >= 85) {
      insights.push({
        icon: <Trophy className="w-4 h-4" />,
        text: `Excellent work! Your average score of ${metrics.averageScore}% shows strong mastery.`,
        color: "yellow",
      });
    }

    if (metrics.consistency >= 80) {
      insights.push({
        icon: <BarChart3 className="w-4 h-4" />,
        text: `Great consistency! With a score of ${metrics.consistency}%, your performance is very reliable.`,
        color: "blue",
      });
    }

    if (metrics.trend === "improving") {
      insights.push({
        icon: <TrendingUp className="w-4 h-4" />,
        text: "You're on an upward trend! Your recent scores are improving.",
        color: "green",
      });
    }

    if (metrics.bestScore === 100) {
      insights.push({
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Perfect score achieved! You've proven you can ace these challenges.",
        color: "green",
      });
    }
    
    if (metrics.totalAttempts >= 10) {
      insights.push({
        icon: <Award className="w-4 h-4" />,
        text: `Dedicated learner! You've completed ${metrics.totalAttempts} quests.`,
        color: "purple",
      });
    }

    // If no specific insights are met, provide a default encouraging message
    if (insights.length === 0 && metrics.totalAttempts > 0) {
      insights.push({
        icon: <CheckCircle className="w-4 h-4" />,
        text: "You're off to a great start! Keep completing quests to unlock more insights.",
        color: "green",
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Don't render the component if there are no insights to show
  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div 
        className="pixel-panel !p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-purple-200/20 text-purple-300 mr-3">
          <Award className="w-5 h-5" />
        </div>
        <h3 className="pixel-font text-sm sm:text-base text-white tracking-wider">PERFORMANCE INSIGHTS</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <InsightItem key={index} {...insight} />
        ))}
      </ul>
    </motion.div>
  );
}