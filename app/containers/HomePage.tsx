"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue } from "framer-motion";
import { useEffect } from "react";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function HomePage({ progressMotion }: Props) {
  const homeTexts = useTranslations("homepage");

  // Crossfade
  const slide0Opacity = useTransform(progressMotion, [0, 1], [1, 0]);
  const slide1Opacity = useTransform(progressMotion, [0, 1], [0, 1]);

  // Parallax verticale
  const slide0Y = useTransform(progressMotion, [0, 1], [0, -60]);
  const slide1Y = useTransform(progressMotion, [0, 1], [60, 0]);

  // Border radius animato (24px → 0px)
  const borderRadius = useTransform(progressMotion, [0, 1], [24, 0]);

  return (
      <motion.div
        style={{
          borderRadius,
        }}
        className={clsx(
          "relative",
          "flex w-full h-full",
          "items-center justify-center",
          "text-center",
          "font-extrabold",
          "bg-[#004D8A]",
          "overflow-hidden"
        )}
      >
        <motion.div style={{ opacity: slide0Opacity, y: slide0Y }} className="absolute">
          <h1 className="text-[2.25rem] text-white">{homeTexts("slide0.title")}</h1>
          <h2 className="text-[1.25rem] mt-4 whitespace-pre-line text-white">
            {homeTexts("slide0.subtitle")}
          </h2>
        </motion.div>

        <motion.div style={{ opacity: slide1Opacity, y: slide1Y }} className="absolute">
          <h1 className="text-[2.25rem] text-white">{homeTexts("slide1.title")}</h1>
          <h2 className="text-[1.25rem] mt-4 whitespace-pre-line text-white">
            {homeTexts("slide1.subtitle")}
          </h2>
        </motion.div>
      </motion.div>
  );
}
