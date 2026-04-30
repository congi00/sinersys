"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface ResearchProduct {
  id: string;
  status: "coming-soon" | "prototype" | "certified";
  statusLabel: string;
  suptitle: string;
  title: string;
  subtitle: string;
  detail: string;
  year?: string;
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

const STATUS_COLORS: Record<ResearchProduct["status"], { dot: string; text: string; border: string; bg: string }> = {
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
        <pattern id="bp-grid" x="0" y="0" width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} patternUnits="userSpaceOnUse">
          <path
            d={`M ${isMobile ? 40 : 60} 0 L 0 0 0 ${isMobile ? 40 : 60}`}
            fill="none"
            stroke="#a0c4ff"
            strokeWidth="0.6"
          />
        </pattern>
        <pattern id="bp-cross" x="0" y="0" width={isMobile ? 80 : 120} height={isMobile ? 80 : 120} patternUnits="userSpaceOnUse">
          <circle cx={isMobile ? 40 : 60} cy={isMobile ? 40 : 60} r="1.5" fill="#a0c4ff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
      <rect width="100%" height="100%" fill="url(#bp-cross)" />
    </svg>
  );
}

// ── Decorative: rotating ring-glyph ──────────────────────────────────────────
function RingGlyph({
  size,
  opacity,
  rotate,
  style,
}: {
  size: number;
  opacity: number;
  rotate: MotionValue<number>;
  style?: React.CSSProperties;
}) {
  const ticks = Array.from({ length: 36 });
  return (
    <motion.div
      style={{ position: "absolute", width: size, height: size, opacity, pointerEvents: "none", rotate, ...style }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r="88" fill="none" stroke="#a0c4ff" strokeWidth="0.5" strokeDasharray="3 6" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="#a0c4ff" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#a0c4ff" strokeWidth="0.8" />
        {ticks.map((_, i) => {
          const angle = (i * 360) / 36;
          const rad = (angle * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 76 : 80;
          const r2 = 88;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(rad)}
              y1={100 + r1 * Math.sin(rad)}
              x2={100 + r2 * Math.cos(rad)}
              y2={100 + r2 * Math.sin(rad)}
              stroke="#a0c4ff"
              strokeWidth={i % 3 === 0 ? "0.8" : "0.4"}
            />
          );
        })}
        {/* cross-hair */}
        <line x1="92" y1="100" x2="108" y2="100" stroke="#a0c4ff" strokeWidth="0.6" />
        <line x1="100" y1="92" x2="100" y2="108" stroke="#a0c4ff" strokeWidth="0.6" />
      </svg>
    </motion.div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  reveal,
  isMobile,
}: {
  product: ResearchProduct;
  reveal: ReturnType<typeof useReveal>;
  isMobile: boolean;
}) {
  const sc = STATUS_COLORS[product.status];

  return (
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
          background: "rgba(8,18,52,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(100,150,255,0.14)",
          borderRadius: "2px",
          padding: isMobile ? "clamp(1.2rem,5vw,1.8rem)" : "clamp(1.4rem,2vw,2.2rem)",
          position: "relative",
        }}
      >
        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <div
            key={corner}
            style={{
              position: "absolute",
              width: "10px",
              height: "10px",
              borderColor: "rgba(100,160,255,0.3)",
              borderStyle: "solid",
              borderWidth: corner.includes("t") ? "1px 0 0 0" : "0 0 1px 0",
              borderLeftWidth: corner.includes("l") ? "1px" : "0",
              borderRightWidth: corner.includes("r") ? "1px" : "0",
              top: corner.includes("t") ? "6px" : "auto",
              bottom: corner.includes("b") ? "6px" : "auto",
              left: corner.includes("l") ? "6px" : "auto",
              right: corner.includes("r") ? "6px" : "auto",
            }}
          />
        ))}

        {/* Year badge — top right */}
        {product.year && (
          <div
            style={{
              position: "absolute",
              top: "1.1rem",
              right: "1.4rem",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              color: "rgba(100,150,255,0.3)",
              userSelect: "none",
            }}
          >
            {product.year}
          </div>
        )}

        {/* Status pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px 4px 8px",
            borderRadius: "2px",
            background: sc.bg,
            border: `1px solid ${sc.border}`,
            marginBottom: "clamp(0.9rem,2vh,1.3rem)",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: sc.dot,
              boxShadow: `0 0 0 3px ${sc.dot.replace("0.9", "0.15")}`,
              display: "inline-block",
              animation: product.status === "coming-soon" ? "pulse-dot 2s ease-in-out infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: sc.text,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {product.statusLabel}
          </span>
        </div>

        {/* Suptitle */}
        <p
          style={{
            margin: "0 0 0.35rem",
            textTransform: "uppercase",
            color: "rgba(100,160,255,0.55)",
          }}
          className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)]"
        >
          {product.suptitle}
        </p>

        {/* Title */}
        <h3
          style={{
            margin: "0 0 clamp(0.5rem,1.2vh,0.85rem)",
            fontSize: isMobile ? "clamp(1.3rem,5vw,1.7rem)" : "clamp(1.4rem,1.8vw,2rem)",
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
            background: "linear-gradient(90deg, rgba(100,160,255,0.2), transparent)",
            marginBottom: "clamp(0.7rem,1.5vh,1rem)",
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 clamp(0.8rem,1.8vh,1.2rem)",
            fontSize: isMobile ? "clamp(0.78rem,3vw,0.9rem)" : "clamp(0.82rem,0.95vw,0.96rem)",
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
  const wrapY = useTransform(progress, [1.75, 1.95, 2.65, 2.8], [60, 0, 0, -60]);
  const wrapClip = useTransform(
    progress,
    [1.75, 1.95, 2.65, 2.8],
    [
      "inset(100% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 100% 0%)",
    ]
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

  // Decorative ring rotations
  const ringA = useTransform(progress, [1.8, 2.8], [0, 72]);
  const ringB = useTransform(progress, [1.8, 2.8], [0, -44]);

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 11,
        opacity: wrapOp,
        y: wrapY,
        clipPath: wrapClip,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        padding: isMobile
          ? "5rem clamp(1.2rem,5vw,2rem)"
          : "8rem clamp(3rem,8vw,8rem)",
        overflowY: "hidden",
      }}
    >
      {/* ── Decorative background ──────────────────────────────────────────── */}
      <BlueprintGrid isMobile={isMobile} />

      {/* Large ring — right */}
      <RingGlyph
        size={isMobile ? 260 : 500}
        opacity={0.06}
        rotate={ringA}
        style={{
          right: isMobile ? "-80px" : "-120px",
          top: "50%",
          translateY: "-50%",
        }}
      />

      {/* Small ring — bottom left */}
      <RingGlyph
        size={isMobile ? 120 : 220}
        opacity={0.04}
        rotate={ringB}
        style={{
          left: isMobile ? "-30px" : "20px",
          bottom: isMobile ? "2vh" : "4vh",
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          top: "30%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(40,80,200,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ width: "100%", position: "relative", zIndex: 1 }}>

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
          {!isMobile && (
            <div
              style={{
                width: "32px",
                height: "1px",
                background: "rgba(100,150,255,0.4)",
              }}
            />
          )}
          {/* Diamond marker */}
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ opacity: 0.5 }}>
            <rect x="4" y="0" width="5.66" height="5.66" rx="0.5" transform="rotate(45 4 4)" fill="rgba(100,160,255,0.7)" />
          </svg>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(140,190,255,0.55)",
              fontFamily: "'Courier New', monospace",
            }}
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
          }}
        >
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              reveal={rCards[i] ?? rCards[rCards.length - 1]}
              isMobile={isMobile}
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