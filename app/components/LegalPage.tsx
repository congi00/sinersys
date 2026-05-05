"use client";

/**
 * LegalPage — architettura corretta.
 *
 * PROBLEMA PRECEDENTE:
 *   - contentRef era sulla motion.div con y:contentY → scrollHeight inquinato
 *   - vhPx partiva da 1, quindi i keyframe erano calcolati male al primo render
 *   - Doppio spring su scrollPx causava lag eccessivo sul contentY
 *   - SCROLL_PX = contentH - vh, ma contentH veniva letto prima che il DOM
 *     fosse stabile
 *
 * SOLUZIONE:
 *   - Il contentRef va su un div STATICO (position:relative, no transform)
 *     che è il padre del contenuto. La motion.div del translate è separata.
 *   - contentY usa scrollPx RAW (1:1), senza spring — fluidità massima.
 *   - totalHeight ricalcolato ogni volta che contentH o vhPx cambiano.
 *   - Guard: se vhPx === 0 non renderizza (evita flash con keyframe errati).
 *
 * STRUTTURA DOM:
 *   <page-wrapper position:absolute height:totalHeight>
 *     <card position:fixed inset:0 y:cardY opacity:cardOp>
 *       <card-inner borderRadius overflow:hidden>
 *         <LiquidBg position:absolute />
 *         <measure-wrapper position:absolute inset:0 overflow:hidden>
 *           <motion.div y:contentY>          ← translateY qui
 *             <div ref={contentRef}>          ← misurazione qui (no transform)
 *               ...content...
 *             </div>
 *           </motion.div>
 *         </measure-wrapper>
 *       </card-inner>
 *     </card>
 *     <footer position:absolute bottom:0 />
 *   </page-wrapper>
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { detectIOS } from "../support/useViewportHeight";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuButton from "../components/MenuButton";
import LiquidBackground from "../components/LiquidBackground";
import { useAppSelector } from "../hooks";

// ─────────────────────────────────────────────────────────────────────────────
export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export interface LegalPageProps {
  label: string;
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
  accent?: string;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function SectionBlock({
  section,
  index,
}: {
  section: LegalSection;
  index: number;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "clamp(2rem,4vh,3rem)",
        marginTop: "clamp(2rem,4vh,3rem)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1rem",
          marginBottom: "1.1rem",
        }}
      >
        <span
          style={{
            fontSize: "clamp(0.58rem,0.78vw,0.68rem)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(160,196,255,0.35)",
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(1.4rem,2vw,1.55rem)",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            color: "#f4f7fa",
          }}
        >
          {section.heading}
        </h2>
      </div>
      <div
        style={{
          fontSize: "clamp(0.9rem,1.05vw,1rem)",
          lineHeight: 1.78,
          color: "rgba(200,218,250,0.72)",
        }}
      >
        {section.body}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LegalPage({
  label,
  title,
  subtitle,
  updated,
  sections,
  accent = "#1c398e",
}: LegalPageProps) {
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const scrollPx = useMotionValue(0);
  const [mounted, setMounted] = useState(false);
  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(1024);

  // ── content height — misurato sul div STATICO (senza transform applicato) ─
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

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

  // Measure viewport height accurately (handles iOS/Android quirks)
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

  // Measure content height from the STATIC wrapper (no transform contamination)
  useEffect(() => {
    if (!contentRef.current) return;
    const measure = () => {
      if (contentRef.current) {
        setContentH(
          contentRef.current.getBoundingClientRect().height ||
            contentRef.current.scrollHeight
        );
      }
    };
    const ro = new ResizeObserver(measure);
    ro.observe(contentRef.current);
    measure();
    return () => ro.disconnect();
  }, [mounted]);

  // Lenis / touch scroll → scrollPx MotionValue
  useEffect(() => {
    if (isTouchDevice()) {
      const onScroll = () => scrollPx.set(window.scrollY);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll: number }) => scrollPx.set(e.scroll));
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [scrollPx]);

  // Spring ONLY for decorative elements (inset/radius/card-exit)
  // contentY uses RAW scrollPx for 1:1 response
  const scrollSmooth = useSpring(scrollPx, {
    stiffness: isMobile ? 180 : 280,
    damping: isMobile ? 32 : 28,
    mass: isMobile ? 0.6 : 1,
  });

  const vh = vhPx || 768;

  // ── Scroll budget ────────────────────────────────────────────────────────
  const OPEN_PX = vh;
  const SCROLL_PX = Math.max(contentH - vh + 80, 0); // +80 = bottom breathing room
  const CLOSE_PX = vh * 0.3;
  const FOOTER_PX = isMobile ? 1000 : 320;

  const kReadEnd = OPEN_PX + SCROLL_PX;
  const kCloseEnd = kReadEnd + CLOSE_PX;
  const totalHeight = kCloseEnd + FOOTER_PX + vh;

  // ── Card Y exit — spring-smoothed ───────────────────────────────────────
  const cardY = useTransform(
    scrollSmooth,
    [0, kReadEnd - 200, kCloseEnd + FOOTER_PX - (isMobile ? 300 : 0)],
    [0, 0, -(CLOSE_PX * (isMobile? 4:3))]
  );

  // ── Content Y — RAW 1:1, no spring, no lag ──────────────────────────────
  // Maps: kOpen → 0px,  kReadEnd → -SCROLL_PX
  const contentY = useTransform(
    scrollPx,
    [0.3, kReadEnd - 200],
    [0, -SCROLL_PX],
    {
      clamp: true,
    }
  );

  const hiddenMenu  = useTransform(
    scrollPx,
    [0,kReadEnd, kCloseEnd],
    [1, 1, 0 ]
  );

  const menuTheme =  useTransform(
    scrollPx,
    [0],
    [0 ]
  );

  const liquidProgress = useMotionValue(0);
  const headerTheme = useMotionValue(0);
  const hPad = "clamp(1.5rem,8vw,7rem)";

  // Guard: wait until we have real measurements to avoid wrong keyframes
  if (!mounted || vhPx === 0) {
    return <div style={{ minHeight: "100vh", background: "#060d2a" }} />;
  }

  return (
    <>
      {/* ── Scroll spacer ─────────────────────────────────────────────── */}
      <div style={{ height: totalHeight }} aria-hidden />

      {/* ── Layer container ───────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: totalHeight, zIndex: 1 }}
      >
        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton menuTheme={menuTheme} hiddenMenu={hiddenMenu}/>}

        {/* ── CARD ────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            y: cardY,
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Liquid background — clipped by parent borderRadius */}
            <LiquidBackground
              progress={scrollSmooth}
              vhUnit={vhUnit}
              openPx={OPEN_PX}
              readEndPx={kReadEnd}
              closeEndPx={kCloseEnd}
              lockPalette
            />

            {/* Accent glow */}
            <div
              style={{
                position: "absolute",
                top: "-15%",
                right: "-8%",
                width: "55vw",
                height: "55vw",
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* ── Scroll viewport: clips the translating content ──────── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                zIndex: 3,
              }}
            >
              {/*
               * translateY wrapper — moves content upward as user scrolls.
               * Does NOT have ref (avoids measuring transformed height).
               */}
              <motion.div
                style={{
                  y: contentY,
                  willChange: "transform",
                }}
              >
                {/*
                 * STATIC measurement wrapper — no transform, no position:absolute.
                 * ResizeObserver reads scrollHeight here reliably.
                 */}
                <div ref={contentRef}>
                  {/* Hero */}
                  <div
                    style={{
                      padding: `clamp(5rem,10vh,7rem) ${hPad} clamp(2.5rem,5vh,3.5rem)`,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "1px",
                          background: `${accent}cc`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "clamp(0.62rem,0.85vw,0.72rem)",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(160,196,255,0.65)",
                        }}
                      >
                        {label}
                      </span>
                    </div>

                    <h1
                      style={{
                        margin: 0,
                        fontSize: "clamp(2.4rem,6vw,5.2rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        lineHeight: 0.95,
                        color: "#f4f7fa",
                        marginBottom: "1rem",
                      }}
                    >
                      {title}
                    </h1>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "clamp(0.9rem,1.4vw,1.1rem)",
                        lineHeight: 1.6,
                        color: "rgba(200,218,250,0.68)",
                        maxWidth: "560px",
                      }}
                    >
                      {subtitle}
                    </p>

                    <p
                      style={{
                        margin: "1.1rem 0 0",
                        fontSize: "clamp(0.62rem,0.85vw,0.72rem)",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: "rgba(160,196,255,0.38)",
                      }}
                    >
                      {updated}
                    </p>
                  </div>

                  {/* Sections */}
                  <div
                    style={{
                      padding: `0 ${hPad} clamp(4rem,8vh,6rem)`,
                    }}
                  >
                    {sections.map((s, i) => (
                      <SectionBlock key={i} section={s} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── FOOTER — absolute, appears after card exits ──────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 11,
          }}
        >
          <Footer />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared text helpers (invariati)
// ─────────────────────────────────────────────────────────────────────────────
export function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 0.9rem",
        lineHeight: 1.78,
        color: "rgba(200,218,250,0.70)",
      }}
    >
      {children}
    </p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        margin: "0.5rem 0 1rem",
        paddingLeft: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.45rem",
        listStyle: "none",
      }}
    >
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        color: "rgba(200,218,250,0.68)",
        lineHeight: 1.65,
        paddingLeft: "1.2rem",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: "0.6em",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "rgba(100,150,255,0.55)",
          display: "block",
        }}
      />
      {children}
    </li>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong style={{ color: "#c8d8f8", fontWeight: 600 }}>{children}</strong>
  );
}
