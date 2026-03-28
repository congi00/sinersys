import React from "react";
import { motion, useTransform } from "framer-motion";
import { MotionValue } from "framer-motion";
import Signature from "./Signature";

interface OurPromiseProps {
  title: string;
  subtitle?: string;
  progress: MotionValue<number>;
}

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
  const wordsProgress = useTransform(progress, [3.9, 4.8], [0, words.length]);

  return (
    <div className="w-full px-6 sm:px-16">
      <motion.h1
        className="font-bold"
        style={{
          fontSize: "clamp(1.9rem, 6.5vw, 4.0rem)",
          display:        "flex",
          flexWrap:       "wrap",
          lineHeight: "1.1",
          // Left on mobile, centered on desktop via justifyContent
          justifyContent: "flex-start",
        }}
      >
        {/* Desktop-only centering wrapper — invisible on mobile */}
        <style>{`
          @media (min-width: 640px) {
            .ourpromise-words {
              justify-content: center !important;
            }
          }
        `}</style>
        <span
          className="ourpromise-words"
          style={{
            display:        "flex",
            flexWrap:       "wrap",
            justifyContent: "flex-start",
            width:          "100%",
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
        </span>
      </motion.h1>

      {subtitle && (
        <motion.h2
          className="text-[1.3rem] sm:text-[1.8rem] font-light mt-8 text-left sm:text-center"
          style={{ color: "rgba(200, 216, 248, 0.75)",lineHeight: "1.3" }}
        >
          {subtitle}
        </motion.h2>
      )}

      <Signature progress={progress} />
    </div>
  );
};

export default OurPromise;