"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/landing/courses", label: "Courses" },
  { href: "/gallery", label: "Gallery" },
  { href: "/student/levels", label: "Students" },
  { href: "/landing/about", label: "About Us" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardLink, setDashboardLink] = useState("/student/levels");
  
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        if (user.email === "admin@10xschool.com") {
          setDashboardLink("/admin/dashboard");
        } else {
          // Check if user is a teacher
          const { data: teacher } = await supabase
            .from("teachers")
            .select("id")
            .eq("id", user.id)
            .single();
          
          if (teacher) {
            setDashboardLink("/teacher/dashboard");
          }
           // Default to /student/levels for students
        }
      }
    };

    checkUser();
  }, []);

  if (pathname === "/landing/demo") {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 px-4 md:px-6 py-3 flex items-center justify-between z-50 transition-all duration-300">
      {/* Logo */}
      <Link href={"/"} className="flex items-center gap-2 group">
        <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
          <Image
            src="/images/10x_small.png"
            alt="10x Academy Logo"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-base md:text-lg font-bold text-[#0246A4] tracking-tight">
          THE 10X SCHOOL
        </p>
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center space-x-8 lg:space-x-12">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-black text-sm lg:text-md font-semibold hover:text-[#0246A4] relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#0246A4] after:transition-all after:duration-300 hover:after:w-full ${
                pathname === link.href ? "text-[#0246A4] after:w-full" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-3 items-center">
        {user ? (
          <Link href={dashboardLink}>
            <Button
              size="default"
              variant="outline"
              className="rounded-xl cursor-pointer border-black/10 hover:border-black text-black hover:bg-gray-50 transition-all shadow-sm"
            >
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button
              size="default"
              variant="outline"
              className="rounded-xl cursor-pointer border-black/10 hover:border-black text-black hover:bg-gray-50 transition-all shadow-sm"
            >
              Login
            </Button>
          </Link>
        )}
        <Link href="/application">
          <Button
            size="default"
            className="rounded-xl cursor-pointer bg-[#d8f999] hover:bg-[#c8e885] text-black border border-transparent hover:border-black/5 shadow-sm transition-all text-sm font-semibold"
          >
            Apply Now
          </Button>
        </Link>
        <Link href="/landing/demo">
          <Button
            size="default"
            className="rounded-xl cursor-pointer bg-[#0246A4] hover:bg-[#1a5bc4] text-white shadow-md hover:shadow-lg transition-all text-sm font-bold"
          >
            Math Game
          </Button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed top-full left-0 w-full mt-2 px-2 transition-all duration-300 ease-in-out transform origin-top md:hidden ${
          isMenuOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-3xl p-6 flex flex-col items-center gap-6 border border-gray-100">
          <ul className="flex flex-col items-center gap-4 w-full">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="w-full text-center">
                <Link
                  href={link.href}
                  className={`block w-full py-2 text-lg font-semibold transition-colors ${
                    pathname === link.href ? "text-[#0246A4]" : "text-gray-800 hover:text-[#0246A4]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="w-full h-px bg-gray-100" />
          
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {user ? (
              <Link href={dashboardLink} className="w-full">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-gray-200 text-black hover:bg-gray-50 h-12 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-gray-200 text-black hover:bg-gray-50 h-12 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
            )}
            <Link href="/application" className="w-full">
              <Button
                className="w-full rounded-xl bg-[#d8f999] hover:bg-[#c8e885] text-black h-12 text-base font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Apply Now
              </Button>
            </Link>
            <Link href="/landing/demo" className="w-full">
              <Button
                className="w-full rounded-xl bg-[#0246A4] hover:bg-[#1a5bc4] text-white h-12 text-base font-bold shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Math Game
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
