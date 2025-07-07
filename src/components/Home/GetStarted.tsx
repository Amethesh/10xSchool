"use client";
import React, { useState } from "react";
import { motion } from "motion/react";

const GetStarted = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="mt-20w-screen bg-[#ff7cb5] h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-[#fff07c] rounded-full opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-20"
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-12 h-12 bg-[#fff07c] rounded-full opacity-30"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10"
      >
        <motion.p
          className="text-2xl font-semibold mb-8 text-black"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Ready to Unlock Your Child&apos;s 10X Potential?
        </motion.p>

        <motion.button
          className="border-2 font-semibold border-black bg-[#fff07c] text-6xl mt-4 px-28 py-18 transition-all duration-300 cursor-pointer relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
          whileTap={{
            scale: 0.95,
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Button background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#fff07c] to-[#ffed4a]"
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "0%" : "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Button text */}
          <motion.span
            className="relative z-10"
            animate={{
              color: isHovered ? "#000" : "#000",
            }}
            transition={{ duration: 0.3 }}
          >
            Book a Demo
          </motion.span>

          {/* Floating particles on hover */}
          {isHovered && (
            <>
              <motion.div
                className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -20 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-2 right-4 w-2 h-2 bg-white rounded-full"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: 20 }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </motion.button>

        {/* Animated arrow pointing to button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="text-black text-2xl"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ↓
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pulsing ring animation around the section */}
      <motion.div
        className="absolute inset-0 border-4 border-white rounded-full opacity-20"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
};

export default GetStarted;
