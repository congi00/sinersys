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

export default function CallToActionHome({ progressMotion }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const borderRadius = useTransform(progressMotion, [3.6, 4.3, 4.4, 5.1], [24, 0, 0, 24]);

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
      style={{ borderRadius }}
      className={clsx(
        "relative w-full h-full",
        "flex items-center justify-center text-center",
        "overflow-hidden",
        // Nessun bg — transparent come HomePage per preservare tab bar iOS
      )}
    >
      <div ref={canvasContainerRef} className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
          }}
          camera={{ position: [0, 0, 10], fov: 40 }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        >
          <HeroScene progress={progressMotion} />
        </Canvas>
      </div>
    </motion.div>
  );
}