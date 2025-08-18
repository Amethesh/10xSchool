// app/student/play/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";

// getQuizForLevel function remains the same...
export async function getQuizForLevel(level: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to play.");

  // 1) Find all set_numbers for this level
  const { data: sets, error: setsError } = await supabase
    .from("questions")
    .select("set_number")
    .eq("level", level)
    .not("set_number", "is", null);

  if (setsError) throw setsError;
  if (!sets || sets.length === 0) {
    throw new Error(`No question sets found for level: ${level}`);
  }

  const setNumbers = [
    ...new Set(sets.map((s: any) => Number(s.set_number)).filter(Boolean)),
  ];
  const chosenSet = setNumbers[Math.floor(Math.random() * setNumbers.length)];

  // 2) Fetch questions for that set & level
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("*")
    .eq("level", level)
    .eq("set_number", chosenSet)
    .order("id", { ascending: true });

  if (qError) throw qError;

  // 3) Fetch basic profile (so client has username)
  const { data: profile, error: pError } = await supabase
    .from("students")
    .select("fullName, totalScore, level, rank")
    .eq("id", user.id)
    .single();

  if (pError) {
    return {
      set_number: chosenSet,
      questions,
      profile: {
        fullName: user.email ?? "Player",
        totalScore: 0,
        level: 1,
        rank: "NOOB",
      },
    };
  }

  return { set_number: chosenSet, questions, profile };
}

// MODIFIED ACTION: Now also fetches and returns the leaderboard
export async function recordGameResult({
  levelName,
  setNumber,
  score,
  isCompleted,
}: {
  levelName: string;
  setNumber: number;
  score: number;
  isCompleted: boolean;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // 1. Fetch student profile and the level's ID
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("level, totalScore, fullName")
    .eq("id", user.id)
    .single();

  if (studentError || !student) {
    throw new Error("Could not find student profile.");
  }

  // Find level ID for level up logic
  const { data: levelData } = await supabase
    .from("levels")
    .select("id")
    .eq("name", levelName)
    .single();
  const levelId = levelData?.id;

  // 2. Insert the attempt into `quiz_results`.
  const { error: resultError } = await supabase.from("quiz_results").insert({
    user_id: user.id,
    username: student.fullName ?? user.email,
    level: levelName,
    set_number: setNumber,
    score: score,
    completed: isCompleted,
  });

  if (resultError) {
    console.error("Error saving quiz result:", resultError.message);
  }

  // 3. Update student's total score and, if completed, their level
  const newTotalScore = (student.totalScore || 0) + score;
  let newLevel = student.level;
  let levelUp = false;

  if (isCompleted && levelId && levelId >= student.level) {
    newLevel = student.level + 1;
    levelUp = true;
  }

  const { data: updatedStudent, error: updateError } = await supabase
    .from("students")
    .update({ totalScore: newTotalScore, level: newLevel })
    .eq("id", user.id)
    .select("level, totalScore")
    .single();

  if (updateError) {
    throw new Error(
      `Failed to update student progress: ${updateError.message}`
    );
  }

  // 4. NEW: Fetch the top 10 leaderboard for this specific level and set
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from("quiz_results")
    .select("username, score")
    .eq("level", levelName)
    .eq("set_number", setNumber)
    .order("score", { ascending: false })
    .limit(10);

  if (leaderboardError) {
    console.error("Error fetching leaderboard:", leaderboardError.message);
  }

  return {
    status: "success",
    levelUp,
    finalScore: score,
    newLevel: updatedStudent.level,
    newTotalScore: updatedStudent.totalScore,
    leaderboard: leaderboard ?? [], // Return leaderboard data or an empty array
  };
}
