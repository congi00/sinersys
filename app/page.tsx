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

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null);
  const progressMotion = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);
  const homeTexts = useTranslations("homepage");
  const openContact = useAppSelector((state) => state.siteState.openContact);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showIntro) return;

    const lenis = new Lenis({
      duration: 0.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
      const sy = lenis.scroll;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${sy}px)`;
      }
      if (ctaRef.current) {
        ctaRef.current.style.transform = `translateY(${sy}px)`;
      }
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      const progress = (e.scroll / e.limit) * 6;
      progressMotion.set(progress);
      scrollY.set(e.scroll);
    });

    return () => {
      lenis.destroy();
    };
  }, [progressMotion, showIntro]);

  const smooth = useSpring(progressMotion, {
    stiffness: 200,
    damping: 20,
  });

  const frameY = useTransform(smooth, [1.5, 2.5], ["0%", "-105%"]);
  const frameYCTA = useTransform(smooth, [4.0, 4.5], ["0%", "0%"]);
  const bgColor = useTransform(
    smooth,
    [2.1, 2.2, 3.5, 3.8],
    [
      "#F4F7FA",
      "#1c398e",
      "#1c398e",
      "#F4F7FA",
    ]
  );

  // Animazione padding wrapper
  const wrapperInset = useTransform(smooth, [0, 1, 1.8, 2.3], [16, 0, 0, 16]);
  const wrapperCTAInset = useTransform(
    smooth,
    [0, 1, 1.8, 2.3],
    [16, 0, 0, 16]
  );
  const AboutOpacity = useTransform(smooth, [1, 1.2], [0, 1]);

  const heroHeight = useTransform(
    wrapperInset,
    (v) =>
      `calc(100${detectIOS() ? "lvh" : "dvh"} - ${
        v * 2
      }px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
  );

  const heroTop = useTransform(
    wrapperInset,
    (v) => `calc(${v}px + env(safe-area-inset-top))`
  );

  return (
    <motion.div
      className={clsx("relative", showIntro ? "overflow-hidden" : "")}
      style={{ background: bgColor }}
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
      <div className="h-[450vh]" />
      <motion.div
        ref={heroRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          willChange: "transform",
        }}
      >
        <motion.div
          style={{
            left: wrapperInset,
            right: wrapperInset,
            top: heroTop,
            height: heroHeight,
            y: frameY,
            position: "absolute",
          }}
          className={clsx("flex items-center justify-center")}
        >
          <HomePage progressMotion={smooth} />
        </motion.div>
      </motion.div>
      <motion.div
        style={{ opacity: AboutOpacity, y: "-150%" }}
        className={clsx(
          detectIOS() ? "h-[100lvh]" : "h-[100dvh]",
          "flex items-start justify-center"
        )}
      >
        <HomePageAbout progressMotion={smooth} />
      </motion.div>
      <motion.div
        className={clsx(
          detectIOS() ? "h-[100lvh]" : "h-[100dvh]",
          "flex items-start justify-center w-[100vw]"
        )}
        style={{ y: "-160%" }}
      >
        <ScatteredCards
          items={[
            {
              id: "1",
              image: "/images/1.jpg",
              label: "descrizione 1",
            },
            {
              id: "2",
              image: "/images/2.jpg",
              label: "descrizione 2",
            },
            {
              id: "3",
              image: "/images/3.jpg",
              label: "descrizione 3",
            },
            {
              id: "4",
              image: "/images/4.jpg",
              label: "descrizione 4",
            },
            {
              id: "5",
              image: "/images/5.jpg",
              label: "descrizione 5",
            },
          ]}
          progress={progressMotion}
        />
      </motion.div>

      <motion.div
        className={clsx(
          detectIOS() ? "h-[100lvh]" : "h-[100dvh]",
          "flex items-start justify-center px-5"
        )}
        style={{ y: "-170%" }}
      >
        <OurPromise
          title={homeTexts("slide3.title")}
          subtitle={homeTexts("slide3.subtitle")}
          disabledColor="#5C8BAF"
          enabledColor="#F4F7FA"
          progress={smooth}
        />
      </motion.div>
      <motion.div
        className="flex items-start justify-center"
        style={{ y: "-215%" }} // adatta questo valore al tuo layout
      >
        <FaqSection
          progress={smooth}
          progressStart={3.5} // il range di progress in cui entra in scena
          title="Here are the essentials about our service, how it works, and what makes it unique."
          suptitle="FAQ"
          items={[
            {
              question: "What exactly does Nfinite sell?",
              answer:
                "Nfinite develops and sells a high-performance paper-based material that replaces conventional plastic packaging. Our material is fully recyclable, compostable, and designed to meet the same mechanical requirements as traditional plastic films.",
            },
            {
              question: "Does Nfinite paper require lamination?",
              answer:
                "No lamination needed. Our proprietary coating technology provides barrier properties directly on the paper surface, eliminating the need for multi-layer lamination processes while maintaining excellent moisture and oxygen resistance.",
            },
            {
              question: "Will it run on existing packing lines?",
              answer:
                "Yes. Nfinite paper is engineered to be drop-in compatible with standard horizontal and vertical form-fill-seal machines, with minimal to no equipment modifications required.",
            },
            {
              question: "Does Nfinite paper contain metal?",
              answer:
                "No. Our material is entirely metal-free, making it fully compatible with microwave use and industrial composting streams, as well as standard paper recycling facilities.",
            },
            {
              question: "What's the aspect of Nfinite paper?",
              answer:
                "Nfinite paper looks and feels just like paper. Our coating is fully transparent, so it doesn't have a metallic appearance on the inside or outside.",
            },
          ]}
        />
      </motion.div>
      <motion.div
        ref={ctaRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "67%",
          willChange: "transform",
        }}
      >
        <motion.div
          style={{
            left: wrapperCTAInset,
            right: wrapperCTAInset,
            top: "67%",
            height: heroHeight,
            // y: frameYCTA,
            position: "absolute",
          }}
          className="flex items-center justify-center"
        >
          <CallToActionHome progressMotion={smooth} />
        </motion.div>
      </motion.div>
      {!openContact && <MenuButton />}
      <Footer />
    </motion.div>
  );
}
