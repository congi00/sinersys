"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { useTranslations } from "next-intl";
import { detectIOS } from "../support/useViewportHeight";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuButton from "../components/MenuButton";
import { useAppDispatch, useAppSelector } from "../hooks";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "lucide-react";
import ScrollNavigator from "../components/ScrollNavigator";
import VintageMediaViewer, { MediaItem } from "../components/VintageMediaViewer";

// Industrial partners
const partners = ["Honda", "Volvo", "Chrysler", "Saab", "Hanomag - Henschel", "VW"];
const MEDIA: MediaItem[] = [
  {
    type: "image",
    src: "/aboutusgallery/img_3.jpg",
    caption: "Passo... e chiudo",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/IMG_1081.jpg",
    caption: "Bieffe",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/small_DSC_0005.jpg",
    caption: "Precursore APWEC",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/small_DSCN0765.jpg",
    caption: "Motore DKW",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/small_img_1.png",
    caption: "",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/small_img_2.png",
    caption: "",
    date: "",
  },
  {
    type: "image",
    src: "/aboutusgallery/small_IMG_1001.jpg",
    caption: "",
    date: "",
  },
  
];

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function FadeIn({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const yMap = { up: 40, down: -40, left: 0, right: 0, none: 0 };
  const xMap = { up: 0, down: 0, left: 60, right: -60, none: 0 };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yMap[direction], x: xMap[direction] }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: "20px",
        boxShadow:
          "0 8px 32px rgba(12,24,70,0.22), inset 0 1px 0 rgba(255,255,255,0.14)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "clamp(2.5rem,5vh,4rem)",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "1px",
          background: "rgba(160,196,255,0.5)",
        }}
      />
      <span
        style={{
          textTransform: "uppercase",
          color: "rgba(160,196,255,0.7)",
        }}
        className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] "
      >
        {label}
      </span>
    </div>
  );
}

