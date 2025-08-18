import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateQuizConfig,
  validateAnswers,
  formatTime,
  calculateTimeTaken,
  generateQuizSummary,
  getPerformanceGrade,
  shuffleArray,
  QUIZ_DIFFICULTIES,
} from '../utils';
import { calculateQuizScore, checkAnswer } from '../data-access';
import { Question, Answer } from '@/types/types';

// Mock questions for testing
const mockQuestions: Question[] = [
  {
    id: 1,
    level_no: 1,
    level: 'Beginner',
    week_no: 1,
    question: '2 + 2 = ?',
    option_a: '3',
    option_b: '4',
    option_c: '5',
    option_d: '6',
    correct_answer: 'B',
    points: 10,
  },
  {
    id: 2,
    level_no: 1,
    level: 'Beginner',
    week_no: 1,
    question: '5 - 3 = ?',
    option_a: '1',
    option_b: '2',
    option_c: '3',
    option_d: '4',
    correct_answer: 'B',
    points: 10,
  },
  {
    id: 3,
    level_no: 1,
    level: 'Beginner',
    week_no: 1,
    question: '3 × 4 = ?',
    option_a: '10',
    option_b: '11',
    option_c: '12',
    option_d: '13',
    correct_answer: 'C',
    points: 15,
  },
];

describe('Quiz Utility Functions', () => {
  describe('calculateQuizScore', () => {
    it('should calculate correct score for all correct answers', () => {
      const answers = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true },
        { questionId: 2, selectedAnswer: 'B', isCorrect: true },
        { questionId: 3, selectedAnswer: 'C', isCorrect: true },
      ];

      const result = calculateQuizScore(mockQuestions, answers);

      expect(result.correctAnswers).toBe(3);
      expect(result.totalQuestions).toBe(3);
      expect(result.score).toBe(100);
      expect(result.totalPoints).toBe(35);
      expect(result.earnedPoints).toBe(35);
    });

    it('should calculate correct score for mixed answers', () => {
      const answers = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true },
        { questionId: 2, selectedAnswer: 'A', isCorrect: false },
        { questionId: 3, selectedAnswer: 'C', isCorrect: true },
      ];

      const result = calculateQuizScore(mockQuestions, answers);

      expect(result.correctAnswers).toBe(2);
      expect(result.totalQuestions).toBe(3);
      expect(result.score).toBe(67); // 2/3 * 100 rounded
      expect(result.totalPoints).toBe(35);
      expect(result.earnedPoints).toBe(25); // 10 + 15
    });

    it('should handle empty answers', () => {
      const result = calculateQuizScore(mockQuestions, []);

      expect(result.correctAnswers).toBe(0);
      expect(result.totalQuestions).toBe(3);
      expect(result.score).toBe(0);
      expect(result.earnedPoints).toBe(0);
    });
  });

  describe('checkAnswer', () => {
    it('should return true for correct answer', () => {
      const result = checkAnswer(mockQuestions[0], 'B');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const result = checkAnswer(mockQuestions[0], 'A');
      expect(result).toBe(false);
    });

    it('should be case insensitive', () => {
      const result1 = checkAnswer(mockQuestions[0], 'b');
      const result2 = checkAnswer(mockQuestions[0], 'B');
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('validateQuizConfig', () => {
    it('should validate correct configuration', () => {
      const result = validateQuizConfig('Beginner', 1, 'easy');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty level', () => {
      const result = validateQuizConfig('', 1, 'easy');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level is required');
    });

    it('should reject invalid week number', () => {
      const result = validateQuizConfig('Beginner', 0, 'easy');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Week number must be a positive integer');
    });

    it('should reject invalid difficulty', () => {
      const result = validateQuizConfig('Beginner', 1, 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid difficulty level');
    });
  });

  describe('validateAnswers', () => {
    it('should validate correct answers format', () => {
      const answers: Answer[] = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true, timeTaken: 5 },
        { questionId: 2, selectedAnswer: 'A', isCorrect: false, timeTaken: 8 },
        { questionId: 3, selectedAnswer: null, isCorrect: false, timeTaken: 15 },
      ];

      const result = validateAnswers(mockQuestions, answers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject wrong number of answers', () => {
      const answers: Answer[] = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true, timeTaken: 5 },
      ];

      const result = validateAnswers(mockQuestions, answers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected 3 answers, got 1');
    });

    it('should reject invalid question ID', () => {
      const answers: Answer[] = [
        { questionId: 999, selectedAnswer: 'B', isCorrect: true, timeTaken: 5 },
        { questionId: 2, selectedAnswer: 'A', isCorrect: false, timeTaken: 8 },
        { questionId: 3, selectedAnswer: 'C', isCorrect: true, timeTaken: 10 },
      ];

      const result = validateAnswers(mockQuestions, answers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Answer 1: Invalid question ID 999');
    });
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(120)).toBe('02:00');
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('calculateTimeTaken', () => {
    it('should calculate time difference correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:02:30Z');
      
      const result = calculateTimeTaken(startTime, endTime);
      expect(result).toBe(150); // 2 minutes 30 seconds
    });
  });

  describe('generateQuizSummary', () => {
    it('should generate correct summary', () => {
      const answers: Answer[] = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true, timeTaken: 5 },
        { questionId: 2, selectedAnswer: 'A', isCorrect: false, timeTaken: 8 },
        { questionId: 3, selectedAnswer: null, isCorrect: false, timeTaken: 15 },
      ];

      const result = generateQuizSummary(mockQuestions, answers, 28);

      expect(result.totalQuestions).toBe(3);
      expect(result.answeredQuestions).toBe(2);
      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(1);
      expect(result.skippedQuestions).toBe(1);
      expect(result.accuracy).toBe(50); // 1/2 * 100
      expect(result.averageTimePerQuestion).toBe(9.33); // 28/3 rounded
      expect(result.totalPoints).toBe(35);
      expect(result.earnedPoints).toBe(10);
    });
  });

  describe('getPerformanceGrade', () => {
    it('should return correct grades', () => {
      expect(getPerformanceGrade(95).grade).toBe('A+');
      expect(getPerformanceGrade(85).grade).toBe('A');
      expect(getPerformanceGrade(75).grade).toBe('B');
      expect(getPerformanceGrade(65).grade).toBe('C');
      expect(getPerformanceGrade(55).grade).toBe('D');
      expect(getPerformanceGrade(45).grade).toBe('F');
    });

    it('should return appropriate messages', () => {
      expect(getPerformanceGrade(95).message).toBe('Excellent work!');
      expect(getPerformanceGrade(45).message).toBe('Keep trying!');
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).toEqual(expect.arrayContaining(original));
    });

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });
  });

  describe('QUIZ_DIFFICULTIES', () => {
    it('should have all required difficulties', () => {
      expect(QUIZ_DIFFICULTIES.easy).toBeDefined();
      expect(QUIZ_DIFFICULTIES.medium).toBeDefined();
      expect(QUIZ_DIFFICULTIES.hard).toBeDefined();
    });

    it('should have correct time limits', () => {
      expect(QUIZ_DIFFICULTIES.easy.timeLimit).toBe(15);
      expect(QUIZ_DIFFICULTIES.medium.timeLimit).toBe(10);
      expect(QUIZ_DIFFICULTIES.hard.timeLimit).toBe(5);
    });
  });
});