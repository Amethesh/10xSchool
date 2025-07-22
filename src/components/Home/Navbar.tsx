"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

const Navbar = () => {
  const pathname = usePathname();

  if (pathname === "/game") return null;
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[1000px] max-w-6xl bg-white/90 backdrop-blur-md rounded-3xl shadow-lg px-6 py-3 flex items-center justify-between z-50 ">
      <Link href={"/"}>
        <div className="flex items-center cursor-pointer">
          <Image
            src="/images/10x_small.png"
            alt="10x Academy Logo"
            width={40}
            height={40}
          />
          <p className="text-lg font-bold text-[#0246A4] ml-4">
            THE 10X SCHOOL
          </p>
        </div>
      </Link>

      <ul className="hidden md:flex items-center space-x-12">
        <li>
          <a
            href="#classes"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Classes
          </a>
        </li>
        <li>
          <a
            href="/courses"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Courses
          </a>
        </li>
        <li>
          <a
            href="#students"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Students
          </a>
        </li>
        <li>
          <a
            href="/about"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            About Us
          </a>
        </li>
      </ul>

      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          className="rounded-lg bg-[#bfecff]  border border-black cursor-pointer"
        >
          <a href="/game">Test your mind</a>
        </Button>
        <Button
          size="lg"
          className="rounded-2xl border border-black cursor-pointer"
        >
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSenR-uZldf8c2P_KCo49LLZZWM4ewTgb7pNbPWpQ6pASG5X4A/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            Interested
          </a>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
