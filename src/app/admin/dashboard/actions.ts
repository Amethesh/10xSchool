// /app/admin/dashboard/actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required: You must be logged in.");
  }

  const { data: profile, error } = await supabase
    .from("profiles") // Assuming admins also have a profile
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new Error("Authorization failed: You are not an admin.");
  }

  return user; 
}

/**
 * Fetches all student records. Only callable by an admin.
 */
export async function getAllStudentsData() {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("id, fullName, student_id, email, totalScore, level, rank")
    .order("fullName", { ascending: true });

  console.log(data);

  if (error) {
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  return data;
}

/**
 * Updates a student's profile. Only callable by an admin.
 */
export async function updateStudentByAdmin(formData: FormData) {
  await verifyAdmin(); // Security check

  const studentId = formData.get("id") as string;
  const fullName = formData.get("fullName") as string;
  const totalScore = Number(formData.get("totalScore"));
  const level = Number(formData.get("level"));
  const rank = formData.get("rank") as string;

  if (!studentId || !fullName) {
    throw new Error("Student ID and Full Name are required.");
  }

  // Use the admin client to bypass RLS for administrative tasks.
  // This is safe because we've already verified the user's role.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("students")
    .update({
      fullName,
      totalScore,
      level,
      rank,
    })
    .eq("id", studentId);

  if (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }

  // Revalidate the path to ensure the list on the dashboard refreshes
  revalidatePath("/admin/dashboard");

  return { success: true, message: `${fullName} updated successfully.` };
}
