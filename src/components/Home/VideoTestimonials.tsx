"use client";

import React, { useState } from "react";
import * as motion from "motion/react-client";
import { cn } from "@/lib/utils";

// --- Types ---
interface Teacher {
  id: string;
  name: string;
  role: string;
  desc: string;
  tag: string;
  tagColor: string;
  img: string;
}

interface Stat {
  value: string;
  label: string;
}

// --- Data Configuration ---
const stats: Stat[] = [
  { value: "50+", label: "IITians Team" },
  { value: "1%", label: "Selection Rate" },
  { value: "10+", label: "Years Teaching" },
  { value: "98%", label: "Good Rate" },
];

const teachers: Teacher[] = [
  {
    id: "abhisek",
    name: "Abhisek Sir",
    role: "6 Years of Teaching",
    desc: "Produced Top Ranks in JEE",
    tag: "IIT.D",
    tagColor: "bg-[#bfecff]", // Light Blue
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/WhatsApp%20Video%202026-01-22%20at%206.22.27%20AM.mp4",
  },
  {
    id: "vikas",
    name: "Vikas Sir",
    role: "5+ Years of Teaching",
    desc: "4 Times Star Teacher",
    tag: "NIT.S",
    tagColor: "bg-[#ffd6cc]", // Light Peach
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Daksh-Age10%20Cmprsd.mp4",
  },
  {
    id: "subham",
    name: "Subham Sir",
    role: "9 Years of Teaching",
    desc: "Oda Star Teacher",
    tag: "NIT.R",
    tagColor: "bg-[#D3EF95]", // Light Green
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Lena%20Park%20Cmprsd.mp4",
  },
  {
    id: "mansha",
    name: "Mansha Ma'am",
    role: "5 Years of Teaching",
    desc: "98% Good Rate",
    tag: "NIT.S",
    tagColor: "bg-[#bfecff]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Yazhini-Age-8.mp4",
  },
  {
    id: "shivani",
    name: "Shivani",
    role: "6 Years of Teaching",
    desc: "7 Times Star Teacher",
    tag: "BIT",
    tagColor: "bg-[#ffd6cc]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/933bebf3-572d-4838-b535-8126fb741a57.jpg",
  },
  {
    id: "s",
    name: "Shivani",
    role: "6 Years of Teaching",
    desc: "7 Times Star Teacher",
    tag: "BIT",
    tagColor: "bg-[#ffd6cc]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/97d730f8-85ec-4752-b24f-c8fa4e36a560.jpg",
  },
];

export default function VideoTestimonials() {
  const [activeId, setActiveId] = useState<string>("subham");

  return (
    <section className="w-full max-w-[80vw] mx-auto px-4 py-12 font-sans">
      <motion.div
        className="flex justify-center items-center mt-2 mb-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-4xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 cursor-pointer"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          Video Testimonials
        </motion.p>
      </motion.div>
      {/* --- Top Stats Section --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 px-4 md:px-12">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] rounded-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-black">
              {stat.value}
            </h3>
            <p className="text-slate-600 font-medium text-sm md:text-base mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* --- Cards Container --- */}
      <div className="flex flex-col md:flex-row h-[800px] w-full gap-4 overflow-hidden px-2 py-2">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            data={teacher}
            isActive={activeId === teacher.id}
            onHover={() => setActiveId(teacher.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface CardProps {
  data: Teacher;
  isActive: boolean;
  onHover: () => void;
}

function Card({ data, isActive, onHover }: CardProps) {
  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onClick={onHover} // Handle click for mobile/touch
      className={cn(
        "relative h-full rounded-2xl overflow-hidden cursor-pointer border-2 border-black transition-all duration-300 ease-in-out",
        // Flex basis determines the width. Expanded = more space.
        isActive ? "flex-[3] md:flex-[3] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]" : "flex-[1] md:flex-[1] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] filter grayscale-[50%] hover:grayscale-0"
      )}
      // Smooth animation configuration
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Background Media */}
      {data.img.toLowerCase().endsWith(".mp4") ? (
        <video
          src={data.img}
          className="absolute inset-0 w-full h-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={data.img}
          alt={data.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}

      {/* Dark Gradient Overlay (for text readability) */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300",
          isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
        )}
      />

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-center text-center">
        
        {/* Text Content (Name/Role) - Only visible when active */}
        <div className="overflow-hidden mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isActive ? 1 : 0, 
              y: isActive ? 0 : 20,
              height: isActive ? "auto" : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-md">
              {data.name}
            </h2>
            <p className="text-gray-200 text-sm md:text-base font-medium">
              {data.role}
            </p>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              {data.desc}
            </p>
          </motion.div>
        </div>

        {/* Tag (Always visible) */}
        <div
          className={cn(
            "px-4 py-1.5 rounded-full text-black font-bold text-sm tracking-wide border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]",
            data.tagColor
          )}
        >
          {data.tag}
        </div>
      </div>
    </motion.div>
  );
}