import Image from "next/image";
import React from "react";
import { HoverButton } from "../ui/HoverButton";

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[900px] max-w-6xl bg-white/90 backdrop-blur-md rounded-3xl shadow-lg px-6 py-3 flex items-center justify-between z-50 ">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/images/10x_small.jpg"
          alt="10x Academy Logo"
          width={40}
          height={40}
        />
        <p className="text-lg font-bold text-[#0246A4] ml-4">THE 10X SCHOOL</p>
      </div>

      <ul className="hidden md:flex items-center space-x-12">
        {["Classes", "Courses", "Students", "About Us"].map((item) => (
          <li key={item}>
            <a
              href={`#${item.replace(/\s+/g, "").toLowerCase()}`}
              className="text-black text-md font-semibold hover:text-primary"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        {/* <Button
          size="lg"
          className="rounded-2xl border border-black cursor-pointer"
        ></Button> */}
        <HoverButton>Enroll Now</HoverButton>
      </div>
    </nav>
  );
};

export default Navbar;
