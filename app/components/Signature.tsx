import React from "react";
import { motion, useTransform } from "framer-motion";
import { MotionValue } from "framer-motion";

interface SignatureProps {
  progress: MotionValue<number>; // progresso scroll
}

const Signature: React.FC<SignatureProps> = ({ progress }) => {
  const pathLength = useTransform(progress, [3.6, 3.7], [0, 1]);

  return (
    <motion.svg
      viewBox="0 0 500 200"
      width="400"
      fill="none"
    >
      <motion.path
        d="M10 100 C 100 0, 200 200, 300 100"
        stroke="#5C8BAF"
        strokeWidth="3"
        style={{ pathLength }}
      />
    </motion.svg>
  );
};

export default Signature;