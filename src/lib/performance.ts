import { createClient } from "./supabase/client";

function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length < 2) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance =
    numbers.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    numbers.length;
  return Math.sqrt(variance);
}

// Type definitions for clarity
export type PerformanceHistoryItem = {
  date: string;
  score: number;
  level: string;
  weekNo: number;
  difficulty: string;
  timeSpent: number;
};

export type PerformanceStats = {
  currentScore: number;
  previousScore: number;
  averageScore: number;
  consistency: number; // Standard Deviation
  speed: number; // Questions per minute
  accuracy: number; // Percentage
};

/**
 * Fetches the last 5 quiz attempts for the performance chart.
 * @param studentId The UUID of the student.
 */
export async function fetchPerformanceHistory(
  studentId: string
): Promise<PerformanceHistoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      `
      completed_at,
      score,
      week_no,
      difficulty,
      time_spent,
      levels ( name )
    `
    )
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching performance history:", error);
    throw new Error(error.message);
  }

  if (!data) return [];

  // Map Supabase data to the format expected by the chart component
  // We also reverse the array to display it chronologically in the chart
  return data
    .map((attempt) => ({
      date: attempt.completed_at
        ? new Date(attempt.completed_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      score: Number(attempt.score),
      level: (attempt.levels as { name: string } | null)?.name ?? "Unknown",
      weekNo: attempt.week_no,
      difficulty: attempt.difficulty,
      timeSpent: attempt.time_spent,
    }))
    .reverse();
}

/**
 * Fetches all attempts for a student and calculates key performance statistics for insights.
 * @param studentId The UUID of the student.
 */
export async function fetchPerformanceStats(
  studentId: string
): Promise<PerformanceStats | null> {
  const supabase = createClient();
  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("score, time_spent, total_questions, correct_answers")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching performance stats:", error);
    throw new Error(error.message);
  }

  if (!attempts || attempts.length === 0) {
    return null; // No attempts, no stats to calculate
  }

  const scores = attempts.map((a) => Number(a.score));

  const currentScore = scores[0] ?? 0;
  const previousScore = scores[1] ?? currentScore; // If only one attempt, previous is same as current

  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / scores.length;

  const consistency = calculateStandardDeviation(scores);

  const totalQuestionsAnswered = attempts.reduce(
    (sum, a) => sum + a.total_questions,
    0
  );
  const totalTimeInSeconds = attempts.reduce((sum, a) => sum + a.time_spent, 0);
  const speed =
    totalTimeInSeconds > 0
      ? totalQuestionsAnswered / (totalTimeInSeconds / 60)
      : 0;

  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_answers, 0);
  const accuracy =
    totalQuestionsAnswered > 0
      ? (totalCorrect / totalQuestionsAnswered) * 100
      : 0;

  return {
    currentScore,
    previousScore,
    averageScore,
    consistency,
    speed,
    accuracy,
  };
}
