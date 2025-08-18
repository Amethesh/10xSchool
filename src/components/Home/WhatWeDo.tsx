"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
// import Abacus2 from "./Abacus2";
import AbacusHorizontal from "./Abacus2";

const courses = [
  {
    id: 1,
    title: "M³ Genius Program",
    description:
      "A holistic program to improve mental speed, memory, logic and managing money.",
    bgColor: "bg-lime-200",
    icon: "🧠",
  },
  {
    id: 2,
    title: "Vedic Maths Course for Kids (Ages 10-15)",
    description:
      "Learn to solve math problems faster and smarter using ancient Indian techniques.",
    bgColor: "bg-sky-300",
    icon: "📚",
  },
  {
    id: 3,
    title: "Phonics Program (Ages 4-8)",
    description:
      "Build early reading fluency and pronunciation skills through fun and interactive learning.",
    bgColor: "bg-purple-300",
    icon: "📖",
  },
];

type Course = {
  id: number;
  title: string;
  description: string;
  bgColor: string;
  icon: string;
};

type CourseCardProps = {
  course: Course;
  index: number;
};

function CourseCard({ course, index }: CourseCardProps) {
  const ref = useRef(null);

  return (
    <div ref={ref} className="relative h-screen">
      <motion.div
        className={`sticky top-[20vh] rounded-3xl p-10 m-5 min-h-[300px] shadow-lg hover:shadow-xl transition-shadow duration-300 ${course.bgColor} flex flex-col justify-center group`}
        style={{
          zIndex: courses.length - index,
        }}
        whileHover={{
          scale: 1.03,
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-start gap-5">
          <motion.span
            className="text-[3rem] mb-2 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 5 }}
          >
            {course.icon}
          </motion.span>
          <div>
            <motion.h3
              className="text-xl font-bold text-gray-800 mb-4 group-hover:text-gray-700 transition-colors duration-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {index + 1}. {course.title}
            </motion.h3>
            <motion.p
              className="text-base leading-relaxed text-gray-600 group-hover:text-gray-500 transition-colors duration-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {course.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PowerfulProgramsSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Header */}
      <motion.div
        className="flex justify-center items-center mt-2 mb-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-2xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          WHAT DO WE DO?
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Side */}
        <motion.div className="sticky top-0 h-screen">
          <div className="relative bg-black w-full h-[calc(100vh-200px)] flex flex-col justify-center items-center">
            <motion.p
              className="absolute text-[22rem] font-bold mb-10 select-none"
              style={{
                WebkitTextStroke: "2px #D3EF95",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                scale: textScale,
              }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              10X
            </motion.p>

            <motion.h2
              className="text-white text-6xl font-bold text-center z-2 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Powerful Programs,
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                One Mission: 10X Growth
              </motion.span>
            </motion.h2>
          </div>
          <div>
            <AbacusHorizontal />
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="relative">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}

          {/* More Details Button */}
          <motion.div
            className="h-[200px] bg-black flex justify-center items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              className="text-white text-2xl font-bold border-2 border-white bg-transparent px-10 py-5 cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 20px rgba(255,255,255,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/courses">More Details</a>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
