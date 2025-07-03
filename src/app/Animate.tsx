// // components/AnimatedHeroSection.jsx
// "use client";

// import { motion, useAnimationControls } from "framer-motion";
// import Image from "next/image";
// import { useState, useRef, useLayoutEffect } from "react";
// import { OutlineDrawer } from "./OutlineDrawer"; // Import the drawer

// // Dummy component to represent your Abacus
// const Abacus = () => (
//   <div className="w-32 h-32 bg-yellow-300/50 border-2 border-black rounded-lg flex items-center justify-center text-black font-mono">
//     Abacus
//   </div>
// );

// // Variants for fading the actual content in
// const contentVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

// export const AnimatedHeroSection = () => {
//   const [geometries, setGeometries] = useState({});
//   const parentRef = useRef(null);
//   const bannerRef = useRef(null);
//   const leftPanelRef = useRef(null);
//   const rightPanelRef = useRef(null);

//   const outlineControls = useAnimationControls();
//   const contentControls = useAnimationControls();

//   // Measure the components' dimensions and position
//   useLayoutEffect(() => {
//     const measure = () => {
//       const parentRect = parentRef.current?.getBoundingClientRect();
//       const bannerRect = bannerRef.current?.getBoundingClientRect();
//       const leftPanelRect = leftPanelRef.current?.getBoundingClientRect();
//       const rightPanelRect = rightPanelRef.current?.getBoundingClientRect();

//       if (parentRect) {
//         setGeometries({
//           parent: { width: parentRect.width, height: parentRect.height },
//           banner: bannerRect && {
//             x: bannerRect.left - parentRect.left,
//             y: bannerRect.top - parentRect.top,
//             width: bannerRect.width,
//             height: bannerRect.height,
//           },
//           leftPanel: leftPanelRect && {
//             x: leftPanelRect.left - parentRect.left,
//             y: leftPanelRect.top - parentRect.top,
//             width: leftPanelRect.width,
//             height: leftPanelRect.height,
//           },
//           rightPanel: rightPanelRect && {
//             x: rightPanelRect.left - parentRect.left,
//             y: rightPanelRect.top - parentRect.top,
//             width: rightPanelRect.width,
//             height: rightPanelRect.height,
//           },
//         });
//       }
//     };

//     measure(); // Measure on initial render

//     // Define the animation sequence
//     const sequence = async () => {
//       // 1. Start drawing the outline and wait for it to complete
//       await outlineControls.start("visible");
//       // 2. Once drawing is done, fade in the content
//       await contentControls.start("visible");
//     };

//     // A small delay to ensure everything is mounted before starting
//     const timeoutId = setTimeout(sequence, 100);

//     window.addEventListener("resize", measure);
//     return () => {
//       window.removeEventListener("resize", measure);
//       clearTimeout(timeoutId);
//     };
//   }, [outlineControls, contentControls]);

//   return (
//     <section
//       ref={parentRef}
//       className="relative max-w-7xl mx-auto my-16 sm:my-24 px-4 sm:px-6 lg:px-8"
//     >
//       {/* The SVG outline drawer that sits on top */}
//       <OutlineDrawer geometries={geometries} animate={outlineControls} />

//       {/* Your original content, now controlled by Framer Motion */}
//       <motion.div initial="hidden" animate={contentControls}>
//         <div
//           ref={bannerRef}
//           className="w-full h-[100px] bg-[#bfecff] flex items-center justify-center text-center text-2xl md:text-3xl font-medium text-black px-4"
//         >
//           <motion.div variants={contentVariants}>
//             Welcome to The 10X School - Empowering Minds, Transforming Futures
//           </motion.div>
//         </div>

//         <div className="flex flex-col lg:flex-row">
//           <div
//             ref={leftPanelRef}
//             className="w-full lg:w-[60%] px-6 py-12 md:px-12 md:py-16 flex flex-col justify-center bg-white"
//           >
//             <motion.h2
//               variants={contentVariants}
//               className="text-3xl sm:text-4xl md:text-5xl font-bold text-black leading-tight mb-6"
//             >
//               Unlock Your Child's Superpower
//               <br />
//               in Math & Lean Thinking
//             </motion.h2>
//             <motion.p
//               variants={contentVariants}
//               className="text-base md:text-lg text-gray-700 leading-relaxed mb-10 max-w-xl"
//             >
//               Discover online brain development & academic tutoring programs...
//             </motion.p>
//             <motion.div variants={contentVariants}>
//               <motion.button
//                 className="bg-[#bfecff] text-black w-fit px-8 py-4 font-semibold text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] cursor-pointer"
//                 whileHover={{
//                   backgroundColor: "rgba(173, 243, 21, 1)",
//                   transform: "translate(-2px, -2px)",
//                   boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.8)",
//                 }}
//                 whileTap={{
//                   backgroundColor: "rgba(255, 255, 255, 1)",
//                   transform: "translate(2px, 2px)",
//                   boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.8)",
//                 }}
//                 transition={{ duration: 0.2, ease: "easeOut" }}
//               >
//                 Explore Our Programs
//               </motion.button>
//             </motion.div>
//           </div>

//           <div
//             ref={rightPanelRef}
//             className="relative w-full lg:w-[40%] bg-[#D3EF95]/50 flex items-center justify-center p-8 md:p-12"
//           >
//             <motion.div
//               variants={contentVariants}
//               className="w-full h-full flex items-center justify-center"
//             >
//               <div className="absolute top-4 left-4 sm:top-0 sm:left-0 sm:-translate-x-1/4 sm:-translate-y-1/4 z-10 opacity-80 hover:opacity-100 transition-opacity">
//                 <Abacus />
//               </div>
//               <div className="w-full max-w-sm aspect-square">
//                 <div className="w-full h-full border-2 border-black rounded-full overflow-hidden shadow-lg">
//                   <Image
//                     src="/images/child_pic.png"
//                     alt="Child playing with a tablet"
//                     width={500}
//                     height={500}
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>
//     </section>
//   );
// };
