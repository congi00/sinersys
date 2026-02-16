"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";
import HomePage from "./containers/HomePage";

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null);
  const progressMotion = useMotionValue(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      const progress = e.scroll / e.limit
      progressMotion.set(progress)
    })

    return () => {
      lenis.destroy();
    };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, {
    stiffness: 200,
    damping: 20,
  });

  // Animazione padding wrapper
  const wrapperPadding = useTransform(smooth, [0, 1], [16, 0]);

  return (
    <div className="relative bg-[#F4F7FA]">
      <div className="h-[200vh]" />
      <Header />
      <motion.div
        style={{ padding: wrapperPadding }}
        className="flex w-full h-full items-center justify-center fixed inset-0"
      >
        <HomePage progressMotion={smooth} />
      </motion.div>
      <MenuButton />
    </div>
  );
}
