// src/components/profile/LevelProfile.tsx
"use client";
import React, { useState } from "react";
import { motion, Variants } from "motion/react";
import {
  Crown,
  LogOut,
  Trophy,
  Star,
  Copy,
  Check,
  ChartColumnDecreasing,
  Home,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";

type Profile = {
  full_name: string;
  email: string;
  total_score: number;
  student_id: string;
};

type LevelProfileProps = {
  profile: Profile;
  overallProgress: number;
  page: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const LevelProfile: React.FC<LevelProfileProps> = ({
  profile,
  overallProgress,
  page,
}) => {
  const [copied, setCopied] = useState(false);

  const copyStudentId = async () => {
    try {
      await navigator.clipboard.writeText(profile.student_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = profile.student_id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate star rating (0-5 stars based on score)
  const getStarRating = (score: number) => {
    const maxScore = 1000; // Adjust this based on your scoring system
    return Math.min(5, Math.floor((score / maxScore) * 5));
  };

  const starCount = getStarRating(profile.total_score);
  const stars = Array.from({ length: 5 }, (_, i) => i < starCount);

  return (
    <motion.div
      className="pixel-panel p-4 mb-6 backdrop-blur-sm bg-black/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Avatar Section */}
        <motion.div className="relative flex-shrink-0" variants={itemVariants}>
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <img
            className="relative w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full p-1 object-cover"
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile.full_name}`}
            alt="Avatar"
          />
          <motion.div
            className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 0.2,
            }}
          >
            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.div>
        </motion.div>

        {/* Profile Info & Stats (Takes up the middle space) */}
        <motion.div
          className="flex-1 min-w-0 space-y-2"
          variants={itemVariants}
        >
          {/* Name */}
          <h1 className="pixel-font text-sm sm:text-lg text-white truncate">
            {profile.full_name.charAt(0).toUpperCase() +
              profile.full_name.slice(1)}
          </h1>

          {/* Student ID with Copy */}
          <div className="flex items-center gap-1">
            <span className="pixel-font text-[10px] sm:text-xs text-cyan-300/60">
              ID:
            </span>
            <span className="pixel-font text-[10px] sm:text-xs text-white font-mono">
              {profile.student_id}
            </span>
            <button
              onClick={copyStudentId}
              className="ml-1 p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              <motion.div
                animate={{ scale: copied ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-cyan-300/80 hover:text-cyan-300" />
                )}
              </motion.div>
            </button>
          </div>

          {/* Score with Trophy and Stars */}
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="pixel-font text-xs sm:text-sm text-yellow-400 font-bold">
                {profile.total_score.toLocaleString()}
              </span>
            </motion.div>

            {/* Star Rating */}
            <div className="flex items-center gap-0.5">
              {stars.map((filled, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <Star
                    className={`w-3 h-3 ${
                      filled
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-500/50"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="pixel-font text-[9px] sm:text-xs text-cyan-300/80">
                PROGRESS
              </span>
              <span className="pixel-font text-[10px] sm:text-sm text-white font-bold">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-cyan-900/40 rounded-full h-2 sm:h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300/40 via-teal-300/60 to-cyan-300/80"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div variants={itemVariants} className="flex-shrink-0">
          {page === "levels" ? (
            <a
              href="/student/dashboard"
              className="sm:inline pixel-font text-xs"
            >
              <button className="pixel-button pixel-button-purple !p-2 sm:!px-4 sm:!py-2 mb-4 w-full">
                <ChartColumnDecreasing className="w-3 h-3 sm:w-4 sm:h-4 sm:hidden" />
                <span className="hidden sm:inline pixel-font text-xs">
                  Dashboard
                </span>
              </button>
            </a>
          ) : page === "dashboard" ? (
            <a
              href="/student/levels"
              className="sm:inline pixel-font text-xs"
            >
              <button className="pixel-button pixel-button-purple !p-2 sm:!px-4 sm:!py-2 mb-4 w-full">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 sm:hidden" />
                <span className="hidden sm:inline pixel-font text-xs">
                  Home
                </span>
              </button>
            </a>
          ) : null}
          <form action={logout}>
            <button className="pixel-button pixel-button-secondary !p-2 sm:!px-4 sm:!py-2 w-full">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:hidden" />
              <span className="hidden sm:inline pixel-font text-xs">
                Log Out
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LevelProfile;
