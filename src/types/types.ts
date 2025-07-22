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
export interface Question {
  id: string; // uuid
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: "A" | "B" | "C" | "D"; // Enforce specific answer keys
  points: number;
  set_number: number;
}

// NEW: Type for a leaderboard entry
export interface LeaderboardEntry {
  username: string;
  score: number;
}
