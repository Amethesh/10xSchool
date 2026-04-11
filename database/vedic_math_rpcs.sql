-- ============================================================
-- Vedic Math RPC Functions + Schema Fixes
-- Run these in the Supabase SQL editor to register the RPCs.
-- ============================================================

-- 0. Drop the FK constraint that ties quiz_answers.question_id to
--    math_questions.id only. This allows vedic_math_questions IDs
--    to be stored in the same column without a constraint violation.
--    The column remains nullable — no data is lost.
ALTER TABLE quiz_answers DROP CONSTRAINT IF EXISTS quiz_answers_question_id_fkey;

-- 1. Fetch a random set of questions from vedic_math_questions
--    by level_id and week_no. Mirrors get_random_questions for
--    the m3-genius-program course.
CREATE OR REPLACE FUNCTION get_random_vedic_questions(
  p_level_id int,
  p_week_no   int
)
RETURNS SETOF vedic_math_questions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM vedic_math_questions
  WHERE level_id = p_level_id
    AND week_no  = p_week_no
  ORDER BY random()
  LIMIT 20;
$$;

-- 2. Count questions per level/week for an array of level IDs.
--    Mirrors get_question_counts_for_levels for the vedic-math course.
CREATE OR REPLACE FUNCTION get_question_counts_for_vedic_levels(
  level_ids int[]
)
RETURNS TABLE(
  level_id       int,
  week_no        int,
  question_count int
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.level_id::int,
    v.week_no::int,
    COUNT(*)::int AS question_count
  FROM vedic_math_questions v
  WHERE v.level_id = ANY(level_ids)
  GROUP BY v.level_id, v.week_no;
$$;
