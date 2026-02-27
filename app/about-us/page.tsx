"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import AboutUsContainer from "../containers/AboutUsContainer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuButton from "../components/MenuButton";
import clsx from "clsx";
import { detectIOS } from "../support/useViewportHeight";

export default function AboutUsPage() {
  const progressMotion = useMotionValue(0);
  const lenisRef = useRef<Lenis | null>(null);

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
      const progress = (e.scroll / e.limit) * 2;
      progressMotion.set(progress);
    });

    return () => {
      lenis.destroy();
    };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, {
    stiffness: 200,
    damping: 20,
  });

  // Wrapper inset animato
  const wrapperInset = useTransform(smooth, [0, 1, 1.8, 2.3], [16, 0, 0, 16]);

  return (
    <div className="relative min-h-screen">
      <Header />

      <motion.div className="relative bg-[#f4f4fa]">
        <div className={clsx(detectIOS() ? "h-[300lvh]" : "h-[300dvh]")}/>

        <motion.div
          style={{ inset: wrapperInset }}
          className="fixed flex items-center justify-center"
        >
          <AboutUsContainer progressMotion={smooth} />
        </motion.div>
      </motion.div>

      <MenuButton />
      <Footer />
    </div>
  );
}