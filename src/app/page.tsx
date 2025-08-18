import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function page() {
  const supabase = await createClient();
  const { data, error  } = await supabase.auth.getUser();
  if (error || data?.user) {
    redirect("/student/levels");
  } else {
    redirect("/hero");
  }
}
