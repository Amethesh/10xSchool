// app/api/check-username/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username || typeof username !== "string" || username.trim() === "") {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    // Ensure environment variables are available
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("demo_users")
      .select("id, total_score")
      .eq("username", username.trim())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is 'No rows found'
      console.error("Supabase error checking username:", error);
      return NextResponse.json(
        { error: "Database error checking username." },
        { status: 500 }
      );
    }

    if (profile) {
      return NextResponse.json(
        { exists: true, userId: profile.id, total_score: profile.total_score },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (e: any) {
    console.error("Unhandled server error in /api/check-username:", e);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
