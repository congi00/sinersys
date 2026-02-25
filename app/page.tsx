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

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null);
  const progressMotion = useMotionValue(0);
  const [showIntro, setShowIntro] = useState(true);
  const homeTexts = useTranslations("homepage");

  useEffect(() => {
    if (showIntro) return;

    const lenis = new Lenis({
      duration: 0.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      const progress = (e.scroll / e.limit) * 6;
      progressMotion.set(progress);
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
  const frameYAbout = useTransform(smooth, [2.0, 3.0], ["-270%", "-300%"]);
  const frameYCards = useTransform(smooth, [2.5, 3.5], ["-270%", "-300%"]);
  const frameYPromise = useTransform(smooth, [2.0, 3.5], ["0vh", "0vh"]);
  const frameYCTA = useTransform(smooth, [5.0, 6.0], ["105%", "-105%"]);
  const bgColor = useTransform(smooth, [2.1, 2.2, 4], ["#F4F7FA", "#1c398e", "linear-gradient(rgb(28, 57, 142) 89%, rgb(81, 118, 252) 94%, rgb(247, 251, 255) 100%)"]);

  // Animazione padding wrapper
  const wrapperInset = useTransform(smooth, [0, 1, 1.8, 2.3], [16, 0, 0, 16]);
  const wrapperCTAInset = useTransform(smooth, [0, 1, 1.8, 2.3], [16, 0, 0, 16]);
  const AboutOpacity = useTransform(smooth, [1, 1.2], [0, 1]);

  return (
    <div
      className={clsx(
        "relative min-h-screen max-h-screen",
        showIntro ? "overflow-hidden" : ""
      )}
    >
      <AnimatePresence>
        {showIntro && (
          <IntroParticles
            showIntro={showIntro}
            onFinish={() => setTimeout(() => setShowIntro(false), 10)}
          />
        )}
      </AnimatePresence>
      <motion.div className="relative" style={{ background: bgColor }}>
        <div className="h-[450vh]" />
        <Header />
        <motion.div
          style={{ inset: wrapperInset, y: frameY }}
          className={clsx("flex items-center justify-center fixed")}
        >
          <HomePage progressMotion={smooth} />
        </motion.div>
        <motion.div
          style={{ opacity: AboutOpacity, y: frameYAbout }}
          className="h-[100vh] flex items-start justify-center"
        >
          <HomePageAbout progressMotion={smooth} />
        </motion.div>
        <motion.div
          className="h-[50vh] flex items-start justify-center"
          style={{ y: frameYCards }}
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
          className="h-[100vh] flex items-start justify-center px-5"
          style={{ y: frameYPromise }}
        >
            <OurPromise
              title={homeTexts("slide3.title")}
              subtitle={homeTexts("slide3.subtitle")}
              disabledColor="#5C8BAF"
              enabledColor="#F4F7FA"
              progress={smooth}
            />
        </ motion.div>
        <motion.div
          style={{ inset: wrapperCTAInset, y: frameYCTA }}
          className={clsx("flex items-center justify-center fixed")}
        >
          <CallToActionHome progressMotion={smooth} />
        </motion.div>
        <MenuButton />
      </motion.div>
    </div>
  );
}
