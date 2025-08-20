// src/components/dashboard/RecentSessionsDisplay.tsx

"use client";

import React from "react";
import { motion } from "motion/react";
import { History, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import clsx from "clsx";
import { formatTime } from "@/utils/ResultUtils";

// --- Type Definitions ---
interface SessionImprovement { change: number; }
interface ProgressSessionData {
  date: string;
  quizzesCompleted: number;
  averageScore: number;
  timeSpent: number;
  improvements: SessionImprovement[];
}
interface RecentSessionsDisplayProps {
  progressSessions: ProgressSessionData[] | null;
}

// --- Change Icon Helper ---
const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-400" />;
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-cyan-400/50" />;
};

export function RecentSessionsDisplay({ progressSessions }: RecentSessionsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><History className="w-5 h-5 text-cyan-300" />Recent Sessions</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!progressSessions || progressSessions.length === 0 ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            Your recent session history will be shown here.
          </div>
        ) : (
          <div className="space-y-3">
            {progressSessions.slice(0, 5).map((session, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-cyan-900/20 border border-cyan-400/10 rounded-lg">
                <div>
                  <p className="pixel-font text-sm text-white">{new Date(session.date).toLocaleDateString('en-GB')}</p>
                  <p className="pixel-font text-xs text-cyan-300/70">
                    {session.quizzesCompleted} quizzes • {session.averageScore.toFixed(0)}% avg
                  </p>
                </div>
                <div className="text-right">
                  <p className="pixel-font text-sm text-white">
                    {formatTime(session.timeSpent)}
                  </p>
                  {session.improvements.length > 0 && (
                    <div className="flex gap-2 mt-1 justify-end">
                      {session.improvements.map((imp, j) => (
                        <div key={j} className={clsx("flex items-center gap-1 pixel-font text-xs rounded px-1.5 py-0.5",
                           imp.change > 0 ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                        )}>
                          {getChangeIcon(imp.change)}
                          <span>{Math.abs(imp.change).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}