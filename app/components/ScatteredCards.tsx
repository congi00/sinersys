"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "@deemlol/next-icons"

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

interface SingleCardProps {
  item: CardItem;
  index: number;
  progress: MotionValue<number>;
  isGlass: boolean;
  isMobile: boolean;
}

function SingleCard({ item, index, progress, isGlass, isMobile }: SingleCardProps) {
  const enterStart = 3.4 + index * 0.4;
  const enterEnd   = enterStart + 0.4;
  const slideStart = enterEnd;
  const slideEnd   = slideStart + 0.4;

  const desktopY = useTransform(
    progress,
    index === 0 ? [enterStart, enterEnd] : [enterStart, enterStart],
    index === 0 ? ["100%", "0%"] : ["0%", "0%"]
  );

  const desktopX = (() => {
    if (index === 0) {
      return useTransform(
        progress,
        [enterStart, enterEnd, slideStart, slideEnd, slideEnd, slideEnd + 0.4],
        ["0%", "0%", "0%", "-100%", "-100%", "-200%"]
      );
    }
    if (index === 1) {
      return useTransform(
        progress,
        [enterStart, enterEnd, slideStart, slideEnd],
        ["100%", "0%", "0%", "-100%"]
      );
    }
    return useTransform(progress, [enterStart, enterEnd], ["100%", "0%"]);
  })();

  const desktopOpacity = (() => {
    if (index === 0) {
      return useTransform(progress, [enterStart, slideEnd + 0.2, slideEnd + 0.4], [1, 1, 0]);
    }
    return useTransform(progress, [enterStart], [1]);
  })();

  const mobileX = (() => {
    if (index === 0) return useTransform(progress, [enterStart, enterEnd], ["100%", "0%"]);
    return useTransform(progress, [enterStart], ["0%"]);
  })();

  const mobileY = (() => {
    if (index === 0) {
      return useTransform(progress, [0, enterEnd - 0.5, enterEnd, slideStart, slideEnd, slideEnd + 0.4], ["120%", "120%" ,"0%", "0%", "-100%", "-100%"]);
    }
    if (index === 1) {
      return useTransform(progress, [enterStart, enterEnd, slideStart, slideEnd], [ "100%", "0%", "0%", "-100%"]);
    }
    return useTransform(progress, [enterStart, enterEnd], [ "100%", "0%"]);
  })();

  const mobileOpacity = (() => {
    if (index === 0) {
      return useTransform(progress, [enterStart - 0.1, enterStart, slideEnd + 0.1, slideEnd + 0.3], [0, 1, 1, 0]);
    }
    return useTransform(progress, [enterStart - 1, enterStart], [0,1]);
  })();

  // Glass card = dark blue bg, white text. Solid card = white bg, dark text.
  const bg         = isGlass ? "rgba(14,28,80,0.72)"            : "#f4f7fa";
  const blur       = isGlass ? "blur(32px) saturate(160%)"      : "none";
  const border     = isGlass ? "1px solid rgba(255,255,255,0.14)": "none";

  const content = <CardContent item={item} isGlass={isGlass} isMobile={isMobile}/>;

  const shared: React.CSSProperties = {
    position: "fixed", top: 0, zIndex: 20 + index, overflow: "hidden",
    background: bg,
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    border,
  };

  if (isMobile) {
    return (
      <motion.div style={{ ...shared, left: 0, width: "100vw", height: "100%", x: mobileX, y: mobileY, opacity: mobileOpacity }}>
        {content}
      </motion.div>
    );
  }
  return (
    <motion.div style={{ ...shared, left: "50%", width: "50vw", height: "100%", x: desktopX, y: desktopY, opacity: desktopOpacity }}>
      {content}
    </motion.div>
  );
}

function CardContent({ item, isGlass, isMobile }: { item: CardItem; isGlass: boolean;  isMobile: boolean}) {
  const textPrimary    = isGlass ? "#f4f7fa"                 : "#0a0f24";
  const textSecondary  = isGlass ? "rgba(200,218,250,0.75)"  : "#374151";
  const labelLight     = isGlass ? "rgba(160,194,255,0.60)"  : "#9ca3af";
  const labelBold      = isGlass ? "rgba(200,218,250,0.90)"  : "#1c398e";
  const arrowColor     = isGlass ? "rgba(180,210,255,0.80)"  : "#e53e3e";

  // Title gradient: from a lighter blue to a deep navy (matches reference)
  const titleStyle: React.CSSProperties = isGlass
    ? { color: "#f4f7fa" }
    : {
        background:          "linear-gradient(135deg, #2a52c9 0%, #0f2057 60%)",
        WebkitBackgroundClip:"text",
        WebkitTextFillColor: "transparent",
        backgroundClip:      "text",
      };

  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      height:         "100%",
      width:          "100%",
      padding:        "clamp(1.6rem, 4vw, 3rem) clamp(1.6rem, 4vw, 3rem)",
      boxSizing:      "border-box",
    }}>

      {/* ── TOP: description left + arrow top-right ──────────────────────── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
        flexShrink:     0,
      }}>
        <p style={{
          margin:     0,
          color:      textSecondary,
          fontWeight: 400,
          maxWidth:   "78%",
          marginTop: isMobile ? "100px" : 0
        }}
        className="text-xl font-stretch-extra-expanded tracking-wide sm:text-2xl"
        >
          {item.subtitle}
        </p>

        {/* Arrow — top right, accent colour */}
        <span style={{
          fontSize:   "clamp(1.1rem, 1.8vw, 1.5rem)",
          color:      arrowColor,
          fontWeight: 700,
          lineHeight: 1,
          flexShrink: 0,
          marginLeft: "1rem",
          marginTop: isMobile ? "100px" : 0
        }}>
          <ArrowUpRight strokeWidth={0.5} />
        </span>
      </div>

      {/* ── MIDDLE: breathing space (flexGrow pushes bottom content down) ── */}
      <div style={{ flexGrow: 1 }} />

      {/* ── BOTTOM: label + giant title ───────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>

        {/* Category label — "LIGHT & BOLD" style from reference */}
        {(item.suptitle || item.label) && (
          <p style={{
            margin:        "0 0 clamp(0.5rem, 1vh, 0.9rem)",
            fontSize:      "clamp(0.62rem, 0.9vw, 0.78rem)",
            fontWeight:    400,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color:         labelLight,
            lineHeight:    1,
          }}>
            {item.suptitle && (
              <>
                <span className={"text-[1rem] sm:text-[1.3rem]"} style={{ fontWeight: 400, color: labelLight }}>{item.suptitle}</span>
                <span className={"text-[1rem] sm:text-[1.3rem]"} style={{ color: labelBold, fontWeight: 700 }}> & {item.label}</span>
              </>
            )}
            {!item.suptitle && (
              <span style={{ fontWeight: 700, color: labelBold }}>{item.label}</span>
            )}
          </p>
        )}

        {/* Massive display title — fills the bottom of the card */}
        <h2 style={{
          margin:        0,
          marginBottom: isMobile ? "150px" : 0,
          fontWeight:    700,
          lineHeight:    0.88,
          ...titleStyle,
          // Overflow visible so descenders can breathe
          overflowX:     "visible",
          overflowY:     "visible",
        }}
        className="text-4xl font-stretch-extra-expanded tracking-wide sm:text-7xl"
        >
          {item.title ?? item.label}
        </h2>
      </div>
    </div>
  );
}

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