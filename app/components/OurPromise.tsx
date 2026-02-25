import React from "react";
import { motion, Variants, useAnimation } from "framer-motion";
import { MotionValue, useTransform } from "framer-motion";
import Signature from "./Signature";

interface OurPromiseProps {
  title: string;
  subtitle?: string;
  disabledColor?: string;
  enabledColor?: string;
  progress: MotionValue<number>; // progress derivato da Lenis
}

const OurPromise: React.FC<OurPromiseProps> = ({
  title,
  subtitle,
  disabledColor = "#999",
  enabledColor = "#000",
  progress,
}) => {
  const controls = useAnimation();

  const wordVariants: Variants = {
    hidden: { color: disabledColor },
    visible: { color: enabledColor, transition: { duration: 0.2 } },
  };

  const words = title.split(" ");
  const wordsProgress = useTransform(progress, [3.2, 3.6], [0, words.length]);

  React.useEffect(() => {
    const unsubscribe = wordsProgress.on("change", (value) => {
      const wordsCount = Math.floor(value);
      controls.start((i) => (i < wordsCount ? "visible" : "hidden"));
    });

    return () => unsubscribe();
  }, [wordsProgress, controls]);

  return (
    <div className="text-center whitespace-pre-line">
      <motion.h1
        style={{
          fontSize: "1.9rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          textTransform: "uppercase",
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={wordVariants}
            initial="hidden"
            animate={controls}
            style={{ whiteSpace: "pre", marginRight: "0.5rem" }} // spazio tra le parole
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      {subtitle && (
        <motion.h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2rem" }}
        >
          {subtitle}
        </motion.h2>
      )}
      <Signature progress={progress} />
    </div>
  );
};

export default OurPromise;
