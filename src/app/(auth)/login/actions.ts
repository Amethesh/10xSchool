"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(studentId: string, password: string) {
  const supabase = await createClient();

  if (!studentId || !password) {
    return { error: "PLEASE FILL ALL FIELDS" };
  }

  // 1. Format the Student ID into the email format you used during creation.
  //    This is the key step. It avoids querying the 'students' table.
  const loginEmail = `${studentId.trim().toUpperCase()}@10xschool.com`;

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  // 3. Handle the result.
  if (error) {
    console.error("Supabase Login Error:", error.message);
    // This message is now accurate, as it's a direct auth failure.
    return { error: "INVALID STUDENT ID OR PASSWORD" };
  }

  // Check if the logged in user is admin
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Login failed" };
  }

  if (user.email === "admin@10xschool.com") {
    redirect("/admin/dashboard");
  }

  // Check if the logged in user is a teacher
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("id", user.id)
    .single();

  if (teacher) {
    redirect("/teacher/dashboard");
  }
  // 4. On success, redirect.
  redirect("/student/levels");
}
