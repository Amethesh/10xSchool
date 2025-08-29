"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  if (currentPath === "/landing/demo") {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-3xl shadow-lg px-6 py-3 flex items-center justify-between z-50 md:w-[1000px]">
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

      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-black focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center space-x-12">
        <li>
          <a
            href="/landing/courses"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Courses
          </a>
        </li>
        <li>
          <a
            href="/student/levels"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Students
          </a>
        </li>
        <li>
          <a
            href="/landing/about"
            className="text-black text-md font-semibold hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            About Us
          </a>
        </li>
      </ul>

      <div className="hidden md:flex gap-3 items-center">
        <a href="/login">
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-black text-black hover:bg-gray-50"
          >
            Login
          </Button>
        </a>
        <a href="/application">
          <Button
            size="lg"
            className="rounded-2xl bg-[#d8f999] hover:bg-[#c8e885] text-black border border-black"
          >
            Apply Now
          </Button>
        </a>
        <a href="/landing/demo">
          <Button
            size="lg"
            className="rounded-2xl bg-[#0246A4] hover:bg-[#1a5bc4] text-white border border-[#0246A4]"
          >
            Try Demo
          </Button>
        </a>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/90 backdrop-blur-md shadow-lg rounded-b-3xl py-4">
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <a
                href="/landing/courses"
                className="text-black text-md font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </a>
            </li>
            <li>
              <a
                href="/student/levels"
                className="text-black text-md font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Students
              </a>
            </li>
            <li>
              <a
                href="/landing/about"
                className="text-black text-md font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </a>
            </li>
          </ul>
          <div className="flex flex-col gap-3 items-center mt-4 w-full px-4">
            <a href="/login" className="w-full max-w-xs">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-2xl border-black text-black hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Button>
            </a>
            <a href="/application" className="w-full max-w-xs">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-[#d8f999] hover:bg-[#c8e885] text-black border border-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Apply Now
              </Button>
            </a>
            <a href="/landing/demo" className="w-full max-w-xs">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-[#0246A4] hover:bg-[#1a5bc4] text-white border border-[#0246A4]"
                onClick={() => setIsMenuOpen(false)}
              >
                Try Demo
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
