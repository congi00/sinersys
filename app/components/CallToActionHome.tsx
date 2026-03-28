"use client";

import { useRef, useEffect } from "react";
import { motion, useTransform, MotionValue, useMotionValue } from "framer-motion";
import clsx from "clsx";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { useTranslations } from "next-intl";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function CallToActionHome({ progressMotion }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const homeTexts = useTranslations("homepage");

  // ── inset & borderRadius animation ────────────────────────────────────────
  // Timeline (progress):
  //   5.2   → section appears (circle gone), inset:16 radius:24
  //   5.6   → CTA fills viewport (inset:0  radius:0 )
  //   6.8   → CTA still full-screen
  //   7.2   → CTA shrinks back  (inset:16 radius:24)
  //
  // Expressed as CSS shorthand via useTransform on a number, then converted.
  const inset  = useTransform(progressMotion, [5.2, 6.0, 6.1, 6.8], [16, 0, 0, 16]);
  const radius = useTransform(progressMotion, [5.2, 6.0, 6.1, 6.8], [24, 0, 0, 24]);

  const insetStr  = useTransform(inset,  (v) => `${v}px`);
  const radiusStr = useTransform(radius, (v) => `${v}px`);

  // Content fade-in: appears as CTA expands to fullscreen
  const contentOpacity = useTransform(progressMotion, [5.4, 5.8], [0, 1]);
  const contentY       = useTransform(progressMotion, [5.4, 5.8], [30, 0]);

  // Autoplay video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  // linkButton color — always white on video bg
  const linkColor = useMotionValue("#ffffff");

  return (
    <motion.div
      style={{
        position:     "absolute",
        inset:        insetStr,
        borderRadius: radiusStr,
        overflow:     "hidden",
        zIndex:       1,
      }}
    >
      {/* ── Video background ─────────────────────────────────────────────── */}
      <img
        src="/sinVidCompressed.gif"
        alt="background animation"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* ── Overlay: dark gradient + subtle colour tint ───────────────────── */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: [
          "linear-gradient(to bottom, rgba(8,16,52,0.65) 0%, rgba(8,16,52,0.40) 40%, rgba(8,16,52,0.72) 100%)",
          "linear-gradient(135deg, rgba(28,57,142,0.30) 0%, transparent 60%)",
        ].join(", "),
        pointerEvents: "none",
      }} />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          position:  "relative",
          zIndex:    2,
          height:    "100%",
          display:   "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding:   "clamp(2rem, 5vw, 4rem)",
          opacity:   contentOpacity,
          y:         contentY,
        }}
      >
        {/* Suptitle */}
        <p style={{
          margin:        0,
          fontSize:      "clamp(0.7rem, 1vw, 0.85rem)",
          fontWeight:    600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         "rgba(180,210,255,0.75)",
          marginBottom:  "0.6rem",
        }}>
          {homeTexts("cta.suptitle")}
        </p>

        {/* Title */}
        <h2 style={{
          margin:        0,
          fontSize:      "clamp(2rem, 4.5vw, 3.8rem)",
          fontWeight:    700,
          lineHeight:    1.05,
          letterSpacing: "-0.025em",
          color:         "#f4f7fa",
          marginBottom:  "1rem",
          maxWidth:      "700px",
        }}>
          {homeTexts("cta.title")}
        </h2>

        {/* Subtitle */}
        <p style={{
          margin:      0,
          fontSize:    "clamp(0.9rem, 1.4vw, 1.15rem)",
          fontWeight:  400,
          lineHeight:  1.55,
          color:       "rgba(200,218,250,0.72)",
          maxWidth:    "520px",
          marginBottom: "0.5rem",
        }}>
          {homeTexts("cta.subtitle")}
        </p>

        {/* LinkButton */}
        <LinkButton
          link="/contatti"
          text={homeTexts("cta.link")}
          icon={<ArrowUpRight size={20} className="text-white" />}
          top="0"
          color={linkColor}
        />
      </motion.div>
    </motion.div>
  );
}