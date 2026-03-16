import React from "react";
import { motion, useTransform } from "framer-motion";
import { MotionValue } from "framer-motion";

interface SignatureProps {
  progress: MotionValue<number>;
}

const Signature: React.FC<SignatureProps> = ({ progress }) => {
  // Draws after words finish (~p 4.8), completes at p 5.0
  const pathLength = useTransform(progress, [4.8, 5.0], [0, 1]);
  const opacity    = useTransform(progress, [4.75, 4.9], [0, 1]);

  return (
    <motion.div
      className="mt-8 sm:flex sm:justify-center"
      style={{ opacity }}
    >
      <motion.svg
        viewBox="0 0 500 120"
        width="320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main signature stroke — white on dark blue */}
        <motion.path
          d="M20 80 C 60 20, 120 100, 180 60 C 240 20, 280 90, 340 55 C 380 35, 420 70, 470 50"
          stroke="rgba(244,247,250,0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength }}
        />
        {/* Underline flourish */}
        <motion.path
          d="M20 95 C 160 105, 320 95, 470 98"
          stroke="rgba(200,216,248,0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </motion.svg>
    </motion.div>
  );
};

export default Signature;