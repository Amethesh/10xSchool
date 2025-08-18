"use client";

import React, { useState } from "react";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizResults } from "@/types/types";

export function ResultsDisplayExample() {
  const [showResults, setShowResults] = useState(false);

  // Mock quiz results for demonstration
  const mockResults: QuizResults = {
    studentId: 'demo-student-id',
    level: 'Beginner',
    weekNo: 1,
    difficulty: {
      name: 'medium',
      timeLimit: 10,
      label: 'Medium (10s)',
    },
    totalQuestions: 10,
    correctAnswers: 8,
    score: 80,
    timeSpent: 120,
    answers: [
      { questionId: 1, selectedAnswer: 'b', isCorrect: true, timeTaken: 8 },
      { questionId: 2, selectedAnswer: 'a', isCorrect: true, timeTaken: 12 },
      { questionId: 3, selectedAnswer: 'c', isCorrect: false, timeTaken: 15 },
      { questionId: 4, selectedAnswer: 'd', isCorrect: true, timeTaken: 9 },
      { questionId: 5, selectedAnswer: 'b', isCorrect: true, timeTaken: 11 },
      { questionId: 6, selectedAnswer: 'a', isCorrect: false, timeTaken: 10 },
      { questionId: 7, selectedAnswer: 'c', isCorrect: true, timeTaken: 13 },
      { questionId: 8, selectedAnswer: 'b', isCorrect: true, timeTaken: 14 },
      { questionId: 9, selectedAnswer: 'd', isCorrect: true, timeTaken: 16 },
      { questionId: 10, selectedAnswer: 'a', isCorrect: true, timeTaken: 12 },
    ],
    completedAt: new Date(),
  };

  const handleRetry = () => {
    console.log('Retry quiz clicked');
    setShowResults(false);
    // In a real implementation, this would navigate back to the quiz
  };

  const handleBackToLevels = () => {
    console.log('Back to levels clicked');
    setShowResults(false);
    // In a real implementation, this would navigate to the levels page
  };

  if (showResults) {
    return (
      <ResultsDisplay
        results={mockResults}
        onRetry={handleRetry}
        onBackToLevels={handleBackToLevels}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 flex items-center justify-center">
      <Card className="bg-gray-800/90 border-gray-600 text-white max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Quiz Results Display Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              This demo shows the quiz results display component with sample data.
            </p>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Sample Results:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Level: {mockResults.level} - Week {mockResults.weekNo}</li>
                <li>• Difficulty: {mockResults.difficulty.label}</li>
                <li>• Score: {mockResults.score}% ({mockResults.correctAnswers}/{mockResults.totalQuestions} correct)</li>
                <li>• Time Spent: {Math.floor(mockResults.timeSpent / 60)}m {mockResults.timeSpent % 60}s</li>
              </ul>
            </div>

            <Button
              onClick={() => setShowResults(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              Show Results Display
            </Button>
          </div>

          <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Features Demonstrated:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ Performance metrics display (accuracy, time, average per question)</li>
              <li>✅ Performance badges based on score (Excellent, Great Job, etc.)</li>
              <li>✅ Confetti animation for good scores (≥70%)</li>
              <li>✅ Real-time ranking and leaderboard (with mock data)</li>
              <li>✅ Performance tracking and history</li>
              <li>✅ Retry and navigation functionality</li>
              <li>✅ Responsive design with pixel-art theme</li>
            </ul>
          </div>

          <div className="bg-yellow-600/20 p-4 rounded-lg border border-yellow-500/30">
            <h3 className="text-lg font-semibold mb-2 text-yellow-300">Requirements Met:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>📊 4.1: Calculate and display student score</li>
              <li>📈 4.2: Show correct answers out of total questions</li>
              <li>🏆 4.3: Show student ranking compared to others</li>
              <li>🔄 4.5: Handle tie-breaking consistently</li>
              <li>💾 6.1: Store performance data for historical tracking</li>
              <li>🔗 6.2: Associate data with student, level, week, and difficulty</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}