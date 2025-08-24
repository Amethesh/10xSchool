import { ArrowRight } from "lucide-react";
import { Variants } from "motion/react";
import * as motion from "motion/react-client";

const EducationalVisionComponent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <motion.div className="lg:col-span-2 relative" variants={itemVariants}>
          <motion.div
            className="relative h-96 lg:h-full overflow-hidden border-2 border-black"
            style={{ boxShadow: "4px 4px 0 0 #000" }}
            whileHover={{
              boxShadow: "8px 8px 0 0 #000",
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          >
            <div className="absolute inset-0 bg-white"></div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-amber-100 to-blue-200 opacity-30"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <motion.h1
                  className="text-4xl lg:text-5xl font-bold text-black leading-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                >
                  Our ambitious vision is to empower{" "}
                  <motion.span
                    className="text-[#adf315] stroke-black stroke-1"
                    style={{
                      WebkitTextStroke: "1px #222",
                      textShadow: "0 1px 4px #2228",
                    }}
                    animate={{
                      textShadow: [
                        "0 1px 4px #2228",
                        "0 4px 8px #2228",
                        "0 1px 4px #2228",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    1 million
                  </motion.span>
                  <br />
                  students by 2030
                </motion.h1>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute bottom-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-sm"
              variants={floatingVariants}
              animate="animate"
            ></motion.div>
            <motion.div
              className="absolute top-8 right-8 w-12 h-12 bg-yellow-300/30 rounded-full blur-sm"
              variants={pulseVariants}
              animate="animate"
            ></motion.div>
            <motion.div
              className="absolute bottom-8 right-12 w-20 h-20 bg-blue-300/20 rounded-full blur-sm"
              animate={{
                x: [-5, 5, -5],
                y: [5, -5, 5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* Side Panels */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Personal Development Programs */}
          <motion.div
            className="bg-[#bfecff] p-6 border-2 border-black"
            style={{ boxShadow: "4px 4px 0 0 #000" }}
            whileHover={{
              boxShadow: "8px 8px 0 0 #000",
              x: -2,
              y: -2,
              transition: { duration: 0.2 },
            }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                className="text-xl font-bold text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                Personal development programs
              </motion.h2>
              {/* <motion.div
                className="bg-white p-2"
                style={{ boxShadow: "1px 4px 0 0 #000" }}
                whileHover={{
                  scale: 1.1,
                  rotate: 45,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </motion.div> */}
            </div>
            <motion.div
              className="space-y-3 text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              {[
                "Certificates after each level",
                "Study kits",
                "Engaging activities",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.8 + index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* School & Institute Tie-Ups */}
          <motion.div
            className="bg-[#cbffa9] p-6 shadow-lg border-2 border-black"
            style={{ boxShadow: "4px 4px 0 0 #000" }}
            whileHover={{
              boxShadow: "8px 8px 0 0 #000",
              x: -2,
              y: -2,
              transition: { duration: 0.2 },
            }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                className="text-xl font-bold text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                School & Institute Tie-Ups
              </motion.h2>
              {/* <motion.div
                className="bg-white p-2"
                style={{ boxShadow: "1px 4px 0 0 #000" }}
                whileHover={{
                  scale: 1.1,
                  rotate: 45,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </motion.div> */}
            </div>
            <motion.div
              className="space-y-3 text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              {[
                "Co-curricular Programs",
                "Customizable Academic Enrichment Modules",
                "Comprehensive training for instructors",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.0 + index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EducationalVisionComponent;
