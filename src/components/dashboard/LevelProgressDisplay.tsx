// src/components/dashboard/LevelProgressDisplay.tsx

"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Layers, Star, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatLevelName } from "@/utils/levelUtils";

// --- Type Definition ---
interface LevelProgressData {
  level: string;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
}

interface LevelProgressDisplayProps {
  levelProgress: LevelProgressData[] | null;
}

// --- Animation Variants ---
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeInItem: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};


// --- Reusable Sub-Component for a Single Level's Progress ---

const LevelProgressItem = ({ level }: { level: LevelProgressData }) => {
  const scoreColor = level.averageScore >= 80 ? "text-green-400" : level.averageScore >= 60 ? "text-yellow-400" : "text-red-400";
  
  return (
    <motion.div
      className="pixel-panel !p-4 flex flex-col gap-4 bg-cyan-900/30 border-cyan-400/20"
      variants={fadeInItem}
    >
      {/* Header: Level Name & Quizzes Completed */}
      <div className="flex items-start justify-between">
        <h4 className="pixel-font text-base text-white">{formatLevelName(level.level)}</h4>
        <div className="pixel-font text-[10px] px-2 py-1 bg-cyan-400/10 text-cyan-300 rounded whitespace-nowrap">
          {level.quizzesCompleted} QUIZZES
        </div>
      </div>
      
      {/* Stats: Best and Average Scores */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-center">
          <div className={clsx("pixel-font text-xl font-bold", scoreColor)}>{level.averageScore}%</div>
          <div className="pixel-font text-[10px] text-cyan-300/70 mt-0.5">AVERAGE</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-xl font-bold text-yellow-400">{level.bestScore}%</div>
          <div className="pixel-font text-[10px] text-cyan-300/70 mt-0.5">BEST</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cyan-900/50 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${level.averageScore}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};


// --- The Main Component ---
export function LevelProgressDisplay({ levelProgress }: LevelProgressDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-cyan-300" />
            Level Accuracy
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!levelProgress || levelProgress.length === 0 ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            No level progress to display yet. Complete some quizzes!
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {levelProgress.map((level) => (
              <LevelProgressItem key={level.level} level={level} />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}