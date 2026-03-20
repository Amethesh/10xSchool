"use client";

import React from "react";
import { motion } from "motion/react"; // Using motion/react as seen in Hero.tsx
import Image from "next/image";

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  images: string[];
  created_at: string;
};

type GalleryGridProps = {
  items: GalleryItem[];
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* Card Header */}
            <div className="p-6 border-b-2 border-black bg-gradient-to-r from-[#bfecff]/30 to-white">
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Images Grid */}
            <div className="p-6 bg-white">
              {item.images && item.images.length > 0 ? (
                <div
                  className={`grid gap-4 ${
                    item.images.length === 1
                      ? "grid-cols-1"
                      : item.images.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 lg:grid-cols-3" // Auto-fit for more images
                  }`}
                >
                  {item.images.map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`${item.title} - Image ${imgIndex + 1}`}
                        className="w-full h-auto object-contain rounded-xl border-2 border-black shadow-sm"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-black border-dashed rounded-xl">
                  <span className="text-gray-400 font-semibold">
                    No Images Available
                  </span>
                </div>
              )}
            </div>

            {/* Optional Footer or Date */}
            <div className="px-6 py-3 bg-gray-50 border-t-2 border-black flex justify-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-7xl w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Full screen view"
              className="max-w-full max-h-[90vh] object-contain rounded-md"
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
