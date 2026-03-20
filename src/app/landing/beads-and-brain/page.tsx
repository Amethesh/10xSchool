"use client";

import React from "react";
import * as motion from "motion/react-client";
import {
  Brain,
  Calculator,
  Coins,
  Puzzle,
  Zap,
  GraduationCap,
  BookOpen,
  Activity,
  UsersRound,
  Tag,
  Globe,
  CheckCircle2,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── reusable animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const vp = { once: true, amount: 0.2 };

/* ─── data ─── */
const pillars = [
  { title: "Math Ability", desc: "Abacus & Vedic Maths", icon: <Calculator className="w-5 h-5" />, color: "bg-[#bfecff]" },
  { title: "Memory Power", desc: "Brain training techniques", icon: <Brain className="w-5 h-5" />, color: "bg-[#D3EF95]" },
  { title: "Money Intelligence", desc: "Financial literacy for kids", icon: <Coins className="w-5 h-5" />, color: "bg-[#ffe082]" },
  { title: "Logical Thinking", desc: "Structured brain games", icon: <Puzzle className="w-5 h-5" />, color: "bg-[#ffd6cc]" },
];
const benefits = [
  "Faster in calculations",
  "Stronger concentration",
  "Confident problem solving",
  "Smarter money understanding",
];
const vedicPoints = [
  "Solve complex sums quickly",
  "Improve speed & accuracy",
  "Calculate mentally — no calculator needed",
  "Build confidence in school maths",
];
const whyUs = [
  { title: "Experienced Trainers", desc: "Trained under The 10X School methodology.", icon: <GraduationCap />, color: "bg-[#bfecff]" },
  { title: "Color Workbooks", desc: "Visually engaging books that make learning fun.", icon: <BookOpen />, color: "bg-[#ffd6cc]" },
  { title: "Learning by Doing", desc: "Hands-on activities & interactive brain games.", icon: <Activity />, color: "bg-[#D3EF95]" },
  { title: "Small Batch Size", desc: "Individual attention for every child.", icon: <UsersRound />, color: "bg-[#ffe082]" },
  { title: "Competitive Fees", desc: "Premium quality at reasonable pricing.", icon: <Tag />, color: "bg-white" },
  { title: "Flexible Formats", desc: "In-Person & Online modes available.", icon: <Globe />, color: "bg-[#e8d5ff]" },
];

export default function BeadsAndBrainPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] grid-background font-sans text-black overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative bg-gradient-to-br from-[#bfecff] via-[#d0f4ff] to-[#a8e6ff] border-[3px] border-black rounded-3xl p-8 md:p-14 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        >
          {/* decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#D3EF95]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* left */}
            <div>
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                animate="show"
                className="inline-block bg-[#D3EF95] border-2 border-black rounded-full px-5 py-2 font-bold mb-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 text-sm"
              >
                ⭐ Licensed Teaching Partner · The 10X School
              </motion.div>
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                animate="show"
                className="flex items-center gap-4 mb-5"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-white border-[3px] border-black rounded-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                  <Image
                    src="https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/images/beads-and-brain.jpeg"
                    alt="Beads & Brain Logo"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                  Beads &amp; Brain
                </h1>
              </motion.div>
              <motion.p
                variants={fadeLeft}
                initial="hidden"
                animate="show"
                className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 max-w-xl"
              >
                Brain development &amp; math mastery programs for children <strong>5–13 years</strong> in the USA — building sharp minds through a{" "}
                <em>"Learning by Doing"</em> approach.
              </motion.p>
              <motion.div variants={fadeLeft} initial="hidden" animate="show" className="flex flex-wrap gap-3">
                {["🧮 Abacus", "🧠 Memory Training", "💰 Financial Literacy", "🎯 Brain Games"].map((t) => (
                  <span key={t} className="bg-white border-2 border-black rounded-full px-4 py-1.5 font-semibold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* right – image */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="show"
              className="relative"
            >
              <div className="relative border-[3px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <Image
                  src="https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/images/m3_genius_kids.png"
                  alt="Children learning with abacus at Beads & Brain LLC"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#D3EF95] border-2 border-black rounded-xl px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-2">
                Ages 5–13 🎉
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── M³ GENIUS PROGRAM ── */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        {/* section label */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-black rounded-full" />
          <h2 className="text-3xl md:text-4xl font-extrabold whitespace-nowrap">🌟 M³ Genius Program</h2>
          <div className="h-1 flex-1 bg-black rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-14">
          {/* image */}
          <motion.div variants={fadeLeft} initial="hidden" whileInView="show" viewport={vp} className="relative">
            <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <Image
                src="https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/images/brain_development.png"
                alt="Brain development with math, memory and money concepts"
                width={600}
                height={520}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-4 -left-4 bg-[#ffd6cc] border-2 border-black rounded-xl px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              All-in-One Course ✨
            </div>
          </motion.div>

          {/* pillars */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp} className="grid grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, rotate: 1 }}
                transition={{ duration: 0.2 }}
                className={`${p.color} border-[3px] border-black rounded-xl p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3`}
              >
                <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {p.icon}
                </div>
                <h3 className="font-extrabold text-lg leading-tight">{p.title}</h3>
                <p className="text-sm font-medium text-gray-700">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* outcomes strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="bg-white border-[3px] border-black rounded-2xl p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="text-center font-bold text-lg mb-5 text-gray-500 uppercase tracking-widest text-sm">Children become ✔</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="show"
                viewport={vp}
                className="flex items-center gap-3 bg-[#D3EF95] border-2 border-black rounded-xl p-4 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0246A4]" />
                <span className="text-sm leading-snug">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── VEDIC MATHS ── */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-black rounded-full" />
          <h2 className="text-3xl md:text-4xl font-extrabold whitespace-nowrap">🧠 Vedic Maths Program</h2>
          <div className="h-1 flex-1 bg-black rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* points */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp} className="flex flex-col gap-5">
            <motion.div variants={fadeLeft} className="bg-[#D3EF95] border-[3px] border-black rounded-2xl p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-extrabold text-2xl">Exclusive for 9+ years</p>
                  <p className="text-gray-700 font-medium">Master mental arithmetic</p>
                </div>
              </div>
            </motion.div>

            <ul className="space-y-4">
              {vedicPoints.map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeLeft}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 bg-white border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="bg-[#bfecff] border-2 border-black rounded-full p-1.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* image */}
          <motion.div variants={fadeRight} initial="hidden" whileInView="show" viewport={vp} className="relative">
            <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <Image
                src="https://vnwacjzpzyblrvastejt.supabase.co/storage/v1/object/public/images/vedic_maths.png"
                alt="Child solving complex maths on chalkboard using Vedic techniques"
                width={600}
                height={520}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#bfecff] border-2 border-black rounded-xl px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-1">
              ⚡ Mental Speed!
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">Why Choose Beads &amp; Brain?</h2>
          <p className="text-gray-600 font-medium text-lg">6 reasons parents trust us with their children</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {whyUs.map((f, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: -6, rotate: 0.5 }}
              transition={{ duration: 0.2 }}
              className={`${f.color} border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative pt-10 mt-5`}
            >
              <div className="absolute -top-5 -right-3 bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-12">
                {f.icon}
              </div>
              <h3 className="text-xl font-extrabold mb-2 pr-6">{f.title}</h3>
              <p className="font-medium text-gray-700 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto mb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="bg-gradient-to-br from-[#0246A4] to-[#1a5bc4] text-white border-[3px] border-black rounded-3xl p-10 md:p-14 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-center"
        >
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#D3EF95]/20 rounded-full blur-2xl pointer-events-none" />

          <p className="inline-block bg-[#D3EF95] text-black border-2 border-black rounded-full px-5 py-1.5 font-bold text-sm mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-1">
            📩 Free Demo Session Available
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative z-10">
            We don't just teach math —<br />we build sharp, confident young minds.
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
            Schedule your free demo session and see the Beads &amp; Brain difference!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="mailto:admin@10xschool.com">
              <button className="group w-full sm:w-auto bg-[#D3EF95] text-black border-2 border-black rounded-xl px-8 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                Email Us
              </button>
            </Link>
            <Link href="/application">
              <button className="group w-full sm:w-auto bg-white text-black border-2 border-black rounded-xl px-8 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all flex items-center justify-center gap-2">
                Book Free Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
