'use client';

import React from 'react';
import { Heart, HeartOff } from 'lucide-react';

interface LivesDisplayProps {
  livesRemaining: number;
  maxLives?: number;
  className?: string;
}

export function LivesDisplay({ 
  livesRemaining, 
  maxLives = 3, 
  className = '' 
}: LivesDisplayProps) {
  const hearts = Array.from({ length: maxLives }, (_, index) => {
    const isActive = index < livesRemaining;
    return (
      <div
        key={index}
        className={`transition-all duration-300 ${
          isActive ? 'text-red-400 scale-100' : 'text-gray-600 scale-90'
        }`}
        aria-hidden="true"
      >
        {isActive ? (
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
        ) : (
          <HeartOff className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </div>
    );
  });

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-1" role="img" aria-label={`${livesRemaining} lives remaining`}>
        {hearts}
      </div>
      <span className="pixel-font text-xs sm:text-sm text-white ml-2 hidden sm:inline">
        {livesRemaining}/{maxLives}
      </span>
    </div>
  );
}