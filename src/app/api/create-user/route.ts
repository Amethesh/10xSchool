// app/api/create-user/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username } = await request.json();

  if (!username || typeof username !== "string" || username.trim() === "") {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient(); // This uses the service_role key
  const trimmedUsername = username.trim();

  try {
    // Check if user already exists to prevent duplicate creation attempts (or handle gracefully)
    const { data: existingProfile, error: checkError } = await supabase
      .from("demo_users")
      .select("id")
      .eq("username", trimmedUsername)
      .single();

    if (existingProfile) {
      // If user exists, return their ID. This handles race conditions or re-attempts gracefully.
      return NextResponse.json(
        {
          success: true,
          userId: existingProfile.id,
          message: "User already exists, returning existing ID.",
        },
        { status: 200 }
      );
    }

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is 'No rows found' [3]
      console.error(
        "Supabase error during pre-check for user creation:",
        checkError.message
      );
      throw new Error("Database error during user pre-check.");
    }

    // User does not exist, proceed to create
    const { data: newProfile, error: insertError } = await supabase
      .from("demo_users")
      .insert({ username: trimmedUsername }) // Create basic profile
      .select("id") // Select the ID of the newly created profile [39]
      .single(); // Expecting one new record

    if (insertError) {
      console.error(
        "Supabase error inserting new profile:",
        insertError.message
      );
      // Handle unique constraint violation specifically [10, 11, 13, 18]
      if (insertError.code === "23505") {
        // PostgreSQL unique violation error code [3]
        return NextResponse.json(
          { error: "Username already taken. Please choose another." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, userId: newProfile.id },
      { status: 201 }
    ); // 201 Created
  } catch (e: any) {
    console.error("Unhandled server error in /api/create-user:", e.message);
    return NextResponse.json(
      { error: e.message || "Internal server error." },
      { status: 500 }
    );
  }
}
