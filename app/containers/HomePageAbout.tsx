"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue } from "framer-motion";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { Canvas } from "@react-three/fiber";
import HeroScene from "../components/HeroScene";
import { useRef, useEffect } from "react";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function HomePageAbout({ progressMotion }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const homeTexts = useTranslations("homepage");

  // Crossfade
  const slide0Opacity = useTransform(progressMotion, [0, 0.2], [1, 0]);
  const slide0Y = useTransform(progressMotion, [0, 0.2], [0, -120]);

  const slide1Opacity = useTransform(progressMotion, [0.6, 0.8], [0, 1]);
  const slide1Y = useTransform(progressMotion, [0.6, 0.8], [120, 0]);
  const titleColor = useTransform(
    progressMotion,
    [2.1, 2.12],
    ["#1c398e", "#F4F7FA"]
  );
  const subtitleColor = useTransform(
    progressMotion,
    [2.1, 2.12],
    ["#5C8BAF32", "#F4F7FA82"]
  );

  // Border radius animato (24px → 0px)
  const borderRadius = useTransform(
    progressMotion,
    [0, 1, 1.8, 2.3],
    [24, 0, 0, 24]
  );

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      style={{
        borderRadius,
      }}
      className={clsx(
        "relative",
        "flex w-full",
        "h-full",
        "items-center justify-center",
        "text-left",
        "overflow-hidden"
      )}
    >
      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y }}
        className="absolute px-[60px]"
      >
        <motion.h4
          className="text-[1.25rem] mb-4 whitespace-pre-line [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] line-height-20 font-semibold flex items-center"
          style={{ color: subtitleColor }}
        >
          <motion.div
            className="h-[3px] w-[50px] bg-[#5C8BAF62] [shadow:0_0px_0px_rgba(0,0,0,0.2)] mr-2"
            style={{ backgroundColor: subtitleColor }}
          ></motion.div>
          {homeTexts("slide2.suptitle")}
        </motion.h4>
        <motion.h1
          className="text-[2.25rem] line-height-40 font-extrabold"
          style={{ color: titleColor }}
        >
          {homeTexts("slide2.title")}
        </motion.h1>
        <motion.h2
          className="text-[1.25rem] mt-4 whitespace-pre-line line-height-20 font-medium "
          style={{ color: titleColor }}
        >
          {homeTexts("slide2.subtitle")}
        </motion.h2>
        <LinkButton
          text={homeTexts("slide2.link")}
          link={""}
          icon={<ArrowUpRight size={20} className="text-white"></ArrowUpRight>}
        ></LinkButton>
      </motion.div>
    </motion.div>
  );
}
