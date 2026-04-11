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

const MotionArrowUpRight = motion.create(ArrowUpRight)

interface Props {
  progressMotion: MotionValue<number>;
  isMobile: Boolean;
}

export default function HomePageAbout({ progressMotion, isMobile }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const homeTexts = useTranslations("homepage");

  const slide1Opacity = useTransform(progressMotion, [0.6, 0.8], [0, 1]);
  const slide1Y = useTransform(progressMotion, [0.6, 0.8], [120, 0]);
  const titleColor = useTransform(
    progressMotion,
    [2.1, 2.12],
    ["#F4F7FA", "#1c398e"]
  );
  const subtitleColor = useTransform(
    progressMotion,
    [2.1, 2.12],
    ["#F4F7FA82", "#5C8BAF32" ]
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
        height: detectIOS() ? "100lvh" : "100dvh",
        marginBottom: "70px"
      }}
      className={clsx(
        "relative",
        "flex w-full",
        "items-center justify-center",
        "text-left",
        "overflow-hidden",
      )}
    >
      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y }}
        className="absolute px-[40px] sm:text-center"
      >
        <motion.h4
          className="text-[1rem] sm:text-[1.3rem] tracking-widest uppercase mb-4 whitespace-pre-line [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] line-height-20 font-regular flex items-center sm:justify-center"
          style={{ color: subtitleColor }}
        >
          <motion.div
            className="h-[1px] w-[50px] bg-[#5C8BAF62] sm:hidden [shadow:0_0px_0px_rgba(0,0,0,0.2)] mr-2"
            style={{ backgroundColor: subtitleColor }}
          ></motion.div>
          {homeTexts("slide2.suptitle")}
        </motion.h4>
        <motion.h1
          className="text-3xl font-stretch-extra-expanded tracking-wide sm:text-7xl font-bold whitespace-pre-line"
          style={{ color: titleColor, lineHeight: "1.1"}}
        >
          {homeTexts("slide2.title")}
        </motion.h1>
        <motion.h2
          className="text-xl font-stretch-extra-expanded tracking-wide sm:text-2xl mt-4 whitespace-pre-line font-light "
          style={{ color: titleColor, lineHeight: "1.3" }}
        >
          {homeTexts("slide2.subtitle")}
        </motion.h2>
        <LinkButton
          text={homeTexts("slide2.link")}
          link={"/about-us"}
          icon={<MotionArrowUpRight size={20} style={{color: titleColor}} className="text-white"></MotionArrowUpRight>}
          top={isMobile ? "-20px" : ""}
          color={titleColor}
        ></LinkButton>
      </motion.div>
    </motion.div>
  );
}
