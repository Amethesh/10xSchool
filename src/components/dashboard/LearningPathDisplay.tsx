// src/components/dashboard/LearningPathDisplay.tsx

"use client";

import React from "react";
import { motion } from "motion/react";
import { Map, Star, Compass } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatLevelName } from "@/utils/levelUtils";

// --- Type Definitions ---
interface MasteredTopic { level: string; week: number; masteryScore: number; }
interface SuggestedNext { level: string; week: number; reason: string; }
interface LearningPathData {
  currentLevel: string;
  currentWeek: number;
  masteredTopics: MasteredTopic[];
  suggestedNext: SuggestedNext[];
}

interface LearningPathDisplayProps {
  learningPath: LearningPathData | null;
}

// --- Reusable Sub-Component for a single section ---
const PathSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h4 className="text-xl font-bold text-cyan-300/80 mb-2">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

export function LearningPathDisplay({ learningPath }: LearningPathDisplayProps) {
  if (!learningPath) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-3"><Map className="w-5 h-5 text-cyan-300" />Learning Path</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 pixel-font text-sm text-cyan-300/70">
          Complete a quiz to generate your learning path.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><Map className="w-5 h-5 text-cyan-300" />Learning Path</div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Position */}
        <PathSection title="Current Position">
          <p className="text-lg text-white">
             • {formatLevelName(learningPath.currentLevel)} - Week {learningPath.currentWeek}
          </p>
        </PathSection>
        
        {/* Mastered Topics */}
        <PathSection title="Mastered Topics">
          {learningPath.masteredTopics.slice(0, 3).map((topic, i) => (
            <div key={i} className="flex justify-between items-center text-sm text-cyan-300">
              <span>{topic.level} - W{topic.week}</span>
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs">
                <Star className="w-3 h-3" />
                <span>{topic.masteryScore.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </PathSection>

        {/* Suggested Next */}
        <PathSection title="Suggested Next">
          {learningPath.suggestedNext.slice(0, 2).map((suggestion, i) => (
            <div key={i} className="p-3 bg-blue-500/15 border border-blue-400/30 rounded-lg">
              <div className="flex items-center gap-2 pixel-font text-base text-blue-300 mb-1">
                <Compass className="w-4 h-4" />
                <span>{formatLevelName(suggestion.level)} - W{suggestion.week}</span>
              </div>
              <p className="text">{suggestion.reason}</p>
            </div>
          ))}
        </PathSection>
      </CardContent>
    </Card>
  );
}