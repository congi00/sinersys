"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";
import HomePage from "./containers/HomePage";
import clsx from "clsx";
import IntroParticles from "./components/IntroParticles";

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null);
  const progressMotion = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (showIntro) return;

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
      const progress = (e.scroll / e.limit) * 3;
      progressMotion.set(progress);
    });

    return () => {
      lenis.destroy();
    };
  }, [progressMotion,showIntro]);

  const smooth = useSpring(progressMotion, {
    stiffness: 200,
    damping: 20,
  });

  const frameY = useTransform(smooth, [1.5, 2.5], ["0%", "-100%"]);

  // Animazione padding wrapper
  const wrapperPadding = useTransform(smooth, [0, 1, 1.8, 2.3], [16, 0, 0, 16]);
  const AboutOpacity = useTransform(smooth, [1, 1.2], [0, 1]);

  return (
    <div className={clsx(
      "relative min-h-screen max-h-screen",
      showIntro ? "overflow-hidden" : ""
    )}>
      <AnimatePresence>
        {showIntro && <IntroParticles showIntro={showIntro} onFinish={() => setTimeout(() => setShowIntro(false), 10)} />}
      </AnimatePresence>
      <div className="relative bg-[#F4F7FA]">
        <div className="h-[400vh]" />
        <Header />
        <motion.div
          style={{ padding: wrapperPadding, y: frameY }}
          className={clsx(
            "flex w-full h-full items-center justify-center inset-0 fixed"
          )}
        >
          <HomePage progressMotion={smooth} />
        </motion.div>
        <motion.div
          style={{ opacity: AboutOpacity }}
          className="h-[100vh] flex items-start justify-center pt-20 bg-[red]"
        ></motion.div>
        <MenuButton />
      </div>
    </div>
  );
}
