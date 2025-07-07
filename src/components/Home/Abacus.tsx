"use client";
import React, { useState, useLayoutEffect } from "react";
import {
  motion,
  useAnimate,
  motionValue, // <-- Import the factory function, not the hook
  MotionValue,
} from "motion/react";

// --- Constants for easier maintenance ---
const NUM_BEADS = 6;
const BEAD_HEIGHT = 40; // h-10 in Tailwind (2.5rem)
const BEAD_MARGIN_Y = 0; // Spacing between beads
const EFFECTIVE_BEAD_HEIGHT = BEAD_HEIGHT + BEAD_MARGIN_Y;

// --- Bead Component (Unchanged, it was already correct) ---
interface BeadProps {
  beadId: number;
  y: MotionValue<number>;
  onDrag: () => void;
  onDragEnd: () => void;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

const Bead = ({
  beadId,
  y,
  onDrag,
  onDragEnd,
  dragConstraintsRef,
}: BeadProps) => (
  <motion.div
    data-bead-id={beadId}
    style={{
      y,
      position: "absolute",
      width: "5rem", // w-20
      height: "2.5rem", // h-10
      left: "-1.75rem", // -left-7
      zIndex: 1,
    }}
    drag="y"
    dragElastic={0.1}
    dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
    dragConstraints={dragConstraintsRef}
    whileDrag={{ cursor: "grabbing", zIndex: 2 }}
    onDrag={onDrag}
    onDragEnd={onDragEnd}
    className="bg-[#D3EF95] border-4 border-black rounded-full cursor-grab"
  >
    <div className="absolute left-2 top-1.5 w-7 h-4 -rotate-12 blur-[3px] bg-white/80 rounded-full"></div>
  </motion.div>
);

// --- Main Abacus Component (Corrected) ---
const Abacus = () => {
  const [scope, animate] = useAnimate();

  // THE FIX: Use useState with an initializer function.
  // This function runs ONLY ONCE on the initial render.
  const [yMotionValues] = useState(() =>
    // We call the `motionValue()` factory function here, which is NOT a hook.
    Array.from({ length: NUM_BEADS }, () => motionValue(0))
  );

  useLayoutEffect(() => {
    const containerEl = scope.current;
    if (!containerEl) return;

    const containerHeight = containerEl.offsetHeight;

    yMotionValues.forEach((y, i) => {
      // Stack beads from the bottom up.
      const initialY =
        containerHeight - EFFECTIVE_BEAD_HEIGHT * (NUM_BEADS - i);
      y.set(initialY);
    });
    // This effect should only run once after the component mounts and the ref is set.
    // The yMotionValues array is stable.
  }, [scope, yMotionValues]);

  const handleDrag = (draggedIndex: number) => {
    // const draggedY = yMotionValues[draggedIndex].get();

    // Push the stack below
    for (let i = draggedIndex + 1; i < NUM_BEADS; i++) {
      const beadBelowY = yMotionValues[i - 1].get();
      const newY = beadBelowY + EFFECTIVE_BEAD_HEIGHT;
      if (yMotionValues[i].get() < newY) {
        yMotionValues[i].set(newY);
      }
    }

    // Lift the stack above
    for (let i = draggedIndex - 1; i >= 0; i--) {
      const beadAboveY = yMotionValues[i + 1].get();
      const newY = beadAboveY - EFFECTIVE_BEAD_HEIGHT;
      if (yMotionValues[i].get() > newY) {
        yMotionValues[i].set(newY);
      }
    }
  };

  const handleDragEnd = async (draggedIndex: number) => {
    const containerHeight = scope.current.offsetHeight;

    const floorY =
      draggedIndex === NUM_BEADS - 1
        ? containerHeight - BEAD_HEIGHT
        : yMotionValues[draggedIndex + 1].get() - EFFECTIVE_BEAD_HEIGHT;

    const animations = [];
    for (let i = draggedIndex; i >= 0; i--) {
      const finalY = floorY - (draggedIndex - i) * EFFECTIVE_BEAD_HEIGHT;
      animations.push(
        animate(
          `[data-bead-id="${i}"]`,
          { y: finalY },
          {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.5,
          }
        )
      );
    }
    await Promise.all(animations);
  };

  return (
    <div
      ref={scope}
      className="relative w-7 bg-[#585858] border-2 border-black h-full"
    >
      {yMotionValues.map((y, i) => (
        <Bead
          key={i}
          beadId={i}
          y={y}
          onDrag={() => handleDrag(i)}
          onDragEnd={() => handleDragEnd(i)}
          dragConstraintsRef={scope}
        />
      ))}
    </div>
  );
};

export default Abacus;
