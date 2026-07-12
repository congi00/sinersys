"use client";

import { useEffect, useRef, useState } from "react";
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Lenis from "lenis";
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";
import clsx from "clsx";
import HomePageAbout from "./containers/HomePageAbout";
import ScatteredCards from "./components/ScatteredCards";
import OurPromise from "./components/OurPromise";
import { useLocale, useTranslations } from "next-intl";
import Footer from "./components/Footer";
import { useAppSelector } from "./hooks";
import { detectIOS } from "./support/useViewportHeight";
import FaqSection from "./components/FaqSection";
import ContactDrawer from "./components/ContactDrawer";
import { setNavigationState, setOpenContact } from "./features/counterSlice";
import { useAppDispatch } from "./hooks";
import CookieBanner from "./components/CookieBanner";
import WhiteSection from "./components/WhiteSection";
import LinkButton from "./components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import HeroVideo from "./components/HeroVideo";
import SixPhaseEngine from "./components/SixPhaseEngine";
import ScrollNavigator from "./components/ScrollNavigator";
import { useMotionValueEvent } from "framer-motion";
import dynamic from "next/dynamic";
import { HERO_SUBTITLE_CLASS, HERO_TITLE_CLASS, SUPTITLE_CLASS } from "./typography";
import { formatRegistered } from "./formatter";
import { useLenis } from "./containers/LenisProvider";

const LiquidBackground = dynamic(() => import('./components/LiquidBackground'), {
    ssr: false,
    loading: () => <div className="h-screen bg-[#1c398e]" />
  });

