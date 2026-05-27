"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import Lenis from "lenis";
import { useTranslations } from "next-intl";
import Header from "../components/Header";
import MenuButton from "../components/MenuButton";
import Footer from "../components/Footer";
import { useAppDispatch, useAppSelector } from "../hooks";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "lucide-react";
import ScrollNavigator from "../components/ScrollNavigator";
import VintageMediaViewer, { MediaItem } from "../components/VintageMediaViewer";

const SCENES = 6.2;
const MEDIA: MediaItem[] = [
  {
    type: "video",
    src: "/apwecprod.webm",
    caption: "Prototipo APWEC — ripresa esterna",
    date: "2024 · ARCHIVIO",
  },
  {
    type: "video",
    src: "/apwecprod1.webm",
    caption: "Sequenza mobile",
    date: "2024 · FIELD",
  },
  {
    type: "image",
    src: "/foto-archivio.jpg",
    caption: "Vista d'insieme dell'impianto",
    date: "2023 · FOT",
  },
];

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
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
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Appear({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px 0px" });
  const y = direction === "up" ? 36 : 0;
  const x = direction === "left" ? -48 : direction === "right" ? 48 : 0;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
 
function SectionDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "rgba(255,255,255,0.07)",
        margin: "0 clamp(1.5rem,8vw,7rem)",
      }}
    />
  );
}
 
function SectionLabel({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "block",
        textTransform: "uppercase",
        color: "rgba(100,150,255,0.75)",
        fontWeight: 700,
        letterSpacing: "0.18em",
        marginBottom: "clamp(2rem,4vh,3rem)",
        fontSize: "clamp(0.62rem,0.85vw,0.72rem)",
      }}
    >
      {text}
    </span>
  );
}

export function HowItWorksSection({
  t,
  isMobile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  isMobile: boolean;
}) {
  const stages = [
    { key: "cdi0", accent: "rgba(60,130,255,0.65)" },
    { key: "cdi1", accent: "rgba(90,160,255,0.55)" },
    { key: "cdi2", accent: "rgba(120,190,255,0.45)" },
    { key: "cdi3", accent: "rgba(160,220,255,0.35)" },
  ];
 
  return (
    <>
      <SectionDivider />
      <section
        style={{
          padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,7rem)",
        }}
      >
        <Appear>
          <SectionLabel text={t("howItWorks.label")} />
        </Appear>
 
        {/* Title + intro grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "clamp(2rem,5vw,5rem)",
            alignItems: "start",
            marginBottom: "clamp(3rem,6vh,5rem)",
          }}
        >
          <Appear direction="left">
            <h2
              style={{
                margin: 0,
                lineHeight: 1.05,
                color: "#f4f7fa",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
              className="text-3xl sm:text-6xl tracking-wide font-bold"
            >
              {t("howItWorks.title")}
            </h2>
          </Appear>
          <Appear direction="right" delay={0.08}>
            <p
              style={{
                margin: 0,
                lineHeight: 1.65,
                color: "rgba(200,218,250,0.70)",
                fontWeight: 300,
              }}
              className="text-lg sm:text-xl font-light"
            >
              {t("howItWorks.intro")}
            </p>
          </Appear>
        </div>
 
        {/* Two-shell diagram */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "clamp(1rem,2vw,1.4rem)",
            marginBottom: "clamp(3rem,6vh,5rem)",
          }}
        >
          {(["shell1", "shell2"] as const).map((shell, i) => (
            <Appear key={shell} delay={i * 0.1}>
              <GlassCard
                style={{
                  padding: "clamp(1.6rem,3vw,2.4rem)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* ghost number */}
                <span
                  style={{
                    position: "absolute",
                    top: "0.8rem",
                    right: "1rem",
                    fontSize: "clamp(3rem,6vw,5rem)",
                    fontWeight: 900,
                    color: "rgba(100,150,255,0.05)",
                    lineHeight: 1,
                    userSelect: "none",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {i + 1}
                </span>
                {/* accent bar */}
                <div
                  style={{
                    width: "32px",
                    height: "2px",
                    background:
                      "linear-gradient(90deg,rgba(80,150,255,0.7),transparent)",
                    borderRadius: "2px",
                    marginBottom: "1rem",
                  }}
                />
                <p
                  style={{
                    margin: "0 0 0.4rem",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(100,160,255,0.55)",
                  }}
                >
                  {t(`howItWorks.${shell}.label`)}
                </p>
                <h3
                  style={{
                    margin: "0 0 0.8rem",
                    lineHeight: 1.1,
                    color: "#f4f7fa",
                    fontWeight: 700,
                  }}
                  className="text-2xl sm:text-4xl font-bold"
                >
                  {t(`howItWorks.${shell}.title`)}
                </h3>
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.65,
                    color: "rgba(200,218,250,0.65)",
                    fontWeight: 300,
                  }}
                  className="text-base sm:text-lg font-light"
                >
                  {t(`howItWorks.${shell}.desc`)}
                </p>
              </GlassCard>
            </Appear>
          ))}
        </div>
      </section>
    </>
  );
}
 
