-- Optimized database functions for quiz ranking and leaderboard calculations
-- These functions should be run in Supabase SQL editor to create the RPC functions

-- Function to calculate student ranking optimized with window functions
CREATE OR REPLACE FUNCTION calculate_student_ranking_optimized(
  p_student_id UUID,
  p_level TEXT,
  p_week_no INTEGER,
  p_difficulty TEXT
)
RETURNS TABLE (
  rank BIGINT,
  total_students BIGINT,
  score DECIMAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH student_best_scores AS (
    -- Get best score for each student
    SELECT 
      student_id,
      MAX(score) as best_score,
      MAX(completed_at) as latest_completion
    FROM quiz_attempts 
    WHERE 
      level = p_level 
      AND week_no = p_week_no 
      AND difficulty = p_difficulty 
      AND completed_at IS NOT NULL
    GROUP BY student_id
  ),
  ranked_students AS (
    -- Rank students by their best scores
    SELECT 
      student_id,
      best_score,
      ROW_NUMBER() OVER (ORDER BY best_score DESC, latest_completion ASC) as student_rank,
      COUNT(*) OVER () as total_count
    FROM student_best_scores
  )
  SELECT 
    rs.student_rank::BIGINT as rank,
    rs.total_count::BIGINT as total_students,
    rs.best_score as score
  FROM ranked_students rs
  WHERE rs.student_id = p_student_id;
END;
$$;

-- Function to get optimized leaderboard
CREATE OR REPLACE FUNCTION get_quiz_leaderboard_optimized(
  p_level TEXT,
  p_week_no INTEGER,
  p_difficulty TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  studentId UUID,
  studentName TEXT,
  score DECIMAL,
  rank BIGINT,
  completedAt TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH student_best_attempts AS (
    -- Get best attempt for each student with student info
    SELECT DISTINCT ON (qa.student_id)
      qa.student_id,
      qa.score,
      qa.completed_at,
      s.fullName as student_name
    FROM quiz_attempts qa
    INNER JOIN students s ON qa.student_id = s.id
    WHERE 
      qa.level = p_level 
      AND qa.week_no = p_week_no 
      AND qa.difficulty = p_difficulty 
      AND qa.completed_at IS NOT NULL
    ORDER BY qa.student_id, qa.score DESC, qa.completed_at ASC
  ),
  ranked_leaderboard AS (
    -- Rank the best attempts
    SELECT 
      sba.student_id,
      sba.student_name,
      sba.score,
      sba.completed_at,
      ROW_NUMBER() OVER (ORDER BY sba.score DESC, sba.completed_at ASC) as rank
    FROM student_best_attempts sba
  )
  SELECT 
    rl.student_id as studentId,
    rl.student_name as studentName,
    rl.score,
    rl.rank,
    rl.completed_at as completedAt
  FROM ranked_leaderboard rl
  ORDER BY rl.rank
  LIMIT p_limit;
END;
$$;

-- Function to get student performance summary
CREATE OR REPLACE FUNCTION get_student_performance_summary(
  p_student_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  level TEXT,
  week_no INTEGER,
  difficulty TEXT,
  best_score DECIMAL,
  attempt_count BIGINT,
  latest_attempt TIMESTAMPTZ,
  rank BIGINT,
  total_students BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH student_quiz_summary AS (
    -- Summarize student's performance per quiz
    SELECT 
      qa.level,
      qa.week_no,
      qa.difficulty,
      MAX(qa.score) as best_score,
      COUNT(*) as attempt_count,
      MAX(qa.completed_at) as latest_attempt
    FROM quiz_attempts qa
    WHERE 
      qa.student_id = p_student_id 
      AND qa.completed_at IS NOT NULL
    GROUP BY qa.level, qa.week_no, qa.difficulty
  ),
  quiz_rankings AS (
    -- Calculate rankings for each quiz the student participated in
    SELECT 
      sqs.level,
      sqs.week_no,
      sqs.difficulty,
      sqs.best_score,
      sqs.attempt_count,
      sqs.latest_attempt,
      (
        SELECT COUNT(*) + 1
        FROM (
          SELECT student_id, MAX(score) as max_score
          FROM quiz_attempts qa2
          WHERE 
            qa2.level = sqs.level 
            AND qa2.week_no = sqs.week_no 
            AND qa2.difficulty = sqs.difficulty 
            AND qa2.completed_at IS NOT NULL
          GROUP BY student_id
          HAVING MAX(score) > sqs.best_score
        ) better_students
      ) as rank,
      (
        SELECT COUNT(DISTINCT student_id)
        FROM quiz_attempts qa3
        WHERE 
          qa3.level = sqs.level 
          AND qa3.week_no = sqs.week_no 
          AND qa3.difficulty = sqs.difficulty 
          AND qa3.completed_at IS NOT NULL
      ) as total_students
    FROM student_quiz_summary sqs
  )
  SELECT 
    qr.level,
    qr.week_no,
    qr.difficulty,
    qr.best_score,
    qr.attempt_count,
    qr.latest_attempt,
    qr.rank,
    qr.total_students
  FROM quiz_rankings qr
  ORDER BY qr.latest_attempt DESC
  LIMIT p_limit;
END;
$$;

-- Index optimizations for better query performance
-- These indexes should improve the performance of ranking and leaderboard queries

-- Composite index for quiz attempts filtering and sorting
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_performance 
ON quiz_attempts (level, week_no, difficulty, completed_at, score DESC, student_id);

-- Index for student-specific queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_performance 
ON quiz_attempts (student_id, completed_at DESC, score DESC);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_leaderboard 
ON quiz_attempts (level, week_no, difficulty, score DESC, completed_at ASC) 
WHERE completed_at IS NOT NULL;

-- Partial index for completed attempts only
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed 
ON quiz_attempts (level, week_no, difficulty, student_id, score) 
WHERE completed_at IS NOT NULL;