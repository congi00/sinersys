"use client";

import clsx from "clsx";
import { motion, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { useState } from "react";

interface ResearchProduct {
  id: string;
  status: "coming-soon" | "prototype" | "certified";
  statusLabel: string;
  suptitle: string;
  title: string;
  subtitle: string;
  detail: string;
  year?: string;
  link: Url;
}

interface Props {
  progress: MotionValue<number>;
  isMobile: boolean;
  // Section header
  sectionLabel: string;
  sectionTitle: string;
  sectionSubtitle: string;
  // Products array
  products: ResearchProduct[];
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function useReveal(progress: MotionValue<number>, start: number) {
  return {
    op: useTransform(progress, [start, start + 0.13], [0, 1]),
    y: useTransform(progress, [start, start + 0.13], [28, 0]),
  } as const;
}

const STATUS_COLORS: Record<
  ResearchProduct["status"],
  { dot: string; text: string; border: string; bg: string }
> = {
  "coming-soon": {
    dot: "rgba(120,190,255,0.9)",
    text: "rgba(150,210,255,0.85)",
    border: "rgba(100,170,255,0.22)",
    bg: "rgba(80,140,255,0.07)",
  },
  prototype: {
    dot: "rgba(255,210,80,0.9)",
    text: "rgba(255,220,100,0.85)",
    border: "rgba(255,200,60,0.22)",
    bg: "rgba(255,180,40,0.07)",
  },
  certified: {
    dot: "rgba(80,230,160,0.9)",
    text: "rgba(100,240,170,0.85)",
    border: "rgba(60,220,140,0.22)",
    bg: "rgba(40,200,120,0.07)",
  },
};

// ── Decorative: blueprint grid lines SVG ─────────────────────────────────────
function BlueprintGrid({ isMobile }: { isMobile: boolean }) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.028,
        pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="bp-grid"
          x="0"
          y="0"
          width={isMobile ? 40 : 60}
          height={isMobile ? 40 : 60}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${isMobile ? 40 : 60} 0 L 0 0 0 ${isMobile ? 40 : 60}`}
            fill="none"
            stroke="#a0c4ff"
            strokeWidth="0.6"
          />
        </pattern>
        <pattern
          id="bp-cross"
          x="0"
          y="0"
          width={isMobile ? 80 : 120}
          height={isMobile ? 80 : 120}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={isMobile ? 40 : 60}
            cy={isMobile ? 40 : 60}
            r="1.5"
            fill="#a0c4ff"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
      <rect width="100%" height="100%" fill="url(#bp-cross)" />
    </svg>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  reveal,
  isMobile,
  progress,
}: {
  product: ResearchProduct;
  reveal: ReturnType<typeof useReveal>;
  isMobile: boolean;
  progress: MotionValue<number>;
}) {
  const sc = STATUS_COLORS[product.status];
  const [clickable, setClickable] = useState(false);

  useMotionValueEvent(progress, "change", (v) => {
    setClickable(v >= 1.9 && v <= 2.7);
  });

  return (
    <Link href={product.link} style={{ pointerEvents: clickable ? "auto" : "none", }}>
      <motion.div
        style={{
          opacity: reveal.op,
          y: reveal.y,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Outer frame — blueprint aesthetic */}
        <div
          style={{
            border: "1px solid rgba(100,150,255,0.14)",
            position: "relative",
            borderRadius: "15px",
            overflow: "hidden",
          }}
          className={clsx(
            "p-4 pt-8",
            "flex flex-col items-center justify-center",
            "bg-[#F4F7FA]/10 backdrop-blur-xl backdrop-saturate-150",
            "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ease-[cubic-bezier(.16,1,.3,1)]"
          )}
        >
          {/* Suptitle */}
          <p
            style={{
              margin: "0 0 0.35rem",
              textTransform: "uppercase",
              color: "rgba(100,160,255,0.55)",
            }}
            className="text-xs sm:text-xs tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)]"
          >
            {product.suptitle}
          </p>

          {/* Title */}
          <h3
            style={{
              margin: "0 0 clamp(0.5rem,1.2vh,0.85rem)",
              fontSize: isMobile
                ? "clamp(1.3rem,5vw,1.7rem)"
                : "clamp(1.4rem,1.8vw,2rem)",
              fontWeight: 800,
              color: "#e8f0ff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {product.title}
          </h3>

          {/* Divider line */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(100,160,255,0.2), transparent)",
              marginBottom: "clamp(0.7rem,1.5vh,1rem)",
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              margin: "0 0 clamp(0.8rem,1.8vh,1.2rem)",
              fontSize: isMobile
                ? "clamp(0.78rem,3vw,0.9rem)"
                : "clamp(0.82rem,0.95vw,0.96rem)",
              lineHeight: 1.7,
              color: "rgba(190,215,255,0.65)",
              fontWeight: 300,
            }}
          >
            {product.subtitle}
          </p>

          {/* Detail — monospace annotation */}
          <p
            style={{
              margin: 0,
              fontSize: "0.66rem",
              lineHeight: 1.65,
              color: "rgba(130,170,255,0.4)",
              fontFamily: "'Courier New', monospace",
              borderLeft: "2px solid rgba(100,160,255,0.12)",
              paddingLeft: "0.75rem",
            }}
          >
            {product.detail}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResearchProducts({
  progress,
  isMobile,
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  products,
}: Props) {
  // ── Scroll window ──────────────────────────────────────────────────────────
  const wrapOp = useTransform(progress, [1.75, 1.95, 2.65, 2.8], [0, 1, 1, 0]);
  const wrapY = useTransform(
    progress,
    [1.75, 1.95, 2.65, 2.8],
    [60, 0, 0, -60]
  );

  // Staggered element reveals
  const rLabel = useReveal(progress, 1.9);
  const rTitle = useReveal(progress, 1.97);
  const rSub = useReveal(progress, 2.04);
  // One reveal slot per product (up to 6)
  const rCards = [
    useReveal(progress, 2.12),
    useReveal(progress, 2.2),
    useReveal(progress, 2.28),
    useReveal(progress, 2.36),
    useReveal(progress, 2.44),
    useReveal(progress, 2.52),
  ];
  
  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9,
        opacity: wrapOp,
        y: wrapY,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        padding: isMobile
          ? "1rem clamp(1.2rem,5vw,2rem)"
          : "8rem clamp(3rem,8vw,8rem)",
        overflowY: "hidden",
        alignContent: "center",
        textAlign: "center",
      }}
    >
      {/* ── Decorative background ──────────────────────────────────────────── */}
      <BlueprintGrid isMobile={isMobile} />

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          top: "30%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(40,80,200,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: isMobile ? "100%" : "90%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section label */}
        <motion.div
          style={{
            opacity: rLabel.op,
            y: rLabel.y,
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "clamp(0.6rem,1.5vh,1rem)",
            marginTop: isMobile ? "60px" : "0",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              textTransform: "uppercase",
              color: "rgba(140,190,255,0.55)",
            }}
            className="text-m sm:text-lg text-[#a0b8e8] tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)]"
          >
            {sectionLabel}
          </span>
        </motion.div>

        {/* Section title */}
        <motion.h2
          style={{
            opacity: rTitle.op,
            y: rTitle.y,
            margin: "0 0 clamp(0.5rem,1.2vh,0.9rem)",
            color: "#f0f5ff",
            lineHeight: 1.1,
          }}
          className="text-3xl sm:text-6xl tracking-wide font-bold mt-3"
        >
          {sectionTitle.split("\\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </motion.h2>

        {/* Section subtitle */}
        <motion.p
          style={{
            opacity: rSub.op,
            y: rSub.y,
            margin: "0 0 clamp(1.8rem,4vh,3rem)",
            color: "rgba(180,210,255,0.55)",
            lineHeight: 1.2,
            fontWeight: 300,
          }}
          className="text-lg sm:text-xl mt-6 sm:mt-5 sm:mb-5 text-[#c8d8f8] font-light"
        >
          {sectionSubtitle}
        </motion.p>

        {/* Product cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : products.length === 1
              ? "minmax(280px, 600px)"
              : "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "clamp(1rem,2vw,1.6rem)",
            justifyContent: products.length === 1 ? "center" : "stretch",
          }}
        >
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              reveal={rCards[i] ?? rCards[rCards.length - 1]}
              isMobile={isMobile}
              progress={progress}
            />
          ))}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 3px rgba(120,190,255,0.15); }
          50%       { opacity: 0.55; box-shadow: 0 0 0 7px rgba(120,190,255,0.04); }
        }
      `}</style>
    </motion.div>
  );
}
