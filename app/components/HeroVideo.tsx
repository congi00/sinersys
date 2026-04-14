"use client";

import { useRef } from "react";
import { MotionValue } from "framer-motion";

interface Props {
  progressMotion: MotionValue<number>;
  isMobile: boolean
}

export default function HeroVideo({isMobile}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        aspectRatio: isMobile ? "9 / 16" : "16 / 9",
        zIndex: 1,
      }}
    >
      <img
        ref={imgRef}
        src={isMobile ? "/apwecintro1.gif" : "/apwecintro.gif"}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}