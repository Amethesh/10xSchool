"use client";
import React from "react";
import { motion, Variants } from "motion/react";

interface EightBitButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant: "primary" | "success" | "danger";
  type?: "button" | "submit" | "reset";
}

// Define color palettes for each button variant
const colorPalettes = {
  primary: {
    initialBg: "#0066cc",
    hoverBg: "#0080ff",
    activeBg: "#004499",
    initialBorderLight: "#004499",
    initialBorderDark: "#002266",
  },
  success: {
    initialBg: "#00cc00",
    hoverBg: "#00ff00",
    activeBg: "#009900",
    initialBorderLight: "#009900",
    initialBorderDark: "#006600",
  },
  danger: {
    initialBg: "#cc0000",
    hoverBg: "#ff0000",
    activeBg: "#990000",
    initialBorderLight: "#990000",
    initialBorderDark: "#660000",
  },
};

// Framer Motion variants for the 8-bit button press effect
const buttonVariants: Variants = {
  rest: (colors: (typeof colorPalettes)[keyof typeof colorPalettes]) => ({
    background: colors.initialBg,
    color: "white",
    borderTop: `3px solid ${colors.initialBorderLight}`,
    borderLeft: `3px solid ${colors.initialBorderLight}`,
    borderBottom: `6px solid ${colors.initialBorderDark}`,
    borderRight: `4px solid ${colors.initialBorderDark}`,
    x: 0,
    y: 0,
    transition: { type: "tween", duration: 0.05 },
  }),
  hover: (colors: (typeof colorPalettes)[keyof typeof colorPalettes]) => ({
    background: colors.hoverBg,
    borderBottom: `4px solid ${colors.initialBorderDark}`,
    borderRight: `3px solid ${colors.initialBorderDark}`,
    x: 1,
    y: 1,
    transition: { type: "tween", duration: 0.05 },
  }),
  tap: (colors: (typeof colorPalettes)[keyof typeof colorPalettes]) => ({
    background: colors.activeBg,
    borderBottom: `2px solid ${colors.initialBorderDark}`,
    borderRight: `2px solid ${colors.initialBorderDark}`,
    x: 2,
    y: 2,
    transition: { type: "tween", duration: 0.05 },
  }),
  disabled: {
    background: "#444",
    color: "#aaa",
    borderTop: `3px solid #666`,
    borderLeft: `3px solid #666`,
    borderBottom: `6px solid #222`,
    borderRight: `4px solid #222`,
    x: 0,
    y: 0,
    cursor: "not-allowed",
  },
};

const EightBitButton: React.FC<EightBitButtonProps> = ({
  children,
  onClick,
  disabled,
  className,
  variant,
  type = "button",
}) => {
  const colors = colorPalettes[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-['Press_Start_2P'] text-[10px] py-[12px] px-[20px] border-none cursor-pointer
        uppercase relative inline-block transition-none
        ${className || ""}
        ${disabled ? "pointer-events-none" : ""}
      `}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      animate={disabled ? "disabled" : "rest"}
      custom={colors} // Pass colors as custom prop to variants
      // Add a subtle shadow to simulate depth, separate from the borders
      style={{
        textShadow: "1px 1px 0px rgba(0,0,0,0.5)", // Adds depth to text
        whiteSpace: "nowrap", // Prevent text wrapping
      }}
    >
      {children}
    </motion.button>
  );
};

export default EightBitButton;