function TimelineItem({
  index,
  year,
  title,
  description,
  isLast,
}: {
  index: number;
  year: string;
  title: string;
  description: string;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        gap: "clamp(1.5rem,4vw,3rem)",
        paddingBottom: isLast ? 0 : "clamp(3rem,6vh,5rem)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: "clamp(60px,10vw,90px)",
        }}
      >
        <div
          style={{
            background: "rgba(28,57,142,0.85)",
            border: "1px solid rgba(100,150,255,0.35)",
            borderRadius: "10px",
            padding: "6px 12px",
            fontSize: "clamp(0.65rem,1vw,0.78rem)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#a0c4ff",
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
          }}
        >
          {year}
        </div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{
              width: "1px",
              flexGrow: 1,
              marginTop: "12px",
              background:
                "linear-gradient(to bottom,rgba(100,150,255,0.4),rgba(100,150,255,0.05))",
              transformOrigin: "top",
            }}
          />
        )}
      </div>
      <div style={{ paddingTop: "4px", flex: 1 }}>
        <div
          style={{
            fontSize: "clamp(0.6rem,0.85vw,0.72rem)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(160,196,255,0.45)",
            marginBottom: "0.4rem",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <GlassCard style={{ padding: "clamp(1.2rem,2.5vw,2rem)" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(1.1rem,2vw,1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "#f4f7fa",
              marginBottom: "0.6rem",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(0.85rem,1.2vw,1rem)",
              lineHeight: 1.65,
              color: "rgba(200,218,250,0.72)",
            }}
          >
            {description}
          </p>
        </GlassCard>
      </div>
    </motion.div>
  );
}

function TeamCard({
  name,
  role,
  bio,
  index,
  photo,
}: {
  name: string;
  role: string;
  bio: string;
  index: number;
  photo?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const [hovered, setHovered] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{ y: hovered ? -6 : 0, scale: hovered ? 1.02 : 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard
          style={{
            padding: "clamp(1.4rem,2.5vw,2rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg,rgba(28,57,142,0.25) 0%,transparent 60%)",
              pointerEvents: "none",
              borderRadius: "20px",
            }}
          />
          <div
            style={{
              width: "clamp(56px,8vw,72px)",
              height: "clamp(56px,8vw,72px)",
              borderRadius: "50%",
              marginBottom: "1rem",
              overflow: "hidden",
              border: "2px solid rgba(100,150,255,0.25)",
              background: photo
                ? "transparent"
                : "linear-gradient(135deg,rgba(28,57,142,0.8),rgba(42,82,201,0.6))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              /> // eslint-disable-line
            ) : (
              <span
                style={{
                  fontSize: "clamp(1rem,1.8vw,1.3rem)",
                  fontWeight: 700,
                  color: "rgba(180,210,255,0.9)",
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(1rem,1.6vw,1.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#f4f7fa",
              marginBottom: "0.2rem",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              margin: "0 0 0.8rem",
              fontSize: "clamp(0.65rem,0.9vw,0.78rem)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(100,150,255,0.8)",
            }}
          >
            {role}
          </p>
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              marginBottom: "0.8rem",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: "clamp(0.78rem,1.1vw,0.9rem)",
              lineHeight: 1.65,
              color: "rgba(200,218,250,0.65)",
            }}
          >
            {bio}
          </p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function MilestoneChip({
  year,
  label,
  delay,
}: {
  year: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "10px 18px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(160,196,255,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: "clamp(1rem,2vw,1.3rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#e8f0ff",
          lineHeight: 1,
        }}
      >
        {year}
      </span>
      <span
        style={{
          fontSize: "clamp(0.58rem,0.8vw,0.66rem)",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(140,180,255,0.6)",
          textAlign: "center",
          maxWidth: "80px",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ── Patent tag (slide1) ──────────────────────────────────────────────────────
function PatentTag({
  name,
  year,
  delay,
}: {
  name: string;
  year: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 14px",
        borderRadius: "8px",
        background: "rgba(28,57,142,0.35)",
        border: "1px solid rgba(100,150,255,0.2)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* tiny diamond */}
      <svg width="6" height="6" viewBox="0 0 6 6" style={{ flexShrink: 0 }}>
        <rect
          x="3"
          y="0"
          width="4.24"
          height="4.24"
          rx="0.4"
          transform="rotate(45 3 3)"
          fill="rgba(120,175,255,0.7)"
        />
      </svg>
      <span
        style={{
          fontSize: "clamp(0.72rem,1vw,0.82rem)",
          fontWeight: 600,
          color: "rgba(200,220,255,0.85)",
          letterSpacing: "0.02em",
        }}
      >
        {name}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "rgba(120,170,255,0.45)",
          fontFamily: "'Courier New', monospace",
          flexShrink: 0,
        }}
      >
        {year}
      </span>
    </motion.div>
  );
}

// ── Partnership logo pill (slide1) ──────────────────────────────────────────
function PartnerPill({ name, delay }: { name: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "6px 16px",
        borderRadius: "100px",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontSize: "clamp(0.72rem,1vw,0.82rem)",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "rgba(200,218,255,0.9)",
      }}
    >
      {name}
    </motion.div>
  );
}

export default function AboutUsPage() {
  const t = useTranslations("aboutus");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const isIOS = detectIOS();
  const dispatch = useAppDispatch();
  const ts = useTranslations("scrollNavigator");

  const progressMotion = useMotionValue(0);
  const [vhPx, setVhPx] = useState(0);
  const [width, setWidth] = useState(0);
  const [contentH, setContentH] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    r();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    setContentH(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    if (isTouchDevice()) {
      let rafId = 0;
      let target = 0;
      let current = 0;

      const onScroll = () => {
        const sy = window.scrollY;
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) target = Math.min(6, (sy / limit) * 6);
      };

      const tick = () => {
        // Lerp manuale: 0.1 = smooth ma reattivo su Android
        current += (target - current) * 0.1;
        if (Math.abs(target - current) > 0.0001) {
          progressMotion.set(current);
        }
        rafId = requestAnimationFrame(tick);
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      rafId = requestAnimationFrame(tick);
      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafId);
      };
    }
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      progressMotion.set(Math.min(6, (e.scroll / e.limit) * 6));
    });
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, { stiffness: 280, damping: 28 });
  const vh = vhPx || 1;

  const linkColorWhite = useMotionValue("#f4f7fa");

  // ── Hero scroll timeline ──────────────────────────────────────────────────
  const heroInset = useTransform(smooth, [0, 0.4, 0.8, 1.3], [16, 0, 0, 16]);
  const heroRadius = useTransform(smooth, [0, 0.4, 0.8, 1.3], [24, 0, 0, 24]);
  const heroPad = useTransform(heroInset, (v) => `${v}px`);
  const heroRad = useTransform(heroRadius, (v) => `${v}px`);
  const heroY = useTransform(smooth, [0.8, 1.3], ["0vh", "-115vh"]);
  const heroOp = useTransform(smooth, [1.1, 1.3], [1, 0]);

  const slide0Opacity = useTransform(smooth, [0, 0, 0.35, 0.5], [0, 1, 1, 0]);
  const slide0Y = useTransform(smooth, [0, 0, 0.35, 0.5], [20, 0, 0, -30]);
  const slide1Opacity = useTransform(
    smooth,
    [0.4, 0.6, 1.0, 1.2],
    [0, 1, 1, 0]
  );
  const slide1Y = useTransform(smooth, [0.4, 0.6, 1.0, 1.2], [30, 0, 0, -30]);

  const headerTheme = useTransform(
    smooth,
    [1.0, 1.28, 1.3, 1.4, isMobile ? 5.5 : 5.8, isMobile ? 5.6 : 5.9, 6.0],
    [0, 1, 1, 0, 0, 1, 0]
  );
  const hiddenMenu = useTransform(smooth, [5.4, 5.5], [1, 0]);

  const menuTheme = useTransform(
    smooth,
    [0.8, 0.9, 1.6, 3, 5.0, 5.5],
    [0, 1, 0, 0, 0, 1]
  );
  const gradientPage = useTransform(
    smooth,
    [0, 1.3, 1.4],
    [
      "#F4F7FA",
      "#F4F7FA",
      "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)",
    ]
  );
  const bodyBg = useTransform(
    smooth,
    [0, 1.3, 1.3, 4.9, 5.0],
    [
      "#F4F7FA",
      "#F4F7FA",
      "linear-gradient(160deg, rgb(28, 57, 142) 29%, rgb(0, 112, 243) 71%, rgb(5, 11, 38) 100%)",
      "linear-gradient(160deg, rgb(28, 57, 142) 29%, rgb(0, 112, 243) 71%, rgb(5, 11, 38) 100%)",
      "#F4F7FA",
    ]
  );
  const h2Color = useTransform(
    smooth,
    [0, 1.3, 1.3],
    ["#1c398e", "#1c398e", "#f4f7fa"]
  );
  const pcolor = useTransform(
    smooth,
    [0, 1.3, 1.3],
    ["#1c398e", "#1c398e", "rgba(200,218,250,0.75)"]
  );

  const CONTENT_TOP = vh * (isMobile ? 2.8 : 2.4);
  const totalHeight = CONTENT_TOP + (contentH > 0 ? contentH : vh * 4.6);

  // ── Content card exit animation (inset + border-radius before footer) ─────
  // We use scroll progress mapped to the last ~15% of the page.
  // At p=5.0 → no inset, no radius. At p=5.6 → inset 16px, radius 24px.
  const contentRadius = useTransform(smooth, [5.0, 5.6], [0, 24]);
  const contentScale = useTransform(smooth, [5.0, 5.6], [1, 0.96]);
  const contentY = useTransform(smooth, [5.0, 5.6], [0, -20]);
  const contentBR = useTransform(contentRadius, (v) => `${v}px`);

  if (vhPx === 0) return <div className="min-h-screen bg-[#0f2057]" />;

  const timeline = [
    { key: "t1919", year: "1919" },
    { key: "t1964", year: "1964" },
    { key: "t1965", year: "1965" },
    { key: "t1977", year: "1977" },
    { key: "t1978", year: "1978" },
    { key: "t1998", year: "1998" },
    { key: "t2002", year: "2002" },
    { key: "t2008", year: "2008" },
    { key: "t2016", year: "2016" },
    { key: "t2022", year: "2022" },
    { key: "t2024", year: "2024" },
    { key: "oggi", year: "oggi" },
  ];

  const team = [
    { key: "member0", photo: "/team/1.jpg" },
    { key: "member1", photo: "/team/2.jpg" },
  ];
  

  return (
    <>
      <motion.div style={{ height: totalHeight }} aria-hidden />

      <motion.div
        className="absolute inset-x-0 top-0"
        style={{ height: totalHeight, zIndex: 1, background: bodyBg }}
      >
        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && (
          <MenuButton hiddenMenu={hiddenMenu} menuTheme={menuTheme} />
        )}

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            padding: heroPad,
            y: heroY,
            opacity: heroOp,
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: heroRad,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src="/aboutus.webp"
              alt="" // eslint-disable-line
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom,rgba(6,12,44,0.50) 0%,rgba(6,12,44,0.35) 40%,rgba(6,12,44,0.68) 100%)",
              }}
            />

            {/* Slide 0 */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                opacity: slide0Opacity,
                y: slide0Y,
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  margin: "0 0 1rem",
                  color: "rgba(180,210,255,0.7)",
                }}
                className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] px-3 sm:px-0 mt-3 sm:mt-5"
              >
                {t("hero.suptitle")}
              </p>
              <h1
                style={{
                  margin: 0,
                  lineHeight: 1.0,
                  color: "#f4f7fa",
                  marginBottom: "1.2rem",
                  maxWidth: "820px",
                }}
                className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line px-3 sm:px-2"
              >
                {t("hero.title")}
              </h1>
              <p
                style={{
                  margin: 0,
                  lineHeight: 1.2,
                  color: "rgba(200,218,250,0.78)",
                  maxWidth: "560px",
                }}
                className="text-lg sm:text-xl px-6 sm:px-6 mt-6 sm:mt-5 sm:mb-5 sm:max-w-4xl font-light"
              >
                {t("hero.subtitle")}
              </p>
            </motion.div>

            {/* Slide 1 */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                opacity: slide1Opacity,
                y: slide1Y,
                pointerEvents: "none",
              }}
            >
              {/* Top row: label + title */}
              <div>
                <p
                  style={{
                    color: "rgba(180,210,255,0.9)",
                    textAlign: "center",
                  }}
                  className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] px-3 sm:px-0 "
                >
                  {t("hero.slide1suptitle")}
                </p>
                <h1
                  style={{
                    margin: 0,
                    color: "#f4f7fa",
                    textAlign: "center",
                  }}
                  className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line px-3 sm:px-2"
                >
                  {t("hero.slide1title")}
                </h1>
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.2,
                    color: "rgba(200,218,250,0.78)",
                    maxWidth: "760px",
                    marginTop: "20px"
                  }}
                  className="text-lg sm:text-xl px-6 sm:px-6 mt-6 sm:mt-2 sm:mb-5 sm:max-w-4xl font-light"
                >
                  {t("hero.slide1subtitle")}
                </p>
              </div>

              {/* Two-column: partners + patents */}
              <div className="mt-6">
                {/* Partner pills */}
                <div>
                  <p
                    style={{
                      margin: "0 0 0.6rem",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.8)",
                      textAlign: "center",
                    }}
                  >
                    {t("hero.partnersLabel")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      justifyContent: "center"
                    }}
                  >
                    {partners.map((p, i) => (
                      <PartnerPill key={p} name={p} delay={0.1 + i * 0.06} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        <motion.div
          ref={contentRef}
          style={{
            position: "absolute",
            top: CONTENT_TOP,
            left: 0,
            right: 0,
            zIndex: 11,
          }}
        >
          {/*
            Inner wrapper that animates margin + borderRadius as the user
            approaches the footer. The outer div keeps left:0/right:0 so the
            page background shows through the "inset gap".
          */}
          <motion.div
            style={{
              scale: contentScale,
              y: contentY,
              borderRadius: contentBR,
              overflow: "hidden",
              background: gradientPage,
            }}
          >
            {/* WHO WE ARE */}
            <section
              style={{ padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem)" }}
            >
              <FadeIn>
                <SectionLabel label={t("whoweareLabel")} />
              </FadeIn>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "clamp(2rem,5vw,4rem)",
                  alignItems: "start",
                }}
              >
                <FadeIn direction="left">
                  <motion.h2
                    style={{
                      margin: 0,
                      lineHeight: 1.1,
                      color: h2Color,
                    }}
                    className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line"
                  >
                    {t("whoweare.title")}
                  </motion.h2>
                </FadeIn>
                <FadeIn direction="right" delay={0.1}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                    }}
                  >
                    <motion.p
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        color: pcolor,
                      }}
                      className="text-lg sm:text-xl font-light whitespace-pre-line"
                    >
                      {t("whoweare.p1")}
                    </motion.p>
                    <motion.p
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        color: pcolor,
                      }}
                      className="text-lg sm:text-xl font-light"
                    >
                      {t("whoweare.p2")}
                    </motion.p>
                  </div>
                </FadeIn>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "clamp(0.6rem,1.5vw,1rem)",
                  flexWrap: "wrap",
                  marginTop: "clamp(2.5rem,5vh,4rem)",
                }}
              >
                {["value0", "value1", "value2", "value3", "value4"].map(
                  (key, i) => (
                    <FadeIn key={key} delay={i * 0.06} direction="up">
                      <motion.div
                        style={{
                          padding: "10px 20px",
                          borderRadius: "100px",
                          background: "rgba(28,57,142,0.35)",
                          border: "1px solid rgba(100,150,255,0.20)",
                          backdropFilter: "blur(12px)",
                          fontSize: "clamp(0.78rem,1.1vw,0.92rem)",
                          fontWeight: 600,
                          color: h2Color,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t(`values.${key}`)}
                      </motion.div>
                    </FadeIn>
                  )
                )}
              </div>
            </section>

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.06)",
                margin: "0 clamp(1.5rem,8vw,8rem)",
              }}
            />

            {/* TIMELINE */}
            <section
              style={{ padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem)" }}
            >
              <FadeIn>
                <SectionLabel label={t("timelineLabel")} />
              </FadeIn>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "0 clamp(3rem,6vw,6rem)",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    position: isMobile ? "static" : "sticky",
                    top: "clamp(6rem,10vh,8rem)",
                    paddingBottom: isMobile ? "2rem" : 0,
                  }}
                >
                  <FadeIn direction="left">
                    <h2
                      style={{
                        margin: 0,
                        lineHeight: 1.1,
                        color: "#f4f7fa",
                        marginBottom: "1.2rem",
                      }}
                      className="text-3xl sm:text-5xl tracking-wide font-bold sm:whitespace-pre-line"
                    >
                      {t("timeline.heading")}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        color: "rgba(200,218,250,0.65)",
                      }}
                      className="text-lg sm:text-xl font-light"
                    >
                      {t("timeline.subheading")}
                    </p>
                  </FadeIn>
                </div>
                <div>
                  {timeline.map((item, i) => (
                    <TimelineItem
                      key={item.key}
                      index={i}
                      year={item.year}
                      title={t(`timeline.${item.key}.title`)}
                      description={t(`timeline.${item.key}.description`)}
                      isLast={i === timeline.length - 1}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.06)",
                margin: "0 clamp(1.5rem,8vw,8rem)",
              }}
            />

            {/* TEAM */}
            <section
              style={{
                padding:
                  "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem) clamp(5rem,10vh,8rem)",
              }}
            >
              <FadeIn>
                <SectionLabel label={t("teamLabel")} />
              </FadeIn>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: " clamp(3rem,6vw,6rem)",
                  marginBottom: "clamp(3rem,6vh,5rem)",
                }}
              >
                <FadeIn direction="left">
                  <h2
                    style={{
                      margin: 0,
                      lineHeight: 1.1,
                      color: "#f4f7fa",
                    }}
                    className="text-3xl sm:text-5xl tracking-wide font-bold sm:whitespace-pre-line"
                  >
                    {t("team.heading")}
                  </h2>
                </FadeIn>
                <FadeIn direction="right" delay={0.1}>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.2,
                      color: "rgba(200,218,250,0.65)",
                    }}
                    className="text-lg sm:text-xl font-light"
                  >
                    {t("team.subheading")}
                  </p>
                </FadeIn>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
                  gap: "clamp(1rem,2vw,1.5rem)",
                }}
              >
                {team.map((m, i) => (
                  <TeamCard
                    key={m.key}
                    index={i}
                    photo={m.photo}
                    name={t(`team.${m.key}.name`)}
                    role={t(`team.${m.key}.role`)}
                    bio={t(`team.${m.key}.bio`)}
                  />
                ))}
              </div>
              <FadeIn delay={0.3}>
                <GlassCard
                  style={{
                    marginTop: "clamp(3rem,6vh,5rem)",
                    padding: "clamp(2rem,4vw,3rem)",
                    display: "flex",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "1.5rem",
                  }}
                >
                  <div className="max-w-3xl">
                    <h3
                      style={{
                        margin: "0 0 0.4rem",
                        color: "#f4f7fa",
                      }}
                      className="text-3xl sm:text-5xl tracking-wide font-bold sm:whitespace-pre-line"
                    >
                      {t("team.joinTitle")}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(200,218,250,0.65)",
                        lineHeight: 1.2,
                      }}
                      className="text-lg sm:text-xl font-light"
                    >
                      {t("team.joinSubtitle")}
                    </p>
                  </div>
                  <LinkButton
                    link="/contatti"
                    text={t("team.joinCta")}
                    icon={<ArrowUpRight size={20} />}
                    top="0"
                    color={linkColorWhite}
                  />
                </GlassCard>
              </FadeIn>
            </section>
            <VintageMediaViewer items={MEDIA} vintageIntensity={0} />
            
          </motion.div>

          {/* Whitespace gap before footer */}
          <div style={{ height: "20vh" }} />
          <Footer openContact={() => dispatch(setOpenContact(true))} />
        </motion.div>

        {!openContact && (
          <ScrollNavigator
            progress={smooth}
            totalScrollHeight={totalHeight}
            isMobile={isMobile}
            menuTheme={menuTheme}
            hiddenMenu={hiddenMenu}
            sections={
              [
                { index: 1, label: ts("aboutUs"), start: 0, end: 0.7, target: 0 },
                { index: 2, label: ts("ourStory"), start: 1.0, end: 1.8, target: 3.8 },
                { index: 3, label: ts("timeline"), start: 1.9, end: 4.8, target: 5.3 },
                { index: 4, label: ts("team"), start: 4.9, end: 5.4, target: 13.3 },
              ]
            }
          />
        )}

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </motion.div>
    </>
  );
}
