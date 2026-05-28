"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Lenis from "lenis";
import Header from "./components/Header";
import clsx from "clsx";
import IntroParticles from "./components/IntroParticles";
import { useTranslations } from "next-intl";
import { useAppSelector } from "./hooks";
import { detectIOS } from "./support/useViewportHeight";
import LiquidBackground from "./components/LiquidBackground";
import CookieBanner from "./components/CookieBanner";
import LinkButton from "./components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { useMotionValueEvent } from "framer-motion";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function WorkInProgressPage() {
  const [mounted, setMounted] = useState(false);
  const progressMotion = useMotionValue(0);
  const [showIntro, setShowIntro] =useState<boolean>(() => {
    // Viene eseguito solo lato client (Next.js SSR: il server non ha sessionStorage)
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("sinersys_intro_seen") !== "true";
  });
  const [introFinished, setIntroFinished] = useState(false);

  const homeTexts = useTranslations("homepage");
  const openContact = useAppSelector((s) => s.siteState.openContact);

  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(1024);

  const isMobile = width <= 768;
  const isIOS = mounted ? detectIOS() : false;
  const vhUnit = isIOS ? "lvh" : "dvh";
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${isIOS?"lvh":"dvh"};pointer-events:none;visibility:hidden;`;
      document.body.appendChild(el);
      setVhPx(el.getBoundingClientRect().height);
      document.body.removeChild(el);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("orientationchange", measure); };
  }, [isIOS]);

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    r(); window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    setContentH(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

//   useEffect(() => {
//     if (isTouchDevice()) {
//       let rafId = 0;
//       let target = 0;
//       let current = 0;

//       const onScroll = () => {
//         const sy    = window.scrollY;
//         const limit = document.documentElement.scrollHeight - window.innerHeight;
//         if (limit > 0) target = Math.min(2.5, (sy / limit) * 2.5);
//       };

//       const tick = () => {
//         // Lerp manuale: 0.1 = smooth ma reattivo su Android
//         current += (target - current) * 0.1;
//         if (Math.abs(target - current) > 0.0001) {
//           progressMotion.set(current);
//         }
//         rafId = requestAnimationFrame(tick);
//       };

//       onScroll();
//       window.addEventListener("scroll", onScroll, { passive: true });
//       rafId = requestAnimationFrame(tick);
//       return () => {
//         window.removeEventListener("scroll", onScroll);
//         cancelAnimationFrame(rafId);
//       };
//     }

//     const lenis = new Lenis({ duration:1.2, smoothWheel:true });
//     let rafId = 0;
//     const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
//     rafId = requestAnimationFrame(raf);
//     lenis.on("scroll", (e: { scroll:number; limit:number }) => {
//       progressMotion.set(Math.min(2, (e.scroll / e.limit) * 2));
//     });
//     return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
//   }, [progressMotion]);

  const smooth = useSpring(progressMotion, 
    { 
      stiffness: isMobile ? 180 : 280,
      damping:   isMobile ? 32  : 28,
      mass:      isMobile ? 0.6 : 1,
    });
  const vh     = vhPx || 1;

  // ── Slide 0 ───────────────────────────────────────────────────────────────
  const slide0Y = useTransform(smooth, [0, 0.6, 0.7], [0, 0, -880]);
  const slide0Opacity = useTransform(smooth, [0, 0.7, 1.0], [1, 1, 0]);

  // ── Header theme ──────────────────────────────────────────────────────────
  // Dark bg (white logo) while circle is up, then switches to light when
  // white section appears after circle shrinks (p 5.2+)
  const headerTheme = useTransform(
    smooth,
    [3, 3.1, 4.7, 4.75, 4.9, 5.9, 6.0, 6.1, 6.2, 6.3 , 7.4, 7.8,8.0,8.2,9.0],
    [0, 1,1,1, 0, 0, 0, 0, 0, 1 , 0, 1, 1, 1, isMobile? 0 : 1 ]
  );
  // ── LinkButton colors ─────────────────────────────────────────────────────
  // Both slides have white text/icon on dark bg

  // ── FAQ ───────────────────────────────────────────────────────────────────
  // Absolute positioned after the white section scroll budget
  const totalHeight = vh

  const themeColor = useTransform(
    smooth,
    [0, 3.0, 3.2, 6.2, 6.4, 9],
    [
      "#0f2057", // dark iniziale
      "#0f2057",
      "#faf4f7", // quando passi al light palette
      "#faf4f7",
      "#f4f7fa", // white section
      "#f4f7fa",
    ]
  );

  useMotionValueEvent(themeColor, "change", (color) => {
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);
  });

  if (!mounted) {
    return <div className="min-h-screen bg-[#0f2057]" />;
  }

  
  return (
    <>
      <LiquidBackground progress={smooth} vhUnit={vhUnit} />

      <motion.div
        style={{ height: totalHeight, pointerEvents: "none" }}
        aria-hidden
      />

      <div
        className={clsx(
          "absolute inset-x-0 top-0",
          showIntro ? "overflow-hidden" : ""
        )}
        style={{ height: totalHeight, zIndex: 1 }}
      >
        <AnimatePresence>
          {showIntro && (
            <IntroParticles
              showIntro={showIntro}
              onFinish={() => {
                sessionStorage.setItem("sinersys_intro_seen", "true");  
                setIntroFinished(true);
                setTimeout(() => setShowIntro(false), 10);
              }}
            />
          )}
        </AnimatePresence>

        {!openContact && <Header headerTheme={headerTheme} />}
        

        {/* ── SLIDE 0 ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: slide0Y,
            opacity: slide0Opacity,
            pointerEvents: "none",
          }}
          className="flex flex-col items-center justify-center px-8 text-center"
        >
          <h1
            style={{ 
              lineHeight: "1.0" ,
            }}
            className="text-3xl sm:text-6xl tracking-wide text-[#f4f7fa] font-bold sm:whitespace-pre-line sm:mt-0 mt-8"
            aria-hidden={false}
          >
            Work in progress website
          </h1>
          <h2
            style={{ lineHeight: isMobile ? "1.1" : "1.1" }}
            className="text-lg sm:text-xl px-3 sm:px-0 mt-3 sm:mt-5 sm:mb-5 whitespace-pre-line text-[#c8d8f8] font-light"
            aria-hidden={false}
          >
            Dreams will come true, new energy generation will be true.
          </h2>
        </motion.div>
      </div>
    </>
  );
}
