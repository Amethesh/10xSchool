// src/components/ui/Tabs.tsx

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import clsx from "clsx";

// --- Context (Logic is sound, no changes needed) ---
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

// --- Root Component (Logic is sound, renamed for clarity) ---
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, className, ...props }, ref) => {
    // Controlled/uncontrolled state logic remains the same
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;
    
    const handleValueChange = (newValue: string) => {
      if (value === undefined) setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

// --- Tabs List (Themed and styled) ---
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // A clean bottom border acts as a track for the tabs
    className={cn(
      "relative flex items-center gap-4 sm:gap-6 border-b border-cyan-400/20",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// --- Tabs Trigger (Themed and animated) ---
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
      <button
        ref={ref}
        className={clsx(
          "relative pixel-font text-sm sm:text-base tracking-wider whitespace-nowrap px-2 py-3 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t-sm",
          isActive ? "text-cyan-300" : "text-cyan-300/60 hover:text-cyan-300"
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      >
        {children}
        {/* The magic animated indicator */}
        {isActive && (
          <motion.div
            className="absolute -bottom-px left-0 right-0 h-0.5 bg-cyan-400"
            layoutId="active-tab-indicator" // This ID tells framer-motion to animate between triggers
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

// --- Tabs Content (Themed and animated) ---
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return (
      // Animate the content panel as it appears
      <motion.div
        ref={ref}
        className={cn("mt-6 focus:outline-none", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };