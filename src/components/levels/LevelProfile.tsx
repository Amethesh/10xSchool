// src/components/profile/LevelProfile.tsx

"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Crown, LogOut } from "lucide-react";

// --- Type Definitions for Props ---
type Profile = {
  full_name: string;
};

type LevelProfileProps = {
  profile: Profile;
  overallProgress: number;
  logout: () => Promise<void>;
};

// --- Framer Motion Variants ---
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

// --- The Main Component ---
const LevelProfile: React.FC<LevelProfileProps> = ({ profile, overallProgress, logout }) => {
  return (
    <motion.div
      className="pixel-panel p-4 mb-6 backdrop-blur-sm bg-black/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* NEW: A single flex row for a more compact layout on all screen sizes */}
      <div className="flex items-center gap-4">
        
        {/* Avatar Section (Slightly smaller for compactness) */}
        <motion.div className="relative flex-shrink-0" variants={itemVariants}>
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <img
            className="relative w-14 h-14 sm:w-16 sm:h-16 bg-black rounded-full p-1 object-cover"
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile.full_name}`}
            alt="Avatar"
          />
          <motion.div 
            className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          >
            <Crown className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Profile Info & Progress (Takes up the middle space) */}
        <motion.div className="flex-1 min-w-0" variants={itemVariants}>
          <h1 className="pixel-font text-base sm:text-lg text-white truncate mb-2">
            {profile.full_name.charAt(0).toUpperCase() + profile.full_name.slice(1)}
          </h1>

          {/* NEW: Consistent Progress Bar Styling */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="pixel-font text-[10px] sm:text-xs text-cyan-300/80">PROGRESS</span>
                <span className="pixel-font text-xs sm:text-sm text-white font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full bg-cyan-900/40 rounded-full h-2.5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300/40 via-teal-300/60 to-cyan-300/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
            </div>
          </div>
        </motion.div>

        {/* Logout Button (Takes up remaining space) */}
        <motion.div variants={itemVariants}>
          <form action={logout}>
            {/* Swapped to an icon-only button on small screens for more space */}
            <button className="pixel-button pixel-button-secondary !p-3 sm:!px-4 sm:!py-2">
              <LogOut className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </form>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default LevelProfile;