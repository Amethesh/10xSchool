"use client";

import { motion } from "motion/react";
import { MoveRight } from "lucide-react";

export default function TeachingPartnersSection() {
  return (
    <section className="w-full max-w-[90vw] mx-auto px-4 py-12 font-sans">
      <motion.div
        className="flex flex-col justify-center items-center mt-2 mb-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-2xl md:text-4xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 text-center"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          🌍 Our Franchisees & Teaching Partners
        </motion.p>
        <p className="mt-6 text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium text-center">
          We are proud to collaborate with passionate education providers who
          share our vision of nurturing young minds through innovative learning
          methods.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row w-full gap-8 overflow-hidden py-4">
        {/* Card 1 */}
        <motion.div
          className="flex-[1] bg-white border-2 border-black rounded-2xl p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 relative overflow-hidden group flex flex-col"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#bfecff]/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
                  Amrutha Institutions
                </h3>
                <div className="inline-block bg-[#bfecff] border-2 border-black rounded-full px-4 py-1.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] -rotate-1">
                  🇮🇳 Coimbatore, India
                </div>
             </div>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed font-medium relative z-10 flex-grow">
            <p>
              A well-established name in skill-based education, <strong className="text-black">Amrutha Institutions</strong> has been empowering learners for over a decade. With centers in <strong className="text-black">R.S. Puram</strong> and <strong className="text-black">Kavundampalayam</strong>, they offer a wide range of programs including computer training, fashion designing, spoken languages, and more.
            </p>
            <p>
              Since <strong className="text-black">October 2025</strong>, they have partnered with <strong className="text-black">The 10X School</strong> to deliver our specialized brain development programs, bringing structured and engaging learning experiences to children alongside their diverse academic offerings.
            </p>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="flex-[1] bg-white border-2 border-black rounded-2xl p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 relative overflow-hidden group flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D3EF95]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
                  Beads & Brain LLC
                </h3>
                <div className="inline-block bg-[#D3EF95] border-2 border-black rounded-full px-4 py-1.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] rotate-1">
                  🇺🇸 Charlotte, USA
                </div>
             </div>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed font-medium relative z-10 flex-grow">
            <p>
              <strong className="text-black">Beads & Brain LLC</strong> is a <strong className="text-black">Licensed Teaching Partner of The 10X School</strong> since <strong className="text-black">February 2026</strong>, focused on delivering high-quality brain development and math enrichment programs for children.
            </p>
            <p>
              Led by <strong className="text-black">Mrs. Devi Sri</strong>, an experienced and compassionate educator, the institute is known for its child-friendly teaching approach and commitment to building strong foundational skills in young learners.
            </p>
          </div>

          <div className="mt-8 relative z-10">
            <a 
              href="/landing/beads-and-brain"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-black text-white border-2 border-black rounded-xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:bg-[#D3EF95] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Brain & Beads <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-12 text-center w-full bg-[#ffe082] border-2 border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-lg md:text-xl font-bold text-black leading-relaxed relative z-10">
          ✨ <span className="italic">Together, our partners play a vital role in expanding our mission of developing confident, capable, and future-ready children across the globe.</span>
        </p>
      </motion.div>
    </section>
  );
}
