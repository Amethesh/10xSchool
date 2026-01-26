"use client";

import React, { useState } from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Maximize2, X, Play } from "lucide-react";

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
    id: "migali",
    name: "Migali Muthukannan",
    role: "7 Years, Level 4",
    desc: "Fastest Finger",
    tag: "Level 4",
    tagColor: "bg-[#bfecff]", // Light Blue
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/WhatsApp%20Video%202026-01-22%20at%206.22.27%20AM.mp4",
  },
  {
    id: "daksh",
    name: "Daksh H Gujjar",
    role: "9 Years, Level 6",
    desc: "Master in Mental Arithmetic",
    tag: "Level 6",
    tagColor: "bg-[#ffd6cc]", // Light Peach
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Daksh-Age10%20Cmprsd.mp4",
  },
  {
    id: "lena",
    name: "Lena Park",
    role: "6 Years, Level 3",
    desc: "Young Genius",
    tag: "Level 3",
    tagColor: "bg-[#D3EF95]", // Light Green
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Lena%20Park%20Cmprsd.mp4",
  },
  {
    id: "yazhini",
    name: "Yazhini",
    role: "8 Years, Level 6",
    desc: "Master in Mental Arithmetic",
    tag: "Level 6",
    tagColor: "bg-[#bfecff]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/Yazhini-Age-8.mp4",
  },
  {
    id: "harshan",
    name: "Harshan Saravanan",
    role: "8 Years, Level 4",
    desc: "Master in Precision",
    tag: "Level 4",
    tagColor: "bg-[#ffd6cc]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/31134de7-f2cd-4003-bb82-ad73bd93abd9.jpg",
  },
  {
    id: "poorniksha",
    name: "Poorniksha",
    role: "11 Years, Level 6",
    desc: "Rapid Finisher",
    tag: "Level 6",
    tagColor: "bg-[#D3EF95]",
    img: "https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/gallary/testimonal/933bebf3-572d-4838-b535-8126fb741a57.jpg",
  },
];

export default function VideoTestimonials() {
  const [activeId, setActiveId] = useState<string>("migali");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

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
     {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 px-4 md:px-12">
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
      </div>*/}

      {/* --- Cards Container --- */}
      <div className="flex flex-col md:flex-row h-[800px] w-full gap-4 overflow-hidden px-2 py-2">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            data={teacher}
            isActive={activeId === teacher.id}
            onHover={() => setActiveId(teacher.id)}
            onExpand={() => setSelectedTeacher(teacher)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTeacher(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {selectedTeacher.img.toLowerCase().endsWith(".mp4") ? (
                <video
                  src={selectedTeacher.img}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedTeacher.img}
                  alt={selectedTeacher.name}
                  className="w-full h-full object-contain"
                />
              )}
              
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <h3 className="text-2xl font-bold text-white">{selectedTeacher.name}</h3>
                <p className="text-gray-300">{selectedTeacher.role}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface CardProps {
  data: Teacher;
  isActive: boolean;
  onHover: () => void;
  onExpand: () => void;
}

function Card({ data, isActive, onHover, onExpand }: CardProps) {
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

      {/* Expand/Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 hover:scale-110 hover:bg-white/30 border border-white/30",
          isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {data.img.toLowerCase().endsWith(".mp4") ? (
            <Play size={32} fill="currentColor" className="ml-1" />
        ) : (
            <Maximize2 size={32} />
        )}
      </button>

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