const IntroParticles = dynamic(() => import('./components/IntroParticles'), {
    ssr: false,
});
  

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function Home() {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const progressMotion = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Viene eseguito solo lato client (Next.js SSR: il server non ha sessionStorage)
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("sinersys_intro_seen") !== "true";
  });
  const [introFinished, setIntroFinished] = useState(false);

  const homeTexts = useTranslations("homepage");
  const scatteredCards = homeTexts.raw("scatteredCards");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const navigationState = useAppSelector((s) => s.siteState.navigationState);
  const dispatch = useAppDispatch();
  const { lenis, isTouch } = useLenis();

  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(1024);

  const isMobile = width <= 768;
  const isXL = width >= 1536;
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
    const r = () => setWidth(window.innerWidth);
    r();
    window.addEventListener("resize", r);
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
    if (isTouch) {
      // Su touch continuiamo a leggere lo scroll nativo direttamente:
      // nessun Lenis, comportamento identico a prima.
      let rafId = 0;
      let target = 0;
      let current = 0;
      const onScroll = () => {
        const sy = window.scrollY;
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) target = Math.min(9.5, (sy / limit) * 9.5);
      };
      const tick = () => {
        current += (target - current) * 0.1;
        if (Math.abs(target - current) > 0.0001) {
          progressMotion.set(current);
        }
        rafId = requestAnimationFrame(tick);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      rafId = requestAnimationFrame(tick);
      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafId);
      };
    }
    if (!lenis) return;
    const handleScroll = (e: { scroll: number; limit: number }) => {
      progressMotion.set(Math.min(9, (e.scroll / e.limit) * 9));
    };
    lenis.on("scroll", handleScroll);
    // Sync immediato con la posizione corrente del Lenis condiviso:
    // fondamentale ora che l'istanza sopravvive alla navigazione, quindi
    // potrebbe avere già uno scroll != 0 da questa pagina.
    if (lenis.limit > 0) {
      progressMotion.set(Math.min(9, (lenis.scroll / lenis.limit) * 9));
    }
    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis, isTouch, progressMotion]);
  // Reset dello scroll fisico ad ogni mount di pagina (navigazione),
  // così ogni pagina parte sempre dall'inizio del proprio scroll-track,
  // indipendentemente da dove si trovava la pagina precedente.
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [lenis]);

  const smooth = useSpring(progressMotion, {
    stiffness: isMobile ? 180 : 280,
    damping: isMobile ? 32 : 28,
    mass: isMobile ? 0.6 : 1,
  });
  const vh = vhPx || 1;

  // ── Slide 0 ───────────────────────────────────────────────────────────────
  const slide0Y = useTransform(smooth, [0, 0.6, 0.7], [0, 0, -880]);
  const slide0Opacity = useTransform(smooth, [0, 0.7, 1.0], [1, 1, 0]);

  // ── Slide 1 ───────────────────────────────────────────────────────────────
  const slide1Y = useTransform(smooth, [0.6, 0.7, 1.6, 1.8], [80, 0, 0, -880]);
  const slide1Opacity = useTransform(
    smooth,
    [0.6, 0.7, 2.1, 2.5],
    [0, 1, 1, 0]
  );

  // ── Model ─────────────────────────────────────────────────────────────────
  const modelPhaseAOpacity = useTransform(
    smooth,
    [0, 0.6, 0.7, 1.8, 1.9],
    [0, 0, 1, 1, 0]
  );
  const modelPhaseAY = useTransform(
    smooth,
    [0.7, 1.2, 1.8, 1.9],
    [80, 80, 80, 80]
  );

  // ── HomePageAbout ─────────────────────────────────────────────────────────
  const aboutY = useTransform(smooth, [2.8, 2.9, 3.4, 3.8], [80, 0, 0, -880]);
  const aboutOpacity = useTransform(smooth, [2.8, 2.9, 4.5, 4.8], [0, 1, 1, 0]);

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
  const circleScale = useTransform(smooth, [4.7, 4.8, 6.2, 6.3], [0, 1, 1, 0]);

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
    [3, 3.1, 4.7, 4.75, 4.9, 5.9, 6.0, 6.1, 6.2, 6.3, 7.4, 7.8, 8.0, 8.2, 9.0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, isMobile ? 0 : 1]
  );

  const hiddenMenu = useTransform(smooth, [8.2, 8.3], [1, 0]);

  const menuTheme = useTransform(
    smooth,
    [3, 3.1, 4.7, 4.75, 4.9, 5.9, 6.0, 6.1, 6.2, 6.7, 7.4, 7.8, 8.0, 8.2, 9.0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
  );

  // ── LinkButton colors ─────────────────────────────────────────────────────
  // Both slides have white text/icon on dark bg
  const linkColorWhite = useMotionValue("#f4f7fa");

  // ── FAQ ───────────────────────────────────────────────────────────────────
  // Absolute positioned after the white section scroll budget
  const spacerFaq = isMobile ? vh * 10.5 : vh * 9.5;
  const totalHeight = isMobile ? vh * 12.8 + 100 : vh * 11 + 200;

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
    <main id="main-content">  
      <LiquidBackground progress={smooth} vhUnit={vhUnit} />

      <m.div
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
        <m.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: slide0Y,
            opacity: slide0Opacity,
            pointerEvents: "none",
          }}
          className="flex flex-col items-center justify-center px-8 sm:px-4 text-center"
        >
          <h1
            style={{
              lineHeight: "1.0",
            }}
            className={clsx(
              HERO_TITLE_CLASS,
              "text-[#f4f7fa] sm:whitespace-pre-line sm:mt-0 mt-8"
            )}
            aria-hidden={false}
          >
            {homeTexts("slide0.title")}
          </h1>
          <h2
            style={{ lineHeight: isMobile ? "1.1" : "1.1" }}
            className={clsx(
              HERO_SUBTITLE_CLASS,
              "px-3 sm:px-0 mt-3 sm:mt-5 sm:mb-5 text-[#c8d8f8] sm:max-w-2xl")}
            aria-hidden={false}
          >
            {homeTexts("slide0.subtitle")}
          </h2>

          {/* LinkButton — scopri di più / link ad APWEC */}
          <div className="mb-10 sm:mb-0" style={{ pointerEvents: "auto" }}>
            <LinkButton
              link={`/${locale}/apwec`}
              text={homeTexts("slide0.link")}
              icon={<ArrowUpRight size={20} />}
              top="0"
              color={linkColorWhite}
            />
          </div>
        </m.div>

        {/* ── MODEL PHASE A ────────────────────────────────────────────────── */}
        {!showIntro && ( <m.div
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
        </m.div> )}

        {/* ── SLIDE 1 ─────────────────────────────────────────────────────── */}
        <m.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: slide1Y,
            opacity: slide1Opacity,
            pointerEvents: "none",
          }}
          className="flex flex-col items-center justify-center px-8 sm:px-16 text-center"
        >
          <div
            style={{
              maxWidth: isMobile || isXL ? "100%" : "65%",
              marginBottom: isIOS ? "10lvh" : "10dvh",
            }}
          >
            <h4
              className={clsx(
                SUPTITLE_CLASS,
                "[text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 px-3 sm:px-0 mt-3 sm:mt-5 text-[#a0b8e8]"
              )}
              aria-hidden={false}
            >
              {homeTexts("slide1.suptitle")}
            </h4>
            <h1
              style={{ lineHeight: "1.0" }}
              className={clsx(
                HERO_TITLE_CLASS,
                "sm:whitespace-pre-line px-3 sm:px-2 mt-3  text-[#f4f7fa]"
              )}
              aria-hidden={false}
            >
              {homeTexts("slide1.title")}
            </h1>
            <h2
              style={{ lineHeight: "1.2" }}
              className={clsx(
                HERO_SUBTITLE_CLASS,
                "px-6 sm:px-6 mt-6 sm:mt-5 sm:mb-5 text-[#c8d8f8] sm:max-w-4xl 2xl:max-w-full"
              )}
              aria-hidden={false}
            >
              {formatRegistered(homeTexts("slide1.subtitle"))}
            </h2>

            {/* LinkButton — scopri di più */}
            <div className={"px-3 sm:px-0"} style={{ pointerEvents: "auto" }}>
              <LinkButton
                link={`/${locale}/apwec`}
                text={homeTexts("slide1.link")}
                icon={<ArrowUpRight size={20} />}
                top="0"
                color={linkColorWhite}
              />
            </div>
          </div>
        </m.div>

        {/* ── MOTORE 6 FASI ──────────────────────────────────────────────────── */}
        <SixPhaseEngine
          progress={smooth}
          isMobile={isMobile}
          sectionLabel={homeTexts("sixPhase.researchProducts.sectionLabel")}
          sectionTitle={homeTexts("sixPhase.researchProducts.sectionTitle")}
          sectionSubtitle={homeTexts(
            "sixPhase.researchProducts.sectionSubtitle"
          )}
          products={[
            {
              id: homeTexts("sixPhase.researchProducts.product1.id"),
              status: "coming-soon",
              statusLabel: homeTexts("sixPhase.researchProducts.product1.id"),
              suptitle: homeTexts(
                "sixPhase.researchProducts.product1.suptitle"
              ),
              title: homeTexts("sixPhase.researchProducts.product1.title"),
              subtitle: homeTexts(
                "sixPhase.researchProducts.product1.subtitle"
              ),
              detail: homeTexts("sixPhase.researchProducts.product1.detail"),
              year: homeTexts("sixPhase.researchProducts.product1.year"),
              link: "/six-phase-motor",
            },
          ]}
        />

        {/* ── HomePageAbout ──────────────────────────────────────────────── */}
        <m.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11,
            y: aboutY,
            opacity: aboutOpacity,
            pointerEvents: "none",
          }}
          className="flex items-center justify-center"
        >
          <HomePageAbout progressMotion={smooth} isMobile={isMobile} />
        </m.div>

        {/* ── ScatteredCards ──────────────────────────────────────────────── */}
        <ScatteredCards items={scatteredCards} progress={smooth} />

        <m.div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: "283vmax",
            height: "283vmax",
            zIndex: 30,
            background:
              "linear-gradient(180deg, rgb(28, 57, 142) 10%, rgb(0 86 191) 20%, rgb(5, 11, 38) 70%)",
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
        <m.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 31,
            y: ourPromiseY,
            opacity: ourPromiseOpacity,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <OurPromise
            title={homeTexts("slide3.title")}
            subtitle={homeTexts("slide3.subtitle")}
            progress={smooth}
            isMobile={isMobile}
          />
        </m.div>

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
          setOpen={() => {
            dispatch(setOpenContact(true));
          }}
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
            background: "#f4f7fa",
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
            background: "#f4f7fa",
          }}
        >
          <Footer openContact={() => dispatch(setOpenContact(true))} />
        </div>

        {!openContact && (
          <MenuButton menuTheme={menuTheme} hiddenMenu={hiddenMenu} />
        )}

        {!openContact && (
          <ScrollNavigator
            progress={smooth}
            totalScrollHeight={totalHeight}
            isMobile={isMobile}
            menuTheme={menuTheme}
            hiddenMenu={hiddenMenu}
          />
        )}

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </div>
    </main>
  );
}
