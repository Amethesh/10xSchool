import PixelLoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {

  const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (user) {
      redirect("/student/levels");
    }

  return (
    <main className="">
      <Image
        src={"/images/8bitBG7.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      <div className="w-screen h-screen flex items-center justify-center">
      <PixelLoginForm />
      </div>
    </main>
  );
};

export default page;
