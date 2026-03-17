"use client";

import { useEffect, useState } from "react";
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
import LiquidBackground from "./components/LiquidBackground";
import HeroModel from "./components/HeroModel";
import ContactDrawer from "./components/ContactDrawer";
import { setNavigationState, setOpenContact } from "./features/counterSlice";
import { useAppDispatch } from "./hooks";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function Home() {
  const progressMotion = useMotionValue(0);
  const scrollY        = useMotionValue(0);
  const [showIntro, setShowIntro]         = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  const homeTexts       = useTranslations("homepage");
  const openContact     = useAppSelector((s) => s.siteState.openContact);
  const navigationState = useAppSelector((s) => s.siteState.navigationState);
  const dispatch        = useAppDispatch();

  const [vhPx, setVhPx]  = useState(0);
  const [width, setWidth] = useState(0);

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
      let rafId = 0;
      const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        progressMotion.set(Math.min(8, (e.scroll / e.limit) * 8));
        scrollY.set(e.scroll);
      });
      return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
    }
  }, [progressMotion, scrollY, showIntro]);

  const smooth = useSpring(progressMotion, { stiffness: 280, damping: 28 });
  const vh     = vhPx || 1;

  // ── TIMELINE ──────────────────────────────────────────────────────────────
  // 0           slide0 + model bottom
  // 0→1.1       slide0 exits, LiquidBg fullscreen, model → top-right, slide1 enters
  // 1.1→1.8     slide1 + model hold
  // 1.8→2.8     slide1 exits, HomePageAbout enters + sticky
  // 2.8→3.4     HomePageAbout exits
  // 3.7→3.8     circle expands (covers screen)
  // 3.9→4.3     OurPromise enters (fixed, above circle)
  // 4.3→5.0     OurPromise sticky, words animate (3.7→4.6 in component)
  // 5.0→6.6     ScatteredCards
  // 6.6→7.2     ... (future)

  // ── Slide 0 ───────────────────────────────────────────────────────────────
  const slide0Y       = useTransform(smooth, [0, 0.2, 0.6], [0, 0, -880]);
  const slide0Opacity = useTransform(smooth, [0, 0.7, 1.0], [1, 1, 0]);
  const slide0Clip    = useTransform(smooth,
    [0, 0.3, 0.7],
    ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
  );

  // ── Slide 1 ───────────────────────────────────────────────────────────────
  const slide1Y       = useTransform(smooth, [0.7, 1.1, 1.6, 1.8], [80, 0, 0, -880]);
  const slide1Opacity = useTransform(smooth, [0.7, 1.1, 2.1, 2.5], [0, 1, 1, 0]);
  const slide1Clip    = useTransform(smooth,
    [0.7, 1.1, 1.6, 1.8],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
  );

  // ── Model ─────────────────────────────────────────────────────────────────
  // Initial state: fixed bottom, left 5vw, right 5vw, height 30vh.
  // Visible immediately (opacity starts at 1).
  //
  // Transition to top-right (p 0.7→1.1):
  //   The model container is positioned from left:5vw/bottom:0.
  //   We translate it using viewport-relative values:
  //   - translateX: 0 → move right so right edge is ~3vw from screen right
  //     The container is 90vw wide. To place it top-right at ~30vw wide:
  //     We need to shift right by ~62vw and up by ~(30vh + topOffset).
  //   - translateY: 0 → -(vh-based offset to reach top)
  //   - scale: 1 → 0.33 (30vw/90vw ≈ 0.33)
  //
  // Using percentages on the motion.div: % is relative to the element itself (90vw).
  // To move right edge to 3vw from right:
  //   right edge at 5vw + 90vw = 95vw. Target right edge at 97vw.
  //   So translateX = +2vw. But also scale shrinks to 0.33 so visual right = 5vw + 90vw*0.33/2 ... 
  //   Better: use fixed pixel-based transforms via vw strings.
  //
  // Simpler approach: animate left/right/bottom/height as CSS via useTransform strings.
  // BUT layout changes cause reflows. Instead keep fixed position and use
  // translateX(vw) + translateY(vw) + scale.
  //
  // The container starts at: left=5vw, right=5vw, bottom=0, height=30vh
  // transformOrigin = "right bottom"
  // At p=1.1 we want it in top-right:
  //   scale = 0.33, so rendered size ≈ 90vw*0.33 = ~30vw wide, 30vh*0.33 = ~10vh tall
  //   target position: right=2vw, top=10vh
  //   current right anchor = 5vw from right, bottom=0
  //   With transformOrigin right bottom:
  //     translateX = 0 (right edge stays pinned)... no, let's use center as origin.
  // 
  // SIMPLEST CORRECT approach: use two separate fixed divs controlled by framer:
  //   - phase A (p<0.7): bottom strip
  //   - phase B (p>0.7): top-right box
  // Crossfade between them.
  
  // Phase A opacity: 1 at p=0, 0 at p=1.0
  const modelPhaseAOpacity = useTransform(smooth, [0, 0.05, 0.8, 1.0], [1, 1, 1, 0]);
  // Phase A exit: slides up slightly
  const modelPhaseAY       = useTransform(smooth, [0.7, 1.0], [0, -40]);
  // Bottom mask fades
  const modelMaskOpacity   = useTransform(smooth, [0, 0.5], [1, 1]);

  // Phase B (top-right small version): fades in p 0.8→1.1, exits p 2.0→2.5
  const modelPhaseBOpacity = useTransform(smooth, [0.8, 1.1, 1.6, 1.8], [0, 1, 1, 0]);
  const modelPhaseBY       = useTransform(smooth, [0.8, 1.1, 1.6, 1.8], [20, 0, 0, -60]);

  // 45° CW rotation for both phases
  const modelRotationY = useTransform(smooth, [0, 0.8, 8], [0, Math.PI / 4, Math.PI / 4]);

  // ── HomePageAbout ─────────────────────────────────────────────────────────
  const aboutY       = useTransform(smooth, [1.8, 1.9, 2.4, 2.8], [80, 0, 0, -880]);
  const aboutOpacity = useTransform(smooth, [1.8, 1.9, 3.5, 3.8], [0, 1, 1, 0]);
  const aboutClip    = useTransform(smooth,
    [1.8, 1.9, 2.4, 2.8],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
  );

  // ── White circle — z:30, above ScatteredCards (z:20–22) ──────────────────
  // Expands after cards finish at p≈6.6
  const circleClip = useTransform(smooth,
    [3.7, 3.8],
    ["circle(0% at 10% 95%)", "circle(160% at 10% 95%)"]
  );

  // ── OurPromise — fixed, appears just after circle completes (p 3.85→4.1) ─
  // Stays visible and sticky until p ≈ 5.2, then exits upward
  const ourPromiseY       = useTransform(smooth, [3.85, 4.1, 5.0, 5.2], [50, 0, 0, -60]);
  const ourPromiseOpacity = useTransform(smooth, [3.85, 4.1, 4.9, 5.2], [0, 1, 1, 0]);

  // ── Header theme ──────────────────────────────────────────────────────────
  // Switches to light (blue logo) after circle has expanded
  const headerTheme = useTransform(smooth, [3.75, 3.9], [0, 1]);

  // ── CTA ──────────────────────────────────────────────────────────────────
  const wrapperCTAInset = useTransform(smooth, [7.4, 7.8, 7.9, 8.4], [16, 0, 0, 16]);
  const ctaHeight = useTransform(wrapperCTAInset,
    (v) => `calc(100${vhUnit} - ${v * 2}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );
  const ctaTop    = useTransform(wrapperCTAInset, (v) => `calc(${v}px + env(safe-area-inset-top))`);
  const ctaFrameY = useTransform(smooth,
    [7.4, isMobile ? 7.7 : 7.8, isMobile ? 7.8 : 7.9, isMobile ? 8.3 : 8.4],
    ["105%", "0%", "0%", "-105%"]
  );

  const spacerFaq   = vh * 5.5;
  const totalHeight = vh * 10 + 900;

  if (vhPx === 0) return <div className="min-h-screen bg-[#0f2057]" />;

  return (
    <>
      <LiquidBackground progress={smooth} />

      <motion.div style={{ height: totalHeight, pointerEvents: "none" }} aria-hidden />

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

        {!openContact && <Header headerTheme={headerTheme} />}

        {/* ── SLIDE 0 ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0, zIndex: 11,
            y: slide0Y, opacity: slide0Opacity, clipPath: slide0Clip,
            pointerEvents: "none",
          }}
          className="flex flex-col items-center justify-center px-8 text-center"
        >
            <h1 className="text-[3.0rem] sm:text-[5.8rem] text-[#f4f7fa] font-bold leading-tight tracking-tight">
              {homeTexts("slide0.title")}
            </h1>
            <h2 className="text-[1.4rem] sm:text-[2rem] mt-5 whitespace-pre-line text-[#c8d8f8] font-light max-w-xl">
              {homeTexts("slide0.subtitle")}
            </h2>
        </motion.div>

        {/* ── MODEL PHASE A: bottom strip, full width, visible from start ────
            left:5vw right:5vw bottom:0 height:30vh
            Fades out as phase B (top-right) fades in.
        ──────────────────────────────────────────────────────────────────── */}
        {introFinished && (
          <motion.div
            style={{
              position: "fixed",
              bottom: 0,
              height: isIOS ? "30lvh" : "30dvh",
              width: "100vw",
              zIndex: 10,
              opacity: modelPhaseAOpacity,
              y: modelPhaseAY,
              pointerEvents: "none",
            }}
          >
            <HeroModel progressMotion={smooth} rotationProgress={modelRotationY} />
            <motion.div
              style={{
                position: "absolute", inset: 16,
                background: "linear-gradient(to top, rgba(12,24,70,0.97) 0%, rgba(12,24,70,0.65) 40%, rgba(12,24,70,0.1) 70%, transparent 100%)",
                opacity: modelMaskOpacity,
                pointerEvents: "none", zIndex: 2,
                borderRadius: "24px",
              }}
            />
          </motion.div>
        )}

        {/* ── MODEL PHASE B: top-right corner, small ────────────────────────
            Fixed at top-right, ~30vw wide, ~22vh tall.
            Fades in as phase A fades out.
            Separate HeroModel instance shares same stepSrc.
        ──────────────────────────────────────────────────────────────────── */}
        {introFinished && (
          <motion.div
            style={{
              position: "fixed",
              right: "3vw",
              top: isIOS ? "10lvh" : "10dvh",
              width: isMobile ? "45vw" : "30vw",
              height: isMobile ? isIOS ? "18lvh" : "18dvh" : "22vh",
              zIndex: 12,
              opacity: modelPhaseBOpacity,
              y: modelPhaseBY,
              pointerEvents: "none",
            }}
          >
            <HeroModel progressMotion={smooth} rotationProgress={modelRotationY} />
          </motion.div>
        )}

        {/* ── SLIDE 1 ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0, zIndex: 11,
            y: slide1Y, opacity: slide1Opacity, clipPath: slide1Clip,
            pointerEvents: "none",
          }}
          className="flex flex-col items-start justify-center px-8 sm:px-16"
        >
          {/* Leave right side clear for the model */}
          <div style={{ maxWidth: isMobile ? "100%" : "55%", marginBottom: isIOS ? "10lvh" : "10dvh" }}>
            <h4 className="text-[1rem] sm:text-[1.3rem] mb-3 text-[#a0b8e8] tracking-widest uppercase">
              {homeTexts("slide1.suptitle")}
            </h4>
            <h1 className="text-[2.8rem] sm:text-[4.0rem] text-[#f4f7fa] font-bold leading-tight">
              {homeTexts("slide1.title")}
            </h1>
            <h2 className="text-[1.3rem] sm:text-[1.8rem] mt-4 whitespace-pre-line text-[#c8d8f8] font-light">
              {homeTexts("slide1.subtitle")}
            </h2>
          </div>
        </motion.div>

        {/* ── HomePageAbout ──────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0, zIndex: 11,
            y: aboutY, opacity: aboutOpacity, clipPath: aboutClip,
            pointerEvents: "none",
          }}
          className="flex items-center justify-center"
        >
          <HomePageAbout progressMotion={smooth} />
        </motion.div>

        {/* ── ScatteredCards (z: 20–22) ──────────────────────────────────── */}
        <ScatteredCards
          items={[
            { id: "1", image: "/images/1.jpg", label: "d1", suptitle: "Progetto", title: "Titolo uno",   subtitle: "Descrizione della prima scheda."  },
            { id: "2", image: "/images/2.jpg", label: "d2", suptitle: "Progetto", title: "Titolo due",   subtitle: "Descrizione della seconda scheda." },
            { id: "3", image: "/images/3.jpg", label: "d3", suptitle: "Progetto", title: "Titolo tre",   subtitle: "Descrizione della terza scheda."  },
          ]}
          progress={smooth}
        />

        {/* ── WHITE CIRCLE (z:30 > cards z:22) — expands after p=6.6 ─────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0,
            zIndex: 30,
            backgroundColor: "#1c398e",
            clipPath: circleClip,
            pointerEvents: "none",
          }}
        />

        {/* ── OurPromise — z:31, FIXED, appears just after circle completes ─
            p 3.85: circle is done → OurPromise fades+slides in (3.85→4.1)
            Sticky until p 5.0, then exits upward (5.0→5.2)
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 31,
            y: ourPromiseY,
            opacity: ourPromiseOpacity,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OurPromise
            title={homeTexts("slide3.title")}
            subtitle={homeTexts("slide3.subtitle")}
            progress={smooth}
          />
        </motion.div>

        {/* ── CTA — z:32 ───────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            left: wrapperCTAInset, right: wrapperCTAInset,
            top: ctaTop, height: ctaHeight,
            y: ctaFrameY,
            background: "transparent",
            zIndex: 32,
          }}
          className="flex items-center justify-center"
        >
          <CallToActionHome progressMotion={smooth} />
        </motion.div>

        {/* ── FAQ — z:31 ───────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: spacerFaq,
            left: 0, right: 0,
            zIndex: 31,
            overflowX: "hidden",
          }}
          className="flex items-start justify-center"
        >
          <div style={{ width: "100%", maxWidth: "860px", padding: "0 1.5rem", boxSizing: "border-box" }}>
            <FaqSection
              progress={smooth}
              progressStart={isMobile ? 7.9 : 8.0}
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
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 31 }}>
          <Footer />
        </div>

        {!openContact && <MenuButton />}

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </div>
    </>
  );
}