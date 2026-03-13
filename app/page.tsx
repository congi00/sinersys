"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";
import HomePage from "./containers/HomePage";
import clsx from "clsx";
import IntroParticles from "./components/IntroParticles";
import HomePageAbout from "./containers/HomePageAbout";
import ScatteredCards from "./components/ScatteredCards";
import OurPromise from "./components/OurPromise";
import { useTranslations } from "next-intl";
import CallToActionHome from "./components/CallToActionHome";
import Footer from "./components/Footer";
import { useAppSelector } from "./hooks";
import { detectIOS } from "./support/useViewportHeight";
import FaqSection from "./components/FaqSection";
import LinkButton from "./components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import LiquidBackground from "./components/LiquidBackground";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function Home() {
  // ── State & refs ──────────────────────────────────────────────────────────
  const progressMotion = useMotionValue(0);
  const scrollY        = useMotionValue(0);
  const [showIntro, setShowIntro]         = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const homeTexts       = useTranslations("homepage");
  const openContact     = useAppSelector((s) => s.siteState.openContact);
  const navigationState = useAppSelector((s) => s.siteState.navigationState);

  const [vhPx, setVhPx]   = useState(0);
  const [width, setWidth]  = useState(0);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width <= 768;
  const isIOS    = detectIOS();
  const vhUnit   = isIOS ? "lvh" : "dvh";

  useEffect(() => {
    const measure = () => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${
        isIOS ? "lvh" : "dvh"
      };pointer-events:none;visibility:hidden;`;
      document.body.appendChild(el);
      setVhPx(el.getBoundingClientRect().height);
      document.body.removeChild(el);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [isIOS]);

  useEffect(() => {
    const lock = showIntro || navigationState === 3;
    document.body.style.overflow            = lock ? "hidden" : "";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow            = "";
      document.documentElement.style.overflow = "";
    };
  }, [showIntro, navigationState]);

  useEffect(() => {
    if (showIntro) return;
    const isTouch = isTouchDevice();
    if (isTouch) {
      const onScroll = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) {
          progressMotion.set(Math.min(8, (sy / limit) * 8));
          scrollY.set(sy);
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } else {
      const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      let rafId: number;
      const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        progressMotion.set(Math.min(8, (e.scroll / e.limit) * 8));
        scrollY.set(e.scroll);
      });
      return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
    }
  }, [progressMotion, scrollY, showIntro]);

  // Video scrubbing: progress 2→4 maps to full video duration
  useMotionValueEvent(progressMotion, "change", (p) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const t = Math.max(0, Math.min(1, (p - 2) / 2));
    video.currentTime = t * video.duration;
  });

  // ── Motion values ─────────────────────────────────────────────────────────
  const smooth = useSpring(progressMotion, { stiffness: 200, damping: 20 });

  // Use vh=1 as safe fallback when vhPx not yet measured.
  // The early return below means these values are never rendered in that state.
  const vh = vhPx || 1;

  const wrapperInset = useTransform(smooth, [0, 0.3, 0.8, 1.0], [16, 0, 0, 0]);
  const heroHeight   = useTransform(
    wrapperInset,
    (v) => `calc(100${vhUnit} - ${v * 2}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );
  const heroTop   = useTransform(wrapperInset, (v) => `calc(${v}px + env(safe-area-inset-top))`);
  const heroLeft  = wrapperInset;
  const heroRight = wrapperInset;
  const heroY     = useTransform(smooth, [0, 1], [0, -vh]);

  const textDivY = useTransform(smooth, [0, 1, 2], [vh, 0, -vh]);
  const videoY   = useTransform(smooth, [1, 2, 4, 5], [vh, 0, 0, -vh]);

  const slide1Opacity = useTransform(smooth, [2.3, 2.6, 3.7, 4.0], [0, 1, 1, 0]);
  const slide1Y       = useTransform(smooth, [2.2, 2.6], [60, 0]);

  const bgColor = useTransform(
    smooth,
    [1.8, 2.0, 4.8, 5.0],
    ["#F4F7FA", "#1c398e", "#1c398e", "#F4F7FA"]
  );

  const aboutExitY = useTransform(smooth, [6.3, 6.5], [0, -vh]);
  const cardsExitY = useTransform(smooth, [6.3, 7.5], [0, -vh]);

  const wrapperCTAInset = useTransform(smooth, [5.6, 6.3, 6.4, 7.1], [16, 0, 0, 16]);
  const ctaHeight = useTransform(
    wrapperCTAInset,
    (v) => `calc(100${vhUnit} - ${v * 2}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );
  const ctaTop    = useTransform(wrapperCTAInset, (v) => `calc(${v}px + env(safe-area-inset-top))`);
  const ctaFrameY = useTransform(
    smooth,
    [5.6, isMobile ? 6.1 : 6.3, isMobile ? 6.2 : 6.4, isMobile ? 7.0 : 7.2],
    ["105%", "0%", "0%", "-105%"]
  );

  // ── Derived layout values (safe to compute always) ────────────────────────
  const totalHeight  = vh * 8 + 900;
  const spacerAbove5 = vh * 5;

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (vhPx === 0) return <div className="min-h-screen bg-[#F4F7FA]" />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Permanent background — fixed behind everything */}
      <LiquidBackground style={{ position: "fixed", inset: 0, zIndex: 0 }} />

      <motion.div
        style={{ height: totalHeight, pointerEvents: "none" }}
        aria-hidden
      />

      <div
        className={clsx("absolute inset-x-0 top-0", showIntro ? "overflow-hidden" : "")}
        style={{ height: totalHeight, zIndex: 1 }}
      >
        <AnimatePresence>
          {showIntro && (
            <IntroParticles
              showIntro={showIntro}
              onFinish={() => {
                setIntroFinished(true);
                setTimeout(() => setShowIntro(false), 10);
              }}
            />
          )}
        </AnimatePresence>

        {!openContact && <Header />}

        {/* ── HERO ──────────────────────────────────────────────────────────
            y: 0 → -vh as progress 0→1. Pure physical scroll, no opacity.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            left: heroLeft,
            right: heroRight,
            top: heroTop,
            height: heroHeight,
            y: heroY,
            zIndex: 10,
          }}
        >
          <HomePage progressMotion={smooth} introFinished={introFinished} />
        </motion.div>

        {/* ── TEXT DIV ──────────────────────────────────────────────────────
            y: +vh → 0 → -vh  (progress 0→1→2).
            Arrives exactly as hero exits. Solid bg prevents bleed-through.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            y: textDivY,
            zIndex: 9,
            pointerEvents: "none",
            backgroundColor: "#1c398e"
          }}
          className="flex items-center justify-center px-8"
        >
          <div className="max-w-2xl text-center">
            <p className="text-[1.1rem] sm:text-[1.4rem] text-[#c8d8f8] font-medium leading-relaxed">
              {homeTexts("slide0.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* ── VIDEO (scrubbed) ──────────────────────────────────────────────
            y: +vh → 0 (progress 1→2), holds 2→4 (scrubbing), exits -vh at 5.
            No opacity — attached flush below textDiv.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            y: videoY,
            zIndex: 8,
          }}
          className="overflow-hidden"
        >
          <video
            ref={videoRef}
            src="/city-loopj.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <motion.div
            style={{ opacity: slide1Opacity, y: slide1Y, top: "150px" }}
            className="absolute px-[20px] z-10 text-center w-full"
          >
            <h4 className="text-[1.15rem] sm:text-[1.7rem] mb-4 whitespace-pre-line text-[#D9D9D9]">
              {homeTexts("slide1.suptitle")}
            </h4>
            <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] font-bold">
              {homeTexts("slide1.title")}
            </h1>
            <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] font-light">
              {homeTexts("slide1.subtitle")}
            </h2>
            <LinkButton
              text={homeTexts("slide1.link")}
              link={"apwec"}
              icon={<ArrowUpRight size={20} className="text-[#f4f7fa]" />}
              top="200px"
            />
          </motion.div>
        </motion.div>

        {/* ── ABOUT ─────────────────────────────────────────────────────────
            Absolute at 5*vh — appears exactly when video exits at progress=5.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            top: spacerAbove5,
            left: 0,
            right: 0,
            y: aboutExitY,
          }}
          className="flex items-start justify-center"
        >
          <HomePageAbout progressMotion={smooth} />
        </motion.div>

        {/* ── ScatteredCards ─────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            top: spacerAbove5 + vh * 0.7,
            left: 0,
            right: 0,
            minHeight: `100${vhUnit}`,
            y: cardsExitY,
          }}
          className="flex items-start justify-center w-full"
        >
          <ScatteredCards
            items={[
              { id: "1", image: "/images/1.jpg", label: "descrizione 1" },
              { id: "2", image: "/images/2.jpg", label: "descrizione 2" },
              { id: "3", image: "/images/3.jpg", label: "descrizione 3" },
            ]}
            progress={progressMotion}
          />
        </motion.div>

        {/* ── OurPromise ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: spacerAbove5 + vh * 1.6,
            left: 0,
            right: 0,
            minHeight: `100${vhUnit}`,
          }}
          className="flex items-start justify-center px-5"
        >
          <OurPromise
            title={homeTexts("slide3.title")}
            subtitle={homeTexts("slide3.subtitle")}
            progress={smooth}
          />
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            left: wrapperCTAInset,
            right: wrapperCTAInset,
            top: ctaTop,
            height: ctaHeight,
            y: ctaFrameY,
            background: "transparent",
            zIndex: 10,
          }}
          className="flex items-center justify-center"
        >
          <CallToActionHome progressMotion={smooth} />
        </motion.div>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: spacerAbove5 + vh * (isMobile ? 2.8 : 2.0),
            left: 0,
            right: 0,
          }}
          className="flex items-start justify-center"
        >
          <FaqSection
            progress={smooth}
            progressStart={isMobile ? 6.6 : 6.7}
            title={homeTexts("faq.title")}
            suptitle="FAQ"
            items={[
              { question: homeTexts("faq.q1"), answer: homeTexts("faq.a1") },
              { question: homeTexts("faq.q2"), answer: homeTexts("faq.a2") },
              { question: homeTexts("faq.q3"), answer: homeTexts("faq.a3") },
              { question: homeTexts("faq.q4"), answer: homeTexts("faq.a4") },
              { question: homeTexts("faq.q5"), answer: homeTexts("faq.a5") },
            ]}
          />
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <Footer />
        </div>

        {!openContact && <MenuButton />}
      </div>
    </>
  );
}