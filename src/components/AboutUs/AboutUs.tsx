"use client";
import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import AnimatedLetters from "./AnimatedLetters";

const AboutUsComponent = () => {
  const heroRef = useRef(null);
  const visionRef = useRef(null);
  const contentRef = useRef(null);
  const programsRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isVisionInView = useInView(visionRef, { once: true, margin: "-100px" });
  const isContentInView = useInView(contentRef, {
    once: true,
    margin: "-100px",
  });
  const isProgramsInView = useInView(programsRef, {
    once: true,
    margin: "-100px",
  });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  // const scaleIn = {
  //   initial: { opacity: 0, scale: 0.8 },
  //   animate: { opacity: 1, scale: 1 },
  //   transition: { duration: 0.6, ease: "easeOut" },
  // };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const numberAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="relative w-full bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-80"
          style={{ y: backgroundY }}
        >
          <img
            src={"/images/background.svg"}
            alt="Background Image"
            className="w-screen h-screen "
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8"
          style={{ y: textY }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-semibold text-center text-black mb-8 font-sans"
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          >
            The 10X School - Empowering Minds,
            <br />
            Transforming Futures
          </motion.h1>

          <motion.button
            className="bg-blue-200 hover:bg-blue-300 border-2 border-black px-8 py-4 text-xl font-semibold shadow-[4px_4px] transition-all duration-200 transform hover:scale-105"
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "6px 6px 0px rgba(0,0,0,1)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Our Programs
          </motion.button>
        </motion.div>
      </div>

      {/* Vision and Values Section */}
      <motion.div
        ref={visionRef}
        className="bg-[#cbffa9] border-2 border-black py-24 px-8 font-sans"
        initial={{ opacity: 0 }}
        animate={isVisionInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnimatedLetters />
          </motion.div>

          <motion.div
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            animate={isVisionInView ? "animate" : "initial"}
          >
            <motion.div variants={fadeInRight}>
              <motion.h2
                className="text-4xl md:text-5xl font-semibold text-black mb-4 font-sans"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Our Vision
              </motion.h2>
              <motion.p
                className="text-lg md:text-2xl text-black leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isVisionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Our ambitious vision is to empower 1 million students by 2030,
                and we&apos;re proud to have already made a profound impact on
                the lives of over 1,500 students worldwide through our
                innovative online platform.
              </motion.p>
            </motion.div>

            <motion.div variants={fadeInRight}>
              <motion.h2
                className="text-4xl md:text-5xl font-semibold text-black mb-4 font-sans"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Our Value
              </motion.h2>
              <motion.p
                className="text-lg md:text-2xl text-black leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isVisionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Our programs stimulate both the left and right hemispheres of
                the brain, promoting holistic cognitive development in children.
                We blend traditional wisdom like Vedic Maths with modern
                teaching techniques to make learning enjoyable, meaningful, and
                effective.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Section */}
      <motion.div
        ref={contentRef}
        className="py-16 px-8 bg-white"
        initial={{ opacity: 0 }}
        animate={isContentInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.p
            className="text-2xl md:text-3xl text-black leading-relaxed text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate={isContentInView ? "animate" : "initial"}
            transition={{ delay: 0.2 }}
          >
            Founded in 2021 on the foundation of over a decade of expertise in
            training and mentoring. Our ambitious vision is to empower 1 million
            students by 2030, and we&apos;re proud to have already made a
            profound impact on the lives of over 1,500 students worldwide
            through our innovative online platform. Now, we&apos;re taking our
            mission to the next level by partnering with schools to reach and
            inspire even more young minds. Join us in shaping the future of
            education and transforming lives!
          </motion.p>
        </div>
      </motion.div>

      {/* About Our Programs Section */}
      <motion.div
        ref={programsRef}
        className="bg-pink-200 bg-opacity-80 border-2 border-black py-16 px-8"
        initial={{ opacity: 0 }}
        animate={isProgramsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-semibold text-black mb-12 font-sans"
            variants={fadeInUp}
            initial="initial"
            animate={isProgramsInView ? "animate" : "initial"}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            About our programs
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              animate={isProgramsInView ? "animate" : "initial"}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isProgramsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p className="text-xl md:text-2xl text-black leading-relaxed mb-8">
                  <li>
                    Our programs stimulate both the left and right hemispheres
                    of the brain, promoting holistic cognitive development in
                    children.
                  </li>
                  <br />
                  <li>
                    We blend traditional wisdom like Vedic Maths with modern
                    teaching techniques to make learning enjoyable, meaningful,
                    and effective.
                  </li>
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center font-sans"
                variants={staggerContainer}
                initial="initial"
                animate={isProgramsInView ? "animate" : "initial"}
              >
                <motion.div
                  className="relative"
                  variants={numberAnimation}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-4xl md:text-5xl font-semibold text-black mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isProgramsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    1500+
                  </motion.div>
                  <div className="text-lg md:text-xl text-black">
                    Impacted students
                  </div>
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-black"></div>
                </motion.div>

                <motion.div
                  className="relative"
                  variants={numberAnimation}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-4xl md:text-5xl font-semibold text-black mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isProgramsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    300+
                  </motion.div>
                  <div className="text-lg md:text-xl text-black">
                    Engaging Activities
                  </div>
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-black"></div>
                </motion.div>

                <motion.div
                  variants={numberAnimation}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-4xl md:text-5xl font-semibold text-black mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isProgramsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    80%
                  </motion.div>
                  <div className="text-lg md:text-xl text-black">
                    Student granted growth
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-center"
              variants={fadeInRight}
              initial="initial"
              animate={isProgramsInView ? "animate" : "initial"}
              transition={{ delay: 0.4 }}
            >
              <motion.img
                src={"/images/about/color_letter.png"}
                alt="About Us"
                className="w-full"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUsComponent;
