// app/api/submit-game-result/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, finalScore, playedSetNumber, userId } =
    await request.json();
  console.log("Received submission:", {
    username,
    userId,
    finalScore,
    playedSetNumber,
  });

  if (
    !userId ||
    !username ||
    typeof finalScore !== "number" ||
    typeof playedSetNumber !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid input data: userId, username, finalScore, and playedSetNumber are required.",
      },
      { status: 400 }
    );
  }

  // Ensure this createClient uses a key with sufficient permissions
  // (e.g., service_role key or an authenticated user with appropriate RLS)
  const supabase = await createClient();

  try {
    // Call the PostgreSQL function to atomically update score and record game
    const { data: newTotalScore, error } = await supabase.rpc(
      "update_user_score_and_record_game",
      {
        p_user_id: userId,
        p_username: username,
        p_final_score: finalScore,
        p_set_number: playedSetNumber,
      }
    );

    if (error) {
      console.error(
        "Supabase error calling update_user_score_and_record_game:",
        error.message
      );
      // More specific error messages could be added if the function returns different error codes
      return NextResponse.json(
        { error: "Failed to process game result." },
        { status: 500 }
      );
    }

    // The function returns the new total score, which is assigned to 'newTotalScore'
    return NextResponse.json({ success: true, newTotalScore }, { status: 200 });
  } catch (e: any) {
    console.error(
      "Unhandled server error in /api/submit-game-result:",
      e.message
    );
    return NextResponse.json(
      { error: e.message || "Internal server error." },
      { status: 500 }
    );
  }
}
