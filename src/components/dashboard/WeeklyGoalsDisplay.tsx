// src/components/dashboard/WeeklyGoalsDisplay.tsx

"use client";

import React from "react";
import { motion } from "motion/react";
import { Target, CheckCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// --- Type Definitions ---
interface Goal {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}
interface WeeklyGoalsData {
  overallProgress: number;
  goals: Goal[];
}
interface WeeklyGoalsDisplayProps {
  weeklyGoals: WeeklyGoalsData | null;
}

export function WeeklyGoalsDisplay({ weeklyGoals }: WeeklyGoalsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><Target className="w-5 h-5 text-cyan-300" />Weekly Goals</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!weeklyGoals ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            Weekly goals will be set soon.
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="pixel-font text-xs text-cyan-300/80">OVERALL PROGRESS</span>
                <span className="pixel-font text-sm text-white font-bold">
                  {weeklyGoals.overallProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-cyan-900/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyGoals.overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Individual Goals */}
            <div className="space-y-3">
              {weeklyGoals.goals.map((goal) => (
                <div key={goal.id} className="p-3 bg-cyan-900/20 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="pixel-font text-sm text-white">{goal.description}</p>
                    {goal.completed && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-cyan-900/50 rounded-full h-2 overflow-hidden flex-1">
                      <motion.div
                        className="h-full bg-cyan-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                    <span className="pixel-font text-xs text-cyan-300/70">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}