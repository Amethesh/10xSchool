// src/components/dashboard/PeerComparisonDisplay.tsx

"use client";

import React from "react";
import { Users, Award, TrendingUp, TrendingDown } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// --- Type Definitions ---
interface Performer { rank: number; studentName: string; score: number; scoreDifference?: number; }
interface PeerComparisonData {
  studentRank: number;
  totalStudents: number;
  percentile: number;
  topPerformers: Performer[];
  similarPerformers: Performer[];
}
interface PeerComparisonDisplayProps {
  peerComparison: PeerComparisonData | null;
}

// Helper for change icon
const getChangeIcon = (change?: number) => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
    return <TrendingDown className="w-3 h-3 text-red-400" />;
};

export function PeerComparisonDisplay({ peerComparison }: PeerComparisonDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3"><Users className="w-5 h-5 text-cyan-300" />Peer Comparison</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!peerComparison ? (
          <div className="text-center py-8 pixel-font text-sm text-cyan-300/70">
            Comparison data is not yet available.
          </div>
        ) : (
          <>
            {/* Student's Rank */}
            <div className="p-4 text-center bg-blue-500/15 border border-blue-400/30 rounded-lg">
              <p className="pixel-font text-5xl font-black text-blue-300">#{peerComparison.studentRank}</p>
              <p className="pixel-font text-sm text-cyan-300/70 mt-1">
                out of {peerComparison.totalStudents} students ({peerComparison.percentile}th percentile)
              </p>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center gap-2 pixel-font text-sm text-cyan-300/80 mb-2">
                  <Award className="w-4 h-4" /> Top Performers
                </h4>
                <div className="space-y-1 pixel-font text-sm text-cyan-300">
                  {peerComparison.topPerformers.map((p) => (
                    <div key={p.rank} className="flex justify-between">
                      <span>#{p.rank} {p.studentName}</span>
                      <span>{p.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 pixel-font text-sm text-cyan-300/80 mb-2">
                  <Users className="w-4 h-4" /> Similar Performers
                </h4>
                <div className="space-y-1 pixel-font text-sm text-cyan-300">
                  {peerComparison.similarPerformers.map((p) => (
                    <div key={p.rank} className="flex justify-between">
                      <span>#{p.rank} {p.studentName}</span>
                      <div className="flex items-center gap-1">
                        <span>{p.score}%</span>
                        {getChangeIcon(p.scoreDifference)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}