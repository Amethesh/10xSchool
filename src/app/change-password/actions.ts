"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 1. Modify the function to accept the 'course' parameter
export async function updateUserPassword(password: string, course: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to change your password." };
  }

  // Add a quick validation for the course
  if (!course) {
    return { error: "A course must be selected." };
  }

  // Update the password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: `Could not update password: ${updateError.message}` };
  }

  // 2. CRITICAL: Update the flag AND the new 'course' column in the database
  const { error: profileError } = await supabase
    .from("students")
    .update({
      password_change_required: false,
      course: course, // <-- Add the course here
    })
    .eq("id", user.id);

  if (profileError) {
    // This is a rare but serious state. The user's password is changed,
    // but they might be stuck in the redirect loop.
    console.error(
      "CRITICAL: Failed to update password_change_required flag and course:",
      profileError
    );
    return {
      error: "Could not finalize profile update. Please contact support.",
    };
  }

  // Redirect to the dashboard, the process is complete.
  redirect("/student/levels");
}
