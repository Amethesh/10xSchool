"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Arrow = ({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) => (
  <button
    aria-label={`scroll ${dir}`}
    onClick={onClick}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full cursor-pointer",
      "flex items-center justify-center",
      "bg-white/80 dark:bg-gray-800/80",
      "border border-black dark:border-white",
      "text-black dark:text-white",
      "shadow-md transition hover:scale-110",
      dir === "left" ? "left-5" : "right-5"
    )}
  >
    {/* simple chevron icon */}
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {dir === "left" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  </button>
);

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    image: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const scroll = (dir: "left" | "right") => {
    // FIX: Call scrollBy on containerRef.current, as it's the element with overflow-hidden
    if (!containerRef.current) return;
    const cardWidth = 300 + 32; // 300px card + 32px gap-8
    containerRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      let duration;
      if (speed === "fast") {
        duration = "20s";
      } else if (speed === "normal") {
        duration = "40s";
      } else {
        duration = "80s";
      }
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };
  return (
    <div className="relative">
      <Arrow dir="left" onClick={() => scroll("left")} />
      <div
        ref={containerRef} // This div has overflow-hidden, making it the scrollable area
        className={cn(
          "scroller relative z-20 max-w-screen overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
          className
        )}
      >
        <ul
          ref={scrollerRef} // This ul is the wide content inside the scrollable area
          className={cn(
            "flex w-max min-w-full shrink-0 flex-nowrap gap-8 py-4",
            start && "animate-scroll",
            pauseOnHover && "hover:[animation-play-state:paused]"
          )}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="relative w-[300px] max-w-full h-full shrink-0 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-8 dark:border-white dark:bg-gray-800 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>

                {/* 5-star rating */}
                <div className="flex gap-1 mb-6 transition-transform duration-300 hover:scale-110">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-[#00b67a] flex items-center justify-center transition-colors duration-300 hover:bg-green-600"
                    >
                      <svg
                        className="w-4 h-4 text-white fill-current"
                        viewBox="0 0 24 24"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Trustpilot icon</title>
                        <path d="M12,17.964l5.214-1.321l2.179,6.714L12,17.964z M24,9.286h-9.179L12,0.643L9.179,9.286 H0l7.429,5.357l-2.821,8.643l7.429-5.357l4.571-3.286L24,9.286L24,9.286L24,9.286L24,9.286z" />
                      </svg>
                    </div>
                  ))}
                </div>

                <span className="relative z-20 text-sm leading-relaxed font-normal text-gray-700 dark:text-gray-200 block mb-6">
                  {item.quote}
                </span>

                <div className="relative z-20 flex flex-row items-center gap-3 transition-transform duration-300 hover:scale-105">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm transition-colors duration-300 hover:bg-gray-700">
                      {item.name ? item.name.charAt(0).toUpperCase() : "N"}
                    </div>
                  )}
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300 hover:text-gray-900 dark:hover:text-white">
                      {item.name}
                    </span>
                    {item.title && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300 hover:text-gray-600 dark:hover:text-gray-300">
                        {item.title}
                      </span>
                    )}
                  </span>
                </div>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
      <Arrow dir="right" onClick={() => scroll("right")} />
    </div>
  );
};
