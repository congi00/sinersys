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
import CookieBanner from "./components/CookieBanner";

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
  const modelPhaseAOpacity = useTransform(smooth, [0, 1.0, 1.7, 1.8], [1, 1, 1, 0]);
  const modelPhaseAY       = useTransform(smooth, [0.7, 1.0], [490, -40]);
  const modelMaskOpacity = useTransform(smooth, [0, 0.03], [1, 0]);
  const modelRotationY     = useTransform(smooth, [0, 1.0, 4], [0, Math.PI , Math.PI / 4]);
  const modelOverflow = useTransform(smooth, (v) =>
    v < 0.05 ? "hidden" : "visible"
  );

  // ── HomePageAbout ─────────────────────────────────────────────────────────
  const aboutY       = useTransform(smooth, [1.8, 1.9, 2.4, 2.8], [80, 0, 0, -880]);
  const aboutOpacity = useTransform(smooth, [1.8, 1.9, 3.5, 3.8], [0, 1, 1, 0]);
  const aboutClip    = useTransform(smooth,
    [1.8, 1.9, 2.4, 2.8],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
  );

  // ── Circle ────────────────────────────────────────────────────────────────
  const circleClip = useTransform(smooth,
    [3.7, 3.8, 5.2, 5.3],
    ["circle(0% at 100% 95%)", "circle(160% at 10% 95%)", "circle(160% at 10% 95%)" , "circle(0% at 5% 5%)"]
  );

  // ── OurPromise ────────────────────────────────────────────────────────────
  const ourPromiseY       = useTransform(smooth, [3.85, 4.1, 5.0, 5.2], [50, 0, 0, -60]);
  const ourPromiseOpacity = useTransform(smooth, [3.85, 4.1, 4.9, 5.2], [0, 1, 1, 0]);

  // ── Header theme ──────────────────────────────────────────────────────────
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

        {/* ── MODEL PHASE A ────────────────────────────────────────────────── */}
        {introFinished && (
          <motion.div
            style={{
              position: "fixed",
              bottom: 0,
              height: isIOS ? "120lvh" : "120dvh",
              width: "100vw",
              zIndex: 10,
              opacity: modelPhaseAOpacity,
              y: modelPhaseAY,
              pointerEvents: "none",
              overflow: modelOverflow,
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

        {/* ── SLIDE 1 ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0, zIndex: 11,
            y: slide1Y, opacity: slide1Opacity, clipPath: slide1Clip,
            pointerEvents: "none",
          }}
          className="flex flex-col items-start justify-center px-8 sm:px-16"
        >
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

        {/* ── ScatteredCards ──────────────────────────────────────────────── */}
        <ScatteredCards
          items={[
            { id: "1", image: "/images/1.jpg", label: "d1", suptitle: "Progetto", title: "Titolo uno",   subtitle: "Descrizione della prima scheda."  },
            { id: "2", image: "/images/2.jpg", label: "d2", suptitle: "Progetto", title: "Titolo due",   subtitle: "Descrizione della seconda scheda." },
            { id: "3", image: "/images/3.jpg", label: "d3", suptitle: "Progetto", title: "Titolo tre",   subtitle: "Descrizione della terza scheda."  },
          ]}
          progress={smooth}
        />

        {/* ── Circle ──────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0,
            zIndex: 30,
            backgroundColor: "#1c398e",
            clipPath: circleClip,
            pointerEvents: "none",
          }}
        />

        {/* ── OurPromise ──────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", inset: 0, zIndex: 31,
            y: ourPromiseY, opacity: ourPromiseOpacity,
            pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <OurPromise
            title={homeTexts("slide3.title")}
            subtitle={homeTexts("slide3.subtitle")}
            progress={smooth}
          />
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
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

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
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

      {/* ── Cookie Banner — montato fuori dal div scrollabile, z:9999 ────────
          Visibile solo dopo che introFinished diventa true.
          CookieBanner gestisce internamente showBanner da localStorage,
          quindi se il consenso è già salvato non mostra nulla.
      ──────────────────────────────────────────────────────────────────────── */}
      {introFinished && <CookieBanner />}
    </>
  );
}