// ── 3. ADVANTAGES — confronto APWEC vs stato dell'arte ───────────────────────
export function AdvantagesSection({
  t,
  isMobile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  isMobile: boolean;
}) {
  const advantages = ["a0", "a1", "a2", "a3", "a4", "a5"] as const;
 
  return (
    <>
      <SectionDivider />
      <section
        style={{
          padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,7rem)",
        }}
      >
        <Appear>
          <SectionLabel text={t("advantages.label")} />
        </Appear>
 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "clamp(2rem,5vw,5rem)",
            alignItems: "start",
            marginBottom: "clamp(3rem,6vh,5rem)",
          }}
        >
          <Appear direction="left">
            <h2
              style={{
                margin: 0,
                lineHeight: 1.05,
                color: "#f4f7fa",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
              className="text-3xl sm:text-6xl tracking-wide font-bold"
            >
              {t("advantages.title")}
            </h2>
          </Appear>
          <Appear direction="right" delay={0.08}>
            <p
              style={{
                margin: 0,
                lineHeight: 1.65,
                color: "rgba(200,218,250,0.70)",
                fontWeight: 300,
              }}
              className="text-lg sm:text-xl font-light"
            >
              {t("advantages.intro")}
            </p>
          </Appear>
        </div>
 
        {/* Advantage cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(3,1fr)",
            gap: "clamp(1rem,2vw,1.4rem)",
            marginBottom: "clamp(2rem,4vh,3rem)",
          }}
        >
          {advantages.map((ak, i) => (
            <Appear key={ak} delay={i * 0.07}>
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%" }}
              >
                <GlassCard
                  style={{
                    padding: "clamp(1.2rem,2vw,1.8rem)",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* index ghost */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "0.6rem",
                      right: "0.8rem",
                      fontSize: "clamp(2rem,4vw,3rem)",
                      fontWeight: 900,
                      color: "rgba(80,130,255,0.06)",
                      lineHeight: 1,
                      userSelect: "none",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
 
                  {/* check icon */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(60,120,255,0.15)",
                      border: "1px solid rgba(80,150,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="9" viewBox="0 0 12 9">
                      <path
                        d="M1 4l3.5 3.5L11 1"
                        stroke="rgba(120,190,255,0.8)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
 
                  <p
                    style={{
                      margin: "0 0 0.4rem",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(100,160,255,0.5)",
                    }}
                  >
                    {t(`advantages.${ak}.label`)}
                  </p>
                  <h3
                    style={{
                      margin: "0 0 0.5rem",
                      lineHeight: 1.15,
                      color: "#eef2fa",
                      fontWeight: 700,
                      fontSize: "clamp(0.9rem,1.2vw,1.05rem)",
                    }}
                  >
                    {t(`advantages.${ak}.title`)}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.6,
                      color: "rgba(190,215,255,0.58)",
                      fontWeight: 300,
                      fontSize: "clamp(0.78rem,1vw,0.88rem)",
                    }}
                  >
                    {t(`advantages.${ak}.desc`)}
                  </p>
                </GlassCard>
              </motion.div>
            </Appear>
          ))}
        </div>
 
        {/* vs. Stato dell'arte comparison strip */}
        <Appear delay={0.1}>
          <div
            style={{
              background: "rgba(10,20,60,0.55)",
              border: "1px solid rgba(80,130,255,0.15)",
              borderRadius: "16px",
              padding: "clamp(1.4rem,2.5vw,2rem)",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "clamp(1.2rem,2.5vw,2rem)",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <p
              style={{
                margin: 0,
                lineHeight: 1.65,
                color: "rgba(190,215,255,0.60)",
                fontWeight: 300,
                fontSize: "clamp(0.82rem,1.05vw,0.92rem)",
                textAlign: "center",
                whiteSpace: "pre-line"
              }}
            >
              {t("advantages.vsDesc")}
            </p>
          </div>
        </Appear>
      </section>
    </>
  );
}

