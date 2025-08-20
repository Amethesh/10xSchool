// src/components/dashboard/SkillProgressionDisplay.tsx

"use client";

import React from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import clsx from "clsx";
import { formatLevelName } from "@/utils/levelUtils";

// --- Type Definitions ---
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type SkillTrend =  "improving" | "declining" | "stable";
interface SkillProgressionData {
  skill: string;
  level: SkillLevel;
  progress: number;
  recentTrend: SkillTrend;
  nextMilestone: { description: string; estimatedTime: string; };
}
interface SkillProgressionDisplayProps {
  skillProgression: SkillProgressionData[] | null;
}

// --- Trend Icon Helper ---
const getTrendIcon = (trend: SkillTrend) => {
  switch (trend) {
    case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
    default: return <Minus className="w-4 h-4 text-cyan-400/50" />;
  }
};

export function SkillProgressionDisplay({ skillProgression }: SkillProgressionDisplayProps) {
  const getLevelBadgeStyle = (level: SkillLevel) => {
    switch (level) {
      case 'expert': return "bg-purple-500/20 text-purple-300";
      case 'advanced': return "bg-blue-500/20 text-blue-300";
      case 'intermediate': return "bg-green-500/20 text-green-300";
      default: return "bg-yellow-500/20 text-yellow-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-cyan-300" />Skill Progression</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!skillProgression || skillProgression.length === 0 ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            Skill data will appear here as you progress.
          </div>
        ) : (
          skillProgression.map((skill) => (
            <div key={skill.skill}>
              <div className="flex justify-between items-center mb-2">
                <span className="pixel-font text-base text-white">{formatLevelName(skill.skill)}</span>
                <div className="flex items-center gap-2">
                  <div className={clsx("pixel-font text-xs px-2 py-1 rounded", getLevelBadgeStyle(skill.level))}>
                    {skill.level.toUpperCase()}
                  </div>
                  {getTrendIcon(skill.recentTrend)}
                </div>
              </div>
              <div className="w-full bg-cyan-900/50 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-cyan-300/70 mt-2">
                Next: {skill.nextMilestone.description} ({skill.nextMilestone.estimatedTime})
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}