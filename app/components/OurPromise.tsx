import React from "react";
import { motion, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { MotionValue } from "framer-motion";
import Signature from "./Signature";

interface OurPromiseProps {
  title: string;
  subtitle?: string;
  progress: MotionValue<number>;
}

// The circle background is #1c398e (dark blue).
// Active words → bright white #f4f7fa
// Inactive words → muted blue-white rgba(244,247,250,0.35)
// Subtitle → soft blue #a0c4e8

function Word({
  word,
  index,
  wordsProgress,
}: {
  word: string;
  index: number;
  wordsProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    wordsProgress,
    [index - 0.3, index + 0.3],
    [0.28, 1]
  );

  return (
    <motion.span
      style={{
        whiteSpace: "pre",
        marginRight: "0.5rem",
        color: "#f4f7fa",
        opacity,
      }}
    >
      {word}
    </motion.span>
  );
}

const OurPromise: React.FC<OurPromiseProps> = ({ title, subtitle, progress }) => {
  const words = title.split(" ");

  // Words animate from p 3.9 → 4.8 (after circle is fully expanded at 3.8)
  const wordsProgress = useTransform(progress, [3.9, 4.8], [0, words.length]);

  return (
    <div className="w-full px-6 sm:px-16 sm:text-center">
      <motion.h1
        className="text-[2.6rem] sm:text-[4.2rem] font-bold"
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign: "left",
          lineHeight: 1.15,
        }}
      >
        {words.map((word, i) => (
          <Word
            key={i}
            word={word}
            index={i}
            wordsProgress={wordsProgress}
          />
        ))}
      </motion.h1>

      {subtitle && (
        <motion.h2
          className="text-[1.4rem] sm:text-[2rem] font-light mt-8"
          style={{ color: "rgba(200, 216, 248, 0.75)" }}
        >
          {subtitle}
        </motion.h2>
      )}

      <Signature progress={progress} />
    </div>
  );
};

export default OurPromise;