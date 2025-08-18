import { Question, QuizDifficulty, Answer } from '@/types/types';

/**
 * Quiz difficulty configurations
 */
export const QUIZ_DIFFICULTIES: Record<string, QuizDifficulty> = {
  easy: {
    name: 'easy',
    timeLimit: 15,
    label: 'Easy (15s per question)',
  },
  medium: {
    name: 'medium',
    timeLimit: 10,
    label: 'Medium (10s per question)',
  },
  hard: {
    name: 'hard',
    timeLimit: 5,
    label: 'Hard (5s per question)',
  },
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validate quiz configuration
 */
export function validateQuizConfig(
  level: string,
  weekNo: number,
  difficulty: string
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!level || level.trim().length === 0) {
    errors.push('Level is required');
  }

  if (!weekNo || weekNo < 1) {
    errors.push('Week number must be a positive integer');
  }

  if (!difficulty || !QUIZ_DIFFICULTIES[difficulty]) {
    errors.push('Invalid difficulty level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate time taken for a quiz
 */
export function calculateTimeTaken(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Generate quiz summary statistics
 */
export function generateQuizSummary(
  questions: Question[],
  answers: Answer[],
  timeTaken: number
): {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  accuracy: number;
  averageTimePerQuestion: number;
  totalPoints: number;
  earnedPoints: number;
} {
  const totalQuestions = questions.length;
  const answeredQuestions = answers.filter(a => a.selectedAnswer !== null).length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = answers.filter(a => a.selectedAnswer !== null && !a.isCorrect).length;
  const skippedQuestions = totalQuestions - answeredQuestions;
  
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const averageTimePerQuestion = totalQuestions > 0 ? timeTaken / totalQuestions : 0;
  
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = answers.reduce((sum, answer) => {
    if (answer.isCorrect) {
      const question = questions.find(q => q.id === answer.questionId);
      return sum + (question?.points || 0);
    }
    return sum;
  }, 0);

  return {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    accuracy: Math.round(accuracy * 100) / 100,
    averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
    totalPoints,
    earnedPoints,
  };
}

/**
 * Validate student answers format
 */
export function validateAnswers(
  questions: Question[],
  answers: Answer[]
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (answers.length !== questions.length) {
    errors.push(`Expected ${questions.length} answers, got ${answers.length}`);
  }

  answers.forEach((answer, index) => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) {
      errors.push(`Answer ${index + 1}: Invalid question ID ${answer.questionId}`);
      return;
    }

    if (answer.selectedAnswer !== null) {
      const validOptions = ['A', 'B', 'C', 'D'];
      if (!validOptions.includes(answer.selectedAnswer.toUpperCase())) {
        errors.push(`Answer ${index + 1}: Invalid selected answer "${answer.selectedAnswer}"`);
      }
    }

    if (typeof answer.timeTaken !== 'number' || answer.timeTaken < 0) {
      errors.push(`Answer ${index + 1}: Invalid time taken ${answer.timeTaken}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get performance grade based on score
 */
export function getPerformanceGrade(score: number): {
  grade: string;
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      grade: 'A+',
      color: 'text-green-600',
      message: 'Excellent work!',
    };
  } else if (score >= 80) {
    return {
      grade: 'A',
      color: 'text-green-500',
      message: 'Great job!',
    };
  } else if (score >= 70) {
    return {
      grade: 'B',
      color: 'text-blue-500',
      message: 'Good work!',
    };
  } else if (score >= 60) {
    return {
      grade: 'C',
      color: 'text-yellow-500',
      message: 'Keep practicing!',
    };
  } else if (score >= 50) {
    return {
      grade: 'D',
      color: 'text-orange-500',
      message: 'Need more practice.',
    };
  } else {
    return {
      grade: 'F',
      color: 'text-red-500',
      message: 'Keep trying!',
    };
  }
}

/**
 * Check if a level is accessible to a student
 */
export function isLevelAccessible(studentLevel: number, requiredLevel: number): boolean {
  return studentLevel >= requiredLevel;
}

/**
 * Generate quiz attempt ID (for client-side tracking)
 */
export function generateQuizAttemptId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}