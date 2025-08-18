"use server"
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { Question, QuizAttempt, QuizAnswer, StudentRanking } from '@/types/types';
import { QuizError, QuizErrorType, categorizeError } from './errors';
import { withDatabaseRetry, withNetworkRetry, withDatabaseCircuitBreaker } from './retry';

type Tables = Database['public']['Tables'];
type QuizAttemptRow = Tables['quiz_attempts']['Row'];
type QuizAnswerRow = Tables['quiz_answers']['Row'];
type MathQuestionRow = Tables['math_questions']['Row'];
type StudentRow = Tables['students']['Row'];

/**
 * Fetch questions by level and week number from math_questions table
 */
export async function fetchQuestionsByLevelAndWeek(
  levelId: number,
  weekNo: number
): Promise<Question[]> {
  try {
    return await withDatabaseCircuitBreaker(async () => {
      return await withDatabaseRetry(async () => {
        const supabase =  await createClient();

        const { data, error } = await supabase
          .from("math_questions")
          .select("*")
          .eq("level_id", levelId)
          .eq("week_no", weekNo)

        if (error) {
          throw QuizError.database(
            `Failed to fetch questions: ${error.message}`,
            {
              levelId,
              weekNo,
              operation: "fetchQuestionsByLevelAndWeek",
            }
          );
        }

        if (!data || data.length === 0) {
          throw QuizError.questionLoad(
            `No questions found for levelId ${levelId} week ${weekNo}`,
            {
              levelId,
              weekNo,
            }
          );
        }

        return data;
      });
    });
  } catch (error) {
    if (error instanceof QuizError) {
      throw error;
    }
    throw categorizeError(error as Error, {
      levelId,
      weekNo,
      operation: "fetchQuestionsByLevelAndWeek",
    });
  }
}

/**
 * Create a new quiz attempt record
 */
export async function createQuizAttempt(
  studentId: string,
  levelId: number,
  weekNo: number,
  difficulty: string,
  totalQuestions: number
): Promise<string> {
  try {
    return await withDatabaseCircuitBreaker(async () => {
      return await withDatabaseRetry(async () => {
        const supabase = await createClient();

        const { data, error } = await supabase
          .from("quiz_attempts")
          .insert({
            student_id: studentId,
            level_id: levelId,   // ✅ store by ID, not text
            week_no: weekNo,
            difficulty,
            total_questions: totalQuestions,
            correct_answers: 0,
            score: 0,
            time_spent: 0,
          })
          .select("id")
          .single();

        if (error) {
          throw QuizError.database(
            `Failed to create quiz attempt: ${error.message}`,
            {
              studentId,
              levelId,
              weekNo,
              difficulty,
              operation: "createQuizAttempt",
            }
          );
        }

        if (!data?.id) {
          throw QuizError.database("Quiz attempt created but no ID returned", {
            studentId,
            levelId,
            weekNo,
            difficulty,
          });
        }

        return data.id;
      });
    });
  } catch (error) {
    if (error instanceof QuizError) {
      throw error;
    }
    throw categorizeError(error as Error, {
      studentId,
      levelId,
      weekNo,
      difficulty,
      operation: "createQuizAttempt",
    });
  }
}

/**
 * Update quiz attempt with final results
 */
export async function updateQuizAttempt(
  attemptId: string,
  correctAnswers: number,
  score: number,
  timeSpent: number
): Promise<void> {
  try {
    await withDatabaseCircuitBreaker(async () => {
      return await withDatabaseRetry(async () => {
        const supabase = await createClient();

        const { error } = await supabase
          .from('quiz_attempts')
          .update({
            correct_answers: correctAnswers,
            score,
            time_spent: timeSpent,
            completed_at: new Date().toISOString(),
          })
          .eq('id', attemptId);

        if (error) {
          throw QuizError.save(`Failed to update quiz attempt: ${error.message}`, {
            attemptId,
            correctAnswers,
            score,
            timeSpent,
            operation: 'updateQuizAttempt'
          });
        }
      });
    });
  } catch (error) {
    if (error instanceof QuizError) {
      throw error;
    }
    throw categorizeError(error as Error, {
      attemptId,
      correctAnswers,
      score,
      timeSpent,
      operation: 'updateQuizAttempt'
    });
  }
}

/**
 * Save a quiz answer
 */
export async function saveQuizAnswer(
  attemptId: string,
  questionId: number,
  selectedAnswer: string | null,
  isCorrect: boolean,
  timeTaken: number | null
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('quiz_answers')
    .insert({
      attempt_id: attemptId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      time_taken: timeTaken,
    });

  if (error) {
    throw new Error(`Failed to save quiz answer: ${error.message}`);
  }
}

/**
 * Save multiple quiz answers in batch
 */
