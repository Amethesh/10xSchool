"use server";

import { createClient } from "@/lib/supabase/server";
import { StudentRanking } from "@/types/types";

/**
 * Optimized student ranking calculation using database aggregation
 * This reduces the amount of data transferred and processed on the client
 */
export async function calculateStudentRankingOptimized(
  studentId: string,
  level: string,
  weekNo: number,
  difficulty: string
): Promise<StudentRanking | null> {
  const supabase = await createClient();
  
  try {
    // Use a single query with window functions for better performance
    const { data, error } = await supabase.rpc('calculate_student_ranking_optimized', {
      p_student_id: studentId,
      p_level: level,
      p_week_no: weekNo,
      p_difficulty: difficulty
    });

    if (error) {
      // Fallback to original method if RPC function doesn't exist
      console.warn('RPC function not available, using fallback method');
      return await calculateStudentRankingFallback(studentId, level, weekNo, difficulty);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      studentId,
      rank: result.rank,
      totalStudents: result.total_students,
      percentile: Math.round(((result.total_students - result.rank) / result.total_students) * 100),
      score: result.score,
    };
  } catch (error) {
    console.error('Error in optimized ranking calculation:', error);
    return await calculateStudentRankingFallback(studentId, level, weekNo, difficulty);
  }
}

/**
 * Fallback ranking calculation for when RPC function is not available
 */
async function calculateStudentRankingFallback(
  studentId: string,
  level: string,
  weekNo: number,
  difficulty: string
): Promise<StudentRanking | null> {
  const supabase = await createClient();
  
  // Get student's best score first
  const { data: studentAttempt, error: studentError } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('student_id', studentId)
    .eq('level', level)
    .eq('week_no', weekNo)
    .eq('difficulty', difficulty)
    .not('completed_at', 'is', null)
    .order('score', { ascending: false })
    .limit(1)
    .single();

  if (studentError || !studentAttempt) {
    return null;
  }

  const studentScore = studentAttempt.score;

  // Count students with better scores (more efficient than fetching all)
  const { count: betterCount, error: betterError } = await supabase
    .from('quiz_attempts')
    .select('student_id', { count: 'exact', head: true })
    .eq('level', level)
    .eq('week_no', weekNo)
    .eq('difficulty', difficulty)
    .gt('score', studentScore)
    .not('completed_at', 'is', null);

  if (betterError) {
    throw new Error(`Failed to calculate ranking: ${betterError.message}`);
  }

  // Count total unique students who completed this quiz
  const { data: totalStudents, error: totalError } = await supabase
    .from('quiz_attempts')
    .select('student_id')
    .eq('level', level)
    .eq('week_no', weekNo)
    .eq('difficulty', difficulty)
    .not('completed_at', 'is', null);

  if (totalError) {
    throw new Error(`Failed to get total students: ${totalError.message}`);
  }

  // Get unique student count
  const uniqueStudents = new Set(totalStudents?.map(s => s.student_id) || []).size;
  const rank = (betterCount || 0) + 1;
  const percentile = Math.round(((uniqueStudents - rank) / uniqueStudents) * 100);

  return {
    studentId,
    rank,
    totalStudents: uniqueStudents,
    percentile,
    score: studentScore,
  };
}

/**
 * Optimized leaderboard query using database aggregation
 */
export async function getQuizLeaderboardOptimized(
  level: string,
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
  
  try {
    // Use RPC function for optimized leaderboard calculation
    const { data, error } = await supabase.rpc('get_quiz_leaderboard_optimized', {
      p_level: level,
      p_week_no: weekNo,
      p_difficulty: difficulty,
      p_limit: limit
    });

    if (error) {
      // Fallback to original method
      console.warn('RPC function not available, using fallback method');
      return await getQuizLeaderboardFallback(level, weekNo, difficulty, limit);
    }

    return data || [];
  } catch (error) {
    console.error('Error in optimized leaderboard query:', error);
    return await getQuizLeaderboardFallback(level, weekNo, difficulty, limit);
  }
}

/**
 * Fallback leaderboard query
 */
async function getQuizLeaderboardFallback(
  level: string,
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
  
  // Use a more efficient query that gets best scores directly
  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select(`
      student_id,
      score,
      completed_at,
      students!inner(fullName)
    `)
    .eq('level', level)
    .eq('week_no', weekNo)
    .eq('difficulty', difficulty)
    .not('completed_at', 'is', null)
    .order('score', { ascending: false })
    .order('completed_at', { ascending: true }); // Earlier completion as tiebreaker

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  if (!attempts || attempts.length === 0) {
    return [];
  }

  // Get best score for each student (first occurrence due to ordering)
  const seen = new Set<string>();
  const leaderboard = attempts
    .filter(attempt => {
      if (!attempt.student_id || seen.has(attempt.student_id)) {
        return false;
      }
      seen.add(attempt.student_id);
      return true;
    })
    .slice(0, limit)
    .map((attempt, index) => ({
      studentId: attempt.student_id!,
      studentName: (attempt.students as any)?.fullName || 'Unknown Student',
      score: attempt.score,
      rank: index + 1,
      completedAt: attempt.completed_at!,
    }));

  return leaderboard;
}

/**
 * Batch fetch rankings for multiple students
 * More efficient than individual calls
 */
export async function getBatchStudentRankings(
  studentIds: string[],
  level: string,
  weekNo: number,
  difficulty: string
): Promise<Map<string, StudentRanking>> {
  const supabase = await createClient();
  const rankings = new Map<string, StudentRanking>();
  
  if (studentIds.length === 0) return rankings;
  
  try {
    // Get all relevant attempts in one query
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('student_id, score')
      .eq('level', level)
      .eq('week_no', weekNo)
      .eq('difficulty', difficulty)
      .not('completed_at', 'is', null)
      .order('score', { ascending: false });

    if (error || !attempts) {
      return rankings;
    }

    // Calculate best scores for all students
    const studentBestScores = new Map<string, number>();
    attempts.forEach(attempt => {
      if (!attempt.student_id) return;
      const current = studentBestScores.get(attempt.student_id);
      if (!current || attempt.score > current) {
        studentBestScores.set(attempt.student_id, attempt.score);
      }
    });

    // Sort by score
    const sortedScores = Array.from(studentBestScores.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    const totalStudents = sortedScores.length;

    // Calculate rankings for requested students
    studentIds.forEach(studentId => {
      const position = sortedScores.findIndex(([id]) => id === studentId);
      if (position !== -1) {
        const score = sortedScores[position][1];
        const rank = position + 1;
        const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100);
        
        rankings.set(studentId, {
          studentId,
          rank,
          totalStudents,
          percentile,
          score,
        });
      }
    });

    return rankings;
  } catch (error) {
    console.error('Error in batch ranking calculation:', error);
    return rankings;
  }
}