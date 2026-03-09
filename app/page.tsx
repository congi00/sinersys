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
import HomePageAbout from "./containers/HomePageAbout";
import ScatteredCards from "./components/ScatteredCards";
import OurPromise from "./components/OurPromise";
import { useTranslations } from "next-intl";
import CallToActionHome from "./components/CallToActionHome";
import Footer from "./components/Footer";
import { useAppSelector } from "./hooks";
import { detectIOS } from "./support/useViewportHeight";
import FaqSection from "./components/FaqSection";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function Home() {
  const progressMotion = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);
  const homeTexts = useTranslations("homepage");
  const openContact = useAppSelector((state) => state.siteState.openContact);
  const navigationState = useAppSelector(
    (state) => state.siteState.navigationState
  );
  const [vhPx, setVhPx] = useState(0);

  const isIOS = detectIOS();
  const vhUnit = isIOS ? "lvh" : "dvh";

  useEffect(() => {
    // vhPx serve solo per totalHeight e le animazioni di uscita (aboutExitY, cardsExitY)
    // Misura 100lvh su iOS, 100dvh altrove — coerente con vhUnit
    const measure = () => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${
        isIOS ? "lvh" : "dvh"
      };pointer-events:none;visibility:hidden;`;
      document.body.appendChild(el);
      const h = el.getBoundingClientRect().height;
      document.body.removeChild(el);
      setVhPx(h);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else if (navigationState === 3) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showIntro, navigationState]);

  useEffect(() => {
    if (showIntro) return;

    const isTouch = isTouchDevice();

    if (isTouch) {
      const onScroll = () => {
        const sy = window.scrollY;
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) {
          progressMotion.set(Math.min(6, (sy / limit) * 6));
          scrollY.set(sy);
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } else {
      const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        progressMotion.set(Math.min(6, (e.scroll / e.limit) * 6));
        scrollY.set(e.scroll);
      });
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }
  }, [progressMotion, scrollY, showIntro]);

  const smooth = useSpring(progressMotion, { stiffness: 200, damping: 20 });

  const frameY = useTransform(smooth, [1.5, 2.3], ["0%", "-105%"]);
  const wrapperInset = useTransform(smooth, [0, 1, 1.8, 2.4], [16, 0, 0, 16]);
  const heroHeight = useTransform(
    wrapperInset,
    (v) =>
      `calc(100${vhUnit} - ${
        v * 2
      }px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );
  const heroTop = useTransform(
    wrapperInset,
    (v) => `calc(${v}px + env(safe-area-inset-top))`
  );

  const wrapperCTAInset = useTransform(
    smooth,
    [3.6, 4.3, 4.4, 5.1],
    [16, 0, 0, 16]
  );
  const ctaHeight = useTransform(
    wrapperCTAInset,
    (v) =>
      `calc(100${vhUnit} - ${
        v * 2
      }px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );
  const ctaTop = useTransform(
    wrapperCTAInset,
    (v) => `calc(${v}px + env(safe-area-inset-top))`
  );
  const ctaFrameY = useTransform(
    smooth,
    [3.6, 4.3, 4.4, 5.2],
    ["105%", "0%", "0%", "-105%"]
  );

  const bgColor = useTransform(
    smooth,
    [2.1, 2.2, 3.5, 3.6],
    ["#F4F7FA", "#1c398e", "#1c398e", "#F4F7FA"]
  );

  // aboutExitY e cardsExitY usano vhPx (px assoluti) perché y di Framer Motion
  // non accetta stringhe CSS con vhUnit dinamico
  const AboutOpacity = useTransform(smooth, [1, 1.2], [0, 1]);
  const aboutExitY = useTransform(smooth, [3.3, 3.5], [0, -vhPx]);
  const cardsExitY = useTransform(smooth, [3.3, 4.5], [0, -vhPx]);

  if (vhPx === 0) return <div className="min-h-screen bg-[#F4F7FA]" />;

  // totalHeight in px — necessario per lo spacer che gonfia il body
  // Usa vhPx (= 100lvh/dvh misurato) moltiplicato per il numero di "schermate"
  const spacerPx = 3.5 * vhPx;
  const totalHeight = spacerPx + vhPx * 4 + 900;

  return (
    <>
      <motion.div
        style={{
          height: totalHeight,
          pointerEvents: "none",
          backgroundColor: bgColor,
        }}
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
              onFinish={() => setTimeout(() => setShowIntro(false), 10)}
            />
          )}
        </AnimatePresence>

        {!openContact && <Header />}

        {/* Hero */}
        <motion.div
          style={{
            position: "fixed",
            left: wrapperInset,
            right: wrapperInset,
            top: heroTop,
            height: heroHeight,
            y: frameY,
            zIndex: 10,
          }}
          className="flex items-center justify-center"
        >
          <HomePage progressMotion={smooth} />
        </motion.div>

        {/* About */}
        <motion.div
          style={{
            position: "absolute",
            top: `calc(3.5 * 100${vhUnit})`,
            left: 0,
            right: 0,
            // minHeight: `100${vhUnit}`,
            opacity: AboutOpacity,
            y: aboutExitY,
          }}
          className="flex items-start justify-center"
        >
          <HomePageAbout progressMotion={smooth} />
        </motion.div>

        {/* ScatteredCards */}
        <motion.div
          style={{
            position: "absolute",
            top: `calc(4.2 * 100${vhUnit})`,
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
              { id: "4", image: "/images/4.jpg", label: "descrizione 4" },
              { id: "5", image: "/images/5.jpg", label: "descrizione 5" },
            ]}
            progress={progressMotion}
          />
        </motion.div>

        {/* OurPromise */}
        <div
          style={{
            position: "absolute",
            top: `calc(4.9 * 100${vhUnit})`,
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

        {/* CTA */}
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

        {/* FAQ */}
        <div
          style={{
            position: "absolute",
            top: `calc(7.3 * 100${vhUnit})`,
            left: 0,
            right: 0,
          }}
          className="flex items-start justify-center"
        >
          <FaqSection
            progress={smooth}
            progressStart={3.5}
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

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            top: spacerPx + vhPx * 4 + 650,
            left: 0,
            right: 0,
          }}
        >
          <Footer />
        </div>

        {!openContact && <MenuButton />}
      </div>
    </>
  );
}
