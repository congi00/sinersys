"use client";

import { motion, useTransform, MotionValue, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import CallToActionHome from "./CallToActionHome";

interface Props {
  progressMotion: MotionValue<number>;
  isMobile:       boolean;
  vhUnit:         string;
}

// ── Marquee text loop ─────────────────────────────────────────────────────────
// Pure CSS animation — no JS needed, performant, no layout dependency.
const MARQUEE_TEXT = "SINERSYS · NEW ENERGY FRONTIERS · ";

export default function WhiteSection({ progressMotion, isMobile, vhUnit }: Props) {
  // Section enters as circle shrinks away (p 5.2+)
  // Opacity/y of the whole section
  const sectionOpacity = useTransform(progressMotion, [6.0, 6.1], [0, 1]);
  const sectionY = useTransform(progressMotion, [6.0, 6.35], [0, 0]);
  const sectionCTAY = useTransform(progressMotion, [6.0, 6.35, 7.0, 7.01, 7.8], [0, 0, -320, -320, -1000]);
  const sectionCTAFlex = useTransform(progressMotion, [6.0, 6.35, 7.0, 7.1, 7.8], ["0 0 66.667%", "0 0 66.667%", "0 0 100%", "0 0 100%","0 0 66.667%"]);

  return (
    <motion.div
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     29,
        background: "#ffffff",
        opacity:    sectionOpacity,
        y:          sectionY,
        pointerEvents: "none",
        display:    "flex",
        flexDirection: "column",
        overflow:   "hidden",
      }}
    >
      {/* ── TOP THIRD: scrolling marquee title ──────────────────────────────
          Full-width ticker that scrolls right→left in a continuous loop.
      ──────────────────────────────────────────────────────────────────────── */}
      <motion.div style={{
        flex:          "0 0 33.333%",
        display:       "flex",
        alignItems:    "center",
        overflow:      "hidden",
        borderBottom:  "1px solid rgba(28,57,142,0.08)",
        position:      "relative",
        y: sectionCTAY,
      }}>
        {/* Left gradient fade */}
        <div style={{
          position:   "absolute", left: 0, top: 0, bottom: 0, width: "80px",
          background: "linear-gradient(to right, #ffffff, transparent)",
          zIndex:     2, pointerEvents: "none",
        }} />
        {/* Right gradient fade */}
        <div style={{
          position:   "absolute", right: 0, top: 0, bottom: 0, width: "80px",
          background: "linear-gradient(to left, #ffffff, transparent)",
          zIndex:     2, pointerEvents: "none",
        }} />

        {/* Marquee track — duplicated for seamless loop */}
        <div style={{
          display:     "flex",
          whiteSpace:  "nowrap",
          animation:   "marquee 18s linear infinite",
          willChange:  "transform",
        }}>
          {[0, 1].map((n) => (
            <span key={n} style={{
              fontSize:      "clamp(2.4rem, 5.5vw, 4.8rem)",
              fontWeight:    800,
              letterSpacing: "-0.02em",
              color:         "#0f2057",
              paddingRight:  "3rem",
              // Gradient on text
              background:         "linear-gradient(135deg, #1c398e 0%, #0a1540 55%, #2a52c9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip:      "text",
            }}>
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>

        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </motion.div>

      {/* ── BOTTOM TWO-THIRDS: partial CTA preview ──────────────────────────
          Shows ~60% of the CTA card peeking from below,
          giving the user a clear cue to keep scrolling.
          The actual CTA inset/radius animation is handled inside CallToActionHome.
      ──────────────────────────────────────────────────────────────────────── */}
      <motion.div style={{
        flex:     sectionCTAFlex,
        position: "relative",
        padding:  isMobile ? "12px 12px 0" : "20px 20px 0",
        y: sectionCTAY,
      }}>
        <CallToActionHome progressMotion={progressMotion} />
      </motion.div>
    </motion.div>
  );
}