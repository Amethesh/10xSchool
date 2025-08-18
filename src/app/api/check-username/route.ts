// app/api/check-username/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || typeof username !== "string" || username.trim() === "") {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient(); // This uses the service_role key

  try {
    const { data: profile, error } = await supabase
      .from("students")
      .select("id, totalScore")
      .eq("student_id", username.trim())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is 'No rows found' [3]
      console.error("Supabase error checking username:", error.message);
      return NextResponse.json(
        { error: "Database error checking username." },
        { status: 500 }
      );
    }

    if (profile) {
      return NextResponse.json(
        { exists: true, userId: profile.id, totalScore: profile.totalScore },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (e: any) {
    console.error("Unhandled server error in /api/check-username:", e.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
