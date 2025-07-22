// app/api/questions/route.ts
import { NextResponse } from "next/server";

import { Question } from "@/types/types"; // Adjust path based on your project structure
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const setNumber = parseInt(searchParams.get("set") || "1", 10);

  if (isNaN(setNumber) || setNumber < 1) {
    return NextResponse.json(
      { error: "Invalid set number provided." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .eq("set_number", setNumber)
      .order("id", { ascending: true }) // Order for consistency
      .limit(20); // Get the first 20 questions for the set

    if (error) {
      console.error("Supabase error fetching questions:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch questions." },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: `No questions found for set ${setNumber}.` },
        { status: 404 }
      );
    }

    // Explicitly type the returned data to match your Question interface
    const typedQuestions: any = questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points,
      set_number: q.set_number,
    }));

    return NextResponse.json(typedQuestions, { status: 200 });
  } catch (e: any) {
    console.error("Unhandled server error in /api/questions:", e.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
