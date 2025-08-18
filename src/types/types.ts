// Type for a single difficulty setting
export interface DifficultySetting {
  time: number;
  label: string;
  color: string;
  icon: string;
}

// Type for the entire difficulty settings object
export interface DifficultySettings {
  easy: DifficultySetting;
  medium: DifficultySetting;
  hard: DifficultySetting;
  [key: string]: DifficultySetting; // Allow indexing with string for dynamic access
}

// Type for a single particle in the particle system
export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
}
// Question interface based on math_questions table structure
export interface Question {
  id: number;
  level_no: number;
  level: string;
  week_no: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
}

// NEW: Type for a leaderboard entry
export interface LeaderboardEntry {
  username: string;
  score: number;
}

// Quiz Difficulty interface
export interface QuizDifficulty {
  name: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds per question
  label: string;
}

// Quiz Results interface
export interface QuizResults {
  studentId: string;
  levelId: number;
  levelName: string;
  weekNo: number;
  difficulty: QuizDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number; // total time in seconds
  answers: Answer[];
  completedAt: Date;
  livesUsed: number; // number of lives lost during quiz
  endReason: 'completed' | 'no_lives'; // how the quiz ended
}

// Student Ranking interface
export interface StudentRanking {
  studentId: string;
  rank: number;
  totalStudents: number;
  percentile: number;
  score: number;
}

// Quiz Attempt type for database operations
export interface QuizAttempt {
  id: string;
  student_id: string;
  level: string;
  week_no: number;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  created_at: string;
}

// Quiz Answer type for database operations
export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: number;
  selected_answer: string | null;
  is_correct: boolean;
  time_taken: number | null;
  created_at: string;
}

// Answer type for quiz state management
export interface Answer {
  questionId: number;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeTaken: number; // seconds
  liveLost?: boolean; // whether this answer caused a life to be lost
}

// Quiz State utility types
export interface QuizState {
  currentQuestionIndex: number;
  answers: Answer[];
  timeRemaining: number;
  quizStartTime: Date;
  isCompleted: boolean;
  isPaused: boolean;
  livesRemaining: number; // number of lives left (starts at 3)
}

// Level Access types for database operations
export interface LevelAccess {
  id: string;
  student_id: string;
  level: string;
  granted_at: string;
  granted_by: string;
}

export interface AccessRequest {
  id: string;
  student_id: string;
  level: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// Utility types for quiz management
export type QuizDifficultyName = 'easy' | 'medium' | 'hard';
export type QuizStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type AccessRequestStatus = 'pending' | 'approved' | 'denied';

// Performance tracking types
export interface PerformanceMetrics {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  averageTimePerQuiz: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  streakCount: number;
  accuracyRate: number;
  speedScore: number; // Questions per minute
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  achieved: boolean;
  achievedAt?: string;
  category: 'score' | 'consistency' | 'speed' | 'completion';
  icon: string;
}

export interface LearningPath {
  currentLevel: string;
  currentWeek: number;
  completedLevels: string[];
  completedWeeks: Array<{ level: string; week: number; bestScore: number }>;
  suggestedNext: Array<{ level: string; week: number; reason: string }>;
  masteredTopics: Array<{ level: string; week: number; masteryScore: number }>;
  strugglingTopics: Array<{ level: string; week: number; averageScore: number; attempts: number }>;
}

export interface SkillProgression {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  recentTrend: 'improving' | 'stable' | 'declining';
  evidence: Array<{
    type: 'quiz_score' | 'consistency' | 'speed_improvement';
    value: number;
    date: string;
  }>;
  nextMilestone: {
    description: string;
    target: number;
    estimatedTime: string;
  };
}

export interface PerformanceInsight {
  id: string;
  type: 'achievement' | 'improvement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'consistency' | 'speed' | 'accuracy' | 'progress';
  data?: {
    current: number;
    previous?: number;
    target?: number;
    change?: number;
  };
}



// EXPORT TYPES so other components can use them
export type Attempt = {
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string | null;
} | null;

export type WeekLesson = {
  week_no: number;
  question_count: number;
  attempt: Attempt;
};

export type LevelData = {
  id: number;
  name: string;
  type: string;
  difficulty_level: number;
  approved: boolean;
  pending: boolean;
  weeks: WeekLesson[];
};

export type ProcessedWeekLesson = WeekLesson & {
  hasAccess: boolean;
  completed: boolean;
  bestScore: number;
  stars: number;
};
