// lib/quiz/quizReducer.ts

import { Question, Answer } from '@/types/types';
import { checkAnswer } from '@/lib/quiz/data-access-utils';

// The single state object for our quiz
export interface QuizState {
  status: 'loading' | 'ready' | 'active' | 'paused' | 'feedback' | 'completed' | 'error';
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  selectedAnswer: string | null;
  livesRemaining: number;
  quizStartTime: number;
  questionStartTime: number;
  attemptId: string | null;
  error: string | null;
}

// All possible actions that can change the state
export type QuizAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: { attemptId: string; questions: Question[] } }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; payload: { answer: string; question: Question } }
  | { type: 'TIME_UP'; payload: { question: Question } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESTART'; payload: { questions: Question[] } }
  | { type: 'SET_ERROR'; payload: string };

export const initialState: QuizState = {
  status: 'loading',
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  selectedAnswer: null,
  livesRemaining: 3, // Updated to 30 as in original code
  quizStartTime: 0,
  questionStartTime: 0,
  attemptId: null,
  error: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        status: 'ready',
        attemptId: action.payload.attemptId,
        questions: action.payload.questions,
        error: null,
      };
    case 'INITIALIZE_FAILURE':
      return { ...state, status: 'error', error: action.payload };

    case 'START_QUIZ':
      return {
        ...state,
        status: 'active',
        quizStartTime: Date.now(),
        questionStartTime: Date.now(),
      };

    case 'SELECT_ANSWER': {
      const { answer, question } = action.payload;
      const isCorrect = checkAnswer(question, answer);
      const liveLost = !isCorrect;
      const newLives = state.livesRemaining - (liveLost ? 1 : 0);

      const newAnswer: Answer = {
        questionId: question.id,
        selectedAnswer: answer,
        isCorrect,
        timeTaken: Math.round((Date.now() - state.questionStartTime) / 1000),
        liveLost: liveLost,
      };

      return {
        ...state,
        status: 'feedback', // Show feedback immediately
        selectedAnswer: answer,
        answers: [...state.answers, newAnswer],
        livesRemaining: newLives,
      };
    }

    case 'TIME_UP': {
      const newLives = state.livesRemaining - 1;
      const newAnswer: Answer = {
        questionId: action.payload.question.id,
        selectedAnswer: null,
        isCorrect: false,
        timeTaken: Math.round((Date.now() - state.questionStartTime) / 1000),
        liveLost: true,
      };

      return {
        ...state,
        status: 'feedback',
        answers: [...state.answers, newAnswer],
        livesRemaining: newLives,
        selectedAnswer: null,
      };
    }

    case 'NEXT_QUESTION': {
      const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;
      const isOutOfLives = state.livesRemaining <= 0;
      
      if (isLastQuestion || isOutOfLives) {
        return { ...state, status: 'completed' };
      }

      return {
        ...state,
        status: 'active',
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswer: null,
        questionStartTime: Date.now(),
      };
    }

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        status: state.status === 'paused' ? 'active' : 'paused',
      };
      
    case 'COMPLETE_QUIZ':
      return { ...state, status: 'completed' };

    case 'RESTART':
      return {
        ...initialState,
        status: 'ready',
        questions: action.payload.questions,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}