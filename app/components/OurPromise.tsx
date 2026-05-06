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

const OurPromise: React.FC<OurPromiseProps> = ({
  title,
  subtitle,
  progress,
}) => {
  const words = title.split(" ");
  const wordsProgress = useTransform(progress, [4.9, 5.8], [0, words.length]);

  return (
    <div className="w-full px-6 sm:px-16 flex flex-col items-center">
      <motion.h1
        className="text-3xl font-stretch-extra-expanded tracking-wide sm:text-6xl text-[#f4f7fa] font-bold leading-tight w-full"
        style={{
          display: "flex",
          flexWrap: "wrap",
          lineHeight: "1.1",
        }}
      >
        <style>{`
          .ourpromise-words {
            justify-content: center;
          }
        `}</style>
  
        <span
          className="ourpromise-words"
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {words.map((word, i) => (
            <Word key={i} word={word} index={i} wordsProgress={wordsProgress} />
          ))}
        </span>
      </motion.h1>
  
      {subtitle && (
        <motion.h2
          className="text-lg font-stretch-extra-expanded tracking-wide sm:text-2xl font-light mt-4 sm:mt-8 text-center max-w-[900px]"
          style={{
            color: "rgba(200, 216, 248, 0.75)",
            lineHeight: "1.2",
          }}
        >
          {subtitle}
        </motion.h2>
      )}
  
      <div className="w-full flex justify-center mt-6">
        <Signature progress={progress} />
      </div>
    </div>
  );
};

export default OurPromise;
