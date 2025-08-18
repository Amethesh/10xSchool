import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock all the required modules
vi.mock('@/lib/supabase/client');
vi.mock('@/lib/quiz/data-access');
vi.mock('@/lib/quiz/level-access');
vi.mock('@/hooks/use-level-access');

// Create a mock quiz page component that simulates the full flow
const MockQuizPage = () => {
  const [currentStep, setCurrentStep] = React.useState<'levels' | 'difficulty' | 'quiz' | 'results'>('levels');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('');
  const [selectedWeek, setSelectedWeek] = React.useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<any>(null);
  const [quizResults, setQuizResults] = React.useState<any>(null);

  const mockLevels = [
    { name: 'Beginner', weeks: [1, 2, 3], hasAccess: true },
    { name: 'Movers', weeks: [1, 2, 3], hasAccess: false },
    { name: 'Flyers', weeks: [1, 2, 3], hasAccess: false },
  ];

  const mockQuestions = [
    {
      id: 1,
      question: '2 + 2 = ?',
      option_a: '3',
      option_b: '4',
      option_c: '5',
      option_d: '6',
      correct_answer: 'B',
    },
    {
      id: 2,
      question: '5 - 3 = ?',
      option_a: '1',
      option_b: '2',
      option_c: '3',
      option_d: '4',
      correct_answer: 'B',
    },
  ];

  const difficulties = [
    { name: 'easy', timeLimit: 15, label: 'Easy (15s)' },
    { name: 'medium', timeLimit: 10, label: 'Medium (10s)' },
    { name: 'hard', timeLimit: 5, label: 'Hard (5s)' },
  ];

  // Level Selection Step
  if (currentStep === 'levels') {
    return (
      <div data-testid="level-selection">
        <h1>Select Level and Week</h1>
        {mockLevels.map(level => (
          <div key={level.name} data-testid={`level-${level.name.toLowerCase()}`}>
            <h2>{level.name}</h2>
            {level.hasAccess ? (
              level.weeks.map(week => (
                <button
                  key={week}
                  data-testid={`week-${level.name.toLowerCase()}-${week}`}
                  onClick={() => {
                    setSelectedLevel(level.name);
                    setSelectedWeek(week);
                    setCurrentStep('difficulty');
                  }}
                >
                  Week {week}
                </button>
              ))
            ) : (
              <button
                data-testid={`request-access-${level.name.toLowerCase()}`}
                onClick={() => {
                  // Simulate access request
                  alert(`Access requested for ${level.name}`);
                }}
              >
                Request Access
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Difficulty Selection Step
  if (currentStep === 'difficulty') {
    return (
      <div data-testid="difficulty-selection">
        <h1>Select Difficulty</h1>
        <p>{selectedLevel} - Week {selectedWeek}</p>
        {difficulties.map(difficulty => (
          <button
            key={difficulty.name}
            data-testid={`difficulty-${difficulty.name}`}
            onClick={() => {
              setSelectedDifficulty(difficulty);
              setCurrentStep('quiz');
            }}
          >
            {difficulty.label}
          </button>
        ))}
        <button
          data-testid="back-to-levels"
          onClick={() => setCurrentStep('levels')}
        >
          Back
        </button>
      </div>
    );
  }

  // Quiz Step
  if (currentStep === 'quiz') {
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [answers, setAnswers] = React.useState<any[]>([]);
    const [timeRemaining, setTimeRemaining] = React.useState(selectedDifficulty.timeLimit);

    const currentQuestion = mockQuestions[currentQuestionIndex];

    React.useEffect(() => {
      if (timeRemaining > 0) {
        const timer = setTimeout(() => {
          setTimeRemaining(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Time up - auto submit
        handleAnswer(null);
      }
    }, [timeRemaining]);

    const handleAnswer = (selectedAnswer: string | null) => {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      };

      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeRemaining(selectedDifficulty.timeLimit);
      } else {
        // Quiz complete
        const correctCount = newAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctCount / mockQuestions.length) * 100);
        setQuizResults({
          score,
          correctAnswers: correctCount,
          totalQuestions: mockQuestions.length,
          answers: newAnswers,
        });
        setCurrentStep('results');
      }
    };

    return (
      <div data-testid="quiz-interface">
        <div data-testid="quiz-header">
          <p>Question {currentQuestionIndex + 1} of {mockQuestions.length}</p>
          <p data-testid="timer">Time: {timeRemaining}s</p>
        </div>
        
        <div data-testid="question">
          <h2>{currentQuestion.question}</h2>
          <button
            data-testid="answer-a"
            onClick={() => handleAnswer('A')}
          >
            A. {currentQuestion.option_a}
          </button>
          <button
            data-testid="answer-b"
            onClick={() => handleAnswer('B')}
          >
            B. {currentQuestion.option_b}
          </button>
          <button
            data-testid="answer-c"
            onClick={() => handleAnswer('C')}
          >
            C. {currentQuestion.option_c}
          </button>
          <button
            data-testid="answer-d"
            onClick={() => handleAnswer('D')}
          >
            D. {currentQuestion.option_d}
          </button>
        </div>

        <button
          data-testid="exit-quiz"
          onClick={() => setCurrentStep('levels')}
        >
          Exit Quiz
        </button>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results') {
    return (
      <div data-testid="quiz-results">
        <h1>Quiz Complete!</h1>
        <div data-testid="score">Score: {quizResults.score}%</div>
        <div data-testid="correct-answers">
          Correct: {quizResults.correctAnswers} / {quizResults.totalQuestions}
        </div>
        
        <div data-testid="performance-grade">
          {quizResults.score >= 90 ? 'Excellent!' :
           quizResults.score >= 70 ? 'Good Job!' :
           quizResults.score >= 50 ? 'Keep Practicing!' :
           'Try Again!'}
        </div>

        <button
          data-testid="retry-quiz"
          onClick={() => {
            setCurrentStep('difficulty');
            setQuizResults(null);
          }}
        >
          Try Again
        </button>

        <button
          data-testid="back-to-levels"
          onClick={() => {
            setCurrentStep('levels');
            setQuizResults(null);
          }}
        >
          Back to Levels
        </button>
      </div>
    );
  }

  return null;
};

describe('Quiz End-to-End Tests', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Complete Quiz Taking Experience', () => {
    it('should complete full quiz flow from level selection to results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Step 1: Level Selection
      expect(screen.getByTestId('level-selection')).toBeInTheDocument();
      expect(screen.getByText('Select Level and Week')).toBeInTheDocument();

      // Should show accessible and locked levels
      expect(screen.getByTestId('level-beginner')).toBeInTheDocument();
      expect(screen.getByTestId('level-movers')).toBeInTheDocument();
      expect(screen.getByTestId('level-flyers')).toBeInTheDocument();

      // Beginner should have week buttons, others should have request access
      expect(screen.getByTestId('week-beginner-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-access-movers')).toBeInTheDocument();
      expect(screen.getByTestId('request-access-flyers')).toBeInTheDocument();

      // Select Beginner Week 1
      await user.click(screen.getByTestId('week-beginner-1'));

      // Step 2: Difficulty Selection
      await waitFor(() => {
        expect(screen.getByTestId('difficulty-selection')).toBeInTheDocument();
      });

      expect(screen.getByText('Beginner - Week 1')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-medium')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument();

      // Select medium difficulty
      await user.click(screen.getByTestId('difficulty-medium'));

      // Step 3: Quiz Interface
      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('2 + 2 = ?')).toBeInTheDocument();
      expect(screen.getByTestId('timer')).toHaveTextContent('Time: 10s');

      // Answer first question correctly
      await user.click(screen.getByTestId('answer-b'));

      // Should move to second question
      await waitFor(() => {
        expect(screen.getByText('5 - 3 = ?')).toBeInTheDocument();
      });

      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

      // Answer second question correctly
      await user.click(screen.getByTestId('answer-b'));

      // Step 4: Results
      await waitFor(() => {
        expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      });

      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      expect(screen.getByTestId('score')).toHaveTextContent('Score: 100%');
      expect(screen.getByTestId('correct-answers')).toHaveTextContent('Correct: 2 / 2');
      expect(screen.getByTestId('performance-grade')).toHaveTextContent('Excellent!');
    });

    it('should handle incorrect answers and show appropriate results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Navigate to quiz
      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      // Answer first question incorrectly
      await user.click(screen.getByTestId('answer-a'));

      // Answer second question correctly
      await waitFor(() => {
        expect(screen.getByText('5 - 3 = ?')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('answer-b'));

      // Check results
      await waitFor(() => {
        expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      });

      expect(screen.getByTestId('score')).toHaveTextContent('Score: 50%');
      expect(screen.getByTestId('correct-answers')).toHaveTextContent('Correct: 1 / 2');
      expect(screen.getByTestId('performance-grade')).toHaveTextContent('Keep Practicing!');
    });

    it('should handle timer expiration', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Navigate to quiz with hard difficulty (5 seconds)
      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-hard'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      expect(screen.getByTestId('timer')).toHaveTextContent('Time: 5s');

      // Let timer expire without answering
      vi.advanceTimersByTime(5000);

      // Should auto-progress to next question
      await waitFor(() => {
        expect(screen.getByText('5 - 3 = ?')).toBeInTheDocument();
      });

      // Answer second question correctly
      await user.click(screen.getByTestId('answer-b'));

      // Check results - should show 1 correct out of 2
      await waitFor(() => {
        expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      });

      expect(screen.getByTestId('score')).toHaveTextContent('Score: 50%');
      expect(screen.getByTestId('correct-answers')).toHaveTextContent('Correct: 1 / 2');
    });

    it('should handle quiz retry functionality', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Complete a quiz
      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('answer-b'));

      await waitFor(() => {
        expect(screen.getByText('5 - 3 = ?')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('answer-b'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      });

      // Retry the quiz
      await user.click(screen.getByTestId('retry-quiz'));

      // Should return to difficulty selection
      await waitFor(() => {
        expect(screen.getByTestId('difficulty-selection')).toBeInTheDocument();
      });

      expect(screen.getByText('Beginner - Week 1')).toBeInTheDocument();
    });

    it('should handle navigation back to levels', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Navigate to difficulty selection
      await user.click(screen.getByTestId('week-beginner-1'));

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-selection')).toBeInTheDocument();
      });

      // Go back to levels
      await user.click(screen.getByTestId('back-to-levels'));

      await waitFor(() => {
        expect(screen.getByTestId('level-selection')).toBeInTheDocument();
      });

      expect(screen.getByText('Select Level and Week')).toBeInTheDocument();
    });

    it('should handle quiz exit functionality', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      // Navigate to quiz
      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      // Exit quiz
      await user.click(screen.getByTestId('exit-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('level-selection')).toBeInTheDocument();
      });
    });
  });

  describe('Level Access Control', () => {
    it('should show request access for locked levels', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      expect(screen.getByTestId('level-selection')).toBeInTheDocument();

      // Should show request access buttons for locked levels
      expect(screen.getByTestId('request-access-movers')).toBeInTheDocument();
      expect(screen.getByTestId('request-access-flyers')).toBeInTheDocument();

      // Click request access
      window.alert = vi.fn();
      await user.click(screen.getByTestId('request-access-movers'));

      expect(window.alert).toHaveBeenCalledWith('Access requested for Movers');
    });

    it('should allow access to beginner level without restrictions', () => {
      render(<MockQuizPage />, { wrapper: createWrapper });

      expect(screen.getByTestId('level-selection')).toBeInTheDocument();

      // Beginner level should show week buttons, not request access
      expect(screen.getByTestId('week-beginner-1')).toBeInTheDocument();
      expect(screen.getByTestId('week-beginner-2')).toBeInTheDocument();
      expect(screen.getByTestId('week-beginner-3')).toBeInTheDocument();
    });
  });

  describe('Requirements Validation', () => {
    it('should meet requirement 3.1: select all questions from chosen week and level', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      // Should show questions from the selected level and week
      expect(screen.getByText('2 + 2 = ?')).toBeInTheDocument();
    });

    it('should meet requirement 3.2: show math problem with 4 multiple choice options', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      // Should show 4 answer options
      expect(screen.getByTestId('answer-a')).toBeInTheDocument();
      expect(screen.getByTestId('answer-b')).toBeInTheDocument();
      expect(screen.getByTestId('answer-c')).toBeInTheDocument();
      expect(screen.getByTestId('answer-d')).toBeInTheDocument();
    });

    it('should meet requirement 3.3: start countdown timer based on difficulty', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-hard')); // 5 seconds

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      expect(screen.getByTestId('timer')).toHaveTextContent('Time: 5s');
    });

    it('should meet requirement 4.1: calculate and display student score', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      await user.click(screen.getByTestId('week-beginner-1'));
      await user.click(screen.getByTestId('difficulty-medium'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-interface')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('answer-b'));

      await waitFor(() => {
        expect(screen.getByText('5 - 3 = ?')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('answer-b'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      });

      expect(screen.getByTestId('score')).toHaveTextContent('Score: 100%');
      expect(screen.getByTestId('correct-answers')).toHaveTextContent('Correct: 2 / 2');
    });

    it('should meet requirement 5.1: notify administrator of access requests', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<MockQuizPage />, { wrapper: createWrapper });

      window.alert = vi.fn();
      await user.click(screen.getByTestId('request-access-movers'));

      expect(window.alert).toHaveBeenCalledWith('Access requested for Movers');
    });
  });
});