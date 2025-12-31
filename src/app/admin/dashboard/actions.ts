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
    .single() as { data: { role: string } | null; error: any };

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
      level_no,
      levels:level_no (
        id,
        name,
        type,
        difficulty_level
      ),
      access_requests (
        level_id,
        levels ( name )
      ),
      teacher_id,
      teachers ( full_name )
    `)
    .eq('access_requests.status', 'approved') // <-- Filter for approved levels
    .order("full_name", { ascending: true }) as { data: any[] | null; error: any };

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
    level_no: student.level_no,
    currentLevel: student.levels ? {
      id: student.levels.id,
      name: student.levels.name,
      type: student.levels.type,
      difficulty_level: student.levels.difficulty_level,
    } : null,
    // The structure for granted levels is mapped from the new query
    grantedLevels: student.access_requests?.map((req: any) => ({
      levelId: req.level_id,
      levelName: req.levels?.name,
    })) ?? [],
    teacher_id: student.teacher_id,
    teacher_name: student.teachers?.full_name,
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
 * Fetch all available levels from the database.
 * Admin-only.
 */
export async function getAllLevels() {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("levels")
    .select("id, name, type, difficulty_level")
    .order("difficulty_level", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch levels: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all teachers.
 * Admin-only.
 */
export async function getAllTeachers() {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select("id, full_name, teacher_id")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch teachers: ${error.message}`);
  }

  return data || [];
}

/**
 * Updates a student's profile including level.
 * Admin-only.
 */
export async function updateStudentByAdmin(formData: FormData) {
  await verifyAdmin();

  const studentId = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const total_score = Number(formData.get("total_score"));
  const level_no = formData.get("level_no") ? Number(formData.get("level_no")) : null;
  const rank = formData.get("rank") as string;
  const teacher_id = formData.get("teacher_id") as string;

  if (!studentId || !full_name) {
    throw new Error("Student ID and Full Name are required.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updateData: any = {
    full_name: full_name,
    total_score: total_score,
    rank,
    teacher_id: teacher_id || null, 
  };

  // Only update level_no if provided
  if (level_no !== null) {
    updateData.level_no = level_no;
  }

  const { error } = await supabaseAdmin
    .from("students")
    .update(updateData)
    .eq("id", studentId);

  if (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }

  revalidatePath("/admin/dashboard");

  return { success: true, message: `${full_name} updated successfully.` };
}

/**
 * Deletes a student and all related data.
 * Admin-only.
 */
export async function deleteStudentByAdmin(studentId: string) {
  await verifyAdmin();

  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get student name for success message
  const { data: student } = await supabaseAdmin
    .from("students")
    .select("full_name")
    .eq("id", studentId)
    .single();

  // Delete related access requests first (if any)
  await supabaseAdmin
    .from("access_requests")
    .delete()
    .eq("student_id", studentId);

  // Delete the student
  const { error } = await supabaseAdmin
    .from("students")
    .delete()
    .eq("id", studentId);

  if (error) {
    throw new Error(`Failed to delete student: ${error.message}`);
  }

  revalidatePath("/admin/dashboard");

  return { 
    success: true, 
    message: `${student?.full_name || 'Student'} deleted successfully.` 
  };
}