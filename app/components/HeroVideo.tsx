"use client";

import { useEffect, useRef } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function HeroVideo({ progressMotion }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = "auto";
    el.load();
  }, []);

  useMotionValueEvent(progressMotion, "change", (p) => {
    const el = videoRef.current;
    if (!el || !el.duration || isNaN(el.duration)) return;

    // Il video è visibile tra p=0.7 e p=1.85 (allineato con modelPhaseAOpacity)
    const rangeStart = 0.7;
    const rangeEnd   = 1.85;
    const fraction   = Math.max(0, Math.min(1, (p - rangeStart) / (rangeEnd - rangeStart)));

    el.currentTime = fraction * el.duration;
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 1 }}>
      <video
        ref={videoRef}
        src="/intros.mp4"
        muted
        playsInline
        style={{
          position:  "absolute",
          inset:     0,
          width:     "100%",
          height:    "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}


