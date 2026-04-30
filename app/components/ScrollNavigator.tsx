"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, MotionValue, useMotionValueEvent } from "framer-motion";
import clsx from "clsx";

// ─────────────────────────────────────────────────────────────────────────────
// Section definitions — progress ranges mirror page.tsx transforms
// ─────────────────────────────────────────────────────────────────────────────
export interface NavSection {
  index: number; // display number
  label: string; // short label shown on hover / active
  start: number; // progress value where section enters
  end: number; // progress value where section exits
  target: number; // progress value to jump to when clicking
}

export const DEFAULT_SECTIONS: NavSection[] = [
  { index: 1, label: "Intro", start: 0, end: 0.7, target: 0 },
  { index: 2, label: "APWEC", start: 0.8, end: 1.8, target: 1.4 },
  { index: 3, label: "Ricerca", start: 1.8, end: 2.8, target: 2.4 },
  { index: 4, label: "Chi Siamo", start: 2.8, end: 3.2, target: 3.1 },
  { index: 5, label: "Visione", start: 3.8, end: 4.8, target: 4.43 },
  { index: 6, label: "Promessa", start: 4.9, end: 6.0, target: 6.15 },
  { index: 7, label: "CTA", start: 6.1, end: 7.9, target: 7.2 },
  { index: 8, label: "FAQ", start: 7.4, end: 9.5, target: 8.5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  progress: MotionValue<number>;
  /** Total scroll height in px used to convert progress → scrollY */
  totalScrollHeight: number;
  sections?: NavSection[];
  /** Whether we're in the dark (space) portion of the page */
  isDark?: MotionValue<number>;
  isMobile?: boolean;
  menuTheme?: MotionValue<number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function progressToScrollY(p: number, totalScrollHeight: number): number {
  const maxScroll = totalScrollHeight - window.innerHeight;
  return (p / 9.5) * maxScroll;
}

function getActiveIndex(p: number, sections: NavSection[]): number {
  for (let i = sections.length - 1; i >= 0; i--) {
    if (p >= sections[i].start) return i;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ScrollNavigator({
  progress,
  totalScrollHeight,
  sections = DEFAULT_SECTIONS,
  isMobile = false,
  menuTheme,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isDarkMode, setIsDark] = useState(false);

  // Track active section
  useMotionValueEvent(progress, "change", (p) => {
    setActiveIdx(getActiveIndex(p, sections));
  });
  useEffect(() => {
    if (!menuTheme) return;
    // Read initial value
    setIsDark(menuTheme.get() < 0.5);
    // Subscribe to changes
    const unsubscribe = menuTheme.on("change", (v) => {
      setIsDark(v < 0.5);
    });
    return unsubscribe;
  }, [menuTheme]);

  // Click: jump to section
  const handleClick = useCallback(
    (section: NavSection) => {
      const targetY = progressToScrollY(section.target, totalScrollHeight);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    },
    [totalScrollHeight]
  );

  if (isMobile) return null;

  const textColor = isDarkMode
    ? "#faf4f733"
    : "#1c398e33";
  const textColorActive = isDarkMode
    ? "#faf4f7"
    : "#1c398e";
  const textColorHover = isDarkMode
    ? "#faf4f765"
    : "#1c398e65";
  const lineColor = isDarkMode
    ? "#faf4f788"
    : "#1c398e88";
  const labelText = isDarkMode
    ? "#faf4f7"
    : "#1c398e";

  return (
    <motion.nav
      aria-label="Page sections navigator"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: "clamp(18px, 2.8vw, 36px)",
        top: "50%",
        translateY: "-50%",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0px",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {sections.map((section, i) => {
        const isActive = i === activeIdx;
        const isHovered = i === hoveredIdx;

        return (
          <motion.button
            key={section.index}
            onClick={() => handleClick(section)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            aria-label={`Go to section: ${section.label}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "none",
              cursor: "pointer",
              padding: "7px 0",
              outline: "none",
            }}
          >

            {/* Number */}
            <motion.span
              animate={{
                color: isActive
                  ? textColorActive
                  : isHovered
                  ? textColorHover
                  : textColor,
              }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: isActive ? "0.7rem" : "0.62rem",
                fontWeight: isActive ? 700 : 400,
                lineHeight: 1,
                minWidth: "12px",
                textAlign: "right",
                transition: "font-size 0.2s ease",
              }}
            >
              {section.index}
            </motion.span>

            {/* Horizontal dash — mimics the reference design */}
            <motion.span
              animate={{
                width: isActive ? 21 : isHovered ? 12 : 6,
                opacity: isActive ? 1 : isHovered ? 0.5 : 0.25,
                backgroundColor: isActive || isHovered ? lineColor : textColor,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                height: "1px",
                borderRadius: "1px",
                display: "block",
                flexShrink: 0,
              }}
            />

            {/* Label tooltip — slides in from right on hover or active */}
            <motion.span
              animate={{
                opacity: isActive || isHovered ? 1 : 0,
                x: isActive || isHovered ? 0 : 8,
                scale: isActive || isHovered ? 1 : 0.92,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={clsx(
                "relative flex items-center",
                "rounded-full",
                "backdrop-blur-2xl",
                "bg-white/10",
                "border border-white/20",
                "shadow-[0_8px_40px_rgba(0,0,0,0.25)]",
                "text-[#f4f7fa] text-xl sm:text-2xl font-medium",
                "overflow-hidden"
              )}
              style={{
                fontSize: "0.58rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: labelText,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "5px 10px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                border: isDarkMode
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(20,20,60,0.08)",
              }}
            >
              {section.label}
            </motion.span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
