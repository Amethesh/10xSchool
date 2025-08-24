import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import CountUp from "../ui/CountUp";

const AboutSection = () => {
  return (
    <section className="relative py-16 bg-whit">
      {/* Animated Title */}
      <motion.div
        className="absolute w-full flex justify-center top-8 z-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-2xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
          whileHover={{
            scale: 1.05,
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.8)",
          }}
        >
          ABOUT US
        </motion.p>
      </motion.div>

      {/* Animated Decorative Lines */}
      <div>
        {[2, 5, 8, 10, 12].map((height, index, arr) => (
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

      {/* Main Content Container */}
      <div className="bg-gradient-to-b from-white to-blue-50 py-8">
        <div className="max-w-7xl bg-whie mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Empowering <span className="text-[#0246a4]">1 Million</span>{" "}
                  Students by 2030
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Founded in 2021 on the foundation of over a decade of
                  expertise in training and mentoring. We&apos;ve already made a
                  profound impact on the lives of over 1,500 students worldwide
                  through our innovative online platform.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex">
                    <CountUp
                      from={0}
                      to={1500}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text text-3xl font-bold text-[#0246a4]"
                    />
                    <h3 className="text-3xl font-bold text-[#0246a4]">+</h3>
                  </div>
                  <p className="text-gray-600 font-semibold">
                    Students Impacted
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  <motion.h3
                    className="text-3xl font-bold text-green-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <CountUp
                      from={0}
                      to={10}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                    />
                    + Years
                  </motion.h3>
                  <p className="text-gray-600 font-semibold">Experience</p>
                </div>
              </motion.div>

              {/* View More Button */}
              <Link href="/landing/about">
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
                  viewport={{ once: true }}
                >
                  View More About Us →
                </motion.button>
              </Link>
            </motion.div>

            {/* Image Section */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                whileHover={{
                  transform: "translate(-4px, -4px)",
                  boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.8)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Placeholder for actual image */}
                <div className="aspect-square bg-white rounded-xl border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.8)] relative overflow-hidden flex items-center justify-center">
                  {/* your animated image */}
                  <motion.div
                    className="w-full h-full"
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      className="w-full h-full object-cover"
                      src="/images/child_pic.png"
                      width={500}
                      height={500}
                      alt="About us picture"
                    />
                  </motion.div>

                  {/* overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/50 to-transparent">
                    {/* optional wiggle on the cap emoji */}
                    <motion.div
                      className="text-6xl mb-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🎓
                    </motion.div>

                    {/* gradient text */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
                      Education Excellence
                    </h3>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-[#fff07c] rounded-full p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span className="text-2xl">⭐</span>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-[#d3ef95] rounded-full p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <span className="text-2xl">🚀</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Lines */}
      <div>
        {[12, 10, 8, 5, 2].map((height, index) => (
          <motion.div
            key={index}
            className="bg-black w-full mb-5"
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
    </section>
  );
};

export default AboutSection;
