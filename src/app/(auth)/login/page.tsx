import { LoginForm } from "@/components/ui/8bit/blocks/login-form";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <main className="">
      <Image
        src={"/images/8bitBG7.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      <div className="w-screen h-screen flex items-center justify-center">
      <LoginForm className="max-w-xl" />
      </div>
    </main>
  );
};

export default page;