export default function ApwecPage() {
  const t = useTranslations("apwec");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const dispatch = useAppDispatch();

  /* ── Responsive width ─────────────────────────────────────────────────── */
  const [width, setWidth] = useState(1024);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  /* ── Content height (for total scroll) ───────────────────────────────── */
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    setContentH(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

  /* ── Video scrubbing ──────────────────────────────────────────────────── */
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = isMobile ? "/apwecprod1.webm" : "/apwecprod.webm";

  const videoDuration = useRef<number>(0);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      videoDuration.current = videoRef.current.duration || 0;
    }
  }, []);

  /* ── Scroll ───────────────────────────────────────────────────────────── */
  const progressMotion = useMotionValue(0);

  const [vhPx, setVhPx] = useState(800);

  useEffect(() => {
    const isMobileDevice = isTouchDevice();

    const measure = () => {
      const h = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      setVhPx(h);
    };

    // misura iniziale SEMPRE
    measure();

    // 👉 SU MOBILE: NON aggiornare più (evita glitch tab bar)
    if (isMobileDevice) return;

    // 👉 SOLO DESKTOP: continua a reagire ai resize
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice()) {
      let rafId = 0;
      let target = 0;
      let current = 0;

      const onScroll = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) target = Math.min(SCENES, (sy / limit) * SCENES);
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
      progressMotion.set(Math.min(SCENES, (e.scroll / e.limit) * SCENES));
    });
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [progressMotion]);

  const springValue = useSpring(progressMotion, {
    stiffness: 280,
    damping: 30,
  });
  const smooth = isMobile ? progressMotion : springValue;

  /* ── Drive video currentTime from scroll progress ─────────────────────── */
  const VIDEO_START = 0;
  const VIDEO_END = 3.5;

  useMotionValueEvent(smooth, "change", (p) => {
    const vid = videoRef.current;
    if (!vid || !videoDuration.current) return;

    // normalizza p dentro il range del video
    const progress = Math.min(
      1,
      Math.max(0, (p - VIDEO_START) / (VIDEO_END - VIDEO_START))
    );

    const targetTime = progress * videoDuration.current;

    if (Math.abs(vid.currentTime - targetTime) > 0.01) {
      vid.currentTime = targetTime;
    }
  });

  const vh = vhPx;

  /*
   * Total scroll height:
   * - SCENES + 1 viewport-heights for the hero pin
   * - plus the actual height of the static content below
   * This mirrors the AboutUsPage pattern (CONTENT_TOP + contentH).
   */
  const CONTENT_TOP = vh * (SCENES + (isMobile ? 7.6 : 3));
  const SCROLL_VH = vh * (SCENES + (isMobile ? 7.6 : 3));
  const totalHeight = SCROLL_VH + contentH;

  /* ── Hero card motion values ──────────────────────────────────────────── */
  const headerTheme = useTransform(smooth, [3.8, 4.8, 7], [0, 0, 1]);

  const cardInset = useTransform(smooth, [0, 0.3, isMobile? 3.0 : 3.4, 3.8], [16, 0, 0, 16]);
  const cardRadius = useTransform(smooth, [0, 0.3,isMobile? 3.0 : 3.4, 3.8], [24, 0, 0, 24]);
  const cardPad = useTransform(cardInset, (v) => `${v}px`);
  const cardRad = useTransform(cardRadius, (v) => `${v}px`);
  const cardY = useTransform(smooth, [2.8,isMobile? 3.0 : 3.4, isMobile? 3.7: 4.0], ["0vh", "0vh", "-120vh"]);
  const cardOpacity = useTransform(smooth, [4.1, 4.4], [1, 0]);

  const bgOpacity = useTransform(smooth, [2.5, 3.2, 4.0, 4.3], [0, 1, 1, 0]);

  /* ── Static content section — color / inset / radius transitions ─────── */
  /*
   * Mirrors AboutUsPage:
   * - gradientPage:   starts white (#F4F7FA), transitions to the deep-blue
   *                   gradient once the hero exits (around p ≥ SCENES – 0.7).
   * - contentInset:   0 → 16px as the user approaches the footer.
   * - contentRadius:  0 → 24px at the same time.
   * - contentScale:   subtle shrink towards the end (mirrors AboutUs).
   * - contentY:       slight upward drift at the end.
   *
   * The progress values here are mapped to the *full-page* normalised progress
   * [0 → SCENES].  SCENES = 5, so:
   *   • The hero fully exits around p = 4.4.
   *   • Static content becomes visible from p ≈ 4.4 onward.
   *   • We start the colour transition slightly before (p = 4.2) so it is
   *     already full-blue when it first appears on screen.
   *   • The inset/radius exit animation starts at p = 4.8, ending at p = 5.0.
   */
  const gradientPage = useTransform(
    smooth,
    [0, isMobile? 3.6 : 4.0, 4.4,],
    [
      "#F4F7FA",
      "#F4F7FA",
      "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)",
    ]
  );

  const gradientPageH = useTransform(
    smooth,
    [0, 2.4, isMobile ? 4.2 : 4.2, 4.4, 4.5],
    [
      "#F4F7FA",
      "#F4F7FA",
      "linear-gradient(-160deg, #1c398e 20%, #0070f3 55%, #050b26 100%)",
      "linear-gradient(-160deg, #1c398e 20%, #0070f3 55%, #050b26 100%)",
      "#F4F7FA",
    ]
  );

  const colorP = useTransform(
    smooth,
    [0,isMobile? 3.6 : 3.9, isMobile? 3.7 : 4.0],
    ["#1c398e", "#1c398e", "rgba(160,196,255,0.7)"]
  );

  const colorTitle = useTransform(
    smooth,
    [0,isMobile? 3.6 : 3.9,isMobile? 3.7 : 4.0],
    ["#1c398e", "#1c398e", "#f4f7fa"]
  );

  const colorSub = useTransform(
    smooth,
    [0,isMobile? 3.6 : 3.9, isMobile? 3.7 : 4.0],
    ["#1c398e", "#1c398e", "rgba(200,218,250,0.72)"]
  );

  const contentRadius = useTransform(smooth, [5.6, 5.9], [0, 24]);
  const contentScale = useTransform(smooth, [5.6, 5.9], [1, 0.97]);
  const contentY = useTransform(smooth, [5.5, 5.6], [0, -86]);
  const contentBR = useTransform(contentRadius, (v) => `${v}px`);

  /* ── Slide texts ──────────────────────────────────────────────────────── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function mkSlide(enter: number, peak: number, exitAt: number) {
    return {
      opacity: useTransform(
        smooth,
        [enter, peak, exitAt - 0.05, exitAt],
        [0, 1, 1, 0]
      ),
      y: useTransform(
        smooth,
        [enter, peak, exitAt - 0.05, exitAt],
        [28, 0, 0, -20]
      ),
    } as const;
  }

  const s0 = mkSlide(0, 0, 0.7);
  const s1 = mkSlide(0.7, 0.8, 1.7);
  const s2 = mkSlide(1.7, 1.8, 2.7);
  const s3 = mkSlide(2.7, 2.8, 3.8);

  /* ── Shared style helpers ─────────────────────────────────────────────── */
  const sup: React.CSSProperties = {
    // fontSize: "clamp(0.6rem,0.85vw,0.72rem)",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "rgba(180,210,255,0.6)",
    marginBottom: "0.5rem",
    display: "block",
  };

  const h1s: React.CSSProperties = {
    margin: 0,
    fontWeight: 800,
    lineHeight: 1.0,
    color: "#f4f7fa",
  };

  const bodys: React.CSSProperties = {
    margin: "0.8rem 0 0",
    fontWeight: 400,
    lineHeight: 1.1,
    color: "rgba(200,218,250,0.70)",
    maxWidth: isMobile ? "100%" : "820px",
  };

  const textWrap = (extra?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    zIndex: 3,
    pointerEvents: "none",
    ...(isMobile
      ? {
          bottom: "clamp(2rem,4vh,3.5rem)",
          left: "clamp(1.2rem,5vw,2rem)",
          right: "clamp(1.2rem,5vw,2rem)",
        }
      : {
          top: "clamp(5.5rem,8vh,7rem)",
          left: "clamp(2rem,5vw,5rem)",
          right: "clamp(2rem,5vw,5rem)",
          maxWidth: "48%",
        }),
    ...extra,
  });


  const linkColorWhite = useMotionValue("#f4f7fa");
  const hiddenMenu  = useTransform(
    smooth,
    [5.8,5.9],
    [1, 0 ]
  );

  const menuTheme =  useTransform(
    smooth,
    [3, 3.6, 4.4,5.5, 5.9],
    [0,    1,   0, 0, 1 ]
  );
  const ts = useTranslations("scrollNavigator");

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Scroll spacer */}
      <div style={{ height: totalHeight }} aria-hidden />

      <motion.div
        className="absolute inset-x-0 top-0"
        style={{ height: totalHeight, zIndex: 1, backgroundColor: "#faf4f7" }}
      >
        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton hiddenMenu={hiddenMenu} menuTheme={menuTheme}/>}

        {/* ── HERO CARD (pinned, scrubbed video) ──────────────────────── */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            padding: cardPad,
            y: cardY,
            opacity: cardOpacity,
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: cardRad,
              overflow: "hidden",
              position: "relative",
              background:
                "linear-gradient(160deg, #0f2057 0%, #1c398e 40%, #050b26 100%)",
            }}
          >
            {/* Background image */}
            {/* <motion.div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/apwec-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: bgOpacity,
              }}
            /> */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,11,38,0.55)",
                opacity: bgOpacity,
                pointerEvents: "none",
              }}
            />

            {/* Scrubbed video */}
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              playsInline
              muted
              preload="auto"
              onLoadedMetadata={handleVideoLoaded}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Slide 0 */}
            <motion.div style={{ ...textWrap(isMobile? {top:"25%"} : {
              textAlign: "center",
              top: "20%",
              maxWidth: "100vw",
            }), ...s0 }} aria-hidden={false}>
              <span className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8] text-center" style={sup}>{t("slide0.suptitle")}</span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line text-center" style={h1s}>{t("slide0.title")}</h1>
              <p className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light text-center" style={{...bodys, ...(isMobile ? {marginTop: "65%"} : {maxWidth: "100%"})}}>{t("slide0.subtitle")}</p>
            </motion.div>

            {/* Slide 1 */}
            <motion.div style={{ ...textWrap(isMobile? {
              textAlign: "center",
              top: "15%",
            } : {
              top: "20%",
              textAlign: "center",
              maxWidth: "100vw",
            }), ...s1 }} aria-hidden={false}>
              <span className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8] " style={sup}>{t("slide1.suptitle")}</span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line" style={h1s}>{t("slide1.title")}</h1>
              <p className="text-lg sm:text-xl sm:text-4xl mt-4 sm:whitespace-pre-line font-light text-center" style={{...bodys, ...(isMobile ? { marginTop: "70%"} : {maxWidth: "100%"})}}>{t("slide1.subtitle")}</p>
            </motion.div>

            {/* Slide 2 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {
                      top: "12%",
                    }
                    : {
                        top: "20%",
                        left: "5%",
                        textAlign: "center",
                        maxWidth: "100vw"
                      }
                ),
                ...s2,
              }}
              aria-hidden={false}
            >
              <span
                className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8] text-center"
                style={{ ...sup }}
              >
                {t("slide2.suptitle")}
              </span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line text-center" style={{...h1s}}>{t("slide2.title")}</h1>
              <p
                style={{
                  ...bodys,
                  ...(isMobile
                    ? {marginTop: "45%", textAlign: "center"}
                    : { margin: "0.8rem auto 0", textAlign: "center", }),
                }}
                className="text-lg sm:text-xl mt-4 whitespace-pre-line font-light"
              >
                {t("slide2.subtitle")}
              </p>
            </motion.div>

            {/* Slide 3 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {top: "15%",
                      textAlign: "center",
                    }
                    : {
                        top: "7%",
                        textAlign: "center",
                        maxWidth: "100vw"
                      }
                ),
                ...s3,
              }}
              aria-hidden={false}
            >
              <span
                className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8]"
                style={{ ...sup, ...(isMobile ? {} : { textAlign: "center" }) }}
              >
                {t("slide3.suptitle")}
              </span>
              <h1
                style={{
                  ...h1s,
                  whiteSpace: "pre-line"
                }}
                className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line"
              >
                {t("slide3.title")}
              </h1>
              <p
                style={{
                  ...bodys,
                  ...(isMobile
                    ? {marginTop:"45%", textAlign: "center" }
                    : { margin: "0.8rem auto 0", marginTop:"23%", textAlign: "center" }),
                }}
                className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light"
              >
                {t("slide3.subtitle")}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── STATIC CONTENT ─────────────────────────────────────────── */}
        {/*
          Outer wrapper: positions the content below the hero pin zone.
          Left/right 0 so the page background bleeds through the "inset gap"
          when contentInset > 0.
        */}
        <motion.div
          ref={contentRef}
          style={{
            position: "absolute",
            top: CONTENT_TOP,
            background: gradientPageH,
            left: 0,
            right: 0,
            zIndex: 11,
          }}
          aria-hidden={false}
        >
          {/*
            Inner wrapper: animates background colour, border-radius and
            a subtle scale/Y as the user nears the footer — identical to
            the AboutUsPage pattern.
          */}
          <motion.div
            style={{
              scale: contentScale,
              y: contentY,
              borderRadius: contentBR,
              overflow: "hidden",
              background: gradientPage,
              marginBottom: "20px",
            }}
          >
            {/* About section */}
            <section
              style={{
                padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,7rem)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <motion.span
                    style={{
                      textTransform: "uppercase",
                      color: colorP,
                    }}
                    className="text-[1rem] sm:text-[1.3rem] mb-3 text-[#a0b8e8] tracking-widest uppercase"
                  >
                    {t("static.label")}
                  </motion.span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "clamp(2rem,5vw,5rem)",
                    alignItems: "start",
                  }}
                >
                  <motion.h2
                    style={{
                      margin: 0,
                      lineHeight: 1.1,
                      color: colorTitle,
                    }}
                    className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line"
                  >
                    {t("static.title")}
                  </motion.h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <motion.p
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        color: colorSub,
                      }}
                      className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light mt-4"
                    >
                      {t("static.p1")}
                    </motion.p>
                    <motion.p
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        color: colorSub,
                      }}
                      className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light mt-4"
                    >
                      {t("static.p2")}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </section>

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.07)",
                margin: "0 clamp(1.5rem,8vw,7rem)",
              }}
            />

            {/* Feature cards */}
            <section
              style={{
                padding: "clamp(3rem,6vh,5rem) clamp(1.5rem,8vw,7rem)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap: "clamp(1rem,2vw,1.4rem)",
                }}
              >
                {(["f0", "f1", "f2"] as const).map((k, i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <GlassCard
                      style={{
                        padding: "clamp(1.4rem,2.5vw,2.2rem)",
                        height: "100%",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 0.5rem",
                          textTransform: "uppercase",
                          color: "rgba(100,150,255,0.75)",
                          lineHeight: "1.0",
                          textAlign: "center"
                        }}
                        className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 mt-3 sm:mt-5"
                      >
                        {t(`static.${k}.label`)}
                      </p>
                      <h3
                        style={{
                          margin: "0 0 0.6rem",
                          lineHeight: 1.1,
                          color: "#f4f7fa",
                          textAlign: "center"
                        }}
                        className="text-3xl sm:text-5xl tracking-wide font-bold sm:whitespace-pre-line"
                      >
                        {t(`static.${k}.title`)}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          lineHeight: 1.3,
                          color: "rgba(200,218,250,0.62)",
                          textAlign: "center"
                        }}
                        className="text-lg font-stretch-extra-expanded tracking-wide sm:text-xl mt-4 whitespace-pre-line font-light"
                      >
                        {t(`static.${k}.description`)}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <HowItWorksSection t={t} isMobile={isMobile} />

            {/* ── ADVANTAGES ───────────────────────────────────────────── */}
            <AdvantagesSection t={t} isMobile={isMobile} />

            {/* <VintageMediaViewer items={MEDIA} vintageIntensity={0} /> */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.07)",
                margin: "0 clamp(1.5rem,8vw,7rem)",
              }}
            />

            {/* CTA */}
            <section
              style={{
                padding:
                  "clamp(3rem,6vh,5rem) clamp(1.5rem,8vw,7rem) clamp(4rem,8vh,7rem)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard
                  style={{
                    padding: "clamp(2rem,4vw,3rem)",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    gap: "2rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 0.4rem",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: "#f4f7fa",
                      }}
                      className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line"
                    >
                      {t("static.cta.title")}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(200,218,250,0.60)",
                        lineHeight: 1.2,
                      }}
                      className="text-lg sm:text-xl mt-4 text-[#c8d8f8] sm:max-w-4xl font-light"
                    >
                      {t("static.cta.subtitle")}
                    </p>
                  </div>
                  <div style={{ pointerEvents: "auto" }}>
                  <LinkButton
                    link="/contatti"
                    text={t("static.cta.link")}
                    icon={<ArrowUpRight size={20} />}
                    top="0"
                    color={linkColorWhite}
                  />
                </div>
                </GlassCard>
              </motion.div>
            </section>
          </motion.div>

          {/* Whitespace gap before footer */}
          <div style={{ height: "20vh" }} />

          <Footer openContact={() => dispatch(setOpenContact(true))}/>
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
                { index: 1, label: ts("apwec"), start: 0, end: 0.7, target: 0 },
                { index: 2, label: ts("whatIsIt"), start: 3.8, end: 4.2, target: 6.35 },
                { index: 3, label: ts("architecture"), start: 4.3, end: 4.8, target: 7.2 },
                { index: 4, label: ts("advantages"), start: 4.9, end: 5.4, target: 8.0 },
                { index: 5, label: ts("contactUs"), start: 5.5, end: 7.9, target: 8.65 },
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
