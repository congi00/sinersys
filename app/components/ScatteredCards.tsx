"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type CardItem = {
  id: string;
  image: string;
  label: string;
  title?: string;
  suptitle?: string;
  subtitle?: string;
  link?: string;
};

type Props = {
  items: CardItem[];
  progress: MotionValue<number>;
};

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP TIMING
// ─────────────────────────────────────────────────────────────────────────────
// p 5.0→5.4  Card 0 enters from bottom-right (y: 100%→0, x stays 0%)
// p 5.4→5.8  Card 0 slides left (-100%), Card 1 enters from right (x: 100%→0%)
// p 5.8→6.2  Card 1 slides left (-100%), Card 0 exits (-200%), Card 2 enters (x: 100%→0%)
// p 6.2+     Card 1 and Card 2 stay FIXED — no more movement
//
// MOBILE TIMING
// ─────────────────────────────────────────────────────────────────────────────
// p 5.0→5.4  Card 0 enters from right (x: 100%→0%) full width
// p 5.4→5.8  Card 0 slides up (y: 0→-100%), Card 1 enters from bottom (y: 100%→0%)
// p 5.8→6.2  Card 1 slides up (y: 0→-100%), Card 2 enters from bottom (y: 100%→0%)
// p 6.2+     Card 2 stays FIXED

interface SingleCardProps {
  item: CardItem;
  index: number;
  progress: MotionValue<number>;
  isGlass: boolean;
  isMobile: boolean;
}

function SingleCard({ item, index, progress, isGlass, isMobile }: SingleCardProps) {
  const enterStart = 2.4 + index * 0.4;
  const enterEnd   = enterStart + 0.4;
  const slideStart = enterEnd;
  const slideEnd   = slideStart + 0.4;

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  // Card 0: enters from bottom (y: 100%→0), then slides left, then exits left
  // Card 1: enters from right (x: 100%→0), then slides left, then exits left
  // Card 2: enters from right (x: 100%→0), then STAYS — both card 1 and 2 remain

  const desktopY = useTransform(
    progress,
    index === 0 ? [enterStart, enterEnd] : [enterStart, enterStart],
    index === 0 ? ["100%", "0%"] : ["0%", "0%"]
  );

  const desktopX = (() => {
    if (index === 0) {
      // enters bottom (x stays 0), slides left to -100%, exits to -200%
      return useTransform(
        progress,
        [enterStart, enterEnd, slideStart, slideEnd, slideEnd, slideEnd + 0.4],
        ["0%", "0%", "0%", "-100%", "-100%", "-200%"]
      );
    }
    if (index === 1) {
      // enters from right, slides to left half, STAYS (no exit)
      return useTransform(
        progress,
        [enterStart, enterEnd, slideStart, slideEnd],
        ["100%", "0%", "0%", "-100%"]
      );
    }
    // Card 2: enters from right, STAYS at 0% (right half) — no more movement
    return useTransform(
      progress,
      [enterStart, enterEnd],
      ["100%", "0%"]
    );
  })();

  // Opacity: card 0 exits, cards 1 and 2 stay permanently
  const desktopOpacity = (() => {
    if (index === 0) {
      return useTransform(
        progress,
        [enterStart, slideEnd + 0.2, slideEnd + 0.4],
        [1, 1, 0]
      );
    }
    // Cards 1 and 2: appear and stay forever
    return useTransform(progress, [enterStart], [1]);
  })();

  // ── MOBILE ────────────────────────────────────────────────────────────────
  // Card 0: enters from right (x: 100%→0%), then slides up (y: 0→-100%), exits
  // Card 1: enters from bottom (y: 100%→0%), then slides up, exits
  // Card 2: enters from bottom (y: 100%→0%), STAYS

  const mobileX = (() => {
    if (index === 0) {
      // enters from right, then stays at 0 while sliding up
      return useTransform(
        progress,
        [enterStart, enterEnd],
        ["100%", "0%"]
      );
    }
    return useTransform(progress, [enterStart], ["0%"]);
  })();

  const mobileY = (() => {
    if (index === 0) {
      // slides up and exits after card 1 arrives
      return useTransform(
        progress,
        [enterEnd, slideStart, slideEnd, slideEnd + 0.4],
        ["0%", "0%", "-100%", "-100%"]
      );
    }
    if (index === 1) {
      // enters from bottom, slides up, stays
      return useTransform(
        progress,
        [enterStart, enterEnd, slideStart, slideEnd],
        ["100%", "0%", "0%", "-100%"]
      );
    }
    // Card 2: enters from bottom, STAYS
    return useTransform(
      progress,
      [enterStart, enterEnd],
      ["100%", "0%"]
    );
  })();

  const mobileOpacity = (() => {
    if (index === 0) {
      return useTransform(
        progress,
        [enterStart, slideEnd + 0.1, slideEnd + 0.3],
        [1, 1, 0]
      );
    }
    return useTransform(progress, [enterStart], [1]);
  })();

  // ── Styles ────────────────────────────────────────────────────────────────
  const bgStyle = isGlass
    ? {
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.18)",
      }
    : { background: "#ffffff" };

  const textColor = isGlass ? "#f4f7fa" : "#111827";
  const subColor  = isGlass ? "rgba(244,247,250,0.6)" : "#6b7280";

  if (isMobile) {
    return (
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100%",
          x: mobileX,
          y: mobileY,
          opacity: mobileOpacity,
          zIndex: 20 + index,
          overflow: "hidden",
          ...bgStyle,
        }}
      >
        <CardContent item={item} isGlass={isGlass} textColor={textColor} subColor={subColor} />
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        width: "50vw",
        height: "100%",
        x: desktopX,
        y: desktopY,
        opacity: desktopOpacity,
        zIndex: 20 + index,
        overflow: "hidden",
        ...bgStyle,
      }}
    >
      <CardContent item={item} isGlass={isGlass} textColor={textColor} subColor={subColor} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CardContent({ item, isGlass, textColor, subColor }: {
  item: CardItem;
  isGlass: boolean;
  textColor: string;
  subColor: string;
}) {
  return (
    <>
      {/* Image — top 55% */}
      <div style={{ position: "relative", width: "100%", height: "55%" }}>
        <Image
          src={item.image}
          alt={item.label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div style={{
          position: "absolute", inset: 0,
          background: isGlass
            ? "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.35) 100%)"
            : "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.08) 100%)"
        }} />
      </div>

      {/* Text — bottom 45% */}
      <div style={{
        padding: "2rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        height: "45%",
        justifyContent: "center",
      }}>
        {item.suptitle && (
          <p style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: isGlass ? "rgba(200,216,248,0.8)" : "#1c398e",
          }}>
            {item.suptitle}
          </p>
        )}
        <h2 style={{
          fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          color: textColor,
          margin: 0,
        }}>
          {item.title ?? item.label}
        </h2>
        {item.subtitle && (
          <p style={{
            fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
            lineHeight: 1.55,
            color: subColor,
            margin: 0,
          }}>
            {item.subtitle}
          </p>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ScatteredCards({ items, progress }: Props) {
  const cards = items.slice(0, 3);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {cards.map((item, index) => (
        <SingleCard
          key={item.id}
          item={item}
          index={index}
          progress={progress}
          isGlass={index === 1}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}