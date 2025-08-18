// src/components/skeletons/LevelSkeleton.tsx

"use client";

import React from "react";
import { motion } from "motion/react";

// A reusable placeholder component with the shimmer effect
const ShimmerPlaceholder = ({ className }: { className?: string }) => {
    return (
        <div className={`relative overflow-hidden bg-gray-700/50 ${className}`}>
            <div className="absolute inset-0 -translate-x-full shimmer bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
        </div>
    );
};

// The main skeleton component that mimics your page layout
const LevelSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 min-h-screen p-3 sm:p-6 max-w-7xl mx-auto"
        >
            {/* Profile Header Skeleton */}
            <div className="pixel-panel p-4 mb-6 backdrop-blur-sm bg-black/20">
                <div className="flex items-center gap-4">
                    <ShimmerPlaceholder className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                        <ShimmerPlaceholder className="h-4 w-1/2 rounded" />
                        <ShimmerPlaceholder className="h-2.5 w-full rounded-full" />
                    </div>
                    <ShimmerPlaceholder className="h-10 w-12 sm:w-24 rounded-lg" />
                </div>
            </div>

            {/* Main Content Panel Skeleton */}
            <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
                {/* Title Skeleton */}
                <div className="text-center mb-8">
                    <ShimmerPlaceholder className="h-8 w-1/2 mx-auto rounded mb-3" />
                    <ShimmerPlaceholder className="h-4 w-3/4 mx-auto rounded mb-4" />
                    <ShimmerPlaceholder className="h-1 w-24 mx-auto rounded-full" />
                </div>

                {/* Horizontal Level Selector Skeleton */}
                <div className="flex items-center gap-3 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ShimmerPlaceholder key={i} className="h-12 w-24 sm:w-32 rounded-lg" />
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Level Header Skeleton */}
                    <div className="pixel-panel p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <ShimmerPlaceholder className="w-12 h-12 rounded-lg" />
                                <div className="space-y-2">
                                    <ShimmerPlaceholder className="h-5 w-40 rounded" />
                                    <ShimmerPlaceholder className="h-3 w-24 rounded" />
                                </div>
                            </div>
                            <ShimmerPlaceholder className="h-10 w-32 rounded-lg" />
                        </div>
                    </div>

                    {/* WeekGrid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ShimmerPlaceholder key={i} className="h-44 rounded-lg" />
                        ))}
                    </div>

                    {/* Level Statistics Skeleton */}
                    <div className="mt-8 pt-6 border-t border-gray-700/50">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <ShimmerPlaceholder className="w-16 h-16 rounded-full mb-2" />
                                    <ShimmerPlaceholder className="h-3 w-20 rounded" />
                                </div>
                            ))}
                        </div>
                        <ShimmerPlaceholder className="h-3 w-full rounded-full" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LevelSkeleton;