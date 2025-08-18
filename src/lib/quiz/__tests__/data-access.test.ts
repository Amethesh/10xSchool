import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import {
  fetchQuestionsByLevelAndWeek,
  calculateQuizScore,
  checkAnswer,
} from '../data-access';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

const mockSupabaseClient = {
  from: vi.fn(),
};

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
};

describe('Quiz Data Access Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.from.mockReturnValue(mockQuery);
  });

  describe('fetchQuestionsByLevelAndWeek', () => {
    it('should fetch questions with correct parameters', async () => {
      const mockQuestions = [
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
      ];

      mockQuery.eq.mockReturnValue({
        ...mockQuery,
        eq: vi.fn().mockReturnValue({
          ...mockQuery,
          order: vi.fn().mockResolvedValue({
            data: mockQuestions,
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsByLevelAndWeek('Beginner', 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('math_questions');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockQuestions);
    });

    it('should throw error when database query fails', async () => {
      mockQuery.eq.mockReturnValue({
        ...mockQuery,
        eq: vi.fn().mockReturnValue({
          ...mockQuery,
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      await expect(fetchQuestionsByLevelAndWeek('Beginner', 1))
        .rejects.toThrow('Failed to fetch questions: Database error');
    });

    it('should throw error when no questions found (null data)', async () => {
      mockQuery.eq.mockReturnValue({
        ...mockQuery,
        eq: vi.fn().mockReturnValue({
          ...mockQuery,
          order: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      await expect(fetchQuestionsByLevelAndWeek('Beginner', 1))
        .rejects.toThrow('No questions found for Beginner week 1');
    });

    it('should throw error when no questions found (empty array)', async () => {
      mockQuery.eq.mockReturnValue({
        ...mockQuery,
        eq: vi.fn().mockReturnValue({
          ...mockQuery,
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      await expect(fetchQuestionsByLevelAndWeek('Beginner', 1))
        .rejects.toThrow('No questions found for Beginner week 1');
    });
  });

  describe('calculateQuizScore', () => {
    it('should calculate score correctly', () => {
      const questions = [
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
      ];

      const answers = [
        { questionId: 1, selectedAnswer: 'B', isCorrect: true },
        { questionId: 2, selectedAnswer: 'A', isCorrect: false },
      ];

      const result = calculateQuizScore(questions, answers);

      expect(result.correctAnswers).toBe(1);
      expect(result.totalQuestions).toBe(2);
      expect(result.score).toBe(50);
      expect(result.totalPoints).toBe(20);
      expect(result.earnedPoints).toBe(10);
    });
  });

  describe('checkAnswer', () => {
    it('should validate correct answer', () => {
      const question = {
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
      };

      expect(checkAnswer(question, 'B')).toBe(true);
      expect(checkAnswer(question, 'b')).toBe(true);
      expect(checkAnswer(question, 'A')).toBe(false);
    });
  });
});