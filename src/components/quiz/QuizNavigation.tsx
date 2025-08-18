'use client';

import React from 'react';
import { Breadcrumb, generateQuizBreadcrumbs } from './Breadcrumb';

interface QuizNavigationProps {
  levelName: string;
  weekNo?: number;
  currentPage: 'levels' | 'quiz' | 'results';
  className?: string;
}

export function QuizNavigation({
  levelName,
  weekNo,
  currentPage,
  className = ''
}: QuizNavigationProps) {
  const breadcrumbItems = generateQuizBreadcrumbs(levelName, weekNo, currentPage);

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
}