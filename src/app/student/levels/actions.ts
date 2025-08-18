// FILE: ./actions.ts (or wherever your function is located)

"use server";
import { createClient } from "@/lib/supabase/server";

export async function getStudentLevelsData() {
  const supabase = await createClient();

  // 1️⃣ Get User and Profile (No changes here)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error("You must be logged in to view this page.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("students")
    .select("id, full_name, total_score, email, student_id")
    .eq("id", user.id)
    .single();
  if (profileError) throw profileError;

  // 2️⃣ Get all levels (No changes here)
  const { data: levelsData, error: levelsError } = await supabase
    .from("levels")
    .select("id, name, type, difficulty_level")
    .order("difficulty_level", { ascending: true });
  if (levelsError) throw levelsError;

  // 3️⃣ Get student's access requests (No changes here)
  const { data: accessRequests, error: accessError } = await supabase
    .from("access_requests")
    .select("level_id, status")
    .eq("student_id", user.id);
  if (accessError) throw accessError;

  // 4️⃣ Compute approved & pending level IDs (No changes here)
  const beginnerLevelIds = levelsData
    .filter(l => l.difficulty_level === 1)
    .map(l => l.id);
  const approvedLevelIds = new Set([
    ...accessRequests.filter(a => a.status === "approved").map(a => a.level_id),
    ...beginnerLevelIds
  ]);
  const pendingLevelIds = new Set(
    accessRequests.filter(a => a.status === "pending").map(a => a.level_id)
  );

  const { data: questionCounts, error: questionCountError } = await supabase
    .rpc('get_question_counts_for_levels', {
      level_ids: Array.from(approvedLevelIds).filter((id): id is number => id !== null)
    });
  if (questionCountError) throw questionCountError;

  const questionGroups = new Map<string, { count: number }>();
  questionCounts.forEach(item => {
    const key = `${item.level_id}-${item.week_no}`;
    questionGroups.set(key, { count: item.question_count });
  });

  // 6️⃣ Get quiz attempts (No changes here, this is already efficient)
  const { data: attempts, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select("level_id, week_no, score, correct_answers, total_questions, completed_at")
    .eq("student_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });
  if (attemptError) throw attemptError;

  // 8️⃣ Best attempt per level+week (No changes here)
  const bestAttempts = new Map<string, typeof attempts[0]>();
  attempts.forEach(a => {
    const key = `${a.level_id}-${a.week_no}`;
    const existing = bestAttempts.get(key);
    if (!existing || a.score > existing.score) {
      bestAttempts.set(key, a);
    }
  });

  // 9️⃣ Build final level data (No changes here, logic remains the same)
  const levels = levelsData.map(level => {
    const isApproved = approvedLevelIds.has(level.id);
    const isPending = pendingLevelIds.has(level.id);

    const weeks = isApproved
      ? Array.from(questionGroups.entries())
        .filter(([key]) => key.startsWith(level.id.toString() + "-"))
        .map(([key, qGroup]) => {
          const [, week_no] = key.split("-");
          const attempt = bestAttempts.get(key);
          return {
            week_no: parseInt(week_no),
            question_count: qGroup.count,
            attempt: attempt
              ? {
                score: attempt.score,
                correct_answers: attempt.correct_answers,
                total_questions: attempt.total_questions,
                completed_at: attempt.completed_at,
              }
              : null,
          };
        })
      : [];

    return {
      id: level.id,
      name: level.name,
      type: level.type,
      difficulty_level: level.difficulty_level,
      approved: isApproved,
      pending: isPending,
      weeks,
    };
  });

  console.log("PROFILE", profile)
  console.log("LEVELS", JSON.stringify(levels, null, 2))

  return { profile, levels };
}