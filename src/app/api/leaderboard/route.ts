// app/api/leaderboard/route.ts
import { createClient } from "@/lib/supabase/server";
import { LeaderboardEntry } from "@/types/types"; // Make sure this type matches the function's return
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabaseClient = await createClient();
  const { searchParams } = new URL(request.url);
  const setNumber = parseInt(searchParams.get("set") || "1", 10);

  if (isNaN(setNumber) || setNumber < 1) {
    return NextResponse.json(
      { error: "Invalid set number provided." },
      { status: 400 }
    );
  }

  try {
    // Call the PostgreSQL function
    const { data, error } = await supabaseClient.rpc("get_leaderboard_by_set", {
      p_set_number: setNumber, // Pass the set number as a parameter to the function
    });

    if (error) {
      console.error(
        "Supabase error fetching leaderboard via RPC:",
        error.message
      );
      return NextResponse.json(
        { error: "Failed to fetch leaderboard." },
        { status: 500 }
      );
    }

    // The data returned by the RPC call will already be in the desired format
    // because of the RETURNS TABLE clause in the SQL function.
    // It will be an array of objects like { username: "...", high_score: ... }
    const leaderboard: LeaderboardEntry[] = (data || []).map((entry: any) => ({
      username: entry.username,
      score: entry.high_score, // The function returns 'high_score'
    }));

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (e: any) {
    console.error("Unhandled server error in /api/leaderboard:", e.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
