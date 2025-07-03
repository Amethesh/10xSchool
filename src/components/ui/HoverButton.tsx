"use client";
import React, { useState, useRef, useEffect } from "react";

interface HoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fillColor?: string;
  negativeColor?: string;
  borderColor?: string;
  className?: string;
}

export const HoverButton: React.FC<HoverButtonProps> = ({
  children,
  onClick,
  className = "",
  fillColor = "#adf315",
  negativeColor = "#520ae8",
  borderColor = "#1a1a1a",
  disabled = false,
  style = {},
  ...props
}) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState<{ x: string; y: string }>({
    x: "50%",
    y: "50%",
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent): void => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });

        if (cursorDotRef.current && isHovering) {
          cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1)`;
        }
      });
    };

    if (isHovering) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isHovering]);

  const handleMouseEnter = (): void => {
    setIsHovering(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovering(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (disabled) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setClickPosition({ x: x + "px", y: y + "px" });
      setIsClicked(false);

      requestAnimationFrame(() => {
        setIsClicked(true);
      });

      setTimeout(() => {
        setIsClicked(false);
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const buttonStyles: React.CSSProperties = {
    position: "relative",
    padding: "12px 24px", // Slightly smaller for navbar
    fontSize: "16px",
    fontWeight: "600",
    color: isClicked ? fillColor : borderColor,
    backgroundColor: fillColor,
    border: `2px solid ${borderColor}`, // Thinner border for navbar
    borderRadius: "12px",
    cursor: "none",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    outline: "none",
    boxShadow: `0 2px 10px ${fillColor}4D`, // Subtler shadow for navbar
    transform: isHovering ? "translateY(-1px)" : "translateY(0)", // Less movement for navbar
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...style,
  };

  const beforeStyles: React.CSSProperties = {
    content: '""',
    position: "absolute",
    width: isClicked ? "300px" : "0",
    height: isClicked ? "300px" : "0",
    backgroundColor: negativeColor,
    borderRadius: "50%",
    transform: "translate(-50%, -50%) scale(" + (isClicked ? "1" : "0") + ")",
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1,
    left: clickPosition.x,
    top: clickPosition.y,
    pointerEvents: "none",
  };

  const cursorDotStyles: React.CSSProperties = {
    position: "fixed",
    width: "12px",
    height: "12px",
    backgroundColor: negativeColor,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 99999, // Higher z-index to ensure it's above navbar
    transform: `translate(${cursorPosition.x}px, ${
      cursorPosition.y
    }px) translate(-50%, -50%) scale(${isHovering ? "1" : "0"})`,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    opacity: isHovering ? 1 : 0,
    left: 0,
    top: 0,
    willChange: "transform",
  };

  const spanStyles: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    transition: "color 0.3s ease",
  };

  return (
    <>
      {/* Cursor Dot */}
      <div ref={cursorDotRef} style={cursorDotStyles} />

      {/* Button */}
      <button
        ref={buttonRef}
        className={className}
        style={buttonStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {/* Ripple Effect */}
        <div style={beforeStyles} />

        {/* Button Text */}
        <span style={spanStyles}>{children}</span>
      </button>
    </>
  );
};
