// src/components/ui/PixelCard.tsx

import * as React from "react"
import { cn } from "@/lib/utils"

// --- The Main Card Container ---
// Replaces the default card with your themed "pixel-panel"
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pixel-panel flex flex-col gap-4 sm:gap-6 p-4", // Base style with flex layout
      className
    )}
    {...props}
  />
));
Card.displayName = "PixelCard";


// --- Card Header ---
// Simplified layout using flexbox for better responsiveness
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between gap-4", className)}
    {...props}
  />
));
CardHeader.displayName = "PixelCardHeader";


// --- Card Title ---
// Applies the standard pixel-font heading style
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 // Using h3 for better semantics
    ref={ref}
    className={cn(
      "pixel-font text-base sm:text-lg text-white tracking-wider",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "PixelCardTitle";


// --- Card Description ---
// Applies the standard themed description style
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("pixel-font text-xs sm:text-sm text-cyan-300/80 -mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "PixelCardDescription";


// --- Card Action ---
// A simple slot for buttons or controls in the header
const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-shrink-0", className)} // Prevents shrinking
    {...props}
  />
));
CardAction.displayName = "PixelCardAction";


// --- Card Content ---
// This is the main body. It doesn't need extra padding as the parent provides it.
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "PixelCardContent";


// --- Card Footer ---
// Provides a clear visual separation with a top border
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-4 border-t border-cyan-400/20 pt-4",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "PixelCardFooter";


export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}