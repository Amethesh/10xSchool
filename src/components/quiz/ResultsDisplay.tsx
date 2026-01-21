"use client";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Trophy, Target, TrendingUp, Award } from "lucide-react";
import { QuizResults } from "@/types/types";
import { PerformanceTracker } from "../result/PerformanceTracker";
import { useQuizResults } from "@/hooks/useQuizResults";
import { ResultsHeader } from "../result/ResultsHeader";
import { PerformanceMetrics } from "../result/PerformanceMetrics";
import { RankingDisplay } from "../result/RankingDisplay";
import { ActionButtons } from "../result/ActionButtons";
import { LeaderboardDisplay } from "../result/LeaderboardDisplay";
import { PerformanceHistory } from "../result/PerformanceHistory";

interface ResultsDisplayProps {
  results: QuizResults;
  onRetry: () => void;
  onBackToLevels: () => void;
}

export function ResultsDisplay({
  results,
  onRetry,
  onBackToLevels,
}: ResultsDisplayProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(results.difficulty.name);

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
    difficulty: selectedDifficulty,
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

  const accuracy = Math.round(
    (results.correctAnswers / results.totalQuestions) * 100
  );
  const averageTimePerQuestion = Math.round(
    results.timeSpent / results.totalQuestions
  );

  const getPerformanceBadge = () => {
    if (isExcellentScore)
      return { text: "Excellent!", color: "bg-yellow-500", icon: Trophy };
    if (isGoodScore)
      return { text: "Great Job!", color: "bg-green-500", icon: Award };
    if (results.score >= 50)
      return { text: "Good Effort", color: "bg-blue-500", icon: Target };
    return { text: "Keep Trying", color: "bg-gray-500", icon: TrendingUp };
  };

  const performanceBadge = getPerformanceBadge();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <div className="relative z-10 min-h-screen p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto space-y-4 sm:space-y-6">
          {/* Main Results Card */}
          <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
            <ResultsHeader
              performanceBadge={performanceBadge}
              results={results}
            />
            <div className="mt-6 space-y-6">
              <PerformanceMetrics
                accuracy={accuracy}
                timeSpent={results.timeSpent}
                avgTimePerQuestion={averageTimePerQuestion}
              />
              <RankingDisplay
                ranking={ranking ?? null}
                isLoading={rankingLoading}
              />
              <ActionButtons
                onRetry={onRetry}
                onBackToLevels={onBackToLevels}
              />
            </div>
          </div>

          {/* Performance Tracker */}
          <PerformanceTracker
            history={history || []}
            isLoading={historyLoading}
          />

          {/* Leaderboard and History Grid */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
            <LeaderboardDisplay
              leaderboard={leaderboard ?? null}
              isLoading={leaderboardLoading}
              currentStudentId={results.studentId}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
            />
            <PerformanceHistory
              history={history || []}
              isLoading={historyLoading}
            />
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
