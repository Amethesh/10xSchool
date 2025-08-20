// src/components/dashboard/AchievementsDisplay.tsx

"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Trophy, Lock, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// --- Type Definition ---
interface Milestone {
  id: string;
  icon: string; // Emoji
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
}

interface AchievementsDisplayProps {
  milestones: Milestone[] | null;
}

// --- Animation Variants ---
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeInItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

// --- Reusable Sub-Component for a Single Milestone ---

const MilestoneItem = ({ milestone }: { milestone: Milestone }) => {
  const isAchieved = milestone.achieved;

  return (
    <motion.li
      className={clsx(
        "flex items-center gap-4 p-3 rounded-lg transition-all",
        isAchieved ? "hover:bg-cyan-900/30" : "opacity-60"
      )}
      variants={fadeInItem}
    >
      {/* Icon Container */}
      <div className={clsx(
        "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border-2",
        isAchieved
          ? "bg-green-500/15 border-green-400"
          : "bg-gray-800/50 border-gray-600"
      )}>
        {isAchieved ? (
          <span className="text-2xl">{milestone.icon}</span>
        ) : (
          <Lock className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          "font-bold text-lg tracking-wider",
          isAchieved ? "text-green-300" : "text-gray-400"
        )}>
          {milestone.title}
        </p>
        <p className="text-base text-cyan-300/70 mt-0.5">
          {milestone.description}
        </p>
        {isAchieved && milestone.achievedAt && (
          <p className="text-sm text-green-300/60 mt-1">
            Achieved: {new Date(milestone.achievedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Achieved Indicator */}
      {isAchieved && (
        <div className="flex-shrink-0 text-green-400">
          <CheckCircle className="w-6 h-6" />
        </div>
      )}
    </motion.li>
  );
};


// --- The Main Component ---
export function AchievementsDisplay({ milestones }: AchievementsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-300" />
            Achievements
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!milestones || milestones.length === 0 ? (
          <div className="text-center py-8 text-sm text-cyan-300/70">
            Complete quests to unlock achievements!
          </div>
        ) : (
          <motion.ul
            className="space-y-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {milestones.slice(0, 5).map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}