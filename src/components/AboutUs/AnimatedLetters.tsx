import React from "react";
import * as motion from "motion/react-client";
import { Transition } from "motion";

function AnimatedLetters() {
  // Define common animation configurations to keep the code DRY
  const bounceTransition: Transition = {
    duration: 1,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeOut",
  };

  const pulseTransition: Transition = {
    duration: 2,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut",
  };

  return (
    <div className="flex justify-center lg:justify-start">
      <div className="relative font-sans">
        {/* Letter A: Now extremely large using arbitrary value */}
        <motion.div
          // Original: text-9xl (8rem/128px). New: text-[16rem] (256px) - much bigger!
          className="text-[16rem] font-bold text-red-500 inline-block transform rotate-12"
          animate={{
            y: [0, -10, 0, -5, 0], // Keyframes for a bounce effect
          }}
          transition={bounceTransition}
        >
          A
        </motion.div>

        {/* Letter B: Increased to text-9xl */}
        <motion.div
          // Original: text-8xl. New: text-9xl
          className="text-9xl font-bold text-blue-500 inline-block transform -rotate-6"
          animate={{
            opacity: [0.5, 1, 0.5], // Keyframes for a pulse effect
          }}
          transition={pulseTransition}
        >
          B
        </motion.div>

        {/* Letter C: Increased to text-8xl */}
        <motion.div
          // Original: text-7xl. New: text-8xl
          className="text-8xl font-bold text-green-500 inline-block transform rotate-3"
          animate={{
            y: [0, -10, 0, -5, 0],
          }}
          transition={{ ...bounceTransition, delay: 0.1 }} // Add delay
        >
          C
        </motion.div>

        {/* Letter D: Increased to text-7xl */}
        <motion.div
          // Original: text-6xl. New: text-7xl
          className="absolute -bottom-4 left-8 text-9xl font-bold text-yellow-500 transform rotate-45"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ ...pulseTransition, delay: 0.2 }} // Add delay
        >
          D
        </motion.div>

        {/* Letter E: Increased to text-6xl */}
        <motion.div
          // Original: text-5xl. New: text-6xl
          className="absolute -top-4 right-8 text-[200px] font-bold text-purple-500 transform -rotate-12"
          animate={{
            y: [0, -10, 0, -5, 0],
          }}
          transition={{ ...bounceTransition, delay: 0.3 }} // Add delay
        >
          E
        </motion.div>
      </div>
    </div>
  );
}

export default AnimatedLetters;
