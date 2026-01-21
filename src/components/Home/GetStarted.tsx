import * as motion from "motion/react-client";

const GetStarted = () => {
 
  return (
    <section className="mt-20 w-full bg-[#ff7cb5] h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-[#fff07c] rounded-full opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-20"
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-12 h-12 bg-[#fff07c] rounded-full opacity-30"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center" // Centering container
      >
        <motion.p
          className="text-2xl font-semibold mb-8 text-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Ready to Unlock Your Child&apos;s 10X Potential?
        </motion.p>

        {/* --- REPLACEMENT BUTTON (Using Option 2: 3D Push) --- */}
        <motion.button
          className="font-semibold bg-[#fff07c] text-black text-5xl px-20 py-8 rounded-2xl border-b-8 border-t-2 border-x-2 border-[#e0c800]"
          whileHover={{ y: -4 }}
          whileTap={{ y: 6, borderBottomWidth: "2px", borderTopWidth: "2px" }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: "easeOut",
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <a
            href="/book-demo"
            // href="https://docs.google.com/forms/d/e/1FAIpQLSek5rcxkKm8IFUl1oQ45SXhnMv0JZBw3r4qX7VX8ho-pYclAA/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10"
          >
            Book a Demo
          </a>
        </motion.button>
        {/* --- END REPLACEMENT BUTTON --- */}

        {/* Animated arrow pointing to button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="text-black text-2xl"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ↓
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pulsing ring animation around the section - not needed with new button styles but kept for effect */}
      <motion.div
        className="absolute inset-0 border-4 border-white rounded-full opacity-20 pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
};

export default GetStarted;
