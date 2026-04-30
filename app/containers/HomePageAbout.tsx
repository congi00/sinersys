"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue } from "framer-motion";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { Canvas } from "@react-three/fiber";
import HeroScene from "../components/HeroScene";
import { useRef, useEffect } from "react";
import { detectIOS } from "../support/useViewportHeight";

const MotionArrowUpRight = motion.create(ArrowUpRight);

interface Props {
  progressMotion: MotionValue<number>;
  isMobile: Boolean;
}

export default function HomePageAbout({ progressMotion, isMobile }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const homeTexts = useTranslations("homepage");

  const slide1Opacity = useTransform(progressMotion, [1.6, 1.8], [0, 1]);
  const slide1Y = useTransform(progressMotion, [1.6, 1.8], [120, 0]);
  const titleColor = useTransform(
    progressMotion,
    [3.1, 3.12],
    ["#F4F7FA", "#1c398e"]
  );
  const subtitleColor = useTransform(
    progressMotion,
    [3.1, 3.12],
    ["#F4F7FA82", "#5C8BAF32"]
  );

  // Border radius animato (24px → 0px)
  const borderRadius = useTransform(
    progressMotion,
    [0, 2, 2.8, 3.3],
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
        height: detectIOS() ? "100lvh" : "100dvh",
        marginBottom: "70px",
      }}
      className={clsx(
        "relative",
        "flex w-full",
        "items-center justify-center",
        "text-center",
        "overflow-hidden"
      )}
    >
      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y }}
        className="absolute px-[40px]"
      >
        <motion.h4
          className="
          text-m sm:text-lg mb-3  px-3 sm:px-0 mt-3 sm:mt-5 text-[#a0b8e8] tracking-widest uppercase
          mb-4 whitespace-pre-line [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] items-center sm:justify-center"
          style={{ color: subtitleColor }}
        >
          {homeTexts("slide2.suptitle")}
        </motion.h4>
        <motion.h1
          className="text-3xl sm:text-6xl mt-3 tracking-wide text-[#f4f7fa] font-bold sm:whitespace-pre-line"
          style={{ color: titleColor, lineHeight: "1.1" }}
        >
          {homeTexts("slide2.title")}
        </motion.h1>
        <motion.h2
          className="text-lg sm:text-xl mt-4 sm:mt-5 sm:mb-5 text-[#c8d8f8] font-light whitespace-pre-line"
          style={{ color: titleColor, lineHeight: "1.2" }}
        >
          {homeTexts("slide2.subtitle")}
        </motion.h2>
        
        <div style={{ pointerEvents: "auto" }}>
          <LinkButton
            text={homeTexts("slide2.link")}
            link="/about-us"
            icon={
              <MotionArrowUpRight
                size={20}
                style={{ color: titleColor }}
                className="text-[#f4f7fa]"
              ></MotionArrowUpRight>
            }
            top=""
            color={titleColor}
            fontSize={isMobile ? "19px" : ""}
          ></LinkButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
