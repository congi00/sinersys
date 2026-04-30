"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { useTranslations } from "next-intl";
import Header from "../components/Header";
import MenuButton from "../components/MenuButton";
import Footer from "../components/Footer";
import { useAppDispatch, useAppSelector } from "../hooks";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "lucide-react";

const SCENES = 5;

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
  const headerTheme = useTransform(smooth, [3.8, 4.8, 5], [0, 0, 1]);

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
    [0, isMobile? 3.7 : 3.8, 3.9],
    [
      "#F4F7FA",
      "#F4F7FA",
      "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)",
    ]
  );

  const gradientPageH = useTransform(
    smooth,
    [0, 2.4, isMobile ? 3.7 : 3.9, 4.3, 4.4],
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
    [0,isMobile? 3.6 : 3.8, isMobile? 3.7 : 3.9],
    ["#1c398e", "#1c398e", "rgba(160,196,255,0.7)"]
  );

  const colorTitle = useTransform(
    smooth,
    [0,isMobile? 3.6 : 3.8,isMobile? 3.7 : 3.9],
    ["#1c398e", "#1c398e", "#f4f7fa"]
  );

  const colorSub = useTransform(
    smooth,
    [0,isMobile? 3.6 : 3.8, isMobile? 3.7 : 3.9],
    ["#1c398e", "#1c398e", "rgba(200,218,250,0.72)"]
  );

  const contentRadius = useTransform(smooth, [4.4, 4.7], [0, 24]);
  const contentScale = useTransform(smooth, [4.4, 4.7], [1, 0.97]);
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
          maxWidth: "48%",
        }),
    ...extra,
  });


  const linkColorWhite = useMotionValue("#f4f7fa");
  const hiddenMenu  = useTransform(
    smooth,
    [4.4,4.5],
    [1, 0 ]
  );

  const menuTheme =  useTransform(
    smooth,
    [3, 3.1,3.9, 4.4, ],
    [0, 1,   0,   0, ]
  );

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
            <motion.div style={{ ...textWrap(isMobile? {top:"20%"} : {
              top: "20%"
            }), ...s0 }}>
              <span className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8] " style={sup}>{t("slide0.suptitle")}</span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line" style={h1s}>{t("slide0.title")}</h1>
              <p className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light" style={{...bodys, ...(isMobile ? {textAlign: "left", marginTop: "5%"} : {})}}>{t("slide0.subtitle")}</p>
            </motion.div>

            {/* Slide 1 */}
            <motion.div style={{ ...textWrap(isMobile? {
              textAlign: "right",
              top: "15%",
            } : {
              top: "20%",
              left: "45%",
              textAlign:"right"
            }), ...s1 }}>
              <span className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8] " style={sup}>{t("slide1.suptitle")}</span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line" style={h1s}>{t("slide1.title")}</h1>
              <p className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light" style={{...bodys, ...(isMobile ? {textAlign: "left", marginTop: "35%"} : {})}}>{t("slide1.subtitle")}</p>
            </motion.div>

            {/* Slide 2 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {
                      top: "20%",
                    }
                    : {
                        left: "5%",
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                        maxWidth: "800px",
                        textAlign: "left",
                      }
                ),
                ...s2,
              }}
            >
              <span
                className="text-m sm:text-lg tracking-widest uppercase [text-shadow:0_0px_0px_rgba(0,0,0,0.2)] mb-3 text-[#a0b8e8]"
                style={{ ...sup, ...(isMobile ? { textAlign: "end" } : { textAlign: "left" }) }}
              >
                {t("slide2.suptitle")}
              </span>
              <h1 className="text-3xl sm:text-6xl tracking-wide font-bold sm:whitespace-pre-line" style={{...h1s, ...(isMobile ? { textAlign: "end" } : { })}}>{t("slide2.title")}</h1>
              <p
                style={{
                  ...bodys,
                  ...(isMobile
                    ? {marginTop: "40%"}
                    : { margin: "0.8rem auto 0", textAlign: "left" }),
                }}
                className="text-lg sm:text-xl sm:text-4xl mt-4 whitespace-pre-line font-light"
              >
                {t("slide2.subtitle")}
              </p>
            </motion.div>

            {/* Slide 3 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {top: "20%",
                      textAlign: "center",
                    }
                    : {
                        left: "10%",
                        top: "13%",
                        transform: "translate(-50%,-50%)",
                        maxWidth: "100%",
                        textAlign: "center",
                      }
                ),
                ...s3,
              }}
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
                          lineHeight: "1.0"
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

          <Footer />
        </motion.div>

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
