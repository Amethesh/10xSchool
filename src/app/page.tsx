import Abacus from "@/components/Home/Abacus";
import AboutSection from "@/components/Home/AboutUs";
import FAQComponent from "@/components/Home/FAQ";
import Footer from "@/components/Home/Footer";
import GetStarted from "@/components/Home/GetStarted";
import Testimonials from "@/components/Home/Testimonials";
import WhatWeDoSection from "@/components/Home/WhatWeDo";
import * as motion from "motion/react-client";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section className="mt-25 overflow-x-hidden mx-auto ">
        {/* Header Banner - Reduced height */}
        <div className="w-full h-[70px] bg-gradient-to-r from-[#bfecff] to-[#a8e6ff] flex items-center justify-center text-[24px] font-semibold text-black border-2 border-black ">
          Welcome to The 10X School - Empowering Minds, Transforming Futures
        </div>

        {/* Main Content - Reduced overall height */}
        <div className="bg-white border-b-2 border-black">
          <div className="flex border-black overflow-hidden max-w-7xl mx-auto min-h-[500px]">
            {/* Left Content Panel */}
            <div className="w-[60%] px-12 py-10 flex flex-col justify-center relative">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-[#bfecff] via-transparent to-[#D3EF95]"></div>

              <div className="relative z-10">
                <h2 className="text-[37px] font-bold text-black leading-tight mb-6">
                  Unlock Your Child&apos;s Superpower
                  <br />
                  <span className="text-[#2563eb]">
                    in Math, Logical & Lateral thinking.
                  </span>
                </h2>

                <p className="text-[16px] text-gray-600 leading-relaxed mb-8 max-w-lg">
                  Discover online brain development & academic tutoring programs
                  that make your child smarter, sharper, and more confident —
                  all from the comfort of home.
                </p>

                {/* Enhanced Features List */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <span className="bg-[#D3EF95] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                    🧠 Brain Development
                  </span>
                  <span className="bg-[#bfecff] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                    📚 Academic Tutoring
                  </span>
                  <span className="bg-[#ffd6cc] text-black px-3 py-1 rounded-full text-sm font-medium border border-black/20">
                    🏠 Learn from Home
                  </span>
                </div>

                <motion.button
                  className="bg-gradient-to-r from-[#bfecff] to-[#a8e6ff] text-black w-fit px-8 py-3 font-semibold text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] cursor-pointer rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{
                    background:
                      "linear-gradient(45deg, rgba(173, 243, 21, 1), rgba(200, 255, 50, 1))",
                    transform: "translate(-2px, -2px)",
                    boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.8)",
                  }}
                  whileTap={{
                    background: "rgba(255, 255, 255, 1)",
                    transform: "translate(2px, 2px)",
                    boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.8)",
                  }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  Explore Our Programs →
                </motion.button>
              </div>
            </div>

            <div className="w-[40%] bg-gradient-to-br from-[#D3EF95]/30 to-[#bfecff]/30 flex ">
              <Abacus />

              {/* Image container with better styling */}
              <div className="w-full aspect-sq border-4 border-black rounded-full shadow-lg overflow-hidden bg-white relative">
                <div className="absolute inset-2 rounded-full overflow-hidden">
                  <Image
                    src="/images/child_pic.png"
                    alt="Child playing with an tablet"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AboutSection />
      <WhatWeDoSection />
      <Testimonials />
      <FAQComponent />
      <GetStarted />
      <Footer />
    </main>
  );
}
