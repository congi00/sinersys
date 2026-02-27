"use client";

import clsx from "clsx";
import { motion, useTransform, MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function AboutUsContainer({ progressMotion }: Props) {
  const aboutTexts = useTranslations("aboutus");

  // Crossfade slide
  const slide0Opacity = useTransform(progressMotion, [0, 0.2], [1, 0]);
  const slide0Y = useTransform(progressMotion, [0, 0.2], [0, -120]);

  const slide1Opacity = useTransform(progressMotion, [0.6, 0.8], [0, 1]);
  const slide1Y = useTransform(progressMotion, [0.6, 0.8], [120, 0]);

  // Inset animato come homepage
  const borderRadius = useTransform(
    progressMotion,
    [0, 1, 1.8, 2.3],
    [24, 0, 0, 24]
  );

  return (
    <motion.div
      style={{ borderRadius }}
      className={clsx(
        "relative flex w-full h-full items-center justify-center",
        "overflow-hidden"
      )}
    >
      {/* IMMAGINE BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src="/aboutus.png"
          alt="About background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* SLIDE 0 */}
      <motion.div
        style={{ opacity: slide0Opacity, y: slide0Y }}
        className="absolute px-[60px] text-center"
      >
        <h1 className="text-[2.5rem] text-white font-extrabold">
          {aboutTexts("slide0.title")}
        </h1>
        <h2 className="text-[1.25rem] mt-4 text-white font-medium whitespace-pre-line">
          {aboutTexts("slide0.subtitle")}
        </h2>
      </motion.div>

      {/* SLIDE 1 */}
      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y }}
        className={clsx("absolute text-center")}
      >
        <h1 className="text-[2.5rem] text-white font-extrabold">
          {aboutTexts("slide1.title")}
        </h1>
        <motion.div
          style={{ opacity: slide1Opacity, y: slide1Y }}
          className={clsx(
            "absolute px-[25px] text-center",
            "bg-[#F4F7FA]/20 backdrop-blur-xl backdrop-saturate-150",
            "shadow-[12px_12px_32px_rgba(0,0,0,0.18)]",
            "border border-[#F4F7FA]/30",
            "py-4",
            "mx-10",
            "rounded-3xl",
            "after:absolute after:inset-0",
            "after:rounded-3xl",
            "after:border after:border-white/20",
            "after:pointer-events-none",
            "before:absolute before:inset-0",
            "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.15)_10%,rgba(255,255,255,0)_20%)]",
            "before:pointer-events-none"
          )}
        >
          <h2 className="text-[1.25rem] mt-4 text-white font-medium whitespace-pre-line">
            {aboutTexts("slide1.subtitle")}
          </h2>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
