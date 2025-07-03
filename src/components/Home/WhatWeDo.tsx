/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const WhatWeDoSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const courses = [
    {
      id: 1,
      title: "5-in-1 Brain Development Program (Ages 5-15)",
      description:
        "A holistic program to improve mental speed, memory, logic, and math skills.",
      color: "rgb(173, 243, 21)",
      icon: "🧠",
    },
    {
      id: 2,
      title: "Vedic Maths Course for Kids (Ages 10-15)",
      description:
        "Learn to solve math problems faster and smarter using ancient Indian techniques.",
      color: "rgb(191, 236, 255)",
      icon: "📚",
    },
    {
      id: 3,
      title: "Phonics Program (Ages 4-8)",
      description:
        "Build early reading fluency and pronunciation skills through fun and interactive learning.",
      color: "#9b59b6",
      icon: "📖",
    },
    {
      id: 4,
      title: "Creative Writing Workshop (Ages 8-15)",
      description:
        "Develop storytelling skills and unleash creativity through guided writing exercises.",
      color: "#f39c12",
      icon: "✍️",
    },
    {
      id: 5,
      title: "Critical Thinking Program (Ages 6-12)",
      description:
        "Enhance problem-solving abilities and logical reasoning through engaging activities.",
      color: "#e91e63",
      icon: "🤔",
    },
  ];

  // Create refs for each course card
  const courseRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section ref={containerRef} className="relative">
      {/* Header */}
      <motion.div
        className="w-full flex justify-center z-10 pb-4"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-2xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
          whileHover={{
            scale: 1.05,
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.8)",
          }}
        >
          What We Do ?
        </motion.p>
      </motion.div>

      <div className="flex">
        {/* Left Side - Sticky Content */}
        <div className="w-1/2 sticky top-0 h-[600px] flex items-center justify-center bg-black">
          <motion.div
            className="text-center text-white p-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* 10X Text */}
            <motion.div
              className="relative mb-8"
              animate={{
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="text-8xl font-bold opacity-20 text-gray-400 absolute -top-4 -left-4">
                10X
              </div>
              <div className="text-8xl font-bold relative z-10">10X</div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Powerful Programs, One Mission:{" "}
              <span style={{ color: "rgb(173, 243, 21)" }}>10X Growth</span>
            </motion.h1>

            {/* Animated Progress Ring */}
            <motion.div
              className="flex justify-center mt-8"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(173, 243, 21, 0.3)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgb(173, 243, 21)"
                  strokeWidth="3"
                  strokeDasharray="251"
                  strokeDashoffset="0"
                  style={{
                    strokeDashoffset: useTransform(
                      scrollYProgress,
                      [0, 1],
                      [251, 0]
                    ),
                  }}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Scrolling Course Cards */}
        <div className="w-1/2 relative">
          {courses.map((course, index) => {
            // Use the ref from the array
            if (!courseRefs.current[index]) {
              courseRefs.current[index] = null;
            }
            // Wrap the DOM node in a ref object for useScroll
            const targetRef = courseRefs.current[index]
              ? { current: courseRefs.current[index] }
              : undefined;
            const { scrollYProgress: courseProgress } = useScroll({
              target: targetRef,
              offset: ["start end", "end start"],
            });

            const y = useTransform(courseProgress, [0, 1], [100, -100]);
            const opacity = useTransform(
              courseProgress,
              [0, 0.2, 0.8, 1],
              [0, 1, 1, 0]
            );
            const scale = useTransform(
              courseProgress,
              [0, 0.2, 0.8, 1],
              [0.8, 1, 1, 0.8]
            );

            return (
              <motion.div
                key={course.id}
                ref={(el) => {
                  courseRefs.current[index] = el;
                }}
                className="h-sceen flex items-center justify-center sticky top-0"
                style={{
                  y,
                  opacity,
                  scale,
                }}
              >
                <motion.div
                  className="w-full h-full p-6 border-2 border-black"
                  style={{
                    backgroundColor: course.color,
                    zIndex: courses.length - index,
                  }}
                  // whileHover={{
                  //   transform: "translate(-4px, -4px)",
                  //   boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.8)",
                  // }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Course Number */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xl font-bold text-black">
                      {course.id}.
                    </span>
                    <motion.div
                      className="text-4xl"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      {course.icon}
                    </motion.div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-black mb-3">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-black/80 text-sm leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Book Icon */}
                  <div className="flex justify-end">
                    <motion.div
                      className="bg-white/20 rounded-lg p-2 border border-black/20"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255,255,255,0.3)",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* More Details Button */}
          <motion.div
            className="h-screen flex items-center justify-center sticky top-0 bg-black"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="px-12 py-4 text-2xl font-bold text-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] cursor-pointer rounded-lg"
              whileHover={{
                backgroundColor: "rgb(173, 243, 21)",
                color: "black",
                transform: "translate(-2px, -2px)",
                boxShadow: "6px 6px 0px 0px rgba(255,255,255,0.8)",
              }}
              whileTap={{
                transform: "translate(2px, 2px)",
                boxShadow: "2px 2px 0px 0px rgba(255,255,255,0.8)",
              }}
              transition={{ duration: 0.3 }}
            >
              More Details
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