export async function saveQuizAnswers(
  attemptId: string,
  answers: Array<{
    questionId: number;
    selectedAnswer: string | null;
    isCorrect: boolean;
    timeTaken: number | null;
  }>
): Promise<void> {
  try {
    await withDatabaseCircuitBreaker(async () => {
      return await withDatabaseRetry(async () => {
        const supabase = await createClient();

        const answersToInsert = answers.map(answer => ({
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_answer: answer.selectedAnswer,
          is_correct: answer.isCorrect,
          time_taken: answer.timeTaken,
        }));

        const { error } = await supabase
          .from('quiz_answers')
          .insert(answersToInsert);

        if (error) {
          throw QuizError.save(`Failed to save quiz answers: ${error.message}`, {
            attemptId,
            answerCount: answers.length,
            operation: 'saveQuizAnswers'
          });
        }
      });
    });
  } catch (error) {
    if (error instanceof QuizError) {
      throw error;
    }
    throw categorizeError(error as Error, {
      attemptId,
      answerCount: answers.length,
      operation: 'saveQuizAnswers'
    });
  }
}

/**
 * Retrieve quiz attempts for a student
 */
export async function getStudentQuizAttempts(
  studentId: string,
  level?: string,
  weekNo?: number
): Promise<QuizAttemptRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false });

  if (level) {
    query = query.eq('level', level);
  }

  if (weekNo) {
    query = query.eq('week_no', weekNo);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch quiz attempts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get quiz attempt details with answers
 */
export async function getQuizAttemptWithAnswers(
  attemptId: string
): Promise<{
  attempt: QuizAttemptRow;
  answers: QuizAnswerRow[];
} | null> {
  const supabase = await createClient();

  const [attemptResult, answersResult] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single(),
    supabase
      .from('quiz_answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('created_at')
  ]);

  if (attemptResult.error) {
    throw new Error(`Failed to fetch quiz attempt: ${attemptResult.error.message}`);
  }

  if (answersResult.error) {
    throw new Error(`Failed to fetch quiz answers: ${answersResult.error.message}`);
  }

  return {
    attempt: attemptResult.data,
    answers: answersResult.data || [],
  };
}

/**
 * Calculate student ranking for a specific quiz (level + week + difficulty)
 */
export async function calculateStudentRanking(
  studentId: string,
  levelId: number,
  weekNo: number,
  difficulty: string
): Promise<StudentRanking | null> {
  const supabase = await createClient();

  // Get all attempts for this specific quiz configuration
  const { data: allAttempts, error } = await supabase
    .from("quiz_attempts")
    .select("student_id, score, completed_at")
    .eq("level_id", levelId)   // ✅ use level_id instead of level
    .eq("week_no", weekNo)
    .eq("difficulty", difficulty)
    .not("completed_at", "is", null)
    .order("score", { ascending: false });

  console.log("ALL ATTEMPTS", allAttempts);

  if (error) {
    throw new Error(`Failed to fetch ranking data: ${error.message}`);
  }

  if (!allAttempts || allAttempts.length === 0) {
    return null;
  }

  // Get the best score for each student (in case of multiple attempts)
  const studentBestScores = new Map<string, number>();

  allAttempts.forEach((attempt) => {
    if (!attempt.student_id) return; // Skip if student_id is null
    const currentBest = studentBestScores.get(attempt.student_id);
    if (!currentBest || attempt.score > currentBest) {
      studentBestScores.set(attempt.student_id, attempt.score);
    }
  });

  // Convert to sorted array
  const sortedScores = Array.from(studentBestScores.entries()).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  );

  // Find student's position
  const studentPosition = sortedScores.findIndex(([id]) => id === studentId);

  if (studentPosition === -1) {
    return null;
  }

  const studentScore = sortedScores[studentPosition][1];
  const rank = studentPosition + 1;
  const totalStudents = sortedScores.length;
  const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100);

  return {
    studentId,
    rank,
    totalStudents,
    percentile,
    score: studentScore,
  };
}


/**
 * Get leaderboard for a specific quiz (level + week + difficulty)
 */
export async function getQuizLeaderboard(
  levelId: number,
  weekNo: number,
  difficulty: string,
  limit: number = 10
): Promise<Array<{
  studentId: string;
  studentName: string;
  score: number;
  rank: number;
  completedAt: string;
}>> {
  const supabase = await createClient();

  // Get all attempts with student information
  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select(`
      student_id,
      score,
      completed_at,
      students!inner(full_name)
    `)
    .eq('level_id', levelId) // ✅ changed from "level" to "level_id"
    .eq('week_no', weekNo)
    .eq('difficulty', difficulty)
    .not('completed_at', 'is', null)
    .order('score', { ascending: false });

  if (error) {
    console.error(error.message);
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  if (!attempts || attempts.length === 0) {
    return [];
  }

  // Get best score for each student
  const studentBestAttempts = new Map<string, typeof attempts[0]>();

  attempts.forEach(attempt => {
    if (!attempt.student_id) return; // Skip if student_id is null
    const current = studentBestAttempts.get(attempt.student_id);
    if (!current || attempt.score > current.score) {
      studentBestAttempts.set(attempt.student_id, attempt);
    }
  });

  // Convert to sorted leaderboard
  const leaderboard = Array.from(studentBestAttempts.values())
    .filter(attempt => attempt.student_id && attempt.completed_at) // Filter out null values
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((attempt, index) => ({
      studentId: attempt.student_id!,
      studentName: (attempt.students as any)?.full_name || 'Unknown Student',
      score: attempt.score,
      rank: index + 1,
      completedAt: attempt.completed_at!,
    }));

  return leaderboard;
}
