"use client";

import Image from "next/image";
import React from "react";
import Abacus from "./Abacus";
import * as motion from "motion/react-client";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="mt-25 overflow-x-hidden mx-auto ">
      {/* Header Banner - Responsive Text Size */}
      <div className="w-full h-auto py-4 md:h-[70px] bg-gradient-to-r from-[#bfecff] to-[#a8e6ff] flex items-center justify-center text-center text-lg md:text-[24px] font-semibold text-black border-2 border-black px-4">
        Welcome to The 10X School - Empowering Minds, Transforming Futures
      </div>

      {/* Main Content */}
      <div className="bg-white border-b-2 border-black">
        {/* Responsive Flex Container */}
        <div className="flex flex-col md:flex-row border-black overflow-hidden max-w-7xl mx-auto">
          {/* Left Content Panel - Responsive Width and Padding */}
          <div className="w-full md:w-[60%] px-6 md:px-12 py-10 flex flex-col justify-center relative text-center md:text-left">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-[#bfecff] via-transparent to-[#D3EF95]"></div>

            <div className="relative z-10">
              {/* Responsive Heading */}
              <h2 className="text-3xl md:text-[37px] font-bold text-black leading-tight mb-6">
                Unlock Your Child's Superpower
                <br />
                <span className="text-[#2563eb]">
                  in Math, Memory, Money, Logical & Lateral thinking.
                </span>
              </h2>

              {/* Responsive Paragraph */}
              <p className="text-base md:text-[16px] text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                Discover our various programs offered for kids that make your
                child smarter, sharper, and more confident while dealing with
                money.
              </p>

              {/* Enhanced Features List - Centered on Mobile */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
                <span className="bg-[#D3EF95] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                  🧠 Brain Development
                </span>
                <span className="bg-[#bfecff] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                  📚 Academic Tutoring
                </span>
                <span className="bg-[#ffd6cc] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                  🏠 Learn from Home
                </span>
              </div>
              <div className="flex justify-center md:justify-start">
                <Link href={"/landing/courses"}>
                  <motion.button
                    className="bg-gradient-to-r from-[#bfecff] to-[#a8e6ff] text-black w-fit px-8 py-3 font-semibold text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] cursor-pointer rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{
                      background:
                        "linear-gradient(45deg, rgba(173, 243, 21, 1), rgba(200, 255, 50, 1))",
                      transform: "translate(-2px, -2px)",
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.8)",
                    }}
                    whileTap={{
                      background: "rgba(255, 255, 255, 1)",
                      transform: "translate(2px, 2px)",
                      boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.8)",
                    }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    Explore Our Programs →
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Content Panel - Responsive Width and Alignment */}
          <div className="w-full md:w-[40%] bg-gradient-to-br from-[#D3EF95]/30 to-[#bfecff]/30 flex items-center justify-center p-8 md:p-0">
            {/* Abacus hidden on small screens for cleaner look */}
            <div className="hidden md:block h-full">
              <Abacus />
            </div>

            {/* Image container with better styling */}
            <div className="w-full max-w-[300px] md:max-w-none md:w-full aspect-square border-4 border-black rounded-full shadow-lg overflow-hidden bg-white relative">
              <div className="absolute inset-2 rounded-full overflow-hidden">
                <Image
                  src="/images/child_pic.png"
                  alt="Child playing with a tablet"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
