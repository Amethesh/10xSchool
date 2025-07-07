"use client";
import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, motionValue, MotionValue } from "motion/react"; // Note: motion/react is an older import, framer-motion is current

// --- Constants ---
const NUM_BEADS = 6;
const BEAD_DIAMETER = 30; // w-10 and h-10
const BEAD_MARGIN_X = 8; // mx-2
const EFFECTIVE_BEAD_WIDTH = BEAD_DIAMETER + BEAD_MARGIN_X;

// --- Bead Component (Unchanged) ---
interface BeadProps {
  x: MotionValue<number>;
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>;
}

const Bead = ({ x, dragConstraintsRef }: BeadProps) => (
  <motion.div
    style={{
      x,
      position: "absolute",
      height: "70px",
      width: "35px",
      top: "50%",
      translateY: "-50%",
      zIndex: 1,
    }}
    drag="x"
    dragElastic={0.1}
    dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
    dragConstraints={dragConstraintsRef}
    whileDrag={{ cursor: "grabbing", zIndex: 2 }}
    className="bg-gray-800 border-4 border-black rounded-full cursor-grab"
  >
    <div className="absolute left-1/2 top-1.5 h-7 w-4 -translate-x-1/2 -rotate-12 blur-[3px] bg-white/20 rounded-full"></div>
  </motion.div>
);

// --- Main Abacus Component with Corrected Constraints Logic ---
const AbacusHorizontal = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const [xMotionValues] = useState(() =>
    Array.from({ length: NUM_BEADS }, () => motionValue(0))
  );

  useLayoutEffect(() => {
    // Set initial positions
    xMotionValues.forEach((x, i) => {
      x.set(i * EFFECTIVE_BEAD_WIDTH);
    });

    const updateNeighbors = (changedIndex: number) => {
      // Guard clause in case the ref isn't ready yet
      if (!constraintsRef.current) return;

      // const changedValue = xMotionValues[changedIndex].get();

      // --- Pushing/Pulling Logic (same as before) ---
      // Push the stack of beads to the right
      for (let i = changedIndex + 1; i < NUM_BEADS; i++) {
        const beadToTheLeft = xMotionValues[i - 1];
        const newX = beadToTheLeft.get() + EFFECTIVE_BEAD_WIDTH;
        if (xMotionValues[i].get() < newX) {
          xMotionValues[i].set(newX);
        }
      }

      // Pull the stack of beads to the left
      for (let i = changedIndex - 1; i >= 0; i--) {
        const beadToTheRight = xMotionValues[i + 1];
        const newX = beadToTheRight.get() - EFFECTIVE_BEAD_WIDTH;
        if (xMotionValues[i].get() > newX) {
          xMotionValues[i].set(newX);
        }
      }

      // --- THE FIX: Manually enforce container boundaries ---

      // 1. Get container dimensions and define boundaries
      const containerWidth = constraintsRef.current.offsetWidth;
      const minX = 0;
      const maxX = containerWidth - BEAD_DIAMETER;

      // 2. Check the left boundary (bead 0)
      const firstBeadX = xMotionValues[0].get();
      if (firstBeadX < minX) {
        // Calculate how much the group is out of bounds
        const correction = minX - firstBeadX;
        // Apply the correction to the entire group that was pulled left
        for (let i = 0; i <= changedIndex; i++) {
          xMotionValues[i].set(xMotionValues[i].get() + correction);
        }
      }

      // 3. Check the right boundary (last bead)
      const lastBeadX = xMotionValues[NUM_BEADS - 1].get();
      if (lastBeadX > maxX) {
        // Calculate how much the group is out of bounds
        const correction = maxX - lastBeadX;
        // Apply the correction to the entire group that was pushed right
        for (let i = NUM_BEADS - 1; i >= changedIndex; i--) {
          xMotionValues[i].set(xMotionValues[i].get() + correction);
        }
      }
    };

    const unsubscribers = xMotionValues.map((x, i) =>
      x.onChange(() => updateNeighbors(i))
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [xMotionValues]);

  return (
    <div
      ref={constraintsRef}
      className="relative flex items-center h-16 b w-full px-2"
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-4 bg-gray-700  z-0"></div>

      {xMotionValues.map((x, i) => (
        <Bead key={i} x={x} dragConstraintsRef={constraintsRef} />
      ))}
    </div>
  );
};

export default AbacusHorizontal;
