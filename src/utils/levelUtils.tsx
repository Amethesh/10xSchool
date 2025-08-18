import clsx from "clsx";
import { Crown, Trophy, Zap, Target, BookOpen, Star } from "lucide-react"; // Assuming you use lucide-react for icons
import * as motion from "motion/react-client";
import { JSX } from "react";

export const getDifficultyLabel = (difficulty: number): string => {
    if (difficulty <= 2) return "BEGINNER";
    if (difficulty <= 4) return "EASY";
    if (difficulty <= 6) return "MEDIUM";
    if (difficulty <= 8) return "HARD";
    return "EXPERT";
  };
export const getColorForDifficulty = (difficulty: number): string => {
    const colors = [
      "text-emerald-400 border-emerald-400 bg-emerald-400/10",   // Difficulty 1
      "text-cyan-400 border-cyan-400 bg-cyan-400/10",           // Difficulty 2
      "text-blue-400 border-blue-400 bg-blue-400/10",           // Difficulty 3
      "text-purple-400 border-purple-400 bg-purple-400/10",     // Difficulty 4
      "text-orange-400 border-orange-400 bg-orange-400/10",     // Difficulty 5
      "text-yellow-400 border-yellow-400 bg-yellow-400/10",     // Difficulty 6
      "text-pink-400 border-pink-400 bg-pink-400/10",           // Difficulty 7
      "text-red-400 border-red-400 bg-red-400/10",              // Difficulty 8
      "text-indigo-400 border-indigo-400 bg-indigo-400/10",     // Difficulty 9+
    ];
    const index = Math.max(0, difficulty - 1);
    return colors[Math.min(index, colors.length - 1)];
  };

export const getIconForDifficulty = (difficulty: number): JSX.Element => {
    if (difficulty <= 2) return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (difficulty <= 4) return <Target className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (difficulty <= 6) return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (difficulty <= 8) return <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <Crown className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  // Helper function to render stars with better animation
export const renderStars = (stars = 0) =>
  Array.from({ length: 3 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: i < stars ? 1 : 1, 
        rotate: 0 
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15,
        delay: i * 0.1,
      }}
    >
      <Star
        className={clsx("w-6 h-6 transition-colors duration-300", {
          "text-yellow-400 fill-yellow-400": i < stars,
          "text-gray-200": i >= stars,
        })}
      />
    </motion.div>
));