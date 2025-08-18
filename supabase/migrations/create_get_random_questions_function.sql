-- Create RPC function to get randomized questions by level and week
CREATE OR REPLACE FUNCTION get_random_questions(
  p_level_id INTEGER,
  p_week_no INTEGER
)
RETURNS TABLE (
  id INTEGER,
  level_id INTEGER,
  week_no INTEGER,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  points INTEGER,
  difficulty_level INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mq.id,
    mq.level_id,
    mq.week_no,
    mq.question_text,
    mq.option_a,
    mq.option_b,
    mq.option_c,
    mq.option_d,
    mq.correct_answer,
    mq.points,
    mq.difficulty_level,
    mq.created_at,
    mq.updated_at
  FROM math_questions mq
  WHERE mq.level_id = p_level_id 
    AND mq.week_no = p_week_no
  ORDER BY RANDOM();
END;
$$;