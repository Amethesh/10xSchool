"use client"
import { useState, useRef, useEffect, JSX } from "react";
import { Lock, Clock, Crown, Trophy, Zap, Target, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {motion, useMotionValue, useTransform, AnimatePresence} from "motion/react"
import { formatLevelName, getDifficultyLabel, getIconForDifficulty } from "@/utils/levelUtils";
import { LevelData, WeekLesson } from "@/types/types";

interface HorizontalLevelSelectorProps {
  levels: LevelData[];
  selectedLevelName: string;
  setSelectedLevelName: (levelName: string) => void;
}

export const HorizontalLevelSelector = ({ levels, selectedLevelName, setSelectedLevelName }: HorizontalLevelSelectorProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion value to track the drag position
  const x = useMotionValue(0);

  // Calculate drag constraints and scroll button visibility
  useEffect(() => {
    if (carouselRef.current) {
      const carouselWidth = carouselRef.current.offsetWidth;
      const trackWidth = carouselRef.current.scrollWidth;
      const constraint = Math.max(0, trackWidth - carouselWidth);
      setDragConstraint(constraint);
      setCanScrollRight(constraint > 0);
    }
  }, [levels]);

  // Update scroll button states based on current position
  const updateScrollButtons = (currentX: number) => {
    setCanScrollLeft(currentX < 0);
    setCanScrollRight(Math.abs(currentX) < dragConstraint);
  };

  // Smooth scroll functions for desktop arrows
  const scrollLeft = () => {
    const newX = Math.min(x.get() + 300, 0);
    x.set(newX);
    updateScrollButtons(newX);
  };

  const scrollRight = () => {
    const newX = Math.max(x.get() - 300, -dragConstraint);
    x.set(newX);
    updateScrollButtons(newX);
  };

  // Handle drag events
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => {
    setIsDragging(false);
    updateScrollButtons(x.get());
  };

  return (
    <div className="relative group mb-4">
      {/* Left Arrow - Desktop only */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-full p-3 text-cyan-400 transition-all duration-200 shadow-lg hidden md:flex items-center justify-center active:scale-95"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right Arrow - Desktop only */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-full p-3 text-cyan-400 transition-all duration-200 shadow-lg hidden md:flex items-center justify-center active:scale-95"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main carousel container */}
      <motion.div
        ref={carouselRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing py-2 px-4 md:px-16"
      >
        {/* Draggable track */}
        <motion.div
          className="flex gap-4"
          drag="x"
          dragConstraints={{
            right: 0,
            left: -dragConstraint,
          }}
          dragElastic={0.1}
          style={{ x }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        >
          {levels.map((level: LevelData, index: number) => {
            const completedCount = level.weeks.filter((w: WeekLesson) => w.attempt && w.attempt.score > 0).length;
            const totalCount = level.weeks.length;
            const levelProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isSelected = selectedLevelName === level.name;
            const isLocked = !level.approved;
            const isCompleted = levelProgress === 100;

            return (
              <motion.div
                key={level.name}
                className="flex-shrink-0 w-74"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.08, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <motion.button
                  onClick={() => !isDragging && setSelectedLevelName(level.name)}
                  className="w-full h-full text-left"
                  whileTap={isLocked ? undefined : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {/* Main card - matching WeekGrid styling */}
                  <div className={`
                    relative rounded-lg border-2 p-4 overflow-hidden backdrop-blur-sm transition-all duration-200 cursor-pointer
                    ${isSelected && !isLocked 
                      ? "bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-orange-500/15 border-yellow-400/70 shadow-lg shadow-yellow-400/20" 
                      : isCompleted && !isLocked
                      ? "bg-gradient-to-br from-green-500/15 via-emerald-500/8 to-teal-500/12 border-green-400/70"
                      : !isLocked
                      ? "bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/8 border-cyan-400/60 active:scale-95"
                      : "bg-gradient-to-br from-gray-800/15 via-gray-700/8 to-gray-600/12 border-gray-600/40 opacity-60"
                    }
                  `}>
                    
                    {/* Background Pattern - matching WeekGrid */}
                    <div className="absolute inset-0 opacity-20">
                      <div 
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage: `radial-gradient(circle at 20% 30%, ${
                            isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(79, 195, 247, 0.1)'
                          } 0%, transparent 50%),
                                           radial-gradient(circle at 80% 70%, ${
                            isCompleted ? 'rgba(129, 199, 132, 0.1)' : 'rgba(168, 85, 247, 0.1)'
                          } 0%, transparent 50%)`
                        }}
                      />
                    </div>

                    {/* Selected Glow Effect */}
                    {isSelected && !isLocked && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            "0 0 0 rgba(245, 158, 11, 0)",
                            "0 0 20px rgba(245, 158, 11, 0.3)",
                            "0 0 30px rgba(245, 158, 11, 0.15)",
                            "0 0 0 rgba(245, 158, 11, 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      />
                    )}

                    {/* Header Section */}
                    <div className="relative z-10 flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg transition-all duration-300
                          ${isSelected && !isLocked 
                            ? 'bg-gradient-to-br from-yellow-400/25 to-amber-500/15 text-yellow-300' 
                            : isCompleted && !isLocked
                            ? 'bg-gradient-to-br from-green-400/25 to-emerald-500/15 text-green-300'
                            : !isLocked
                            ? 'bg-gradient-to-br from-cyan-400/25 to-blue-500/15 text-cyan-300'
                            : 'bg-gradient-to-br from-gray-600/25 to-gray-700/15 text-gray-400'
                          }
                        `}>
                          {isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : isCompleted ? (
                            <Trophy className="w-4 h-4" />
                          ) : (
                            getIconForDifficulty(level.difficulty_level)
                          )}
                        </div>
                        <div>
                          <div className={`
                            pixel-font text-sm font-bold tracking-wide transition-colors duration-300
                            ${isSelected && !isLocked ? 'text-yellow-300' : 'text-white'}
                          `}>
                            {formatLevelName(level.name)}
                          </div>
                          <div className={`
                            pixel-font text-xs mt-0.5 transition-colors duration-300
                            ${isSelected && !isLocked 
                              ? 'text-yellow-400/70' 
                              : isLocked 
                              ? 'text-gray-500/70' 
                              : 'text-cyan-300/70'
                            }
                          `}>
                            {getDifficultyLabel(level.difficulty_level).toLowerCase()}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isSelected && !isLocked && (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded-full border border-yellow-400/30"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="pixel-font text-[8px] text-yellow-400 font-bold">ACTIVE</span>
                        </motion.div>
                      )}
                      
                      {level.pending && (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 bg-amber-400/20 rounded-full border border-amber-400/30"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="pixel-font text-[8px] text-amber-400 font-bold">PENDING</span>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="relative z-10 flex-grow flex flex-col justify-center space-y-3">
                      {isLocked ? (
                        <div className="flex flex-col items-center justify-center">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <Lock className="w-6 h-6 text-gray-500 mb-2" />
                          </motion.div>
                          <span className="pixel-font text-sm text-gray-500 font-bold tracking-wide">LOCKED</span>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex justify-between items-center mb-3 py-2">
                            <span className={`
                              pixel-font text-xs transition-colors duration-300
                              ${isSelected ? 'text-yellow-300' : 'text-white'}
                            `}>
                              {completedCount}/{totalCount} WEEKS
                            </span>
                            <span className={`
                              pixel-font text-sm font-bold transition-colors duration-300
                              ${isSelected ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-cyan-400'}
                            `}>
                              {levelProgress}%
                            </span>
                          </div>
                          
                          {/* Progress Bar - matching WeekGrid style */}
                          <div className="relative h-2.5 bg-gray-800/40 rounded-full overflow-hidden">
                            <motion.div
                              className={`
                                h-full rounded-full transition-colors duration-300
                                ${isSelected 
                                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400' 
                                  : isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400'
                                  : 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400'
                                }
                              `}
                              initial={{ width: 0 }}
                              animate={{ width: `${levelProgress}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60" />
                          </div>

                          {/* Completion Badge */}
                          {isCompleted && (
                            <motion.div
                              className="flex items-center justify-center gap-1 mt-2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8, type: "spring" }}
                            >
                              <Trophy className="w-3 h-3 text-green-400" />
                              <span className="pixel-font text-xs text-green-400 font-bold">COMPLETED</span>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Corner Accent - matching WeekGrid */}
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                      <div className={`
                        absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-20
                        ${isSelected && !isLocked 
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                          : isCompleted && !isLocked
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : !isLocked
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                          : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }
                      `} />
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicators for mobile */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex gap-1">
          {[...Array(Math.ceil(levels.length / 2))].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              animate={{
                backgroundColor: Math.abs(x.get()) > i * 300 ? "#06b6d4" : "#4b5563"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};