import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TestPageClient from "./TestPageClient";

export default async function TestPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("students")
    .select("id, full_name, total_score, email, student_id")
    .eq("id", user.id)
    .single();

  return (
    <TestPageClient
      profile={
        profile ?? {
          id: user.id,
          full_name: user.email?.split("@")[0] ?? "Student",
          total_score: 0,
          email: user.email ?? "",
          student_id: null,
        }
      }
    />
  );
}
