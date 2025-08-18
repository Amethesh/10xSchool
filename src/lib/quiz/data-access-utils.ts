import { Question } from "@/types/types";
import { createClient } from "../supabase/client";

export async function getLevelLeaderboard(
  level: string,
  limit: number = 10
): Promise<Array<{
  studentId: string;
  studentName: string;
  totalScore: number;
  quizzesCompleted: number;
  averageScore: number;
  rank: number;
}>> {
  const supabase = await createClient();

  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select(`
      student_id,
      score,
      students!inner(full_name)
    `)
    .eq('level', level)
    .not('completed_at', 'is', null);

  if (error) {
    throw new Error(`Failed to fetch level leaderboard: ${error.message}`);
  }

  if (!attempts || attempts.length === 0) {
    return [];
  }

  // Calculate statistics for each student
  const studentStats = new Map<string, {
    studentName: string;
    scores: number[];
    totalScore: number;
    quizzesCompleted: number;
    averageScore: number;
  }>();

  attempts.forEach(attempt => {
    const studentId = attempt.student_id;
    const studentName = (attempt.students as any)?.full_name || 'Unknown Student';

    // Skip if student_id is null
    if (!studentId) return;

    if (!studentStats.has(studentId)) {
      studentStats.set(studentId, {
        studentName,
        scores: [],
        totalScore: 0,
        quizzesCompleted: 0,
        averageScore: 0,
      });
    }

    const stats = studentStats.get(studentId)!;
    stats.scores.push(attempt.score);
    stats.totalScore += attempt.score;
    stats.quizzesCompleted += 1;
    stats.averageScore = stats.totalScore / stats.quizzesCompleted;
  });

  // Convert to sorted leaderboard (sorted by average score)
  const leaderboard = Array.from(studentStats.entries())
    .map(([studentId, stats]) => ({
      studentId,
      studentName: stats.studentName,
      totalScore: stats.totalScore,
      quizzesCompleted: stats.quizzesCompleted,
      averageScore: Math.round(stats.averageScore * 100) / 100,
      rank: 0, // Will be set below
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}

/**
 * Check if the selected answer is correct for a given question
 */
export function checkAnswer(question: Question, selectedAnswer: string): boolean {
  if (!question || !selectedAnswer) {
    return false;
  }
  console.log("Question:", question.correct_answer)
  console.log("selected", selectedAnswer)
  // Compare the selected answer with the correct answer (case-insensitive)
  return selectedAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
}

/**
 * Calculate quiz score based on answers
 */
export function calculateQuizScore(
  questions: Question[],
  answers: Array<{
    questionId: number;
    selectedAnswer: string | null;
    isCorrect: boolean;
  }>
): {
  correctAnswers: number;
  totalQuestions: number;
  score: number; // percentage
  totalPoints: number;
  earnedPoints: number;
} {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  questions.forEach(question => {
    totalPoints += question.points;

    const answer = answers.find(a => a.questionId === question.id);
    if (answer && answer.isCorrect) {
      correctAnswers += 1;
      earnedPoints += question.points;
    }
  });

  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    correctAnswers,
    totalQuestions,
    score,
    totalPoints,
    earnedPoints,
  };
}


/**
 * Get student's quiz performance history
 */
export async function getStudentQuizHistory(
  studentId: string,
  limit: number = 20
): Promise<Array<{
  attemptId: string;
  levelId: number;
  levelName: string;
  weekNo: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      level_id,
      week_no,
      difficulty,
      score,
      correct_answers,
      total_questions,
      time_spent,
      completed_at,
      levels!inner(name)
    `)
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)
    .not('level_id', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch quiz history: ${error.message}`);
  }

  return (data || []).map(attempt => ({
    attemptId: attempt.id,
    levelId: attempt.level_id!, // Safe to use ! since we filtered null values in the query
    levelName: (attempt.levels as any)?.name || "Unknown Level",
    weekNo: attempt.week_no,
    difficulty: attempt.difficulty,
    score: attempt.score,
    correctAnswers: attempt.correct_answers,
    totalQuestions: attempt.total_questions,
    timeSpent: attempt.time_spent,
    completedAt: attempt.completed_at!,
  }));
}
