import React, { useRef } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { MotionValue, useTransform, useMotionValue } from "framer-motion";
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
  progress,
}: {
  word: string;
  index: number;
  wordsProgress: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const wordColor = useMotionValue("#aaaaaa");

  const activeColor = useTransform(
    progress,
    [2.1, 2.5, 3.5, 3.6],
    ["#1c398e", "#f4f7fa", "#f4f7fa", "#1c398e"]
  );
  const inactiveColor = useTransform(
    progress,
    [2.1, 2.5, 3.5, 3.6],
    ["#aaaaaa", "#5c8baf", "#5c8baf", "#aaaaaa"]
  );

  const updateColor = () => {
    const active = wordsProgress.get() >= index + 0.5;
    wordColor.set(active ? activeColor.get() : inactiveColor.get());
  };

  useMotionValueEvent(wordsProgress, "change", updateColor);
  useMotionValueEvent(progress, "change", updateColor);

  return (
    <motion.span style={{ whiteSpace: "pre", marginRight: "0.5rem", color: wordColor }}>
      {word}
    </motion.span>
  );
}

const OurPromise: React.FC<OurPromiseProps> = ({ title, subtitle, progress }) => {
  const words = title.split(" ");
  const wordsProgress = useTransform(progress, [3.2, 3.6], [0, words.length]);

  const subtitleColor = useTransform(
    progress,
    [2.1, 2.2, 3.5, 3.6],
    ["#5C8BAF", "#f4f7fa", "#f4f7fa", "#5C8BAF"]
  );

  return (
    <div className="sm:whitespace-pre-line w-full px-6 sm:text-center">
      <motion.h1
        className="text-[3.0rem] sm:text-[4.2rem] font-bold line-height-40 sm:justify-center flex-start"
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign: "left",
        }}
      >
        {words.map((word, i) => (
          <Word
            key={i}
            word={word}
            index={i}
            wordsProgress={wordsProgress}
            progress={progress}
          />
        ))}
      </motion.h1>
      {subtitle && (
        <motion.h2
          className="text-[1.65rem] sm:text-[2.25rem] line-height-40 font-light"
          style={{ marginTop: "2rem", color: subtitleColor }}
        >
          {subtitle}
        </motion.h2>
      )}
      <Signature progress={progress} />
    </div>
  );
};

export default OurPromise;