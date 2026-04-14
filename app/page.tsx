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
import clsx from "clsx";
import IntroParticles from "./components/IntroParticles";
import HomePageAbout from "./containers/HomePageAbout";
import ScatteredCards from "./components/ScatteredCards";
import OurPromise from "./components/OurPromise";
import { useTranslations } from "next-intl";
import Footer from "./components/Footer";
import { useAppSelector } from "./hooks";
import { detectIOS } from "./support/useViewportHeight";
import FaqSection from "./components/FaqSection";
import LiquidBackground from "./components/LiquidBackground";
import ContactDrawer from "./components/ContactDrawer";
import { setNavigationState, setOpenContact } from "./features/counterSlice";
import { useAppDispatch } from "./hooks";
import CookieBanner from "./components/CookieBanner";
import WhiteSection from "./components/WhiteSection";
import LinkButton from "./components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import HeroVideo from "./components/HeroVideo";
import SixPhaseEngine from "./components/SixPhaseEngine";
import { useMotionValueEvent } from "framer-motion";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const progressMotion = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  const homeTexts = useTranslations("homepage");
  const scatteredCards = homeTexts.raw("scatteredCards");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const navigationState = useAppSelector((s) => s.siteState.navigationState);
  const dispatch = useAppDispatch();

  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(1024);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  useEffect(() => {
    if (isTouchDevice()) {
      const onScroll = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) progressMotion.set(Math.min(9.5, (sy / limit) * 9.5));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive:true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const lenis = new Lenis({ duration:1.2, smoothWheel:true });
    let rafId = 0;
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll:number; limit:number }) => {
      progressMotion.set(Math.min(9, (e.scroll / e.limit) * 9));
    });
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, { stiffness:280, damping:28 });
  const vh     = vhPx || 1;

  // ── Slide 0 ───────────────────────────────────────────────────────────────
  const slide0Y = useTransform(smooth, [0, 0.2, 0.6], [0, 0, -880]);
  const slide0Opacity = useTransform(smooth, [0, 0.7, 1.0], [1, 1, 0]);
  const slide0Clip = useTransform(
    smooth,
    [0, 0.3, 0.7],
    ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
  );

  // ── Slide 1 ───────────────────────────────────────────────────────────────
  const slide1Y = useTransform(smooth, [0.7, 1.1, 1.6, 1.8], [80, 0, 0, -880]);
  const slide1Opacity = useTransform(
    smooth,
    [0.7, 1.1, 2.1, 2.5],
    [0, 1, 1, 0]
  );
  const slide1Clip = useTransform(
    smooth,
    [0.7, 1.1, 1.8, 1.9],
    [
      "inset(100% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 100% 0%)",
    ]
  );

  // ── Model ─────────────────────────────────────────────────────────────────
  const modelPhaseAOpacity = useTransform(
    smooth,
    [0, 1.1, 1.2, 1.8, 1.9],
    [0, 0, 1, 1, 0]
  );
  const modelPhaseAY = useTransform(smooth, [0.7, 1.2, 1.8, 1.9], [80, 80, 80, 80]);
  const modelOverflow = useTransform(smooth, (v) =>
    v < 0.05 ? "hidden" : "visible"
  );

  // ── HomePageAbout ─────────────────────────────────────────────────────────
  const aboutY = useTransform(smooth, [2.8, 2.9, 3.4, 3.8], [80, 0, 0, -880]);
  const aboutOpacity = useTransform(smooth, [2.8, 2.9, 4.5, 4.8], [0, 1, 1, 0]);
  const aboutClip = useTransform(
    smooth,
    [2.8, 2.9, 3.4, 4.8],
    [
      "inset(100% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 100% 0%)",
    ]
  );

  // ── Circle ────────────────────────────────────────────────────────────────
  // const circleClip = useTransform(
  //   smooth,
  //   [3.7, 3.8, 5.2, 5.3],
  //   [
  //     "circle(0% at 100% 95%)",
  //     "circle(160% at 10% 95%)",
  //     "circle(160% at 10% 95%)",
  //     "circle(0% at 5% 5%)",
  //   ]
  // );
  const circleScale  = useTransform(smooth, [4.7, 4.8, 6.2, 6.3], [0, 1, 1, 0]);

  // ── OurPromise ────────────────────────────────────────────────────────────
  const ourPromiseY = useTransform(
    smooth,
    [4.85, 5.1, 6.0, 6.2],
    [50, 0, 0, -60]
  );
  const ourPromiseOpacity = useTransform(
    smooth,
    [4.85, 5.1, 5.9, 6.2],
    [0, 1, 1, 0]
  );

  // ── Header theme ──────────────────────────────────────────────────────────
  // Dark bg (white logo) while circle is up, then switches to light when
  // white section appears after circle shrinks (p 5.2+)
  const headerTheme = useTransform(
    smooth,
    [3, 3.1, 4.7, 4.75, 4.9, 5.9, 6.0, 6.1, 6.2, 6.3 , 7.4, 7.8,8.0,8.2,9.0],
    [0, 1,1,1, 0, 0, 0, 0, 0, 1 , 0, 1, 1, 1, isMobile? 0 : 1 ]
  );

  const hiddenMenu  = useTransform(
    smooth,
    [8.2,8.3],
    [1, 0 ]
  );

  const menuTheme =  useTransform(
    smooth,
    [3, 3.1, 4.7, 4.75, 4.9, 5.9, 6.0, 6.1, 6.2, 6.7 , 7.4, 7.8, 8.0, 8.2, 9.0],
    [0, 1,1,1, 0, 0, 0, 0, 0, 0 , 1, 1, 1, 1, 1 ]
  );

  // ── LinkButton colors ─────────────────────────────────────────────────────
  // Both slides have white text/icon on dark bg
  const linkColorWhite = useMotionValue("#ffffff");

  // ── FAQ ───────────────────────────────────────────────────────────────────
  // Absolute positioned after the white section scroll budget
  const spacerFaq = isMobile ? vh * 11 : vh * 9.7;
  const totalHeight = isMobile ? vh * 12.8 + 1200 : vh * 11 + 900;

  const themeColor = useTransform(
    smooth,
    [0, 3.0, 3.2, 6.2, 6.4, 9],
    [
      "#0f2057", // dark iniziale
      "#0f2057",
      "#faf4f7", // quando passi al light palette
      "#faf4f7",
      "#ffffff", // white section
      "#ffffff",
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
            clipPath: slide0Clip,
            pointerEvents: "none",
          }}
          className="flex flex-col items-center justify-center px-8 text-center"
        >
          <h1
            style={{ lineHeight: "1.0" }}
            className="text-3xl font-stretch-extra-expanded tracking-wide sm:text-7xl text-[#f4f7fa] font-bold leading-tight tracking-tight whitespace-pre-line"
          >
            {homeTexts("slide0.title")}
          </h1>
          <h2
            style={{ lineHeight: "1.1" }}
            className="text-xl font-stretch-extra-expanded tracking-wide px-3 sm:px-0 sm:text-2xl mt-2 sm:mt-5 sm:mb-5 whitespace-pre-line text-[#c8d8f8] max-w-xl font-light sm:max-w-2xl"
          >
            {homeTexts("slide0.subtitle")}
          </h2>

          {/* LinkButton — scopri di più / link ad APWEC */}
          <div className="mb-10 sm:mb-0" style={{ pointerEvents: "auto" }}>
            <LinkButton
              link="/apwec"
              text={homeTexts("slide0.link")}
              icon={<ArrowUpRight size={20} />}
              top="0"
              color={linkColorWhite}
            />
          </div>
        </motion.div>

        {/* ── MODEL PHASE A ────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            bottom: 0,
            height: isIOS ? "120lvh" : "120dvh",
            width: isMobile ? "120vw" : "100vw",
            zIndex: 10,
            opacity: modelPhaseAOpacity,
            y: modelPhaseAY,
            pointerEvents: "none",
          }}
        >
          <HeroVideo progressMotion={smooth} isMobile={isMobile} />
        </motion.div>

        {/* ── SLIDE 1 ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: slide1Y,
            opacity: slide1Opacity,
            clipPath: slide1Clip,
            pointerEvents: "none",
          }}
          className="flex flex-col items-start justify-center px-8 sm:px-16"
        >
          <div
            style={{
              maxWidth: isMobile ? "100%" : "55%",
              marginBottom: isIOS ? "10lvh" : "10dvh",
            }}
          >
            <h4 className="text-[1rem] sm:text-[1.3rem] mb-3 text-[#a0b8e8] tracking-widest uppercase">
              {homeTexts("slide1.suptitle")}
            </h4>
            <h1
              style={{ lineHeight: "1.1" }}
              className="text-3xl font-stretch-extra-expanded tracking-wide sm:text-7xl text-[#f4f7fa] font-bold leading-tight"
            >
              {homeTexts("slide1.title")}
            </h1>
            <h2
              style={{ lineHeight: "1.3" }}
              className="text-xl font-stretch-extra-expanded tracking-wide sm:text-2xl mt-4 whitespace-pre-line text-[#c8d8f8] font-light"
            >
              {homeTexts("slide1.subtitle")}
            </h2>

            {/* LinkButton — scopri di più */}
            <div style={{ pointerEvents: "auto" }}>
              <LinkButton
                link="/apwec"
                text={homeTexts("slide1.link")}
                icon={<ArrowUpRight size={20} />}
                top="0"
                color={linkColorWhite}
              />
            </div>
          </div>
        </motion.div>

        {/* ── MOTORE 6 FASI ──────────────────────────────────────────────────── */}
        <SixPhaseEngine
          progress={smooth}
          isMobile={isMobile}
          title={homeTexts("sixPhase.title")}
          suptitle={homeTexts("sixPhase.suptitle")}
          badge={homeTexts("sixPhase.badge")}
          subtitle={homeTexts("sixPhase.subtitle")}
          phases={[
            { number: homeTexts("sixPhase.phase0.number"), label: homeTexts("sixPhase.phase0.label"), desc: homeTexts("sixPhase.phase0.desc") },
            { number: homeTexts("sixPhase.phase1.number"), label: homeTexts("sixPhase.phase1.label"), desc: homeTexts("sixPhase.phase1.desc") },
            { number: homeTexts("sixPhase.phase2.number"), label: homeTexts("sixPhase.phase2.label"), desc: homeTexts("sixPhase.phase2.desc") },
            { number: homeTexts("sixPhase.phase3.number"), label: homeTexts("sixPhase.phase3.label"), desc: homeTexts("sixPhase.phase3.desc") },
          ]}
          comingSoon={homeTexts("sixPhase.comingSoon")}
          comingSoonSub={homeTexts("sixPhase.comingSoonSub")}
        />

        {/* ── HomePageAbout ──────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: aboutY,
            opacity: aboutOpacity,
            clipPath: aboutClip,
            pointerEvents: "none",
          }}
          className="flex items-center justify-center"
        >
          <HomePageAbout progressMotion={smooth} isMobile={isMobile}/>
        </motion.div>

        {/* ── ScatteredCards ──────────────────────────────────────────────── */}
        <ScatteredCards
          items={scatteredCards}
          progress={smooth}
        />

        <motion.div
          style={{
            position: "fixed",
            bottom: 0,
            right:  0,
            width:  "283vmax",
            height: "283vmax",
            zIndex: 30,
            background: "linear-gradient(180deg, rgb(28, 57, 142) 10%, rgb(0 86 191) 20%, rgb(5, 11, 38) 70%)",
            borderRadius: "50%",
            scale: circleScale,
            transformOrigin: "bottom right",
            pointerEvents: "none",
            // Translate per centrare il cerchio sull'angolo
            x: "50%",
            y: "50%",
          }}
        />

        {/* ── OurPromise ──────────────────────────────────────────────────── */}
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

        {/* ── WHITE SECTION — appears after circle shrinks (p 5.2+) ─────────
            Contains:
            1. Scrolling marquee text (top third)
            2. Partial CTA preview (bottom two-thirds)
               └ CallToActionHome handles its own inset/radius animation
        ──────────────────────────────────────────────────────────────────── */}
        <WhiteSection
          progressMotion={smooth}
          isMobile={isMobile}
          vhUnit={vhUnit}
        />

        {/* ── FAQ — absolute, on white bg, after CTA ───────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: spacerFaq,
            left: 0,
            right: 0,
            zIndex: 34,
            overflowX: "hidden",
            background: "#ffffff",
          }}
          className="flex items-start justify-center"
        >
          <div
            style={{
              width: "100%",
              maxWidth: "860px",
              padding: isMobile ? "1rem 1.5rem 2rem" : "4rem 1.5rem 2rem",
              boxSizing: "border-box",
            }}
          >
            <FaqSection
              progress={smooth}
              progressStart={isMobile ? 7.3 : 7.4}
              title={homeTexts("faq.title")}
              suptitle="FAQ"
              isMobile={isMobile}
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 31,
            background: "#ffffff",
          }}
        >
          <Footer />
        </div>

        {!openContact && <MenuButton menuTheme={menuTheme} hiddenMenu={hiddenMenu}/>}

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
