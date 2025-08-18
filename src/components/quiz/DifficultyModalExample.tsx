'use client';

import React, { useState } from 'react';
import { DifficultyModal } from './DifficultyModal';
import { QuizDifficulty } from '@/types/types';

/**
 * Example component showing how to integrate the DifficultyModal
 * This demonstrates the usage pattern for the student levels page
 */
export function DifficultyModalExample() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | null>(null);

  const handleDifficultySelect = (difficulty: QuizDifficulty) => {
    setSelectedDifficulty(difficulty);
    setShowModal(false);
    
    // Here you would typically navigate to the quiz page or start the quiz
    console.log('Selected difficulty:', difficulty);
    
    // Example: Navigate to quiz page
    // router.push(`/student/quiz/${level}/${weekNo}?difficulty=${difficulty.name}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="pixel-panel p-6 max-w-md mx-auto">
        <h2 className="pixel-font text-xl text-white mb-4 text-center">
          DIFFICULTY MODAL EXAMPLE
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowModal(true)}
            className="pixel-button w-full"
          >
            OPEN DIFFICULTY MODAL
          </button>
          
          {selectedDifficulty && (
            <div className="pixel-panel p-4">
              <h3 className="pixel-font text-sm text-white mb-2">
                LAST SELECTED:
              </h3>
              <div className="pixel-font text-xs text-cyan-300">
                Difficulty: {selectedDifficulty.name.toUpperCase()}
              </div>
              <div className="pixel-font text-xs text-cyan-300">
                Time Limit: {selectedDifficulty.timeLimit} seconds
              </div>
              <div className="pixel-font text-xs text-cyan-300">
                Label: {selectedDifficulty.label}
              </div>
            </div>
          )}
        </div>
      </div>

      <DifficultyModal
        level="Beginner"
        weekNo={1}
        onSelect={handleDifficultySelect}
        onClose={handleCloseModal}
        isOpen={showModal}
      />
    </div>
  );
}