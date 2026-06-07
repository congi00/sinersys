"use client";

import { useEffect, useState } from "react";
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import Header from "./Header";
import MenuButton from "./MenuButton";
import clsx from "clsx";
import Footer from "./Footer";
import { useAppSelector } from "../hooks";
import { detectIOS } from "../support/useViewportHeight";
import ContactDrawer from "./ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import { useAppDispatch } from "../hooks";
import CookieBanner from "./CookieBanner";
import { useMotionValueEvent } from "framer-motion";
import dynamic from "next/dynamic";

const LiquidBackground = dynamic(() => import('./LiquidBackground'), {
    ssr: false,
    loading: () => <div className="h-screen bg-[#1c398e]" />
  });
  

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function NotFoundContent() {
  const [mounted, setMounted] = useState(false);
  const progressMotion = useMotionValue(0);
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const dispatch = useAppDispatch();

  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(1024);

  const isMobile = width <= 768;
  const isIOS = mounted ? detectIOS() : false;
  const vhUnit = isIOS ? "lvh" : "dvh";

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
    if (isTouchDevice()) {
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
        // Lerp manuale: 0.1 = smooth ma reattivo su Android
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

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      progressMotion.set(Math.min(9, (e.scroll / e.limit) * 9));
    });
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, {
    stiffness: isMobile ? 180 : 280,
    damping: isMobile ? 32 : 28,
    mass: isMobile ? 0.6 : 1,
  });
  const vh = vhPx || 1;

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
  const totalHeight = isMobile ? vh * 12.8 + 800 : vh * 11 + 700;

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
        )}
        style={{ height: totalHeight, zIndex: 1 }}
      >

        {!openContact && <Header headerTheme={headerTheme} />}

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

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </div>
      <CookieBanner />
    </main>
  );
}