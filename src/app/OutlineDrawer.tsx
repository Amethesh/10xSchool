// // components/OutlineDrawer.jsx
// "use client";

// import { motion, Variants } from "framer-motion";

// // The path-drawing animation variant you provided
// const draw: Variants = {
//   hidden: { pathLength: 0, opacity: 0 },
//   visible: (i: number) => {
//     const delay = i * 0.7; // Stagger the drawing of each box
//     return {
//       pathLength: 1,
//       opacity: 1,
//       transition: {
//         pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
//         opacity: { delay, duration: 0.01 },
//       },
//     };
//   },
// };

// const shapeStyles: React.CSSProperties = {
//   strokeWidth: 2, // A thinner stroke often looks cleaner for UI outlines
//   strokeLinecap: "round",
//   fill: "transparent",
//   stroke: "#000000", // Black stroke to match your design
// };

// // This component receives the calculated dimensions and draws the outlines
// export const OutlineDrawer = ({ geometries, animate }) => {
//   if (!geometries.parent) return null; // Don't render until we have measurements

//   return (
//     <motion.svg
//       width={geometries.parent.width}
//       height={geometries.parent.height}
//       viewBox={`0 0 ${geometries.parent.width} ${geometries.parent.height}`}
//       initial="hidden"
//       animate={animate}
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         pointerEvents: "none", // Allows clicks to pass through to the content below
//       }}
//     >
//       {/* Draw rectangle for the top banner */}
//       {geometries.banner && (
//         <motion.rect
//           x={geometries.banner.x}
//           y={geometries.banner.y}
//           width={geometries.banner.width}
//           height={geometries.banner.height}
//           variants={draw}
//           custom={1} // Animation order
//           style={shapeStyles}
//         />
//       )}
//       {/* Draw rectangle for the left text content */}
//       {geometries.leftPanel && (
//         <motion.rect
//           x={geometries.leftPanel.x}
//           y={geometries.leftPanel.y}
//           width={geometries.leftPanel.width}
//           height={geometries.leftPanel.height}
//           variants={draw}
//           custom={1.5} // Animation order
//           style={shapeStyles}
//         />
//       )}
//       {/* Draw rectangle for the right image content */}
//       {geometries.rightPanel && (
//         <motion.rect
//           x={geometries.rightPanel.x}
//           y={geometries.rightPanel.y}
//           width={geometries.rightPanel.width}
//           height={geometries.rightPanel.height}
//           variants={draw}
//           custom={1.5} // Animation order
//           style={shapeStyles}
//         />
//       )}
//     </motion.svg>
//   );
// };
