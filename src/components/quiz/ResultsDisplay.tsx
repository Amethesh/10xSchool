
"use client";

import React, { useEffect, useState } from "react";
// REMOVED: useQuery is no longer needed directly in this component
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import {
  Trophy,
  Target,
  Clock,
  Users,
  TrendingUp,
  RotateCcw,
  Star,
  Award
} from "lucide-react";
import { QuizResults } from "@/types/types";
import { PerformanceTracker } from "../result/PerformanceTracker";
import { useQuizResults } from "@/hooks/useQuizResults";
import { ResultsHeader } from "../result/ResultsHeader";
import { PerformanceMetrics } from "../result/PerformanceMetrics";
import { RankingDisplay } from "../result/RankingDisplay";
import { ActionButtons } from "../result/ActionButtons";
import { StudentDashboard } from "./StudentDashboard";

interface ResultsDisplayProps {
  results: QuizResults;
  onRetry: () => void;
  onBackToLevels: () => void;
}

export function ResultsDisplay({
  results,
  onRetry,
  onBackToLevels
}: ResultsDisplayProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    ranking,
    isRankingLoading: rankingLoading,
    leaderboard,
    isLeaderboardLoading: leaderboardLoading,
    history,
    isHistoryLoading: historyLoading,
  } = useQuizResults({
    studentId: results.studentId,
    levelId: results.levelId,
    weekNo: results.weekNo,
    difficulty: results.difficulty.name,
  });

  const isGoodScore = results.score >= 70;
  const isExcellentScore = results.score >= 90;

  useEffect(() => {
    if (isGoodScore) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isGoodScore]);


  const accuracy = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const averageTimePerQuestion = Math.round(results.timeSpent / results.totalQuestions);

  const getPerformanceBadge = () => {
    if (isExcellentScore) return { text: "Excellent!", color: "bg-yellow-500", icon: Trophy };
    if (isGoodScore) return { text: "Great Job!", color: "bg-green-500", icon: Award };
    if (results.score >= 50) return { text: "Good Effort", color: "bg-blue-500", icon: Target };
    return { text: "Keep Trying", color: "bg-gray-500", icon: TrendingUp };
  };

  const performanceBadge = getPerformanceBadge();
  const BadgeIcon = performanceBadge.icon;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    // <div className="min-h-screen relative overflow-hidden">
    //   {showConfetti && (
    //     <Confetti
    //       width={width}
    //       height={height}
    //       recycle={false}
    //       numberOfPieces={200}
    //       gravity={0.3}
    //     />
    //   )}

    //   <div className="relative z-10 min-h-screen p-3 sm:p-6 max-w-7xl mx-auto">
    //     <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
    //       {/* Main Results Card */}
    //       <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
    //         <ResultsHeader
    //           performanceBadge={performanceBadge}
    //           results={results}
    //         />
    //         <div className="mt-6 space-y-6">
    //           <PerformanceMetrics
    //             accuracy={accuracy}
    //             timeSpent={results.timeSpent}
    //             avgTimePerQuestion={averageTimePerQuestion}
    //           />
    //           <RankingDisplay
    //             ranking={ranking ?? null}
    //             isLoading={rankingLoading}
    //           />
    //           <ActionButtons
    //             onRetry={onRetry}
    //             onBackToLevels={onBackToLevels}
    //           />
    //         </div>
    //       </div>

    //       {/* Performance Tracker */}
    //       <PerformanceTracker
    //         history={history || []}
    //         currentScore={results.score}
    //         isLoading={historyLoading}
    //       />

    //       {/* Leaderboard and History */}
    //       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   
    //         <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
    //           <div className="flex items-center mb-4">
    //             <div className="p-2 rounded bg-yellow-400/20 text-yellow-400 mr-2">
    //               <Trophy className="w-5 h-5" />
    //             </div>
    //             <h3 className="pixel-font text-sm text-yellow-400">LEADERBOARD</h3>
    //           </div>
    //           <div>
    //             {leaderboardLoading ? (
    //               <div className="text-center py-4 pixel-font text-xs text-cyan-300">
    //                 LOADING LEADERBOARD...
    //               </div>
    //             ) : leaderboard && leaderboard.length > 0 ? (
    //               <div className="space-y-2">
    //                 {leaderboard.map((entry, index) => (
    //                   <div
    //                     key={entry.studentId}
    //                     className={`p-3 ${entry.studentId === results.studentId
    //                       ? 'border-yellow-400 bg-yellow-400/10'
    //                       : 'border-cyan-400 bg-cyan-400/5'
    //                       }`}
    //                   >
    //                     <div className="flex items-center justify-between">
    //                       <div className="flex items-center">
    //                         <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${index === 0 ? 'bg-yellow-500' :
    //                           index === 1 ? 'bg-gray-400' :
    //                             index === 2 ? 'bg-orange-600' : 'bg-gray-600'
    //                           }`}>
    //                           <span className="pixel-font text-xs text-white">
    //                             {entry.rank}
    //                           </span>
    //                         </div>
    //                         <span className="pixel-font text-xs text-white">
    //                           {entry.studentId === results.studentId ? 'YOU' : entry.studentName.toUpperCase()}
    //                         </span>
    //                       </div>
    //                       <div className="text-right">
    //                         <div className="pixel-font text-xs text-green-400">
    //                           {entry.score}%
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             ) : (
    //               <div className="text-center py-4 pixel-font text-xs text-cyan-300">
    //                 NO OTHER STUDENTS YET
    //               </div>
    //             )}
    //           </div>
    //         </div>

    //         <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
    //           <div className="flex items-center mb-4">
    //             <div className="p-2 rounded bg-purple-400/20 text-purple-400 mr-2">
    //               <Star className="w-5 h-5" />
    //             </div>
    //             <h3 className="pixel-font text-sm text-purple-400">RECENT PERFORMANCE</h3>
    //           </div>
    //           <div>
    //             {historyLoading ? (
    //               <div className="text-center py-4 pixel-font text-xs text-cyan-300">
    //                 LOADING HISTORY...
    //               </div>
    //             ) : history && history.length > 0 ? (
    //               <div className="space-y-3">
    //                 {history.slice(0, 5).map((attempt, index) => (
    //                   <div
    //                     key={attempt.attemptId}
    //                     className={`p-3 ${index === 0 ? 'border-blue-400 bg-blue-400/10' : 'border-cyan-400 bg-cyan-400/5'
    //                       }`}
    //                   >
    //                     <div className="flex justify-between items-start">
    //                       <div>
    //                         <div className="pixel-font text-xs text-white">
    //                           {attempt.levelName.toUpperCase()} - WEEK {attempt.weekNo}
    //                         </div>
    //                         <div className="pixel-font text-[10px] text-cyan-300">
    //                           {attempt.difficulty.toUpperCase()} • {formatTime(attempt.timeSpent)}
    //                         </div>
    //                       </div>
    //                       <div className="text-right">
    //                         <div className="pixel-font text-xs text-green-400">
    //                           {attempt.score}%
    //                         </div>
    //                         <div className="pixel-font text-[10px] text-cyan-300">
    //                           {attempt.correctAnswers}/{attempt.totalQuestions}
    //                         </div>
    //                       </div>
    //                     </div>
    //                     {index === 0 && (
    //                       <div className="mt-2 bg-blue-500 text-white text-[10px] pixel-font px-2 py-1 rounded w-fit">
    //                         LATEST
    //                       </div>
    //                     )}
    //                   </div>
    //                 ))}
    //               </div>
    //             ) : (
    //               <div className="text-center py-4 pixel-font text-xs text-cyan-300">
    //                 YOUR FIRST QUEST!
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div> */}
    //     </div>
    //   </div>
    // </div>
    <StudentDashboard studentId="160f8f54-5716-4775-b185-60bdbe0f1050"/>
  );
}