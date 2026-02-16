"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue } from "framer-motion";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function HomePage({ progressMotion }: Props) {
  const homeTexts = useTranslations("homepage");

  // Crossfade
  const slide0Opacity = useTransform(progressMotion, [0, 0.15], [1, 0]);
  const slide0Y = useTransform(progressMotion, [0, 0.15], [0, -120]);

  const slide1Opacity = useTransform(progressMotion, [0.85, 1], [0, 1]);
  const slide1Y = useTransform(progressMotion, [0.85, 1], [120, 0]);

  // Border radius animato (24px → 0px)
  const borderRadius = useTransform(progressMotion, [0, 1], [24, 0]);

  return (
      <motion.div
        style={{
          borderRadius,
        }}
        className={clsx(
          "relative",
          "flex w-full",
          "items-center justify-center",
          "text-center",
          "bg-[#cccccc]",
          "overflow-hidden",
          "h-[100dvh]"
        )}
      >
        <motion.div style={{ opacity: slide0Opacity, y: slide0Y }} className="absolute px-[60px]">
          <h1 className="text-[2.25rem] text-white line-height-40 font-extrabold">{homeTexts("slide0.title")}</h1>
          <h2 className="text-[1.25rem] mt-4 whitespace-pre-line text-white line-height-20 font-medium">
            {homeTexts("slide0.subtitle")}
          </h2>
        </motion.div>

        <motion.div style={{ opacity: slide1Opacity, y: slide1Y }} className="absolute px-[60px]">
          <h4 className="text-[1.25rem] mb-4 whitespace-pre-line text-[#D9D9D9] line-height-20 font-semibold ">
            {homeTexts("slide1.suptitle")}
          </h4>
          <h1 className="text-[2.25rem] text-white line-height-40 font-extrabold">{homeTexts("slide1.title")}</h1>
          <h2 className="text-[1.25rem] mt-4 whitespace-pre-line text-white line-height-20 font-medium ">
            {homeTexts("slide1.subtitle")}
          </h2>
        </motion.div>
      </motion.div>
  );
}
