import React from "react";
import {
  ArrowUp,
  Linkedin,
  MessageCircle,
  Youtube,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Decorative lines at top */}
      <div className="absolute top-0 left-0 right-0 h-16">
        <div className="relative h-full">
          {/* Multiple decorative lines */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute border-t border-white opacity-60"
              style={{
                top: `${i * 2}px`,
                left: `${i * 3}%`,
                right: `${-i * 2}%`,
                transform: `rotate(${i * 0.5}deg)`,
              }}
            />
          ))}
        </div>
      </div>

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
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Courses
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Contact US
              </a>
            </li>
          </ul>
        </nav>

        {/* Main title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-600 opacity-80 leading-none">
            THE 10X
            <br />
            SCHOOL
          </h1>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-lg md:text-xl text-gray-300 font-light">
            Empowering Minds, Transforming Futures
          </p>
        </div>

        {/* Enroll Now button */}
        <div className="mb-8">
          <button className="bg-yellow-400 text-black px-8 py-3 font-semibold hover:bg-yellow-300 transition-colors">
            Enrole Now
          </button>
        </div>

        {/* Social media section */}
        <div className="text-center">
          <p className="text-sm mb-4 text-gray-400">FOLLOW US ON SOCIAL</p>
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
      <div className="absolute bottom-0 left-0 right-0 h-4">
        <div className="h-1 bg-yellow-400 mb-1"></div>
        <div className="h-1 bg-gray-600 mb-1"></div>
        <div className="h-1 bg-gray-800"></div>
      </div>
    </footer>
  );
};

export default Footer;
