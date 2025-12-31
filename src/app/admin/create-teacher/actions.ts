"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function createTeacherAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a teacher." };
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
    // Generate Teacher ID
    const { data: teacher_id, error: rpcError } = await supabaseAdmin.rpc(
      "generate_new_teacher_id"
    );
    if (rpcError) throw rpcError;

    const loginEmail = `${teacher_id}@10xschool.com`;

    // Create the user in Supabase Auth
    const {
      data: { user: newUser },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'teacher' } // Optional, but good practice
    });
    if (authError) throw authError;

    // Insert into public.teachers
    const { error: insertError } = await supabaseAdmin.from("teachers").insert({
      id: newUser?.id,
      teacher_id: teacher_id,
      email: contactEmail,
      full_name: full_name,
    });
    if (insertError) throw insertError;

    console.log("Inserted teacher record:", { teacher_id, full_name });

    revalidatePath("/admin/teachers"); 

    return { success: true, teacher_id: teacher_id };
  } catch (error: any) {
    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      return { error: `An account for this teacher might already exist.` };
    }
    return { error: `An error occurred: ${error?.message}` };
  }
}
