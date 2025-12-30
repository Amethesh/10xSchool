"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: teacher, error } = await supabase
    .from("teachers")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  if (error || !teacher) {
    throw new Error("Unauthorized: Teacher access required");
  }

  return teacher;
}

export async function getTeacherStudents() {
  const teacher = await verifyTeacher();
  const supabase = await createClient();

  // Similar query to admin but filtered by teacher_id
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
      )
    `)
    .eq("teacher_id", teacher.id)
    .eq('access_requests.status', 'approved')
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  return (data || []).map((student: any) => ({
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
    grantedLevels: student.access_requests?.map((req: any) => ({
      levelId: req.level_id,
      levelName: req.levels?.name,
    })) ?? [],
  }));
}

export async function updateStudentByTeacher(formData: FormData) {
  const teacher = await verifyTeacher();
  const supabase = await createClient();

  const studentId = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const total_score = Number(formData.get("total_score"));
  const level_no = formData.get("level_no") ? Number(formData.get("level_no")) : null;
  const rank = formData.get("rank") as string;

  if (!studentId) {
    throw new Error("Student ID is required");
  }

  // Verify student belongs to teacher
  const { data: studentCheck } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("teacher_id", teacher.id)
    .single();
    
  if (!studentCheck) {
      throw new Error("Unauthorized: You can only edit your assigned students.");
  }

  const updateData: any = {
    full_name,
    total_score,
    rank,
  };

  if (level_no !== null) {
      updateData.level_no = level_no;
  }

  const { error } = await supabase
    .from("students")
    .update(updateData)
    .eq("id", studentId);
    
  if (error) {
      throw new Error(`Failed to update student: ${error.message}`);
  }
  
  revalidatePath("/teacher/dashboard");
  return { success: true, message: "Student updated successfully" };
}

export async function getAllLevelsForTeacher() {
    // Reuse admin logic or just simple fetch
    const supabase = await createClient();
    const { data } = await supabase.from("levels").select("*").order("difficulty_level");
    return data || [];
}
