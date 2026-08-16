"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Returns the current student's course, or null if they have not picked one.
 * Used by the change-password page to decide whether to ask for a course:
 * a student sent here by an admin password reset already has one, and must
 * not be made to re-pick it.
 */
export async function getCurrentStudentCourse() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("course")
    .eq("id", user.id)
    .single();

  return student?.course ?? null;
}

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

  // A course is only required during first-time setup. Students arriving here
  // from an admin password reset already have one and are not asked again.
  const { data: existing } = await supabase
    .from("students")
    .select("course")
    .eq("id", user.id)
    .single();

  const hasExistingCourse = Boolean(existing?.course);

  if (!hasExistingCourse && !course) {
    return { error: "A course must be selected." };
  }

  // Update the password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: `Could not update password: ${updateError.message}` };
  }

  // 2. CRITICAL: Clear the flag. The course is only written on first-time
  // setup — overwriting it on a reset would wipe the student's course.
  const profileUpdate: { password_change_required: boolean; course?: string } =
    {
      password_change_required: false,
    };

  if (!hasExistingCourse) {
    profileUpdate.course = course;
  }

  const { error: profileError } = await supabase
    .from("students")
    .update(profileUpdate)
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
