"use client";

/**
 * LegalPage — architettura pulita e definitiva.
 *
 * STRUTTURA:
 *   - Spacer div (height = totalHeight) per dare altezza scrollabile alla pagina
 *   - LiquidBackground position:fixed zIndex:0 (sfondo sempre visibile)
 *   - Card position:fixed inset:0 zIndex:10
 *     └─ Outer motion.div: padding animato (= effetto inset), y animata (uscita)
 *        └─ Inner div: borderRadius animato, overflow:hidden, background:rgba scuro
 *           ├─ LiquidBackground position:absolute (clippata dal borderRadius)
 *           └─ Content div position:absolute translateY animato (scorre il testo)
 *   - Footer position:absolute bottom:0 zIndex:11
 *
 * SCROLL TIMELINE (scrollY in px):
 *   0 → OPEN_PX        padding 16→0, radius 24→0     (card si apre)
 *   OPEN_PX → CLOSE_S  contentY 0 → -(contentH-vh)   (testo scorre)
 *   CLOSE_S → CLOSE_E  padding 0→16, radius 0→24,     (card si chiude)
 *                       card.y 0 → -CLOSE_PX          (card sale ed esce)
 *
 * NESSUNO SPRING sul contentY — risposta 1:1 allo scroll per fluidità massima.
 * Spring solo su padding/radius (decorativi).
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
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
  body:    React.ReactNode;
}

export interface LegalPageProps {
  label:    string;
  title:    string;
  subtitle: string;
  updated:  string;
  sections: LegalSection[];
  accent?:  string;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function SectionBlock({ section, index }: { section: LegalSection; index: number }) {
  return (
    <div style={{
      borderTop:  "1px solid rgba(255,255,255,0.08)",
      paddingTop: "clamp(2rem,4vh,3rem)",
      marginTop:  "clamp(2rem,4vh,3rem)",
    }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:"1rem", marginBottom:"1.1rem" }}>
        <span style={{ fontSize:"clamp(0.58rem,0.78vw,0.68rem)", fontWeight:700, letterSpacing:"0.18em", color:"rgba(160,196,255,0.35)", flexShrink:0 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 style={{ margin:0, fontSize:"clamp(1.8rem,2vw,1.55rem)", fontWeight:700, letterSpacing:"-0.015em", lineHeight:1.2, color:"#f4f7fa" }}>
          {section.heading}
        </h2>
      </div>
      <div style={{ fontSize:"clamp(1.38rem,1.2vw,1rem)", lineHeight:1.78, color:"rgba(200,218,250,0.72)" }}>
        {section.body}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LegalPage({
  label, title, subtitle, updated, sections, accent = "#1c398e",
}: LegalPageProps) {
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const isIOS       = detectIOS();

  // Two separate MotionValues:
  // scrollPx  — raw scrollY in pixels, updated by Lenis
  // scrollSmooth — spring-smoothed version, used only for inset/radius
  const scrollPx     = useMotionValue(0);
  const scrollSmooth = useSpring(scrollPx, { stiffness: 380, damping: 36 });

  const [vhPx, setVhPx]        = useState(0);
  const [contentH, setContentH] = useState(4000);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure viewport height
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
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [isIOS]);

  // Measure content height (the absolute div inside the card)
  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    setContentH(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, [sections]);

  // Lenis — updates scrollPx with raw pixel value (no normalization)
  useEffect(() => {
    if (isTouchDevice()) {
      const fn = () => scrollPx.set(window.scrollY);
      fn();
      window.addEventListener("scroll", fn, { passive: true });
      return () => window.removeEventListener("scroll", fn);
    }
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll: number }) => scrollPx.set(e.scroll));
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, [scrollPx]);

  const vh = vhPx || 800;

  // ── Scroll budget (all in raw pixels) ────────────────────────────────────
  //
  // OPEN_PX:   how many px to scroll while the card opens (inset collapses)
  // SCROLL_PX: how many px to scroll to read all the text
  //            = max(contentH - vh, 0)  — exactly what doesn't fit in one screen
  // CLOSE_PX:  how many px to scroll while the card closes
  //
  // Keyframes on scrollY:
  //   0           → card closed (inset:16, radius:24)
  //   OPEN_PX     → card fully open (inset:0, radius:0), content at top
  //   OPEN_PX + SCROLL_PX   → content fully scrolled (last line visible)
  //   OPEN_PX + SCROLL_PX + CLOSE_PX → card fully closed again, y offset applied

  const OPEN_PX  = vh * 0.45;
  const SCROLL_PX = Math.max(contentH - vh, 0);
  const CLOSE_PX = vh * 0.45;
  const FOOTER_PX = 300; // space for footer after card exits

  const kOpen    = OPEN_PX;
  const kReadEnd = OPEN_PX + SCROLL_PX;
  const kCloseEnd= kReadEnd + CLOSE_PX;

  const totalHeight = kCloseEnd + FOOTER_PX + vh;

  // ── inset (padding on outer div) — spring-smoothed ────────────────────────
  const insetPx = useTransform(
    scrollSmooth,
    [0, kOpen, kReadEnd, kCloseEnd],
    [16, 0, 0, 16]
  );
  const radiusPx = useTransform(
    scrollSmooth,
    [0, kOpen, kReadEnd, kCloseEnd],
    [24, 0, 0, 24]
  );
  const padStr = useTransform(insetPx,  (v) => `${v}px`);
  const radStr = useTransform(radiusPx, (v) => `${v}px`);

  // ── Card Y exit — spring-smoothed (nice easing on exit) ──────────────────
  const cardY  = useTransform(scrollSmooth, [kReadEnd, kCloseEnd], [0, -(CLOSE_PX * 2.8)]);
  const cardOp = useTransform(scrollSmooth, [kReadEnd + CLOSE_PX * 0.4, kCloseEnd], [1, 0]);

  // ── Content translateY — RAW (1:1 with scroll, zero latency) ─────────────
  // At kOpen:    contentY = 0    (top of text visible)
  // At kReadEnd: contentY = -SCROLL_PX (bottom of text visible)
  const contentY = useTransform(
    scrollPx,
    [kOpen, kReadEnd],
    [0, -SCROLL_PX],
    { clamp: true }
  );

  // LiquidBackground progress (always 0 = dark palette)
  const liquidProgress = useMotionValue(0);
  const headerTheme    = useMotionValue(0);
  const hPad = "clamp(1.5rem,8vw,7rem)";

  if (vhPx === 0) return <div style={{ minHeight: "100vh" }} />;

  return (
    <>
      {/* ── Scroll spacer — gives the page its scrollable height ────── */}
      <div style={{ height: totalHeight }} aria-hidden />

      {/* ── Layer container ─────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: totalHeight, zIndex: 1 }}
      >
        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton />}

        {/* ── CARD ────────────────────────────────────────────────────────
            Outer: fixed, inset:0. Padding = visual inset effect.
            Inner: clips via overflow:hidden + borderRadius.
            Content div: absolute, translates upward as user scrolls.
        ──────────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset:    0,
            zIndex:   10,
            padding:  padStr,
            y:        cardY,
            opacity:  cardOp,
          }}
        >
          <motion.div
            style={{
              width:        "100%",
              height:       "100%",
              borderRadius: radStr,
              overflow:     "hidden",
              position:     "relative",
            }}
          >
            {/* LiquidBackground — automatically clipped by parent borderRadius */}
            <LiquidBackground
              style={{
                position:      "absolute",
                inset:         0,
                zIndex:        0,
                pointerEvents: "none",
              }}
            />

            {/* Subtle dark overlay for text readability over the liquid bg */}
            <div style={{
              position:      "absolute",
              inset:         0,
              background:   "trasparent",
              zIndex:        1,
              pointerEvents: "none",
            }} />

            {/* Accent glow */}
            <div style={{
              position:      "absolute",
              top:           "-15%",
              right:         "-8%",
              width:         "55vw",
              height:        "55vw",
              background:    `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              pointerEvents: "none",
              zIndex:        2,
            }} />

            {/* ── Content — translates upward (1:1 with scroll) ──────── */}
            <motion.div
              ref={contentRef}
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                right:      0,
                y:          contentY,
                zIndex:     3,
                willChange: "transform",
              }}
            >
              {/* Hero */}
              <div style={{
                padding: `clamp(5rem,10vh,7rem) ${hPad} clamp(2.5rem,5vh,3.5rem)`,
              }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"1.5rem" }}>
                  <div style={{ width:"28px", height:"1px", background:`${accent}cc` }} />
                  <span style={{ fontSize:"clamp(0.62rem,0.85vw,0.72rem)", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(160,196,255,0.65)" }}>
                    {label}
                  </span>
                </div>
                <h1 style={{ margin:0, fontSize:"clamp(2.4rem,6vw,5.2rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:0.95, color:"#f4f7fa", marginBottom:"1rem" }}>
                  {title}
                </h1>
                <p style={{ margin:0, fontSize:"clamp(0.9rem,1.4vw,1.1rem)", lineHeight:1.6, color:"rgba(200,218,250,0.68)", maxWidth:"560px" }}>
                  {subtitle}
                </p>
                <p style={{ margin:"1.1rem 0 0", fontSize:"clamp(0.62rem,0.85vw,0.72rem)", fontWeight:600, letterSpacing:"0.08em", color:"rgba(160,196,255,0.38)" }}>
                  {updated}
                </p>
              </div>

              {/* Sections */}
              <div style={{ padding: `0 ${hPad} clamp(3rem,5vh,4rem)` }}>
                {sections.map((s, i) => (
                  <SectionBlock key={i} section={s} index={i} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── FOOTER — absolute, appears after card exits ──────────────── */}
        <div
          style={{
            position: "absolute",
            bottom:   0,
            left:     0,
            right:    0,
            zIndex:   11,
          }}
        >
          <Footer />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared text helpers
// ─────────────────────────────────────────────────────────────────────────────
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin:"0 0 0.9rem", lineHeight:1.78, color:"rgba(200,218,250,0.70)" }}>{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ margin:"0.5rem 0 1rem", paddingLeft:0, display:"flex", flexDirection:"column", gap:"0.45rem", listStyle:"none" }}>
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ color:"rgba(200,218,250,0.68)", lineHeight:1.65, paddingLeft:"1.2rem", position:"relative" }}>
      <span style={{ position:"absolute", left:0, top:"0.6em", width:"4px", height:"4px", borderRadius:"50%", background:"rgba(100,150,255,0.55)", display:"block" }} />
      {children}
    </li>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color:"#c8d8f8", fontWeight:600 }}>{children}</strong>;
}