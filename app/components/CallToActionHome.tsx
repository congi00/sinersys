"use client";

import { useRef, useEffect } from "react";
import { m, useTransform, MotionValue, useMotionValue } from "framer-motion";
import clsx from "clsx";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { useTranslations } from "next-intl";
import { HERO_SUBTITLE_CLASS, HERO_TITLE_CLASS, PRODUCT_TITLE_CARD, SUPTITLE_CLASS } from "../typography";

interface Props {
  progressMotion: MotionValue<number>;
  setOpen: Function;
}

export default function CallToActionHome({ progressMotion, setOpen }: Props) {
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
  const inset  = useTransform(progressMotion, [6.2, 7.0, 7.1, 7.8], [16, 0, 0, 16]);
  const radius = useTransform(progressMotion, [6.2, 7.0, 7.1, 7.8], [24, 0, 0, 24]);

  const insetStr  = useTransform(inset,  (v) => `${v}px`);
  const radiusStr = useTransform(radius, (v) => `${v}px`);

  // Content fade-in: appears as CTA expands to fullscreen
  const contentOpacity = useTransform(progressMotion, [6.4, 6.8], [0, 1]);
  const contentY       = useTransform(progressMotion, [6.4, 6.8], [30, 0]);

  // Autoplay video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  // linkButton color — always white on video bg
  const linkColor = useMotionValue("#f4f7fa");

  return (
    <m.div
      style={{
        position:     "absolute",
        inset:        insetStr,
        borderRadius: radiusStr,
        overflow:     "hidden",
        zIndex:       1,
      }}
    >
      {/* ── Video background ─────────────────────────────────────────────── */}
      <video autoPlay loop muted playsInline aria-hidden="true" style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}>
        <source src="/sinVidr.webm" type="video/webm" />
        <img src="/sinVidr.gif" alt="" /> {/* fallback */}
      </video>
      <img
        src="/sinVidr.gif"
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
      <m.div
        style={{
          position:  "relative",
          zIndex:    2,
          height:    "100%",
          display:   "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding:   "clamp(1vw, 7vw, 20vw)",
          opacity:   contentOpacity,
          y:         contentY,
        }}
        className="text-center"
      >
        {/* Suptitle */}
        <h4 style={{
          margin:        0,
          textTransform: "uppercase",
          color:         "rgba(180,210,255,0.75)",
          marginBottom:  "0.6rem",
          lineHeight: "1",
        }}
        className={clsx(
          SUPTITLE_CLASS,
          "[text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 px-3 sm:px-0 mt-3 sm:mt-5 text-[#a0b8e8]",
        )}
        >
          {homeTexts("cta.suptitle")}
        </h4>

        {/* Title */}
        <h2 style={{
          margin:        0,
          lineHeight:    1.0,
          color:         "#f4f7fa",
          marginBottom:  "10px",
        }}
          className={clsx(
            HERO_TITLE_CLASS,
            "px-3 sm:px-2 mt-3 text-[#f4f7fa] font-bold sm:whitespace-pre-line")}
        >
          {homeTexts("cta.title")}
        </h2>

        {/* Subtitle */}
        <p style={{
          margin:      0,
          lineHeight:  1.2,
          color:       "rgba(200,218,250,0.72)",
          marginBottom: "0.5rem",
        }}
        className={clsx(
          HERO_SUBTITLE_CLASS,
          "sm:px-[300px] mt-6 sm:mt-5 sm:mb-5 text-[#c8d8f8] font-light")}
        >
          {homeTexts("cta.subtitle")}
        </p>

        {/* LinkButton */}
        <div style={{ pointerEvents: "auto" }} onClick={() => setOpen()}>
          <LinkButton
            link="/"
            text={homeTexts("cta.link")}
            icon={<ArrowUpRight size={20} className="text-[#f4f7fa]" />}
            top="0"
            color={linkColor}
          />
        </div>
      </m.div>
    </m.div>
  );
}