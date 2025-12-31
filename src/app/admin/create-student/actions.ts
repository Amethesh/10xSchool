"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function createStudentAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a student." };
  }

  const isAdmin = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null; error: any };

  if (isAdmin.error || isAdmin.data?.role !== "admin") {
    return { error: "Unauthorized: You are not an admin." };
  }

  const full_name = formData.get("full_name") as string;
  const password = formData.get("password") as string;
  const contactEmail = formData.get("email") as string;

  if (!full_name || !password || !contactEmail) {
    return { error: "Full name, password, and email are required." };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: student_id, error: rpcError } = await supabaseAdmin.rpc(
      "generate_new_student_id"
    );
    if (rpcError) throw rpcError;

    const loginEmail = `${student_id}@10xschool.com`;

    // 2. Create the user in Supabase Auth using the generated loginEmail.
    const {
      data: { user: newUser },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: password,
      email_confirm: true,
    });
    if (authError) throw authError;

    const { error: insertError } = await supabaseAdmin.from("students").insert({
      id: newUser?.id,
      student_id: student_id,
      email: contactEmail,
      full_name: full_name,
      password_change_required: true,
    });
    if (insertError) throw insertError;

    console.log("Inserted student record:", { student_id, full_name });

    revalidatePath("/admin/students");

    return { success: true, student_id: student_id };
  } catch (error: any) {
    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      return { error: `An account for this student might already exist.` };
    }
    return { error: `An error occurred: ${error?.message}` };
  }
}
