// /app/admin/dashboard/actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Helper function to verify if the current user is an admin
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required: You must be logged in.");
  }

  // UPDATED: Now queries the `admins` table instead of `profiles`
  const { data: adminProfile, error } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  // The logic remains the same, just the table name changed
  if (error || adminProfile?.role !== "admin") {
    throw new Error("Authorization failed: You do not have admin privileges.");
  }

  return user;
}

/**
 * Fetch all students with their approved levels from access_requests.
 */
export async function getAllStudentsData() {
  await verifyAdmin();
  const supabase = await createClient();

  // MAJOR UPDATE:
  // - The query now joins with `access_requests` instead of `level_access`.
  // - It explicitly filters for requests where status is 'approved'.
  // - It selects columns using their exact snake_case names from your schema.
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      student_id,
      email,
      total_score,
      rank,
      level,
      access_requests (
        level_id,
        levels ( name )
      )
    `)
    .eq('access_requests.status', 'approved') // <-- Filter for approved levels
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  // Flatten the nested data to make it easier for the UI to consume
  return (data || []).map((student) => ({
    id: student.id,
    full_name: student.full_name,
    student_id: student.student_id,
    email: student.email,
    total_score: student.total_score,
    rank: student.rank,
    level: student.level,
    // The structure for granted levels is mapped from the new query
    grantedLevels: student.access_requests?.map((req) => ({
      levelId: req.level_id,
      levelName: req.levels?.name,
    })) ?? [],
  }));
}

/**
 * Get the count of pending access requests.
 * Admin-only.
 */
export async function getPendingRequestsCount() {
  await verifyAdmin();
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("access_requests")
    .select("*", { count: 'exact', head: true })
    .eq("status", "pending");

  if (error) {
    throw new Error(`Failed to fetch pending requests count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Updates a student's profile (not their level access).
 * Admin-only.
 */
export async function updateStudentByAdmin(formData: FormData) {
  await verifyAdmin();

  const studentId = formData.get("id") as string;
  const full_name = formData.get("full_name") as string; // Match form data name
  const total_score = Number(formData.get("total_score")); // Match form data name
  const rank = formData.get("rank") as string;

  if (!studentId || !full_name) {
    throw new Error("Student ID and Full Name are required.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // UPDATED: Use snake_case column names to match the database schema
  const { error } = await supabaseAdmin
    .from("students")
    .update({
      full_name: full_name,
      total_score: total_score,
      rank,
    })
    .eq("id", studentId);

  if (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }

  revalidatePath("/admin/dashboard");

  return { success: true, message: `${full_name} updated successfully.` };
}