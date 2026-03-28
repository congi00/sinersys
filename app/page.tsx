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
import WhiteSection from "./components/WhiteSection";
import LinkButton from "./components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const progressMotion = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  const homeTexts = useTranslations("homepage");
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const measure = () => {
      // visualViewport è più stabile della navbar che appare/scompare
      const h = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      setVhPx(h);
    };

    const debouncedMeasure = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 150); // aspetta che la navbar finisca
    };

    measure(); // prima misura immediata

    // visualViewport ha il suo evento resize (più preciso di window.resize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", debouncedMeasure);
      window.visualViewport.addEventListener("scroll", debouncedMeasure);
    }
    window.addEventListener("resize", debouncedMeasure);
    window.addEventListener("orientationchange", () => {
      // orientationchange richiede delay più lungo (il browser ri-calcola lentamente)
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 400);
    });

    return () => {
      clearTimeout(debounceTimer);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", debouncedMeasure);
        window.visualViewport.removeEventListener("scroll", debouncedMeasure);
      }
      window.removeEventListener("resize", debouncedMeasure);
    };
  }, [isIOS]);

  useEffect(() => {
    const lock = showIntro || navigationState === 3;
    document.body.style.overflow = lock ? "hidden" : "";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showIntro, navigationState]);

  useEffect(() => {
    if (showIntro) return;
  
    const isTouch = mounted && window.matchMedia("(pointer: coarse)").matches;
    const isIOSDevice = mounted ? detectIOS() : false;
  
    if (isTouch && isIOSDevice) {
      const onScroll = () => {
        const sy = window.scrollY;
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
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        gestureOrientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.15,
        infinite: false,
      });
  
      let rafId = 0;
      let ticking = false;
  
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      
      rafId = requestAnimationFrame(raf);
  
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        if (!ticking) {
          requestAnimationFrame(() => {
            progressMotion.set(Math.min(8, (e.scroll / e.limit) * 8));
            scrollY.set(e.scroll);
            ticking = false;
          });
          ticking = true;
        }
      });
  
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }
  }, [progressMotion, scrollY, showIntro]);

  const springValue = useSpring(progressMotion, { stiffness: 280, damping: 28 });
  const smooth = isMobile ? progressMotion : springValue;
  const vh = vhPx || (mounted ? window.innerHeight : 800);

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
    [0.7, 1.1, 1.6, 1.8],
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
    [0, 0.5, 0.6, 1.7, 1.8],
    [0, 0, 1, 1, 0]
  );
  const modelPhaseAY = useTransform(smooth, [0.7, 1.0, 1.9], [490, -40, -600]);
  const modelMaskOpacity = useTransform(smooth, [0, 0.03], [1, 0]);
  const modelRotationY = useTransform(
    smooth,
    [0, 1.0, 4],
    [0, -Math.PI / 6, Math.PI / 7]
  );
  const modelOverflow = useTransform(smooth, (v) =>
    v < 0.05 ? "hidden" : "visible"
  );

  // ── HomePageAbout ─────────────────────────────────────────────────────────
  const aboutY = useTransform(smooth, [1.8, 1.9, 2.4, 2.8], [80, 0, 0, -880]);
  const aboutOpacity = useTransform(smooth, [1.8, 1.9, 3.5, 3.8], [0, 1, 1, 0]);
  const aboutClip = useTransform(
    smooth,
    [1.8, 1.9, 2.4, 3.8],
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
  const circleScale  = useTransform(smooth, [3.7, 3.8, 5.2, 5.3], [0, 1, 1, 0]);
  const circleRadius = useTransform(smooth,
    [3.7, 3.8],
    ["50%", "0%"]  // inizia come cerchio, diventa rettangolo
  );

  // ── OurPromise ────────────────────────────────────────────────────────────
  const ourPromiseY = useTransform(
    smooth,
    [3.85, 4.1, 5.0, 5.2],
    [50, 0, 0, -60]
  );
  const ourPromiseOpacity = useTransform(
    smooth,
    [3.85, 4.1, 4.9, 5.2],
    [0, 1, 1, 0]
  );

  // ── Header theme ──────────────────────────────────────────────────────────
  // Dark bg (white logo) while circle is up, then switches to light when
  // white section appears after circle shrinks (p 5.2+)
  const headerTheme = useTransform(
    smooth,
    [3.75, 3.9, 5.15, 5.3],
    [0, 1, 1, 0]
  );

  // ── LinkButton colors ─────────────────────────────────────────────────────
  // Both slides have white text/icon on dark bg
  const linkColorWhite = useMotionValue("#ffffff");

  // ── FAQ ───────────────────────────────────────────────────────────────────
  // Absolute positioned after the white section scroll budget
  const spacerFaq = vh * 8.5;
  const totalHeight = vh * 10 + 900;

  if (!mounted) {
    return <div className="min-h-screen bg-[#0f2057]" />;
  }

  return (
    <>
      <LiquidBackground progress={smooth} />

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
            className="text-[3.0rem] sm:text-[5.8rem] text-[#f4f7fa] font-bold leading-tight tracking-tight"
          >
            {homeTexts("slide0.title")}
          </h1>
          <h2
            style={{ lineHeight: "1.3" }}
            className="text-[1.3rem] sm:text-[2rem] mt-5 whitespace-pre-line text-[#c8d8f8] font-light max-w-xl"
          >
            {homeTexts("slide0.subtitle")}
          </h2>

          {/* LinkButton — scopri di più / link ad APWEC */}
          <div style={{ pointerEvents: "auto" }}>
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
            <HeroModel
              progressMotion={smooth}
              rotationProgress={modelRotationY}
            />
            <motion.div
              style={{
                position: "absolute",
                inset: 16,
                background:
                  "linear-gradient(to top, rgba(12,24,70,0.97) 0%, rgba(12,24,70,0.65) 40%, rgba(12,24,70,0.1) 70%, transparent 100%)",
                opacity: modelMaskOpacity,
                pointerEvents: "none",
                zIndex: 2,
                borderRadius: "24px",
              }}
            />
          </motion.div>
        )}

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
              className="text-[2.8rem] sm:text-[4.0rem] text-[#f4f7fa] font-bold leading-tight"
            >
              {homeTexts("slide1.title")}
            </h1>
            <h2
              style={{ lineHeight: "1.3" }}
              className="text-[1.3rem] sm:text-[1.8rem] mt-4 whitespace-pre-line text-[#c8d8f8] font-light"
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
          <HomePageAbout progressMotion={smooth} />
        </motion.div>

        {/* ── ScatteredCards ──────────────────────────────────────────────── */}
        <ScatteredCards
          items={[
            {
              id: "1",
              image: "/images/1.jpg",
              label: "Prodotto",
              suptitle: "Business",
              title: "Strategia",
              subtitle:
                "Analizzare il mercato, validare il product-market fit e testare la solidità del modello di business.",
            },
            {
              id: "2",
              image: "/images/2.jpg",
              label: "Tecnologia",
              suptitle: "Ingegneria",
              title: "Innovazione",
              subtitle:
                "Sviluppare soluzioni energetiche all'avanguardia che ridefiniscono gli standard di settore.",
            },
            {
              id: "3",
              image: "/images/3.jpg",
              label: "Impatto",
              suptitle: "Ambiente",
              title: "Sostenibilità",
              subtitle:
                "Costruire un futuro energetico sostenibile attraverso tecnologia italiana d'eccellenza.",
            },
          ]}
          progress={smooth}
        />

        {/* ── Circle ──────────────────────────────────────────────────────── */}
        {/* <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            backgroundColor: "#1c398e",
            clipPath: circleClip,
            pointerEvents: "none",
          }}
        /> */}

        <motion.div
          style={{
            position: "fixed",
            bottom: 0,
            right:  0,
            // Diagonale dello schermo × 2 per coprire tutto
            width:  "283vmax",
            height: "283vmax",
            zIndex: 30,
            backgroundColor: "#1c398e",
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
              padding: "4rem 1.5rem 2rem",
              boxSizing: "border-box",
            }}
          >
            <FaqSection
              progress={smooth}
              progressStart={isMobile ? 6.3 : 6.4}
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
