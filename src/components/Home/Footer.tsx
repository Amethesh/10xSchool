import React from "react";
import {
  ArrowUp,
  Linkedin,
  MessageCircle,
  Youtube,
  Instagram,
} from "lucide-react";
import * as motion from "motion/react-client";

const Footer = () => {
  return (
    <footer className="mt-24">
      {/* Decorative lines at top */}
      <div className="">
        {[2, 5, 8, 10, 12, 14].map((height, index, arr) => (
          <motion.div
            key={index}
            className={`bg-black w-full${
              index !== arr.length - 1 ? " mb-5" : ""
            }`}
            style={{ height: `${height}px` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
          />
        ))}
      </div>

      <section className="relative bg-black text-white">
        {/* Back to top arrow */}
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 border border-yellow-400 flex items-center justify-center bg-black bg-opacity-50">
            <ArrowUp className="w-4 h-4 text-yellow-400" />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 px-6 py-16">
          {/* Navigation menu */}
          <nav className="mb-8">
            <ul className="space-y-8 text-3xl font-light">
              <li>
                <a href="/" className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Home
                </a>
              </li>
              <li>
                <a href="/landing/courses" className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Courses
                </a>
              </li>
              <li>
                <a href="/student/dashboard" className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/landing/about" className="hover:text-yellow-400 transition-colors cursor-pointer">
                  About Us
                </a>
              </li>
              <li>
                <a href="mailto:admin@10xschool.com" className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Main title */}
          <h1
            className="absolute top-24 right-32 text-xl md:text-[200px] font-bold opacity-80 leading-none pointer-events-none z-0"
            style={{
              WebkitTextStroke: "4px #d3ef9530",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              filter: "url(#fuzzy-filter)",
            }}
          >
            THE 10X SCHOOL
            <svg width="0" height="0" style={{ position: "absolute" }}>
              <defs>
                <filter id="fuzzy-filter">
                  <feTurbulence
                    baseFrequency="0.2"
                    numOctaves="4"
                    seed="5"
                    stitchTiles="stitch"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    scale="20"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
            </svg>
          </h1>

          {/* Tagline */}
          <div className="mb-8 w-full text-center">
            <p
              className="text-[2vw] md:text-[4vw] font-bold text-gray-300"
              style={{
                WebkitTextStroke: "1px #d3ef95",
                color: "transparent",
                lineHeight: 1.1,
              }}
            >
              Empowering Minds, Transforming Futures
            </p>
          </div>

          {/* Enroll Now button */}
          <div className="mb-8 w-full flex justify-center">
            <button className="bg-[#d3ef95] cursor-pointer text-lg text-black px-8 py-3 font-bold hover:bg-yellow-300 transition-colors">
              Enrole Now
            </button>
          </div>

          {/* Social media section */}
          <div className="text-center">
            <p className="text-lg font-bold mb-4 text-gray-400">
              FOLLOW US ON SOCIAL
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom decorative lines */}
        <div className="">
          {[4, 5, 8, 10].map((height, index, arr) => (
            <div
              key={index}
              className={`bg-[#d3ef95] w-full${
                index !== arr.length - 1 ? " mb-4" : ""
              }`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </section>
    </footer>
  );
};

export default Footer;
