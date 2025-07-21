"use client";
import { BrainIcon } from "lucide-react";
import React from "react";
import { useInView, Variants } from "motion/react";
import * as motion from "motion/react-client";
import { useRef } from "react";

export interface CourseCardItems {
  title: string;
  description?: string;
  timing?: string;
  features?: string[];
  image?: string;
  coursePoints?: string[];
  imageWidthClass?: string;
  bgColor?: string;
}

const CourseCard: React.FC<CourseCardItems> = ({
  title = "Course Title",
  description = "Course description goes here",
  timing = "8 Levels - 3 months each\n2 hours/week",
  features = ["Feature 1", "Feature 2", "Feature 3"],
  image,
  coursePoints = [],
  imageWidthClass = "w-80",
  bgColor = "bg-white",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const featureVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const timingBoxVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`max-w-screen ${bgColor} py-16`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-6" variants={itemVariants}>
          <motion.h1
            className="text-5xl font-bold text-black mb-4"
            variants={titleVariants}
          >
            {title}
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center md:items-start">
            <motion.div
              className="flex-1 order-2 md:order-1 mt-6 md:mt-0"
              variants={itemVariants}
            >
              <motion.p
                className="text-black text-lg font-semibold leading-relaxed mb-6"
                variants={itemVariants}
              >
                {description}
              </motion.p>

              {/* Course Points */}
              {coursePoints.length > 0 && (
                <motion.ul
                  className="space-y-2 mb-6"
                  variants={containerVariants}
                >
                  {coursePoints.map((point, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start text-black mb-2"
                      variants={listItemVariants}
                      whileHover={{
                        x: 5,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <span className="text-black mr-2 mt-1">•</span>
                      <span className="text-lg">{point}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </motion.div>

            {/* Image/Icon */}
            <motion.div
              className="ml-0 md:ml-8 flex-shrink-0 order-1 md:order-2"
              variants={imageVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            >
              {image ? (
                <motion.img
                  src={image}
                  alt="Course illustration"
                  className={`${imageWidthClass} object-contain`}
                  whileHover={{
                    rotate: 2,
                    transition: { duration: 0.3 },
                  }}
                />
              ) : (
                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.1,
                    transition: { duration: 0.3 },
                  }}
                >
                  <BrainIcon className="w-20 h-20 text-blue-600" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-0"
          variants={containerVariants}
        >
          {/* Timing Box */}
          <motion.div
            className="border-2 border-black px-4 py-3 rounded mb-4 md:mb-0"
            variants={timingBoxVariants}
            whileHover={{
              scale: 1.02,
              borderColor: "#3b82f6",
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex items-center text-base font-bold text-black">
              <motion.svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.5 },
                }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </motion.svg>
              <div className="whitespace-pre-line">{timing}</div>
            </div>
          </motion.div>

          {/* Feature Tags */}
          <motion.div
            className="flex flex-wrap gap-3 ml-0 md:ml-4 justify-center md:justify-start"
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const colors = [
                "bg-pink-200 text-pink-800 border-pink-300",
                "bg-yellow-200 text-yellow-800 border-yellow-300",
                "bg-purple-200 text-purple-800 border-purple-300",
                "bg-green-200 text-green-800 border-green-300",
                "bg-blue-200 text-blue-800 border-blue-300",
              ];

              return (
                <motion.div
                  key={index}
                  className={`px-4 py-2 rounded border-2 text-sm font-medium ${
                    colors[index % colors.length]
                  }`}
                  variants={featureVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 },
                  }}
                >
                  {feature}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
