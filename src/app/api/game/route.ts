// app/api/game/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level, set_number, score, total_questions, completed } = body;

    if (typeof score !== "number" || typeof level !== "string") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const supabase = await createClient();

    // get user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "not authenticated" }, { status: 401 });
    }

    // map level name (text) to levels.id (level_id)
    let levelId: number | null = null;
    const { data: levelRow } = await supabase
      .from("levels")
      .select("id,name")
      .eq("name", level)
      .limit(1)
      .maybeSingle();

    if (levelRow && (levelRow as any).id) levelId = (levelRow as any).id;

    // insert game_completions record
    const { error: insErr } = await supabase.from("game_completions").insert({
      user_id: user.id,
      username: user.user_metadata?.fullName ?? user.email ?? null,
      score,
      question_set_played: set_number ?? null,
      level_id: levelId,
    });

    if (insErr) {
      console.error("insert game_completions error:", insErr);
      // continue; we still try to update progress below
    }

    // update students.level if completed
    if (completed) {
      // fetch current student record
      const { data: student } = await supabase
        .from("students")
        .select("level")
        .eq("id", user.id)
        .maybeSingle();

      const currentLevel = student?.level ?? 1;
      const newLevel = currentLevel + 1;

      const { error: updErr } = await supabase
        .from("students")
        .update({ level: newLevel })
        .eq("id", user.id);

      if (updErr) {
        console.error("failed update student level:", updErr);
      }
    }

    // TODO: Implement student_level_progress tracking when table is created
    // upsert student_level_progress: keep highest score, set completed true if ever completed
    if (levelId) {
      // const { data: existing } = await supabase
      //   .from("student_level_progress")
      //   .select("id,score,completed")
      //   .eq("student_id", user.id)
      //   .eq("level_id", levelId)
      //   .maybeSingle();

      // if (existing) {
      //   const bestScore = Math.max(Number(existing.score ?? 0), Number(score));
      //   const completedFlag = existing.completed || !!completed;
      //   const { error: upErr } = await supabase
      //     .from("student_level_progress")
      //     .update({
      //       score: bestScore,
      //       completed: completedFlag,
      //       updated_at: new Date().toISOString(),
      //     })
      //     .eq("id", existing.id);

      //   if (upErr) console.error("failed update student_level_progress", upErr);
      // } else {
      //   const { error: insProgErr } = await supabase
      //     .from("student_level_progress")
      //     .insert({
      //       student_id: user.id,
      //       level_id: levelId,
      //       score,
      //       completed: !!completed,
      //       created_at: new Date().toISOString(),
      //     });

      //   if (insProgErr)
      //     console.error("failed insert student_level_progress", insProgErr);
      // }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("api/game/submit error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
