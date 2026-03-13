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
  const smooth = useSpring(progressMotion, { stiffness: 280, damping: 28 });

  const vh = vhPx || 1;

  // ── HERO (z:10): compressed from the top as textDiv rises ────────────────
  // heroTopInset grows 0→vh in sync with textDiv sliding up.
  // Result: hero appears to be "pushed up and out" by the rising panel.
  const heroTopInset = useTransform(smooth, [0, 1.0], [0, vh]);
  const heroClip = useTransform(heroTopInset, (v) => `inset(0px 0px ${v}px 0px)`);

  // ── TEXT DIV (z:11): slides up from 100vh, synchronized with hero clip ────
  // Enters: progress 0→1.0 (y: vh→0)
  // Exits:  progress 1.5→2.0 (y: 0→-vh) when video starts rising
  const textDivY = useTransform(smooth, [0, 1.0, 1.0, 1.8], [vh, 0, 0, -vh]);
  const textDivRadius = useTransform(smooth, [0, 1.0, 1.4, 1.8], [0, 24, 24, 0]);
  const textDivInset = useTransform(smooth, [0, 1.0, 1.4, 1.8], [0, 16, 16, 0]);

  // ── VIDEO (z:12): same mechanic — textDiv compressed from top as video rises
  // videoTopInset tracks textDiv exit: progress 1.5→2.0, inset 0→vh on textDiv
  // But video itself slides up: progress 1.5→2.0, y: vh→0
  const textDivTopInset = useTransform(smooth, [1.5, 2.0], [0, vh]);
  const textDivClip = useTransform(textDivTopInset, (v) => `inset(${v}px 0px 0px 0px)`);

  const videoY = useTransform(smooth, [1.0, 1.1, 4.6, 5.0], [vh, 0, 0, -vh]);
  const videoOpacity = useTransform(smooth, [1.1, 1.6], [ 0, 1]);

  // Slide 1 text inside video — pure y, no opacity
  const slide1Y = useTransform(smooth, [2.0, 2.4, 3.7, 4.1], [60, 0, 0, -40]);

  // ── Header text color ─────────────────────────────────────────────────────
  const headerTheme = useTransform(smooth, [0.5, 0.7, 4.7, 4.9], [1, 0, 0, 1]);

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

  // ── Derived layout values ─────────────────────────────────────────────────
  // 3 fixed panels (hero, textDiv, video) each consume 1 progress unit of scroll.
  // After progress=5 the video exits and absolute sections begin.
  // ScatteredCards was invisible because its top was too close to About.
  // Spread them out: About at 5vh, Cards at 5.8vh, OurPromise at 6.6vh.
  const totalHeight  = vh * 8 + 900;
  const spacerAbove5 = vh * 5;
  const spacerCards  = vh * 5.8;   // was spacerAbove5 + vh*0.7 → cards hidden under About
  const spacerPromise = vh * 6.6;

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

        {/* ── HEADER ────────────────────────────────────────────────────────
            Receives headerTheme so it can swap text/logo color per panel.
            headerTheme: 0 = dark bg (white text), 1 = light bg (dark text)
        ──────────────────────────────────────────────────────────────────── */}
        {!openContact && <Header headerTheme={headerTheme} />}


        {/* ── HERO (z:10) ───────────────────────────────────────────────────
            Fixed full-screen. clipPath TOP-inset grows 0→vh in sync with
            textDiv rising: hero gets "pushed up" as textDiv covers it.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            clipPath: heroClip,
            zIndex: 10,
          }}
        >
          <HomePage progressMotion={smooth} introFinished={introFinished} heroTopInset={heroTopInset} />
        </motion.div>

        {/* ── TEXT DIV (z:11) ───────────────────────────────────────────────
            Slides up from 100vh (progress 0→1.0) covering the hero.
            clipPath top-inset then grows 0→vh (progress 1.5→2.0) as video
            rises beneath it — same "push up" mechanic applied to textDiv.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: textDivInset,
            y: textDivY,
            clipPath: textDivClip,
            zIndex: 11,
            borderRadius: textDivRadius,
            pointerEvents: "none",
            backgroundColor: "#1c398e",
          }}
          className="flex items-center justify-center px-8"
        >
          <div className="max-w-2xl text-center">
            <p className="text-[1.1rem] sm:text-[1.4rem] text-[#c8d8f8] font-medium leading-relaxed">
              {homeTexts("slide0.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* ── VIDEO (z:12) ──────────────────────────────────────────────────
            Slides up from 100vh (progress 1.5→2.0) covering textDiv.
            No clipPath needed — it's a pure y slide, same as on.energy.
            Holds full-screen during scrub (2→4.6), exits at 4.6→5.0.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            y: videoY,
            opacity: videoOpacity,
            zIndex: 10,
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

          {/* Slide 1 text: pure y-only translation, no opacity */}
          <motion.div
            style={{ y: slide1Y, top: "150px" }}
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
            top: spacerCards,
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
            top: spacerPromise,
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
            top: spacerPromise + vh * (isMobile ? 1.2 : 0.8),
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