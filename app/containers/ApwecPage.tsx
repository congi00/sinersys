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
  const t           = useTranslations("apwec");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const dispatch    = useAppDispatch();

  /* ── Responsive width ─────────────────────────────────────────────────── */
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const isMobile = width <= 768;

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  /* ── Video scrubbing ──────────────────────────────────────────────────── */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const videoSrc    = isMobile ? "/apwec-mobile.webm" : "/intro.webm";

  // Once the video metadata is loaded we know the duration; we'll map
  // scroll progress [0 → SCENES] → time [0 → duration].
  const videoDuration = useRef<number>(0);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      videoDuration.current = videoRef.current.duration || 0;
    }
  }, []);

  /* ── Scroll ───────────────────────────────────────────────────────────── */
  const progressMotion = useMotionValue(0);

  const [vhPx, setVhPx] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      const h = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      setVhPx(h);
    };
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    measure();
    if (window.visualViewport)
      window.visualViewport.addEventListener("resize", debounced);
    window.addEventListener("resize", debounced);
    return () => {
      clearTimeout(timer);
      if (window.visualViewport)
        window.visualViewport.removeEventListener("resize", debounced);
      window.removeEventListener("resize", debounced);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice()) {
      const fn = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0)
          progressMotion.set(Math.min(SCENES, (sy / limit) * SCENES));
      };
      fn();
      window.addEventListener("scroll", fn, { passive: true });
      return () => window.removeEventListener("scroll", fn);
    }
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId   = 0;
    const raf   = (time: number) => {
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

  const springValue = useSpring(progressMotion, { stiffness: 280, damping: 30 });
  const smooth      = isMobile ? progressMotion : springValue;

  // Drive video currentTime from scroll progress
  useMotionValueEvent(smooth, "change", (p) => {
    const vid = videoRef.current;
    if (!vid || !videoDuration.current) return;
    const t = Math.min(
      videoDuration.current,
      (p / SCENES) * videoDuration.current
    );
    if (Math.abs(vid.currentTime - t) > 0.01) vid.currentTime = t;
  });

  const vh          = vhPx;
  const totalHeight = vh * (SCENES + 2);

  /* ── Derived motion values ────────────────────────────────────────────── */
  const headerTheme = useTransform(smooth, [3.8, 4.2], [0, 1]);

  const cardInset   = useTransform(smooth, [0, 0.3], [16, 0]);
  const cardRadius  = useTransform(smooth, [0, 0.3], [24, 0]);
  const cardPad     = useTransform(cardInset,  (v) => `${v}px`);
  const cardRad     = useTransform(cardRadius, (v) => `${v}px`);
  const cardY       = useTransform(smooth, [3.8, 4.4], ["0vh", "-120vh"]);
  const cardOpacity = useTransform(smooth, [4.1, 4.4], [1, 0]);

  const bgOpacity = useTransform(smooth, [2.5, 3.2, 4.0, 4.3], [0, 1, 1, 0]);

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

  const s0 = mkSlide(0,   0.05, 0.9);
  const s1 = mkSlide(1.0, 1.15, 1.95);
  const s2 = mkSlide(2.0, 2.15, 2.95);
  const s3 = mkSlide(3.0, 3.2,  3.9);

  /* ── Shared style helpers ─────────────────────────────────────────────── */
  const sup: React.CSSProperties = {
    fontSize: "clamp(0.6rem,0.85vw,0.72rem)",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(180,210,255,0.6)",
    marginBottom: "0.5rem",
    display: "block",
  };

  const h1s: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile
      ? "clamp(1.5rem,6vw,2.2rem)"
      : "clamp(2rem,4.5vw,4rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.0,
    color: "#f4f7fa",
  };

  const bodys: React.CSSProperties = {
    margin: "0.8rem 0 0",
    fontSize: isMobile
      ? "clamp(0.8rem,3.5vw,0.95rem)"
      : "clamp(0.88rem,1.2vw,1.05rem)",
    fontWeight: 400,
    lineHeight: 1.65,
    color: "rgba(200,218,250,0.70)",
    maxWidth: isMobile ? "100%" : "520px",
  };

  const textWrap = (extra?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    zIndex: 3,
    pointerEvents: "none",
    ...(isMobile
      ? {
          bottom: "clamp(2rem,4vh,3.5rem)",
          left:   "clamp(1.2rem,5vw,2rem)",
          right:  "clamp(1.2rem,5vw,2rem)",
        }
      : {
          top:      "clamp(5.5rem,8vh,7rem)",
          left:     "clamp(2rem,5vw,5rem)",
          maxWidth: "48%",
        }),
    ...extra,
  });

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Scroll spacer */}
      <div style={{ height: totalHeight }} aria-hidden />

      <div
        className="absolute inset-x-0 top-0"
        style={{ height: totalHeight, zIndex: 1 }}
      >
        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton />}

        {/* ── MAIN CARD ──────────────────────────────────────────────── */}
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
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/apwec-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: bgOpacity,
              }}
            />
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,11,38,0.55)",
                opacity: bgOpacity,
                pointerEvents: "none",
              }}
            />

            {/* ── SCRUBBED VIDEO ─────────────────────────────────────── */}
            {/*
              The video must be a transparent-background WEBM (VP9 with alpha).
              Desktop: /apwec-desktop.webm
              Mobile:  /apwec-mobile.webm
              The video encodes the full animation (/ → \ → -).
              Scroll progress [0→SCENES] maps to [0→duration].
            */}
            <video
              ref={videoRef}
              key={videoSrc}               /* remount when src changes */
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
                objectFit: "contain",      /* keeps proportions, transparent edges */
                zIndex: 2,
                pointerEvents: "none",
                // mix-blend-mode can be adjusted if needed:
                // mixBlendMode: "screen",
              }}
            />

            {/* Slide 0 */}
            <motion.div style={{ ...textWrap(), ...s0 }}>
              <span style={sup}>{t("slide0.suptitle")}</span>
              <h1 style={h1s}>{t("slide0.title")}</h1>
              <p style={bodys}>{t("slide0.subtitle")}</p>
            </motion.div>

            {/* Slide 1 */}
            <motion.div style={{ ...textWrap(), ...s1 }}>
              <span style={sup}>{t("slide1.suptitle")}</span>
              <h1 style={h1s}>{t("slide1.title")}</h1>
              <p style={bodys}>{t("slide1.subtitle")}</p>
            </motion.div>

            {/* Slide 2 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {}
                    : {
                        left:      "50%",
                        top:       "50%",
                        transform: "translate(-50%,-50%)",
                        maxWidth:  "500px",
                        textAlign: "center",
                      }
                ),
                ...s2,
              }}
            >
              <span
                style={{
                  ...sup,
                  ...(isMobile ? {} : { textAlign: "center" }),
                }}
              >
                {t("slide2.suptitle")}
              </span>
              <h1 style={h1s}>{t("slide2.title")}</h1>
              <p
                style={{
                  ...bodys,
                  ...(isMobile
                    ? {}
                    : { margin: "0.8rem auto 0", textAlign: "center" }),
                }}
              >
                {t("slide2.subtitle")}
              </p>
            </motion.div>

            {/* Slide 3 — centred on desktop */}
            <motion.div
              style={{
                ...textWrap(
                  isMobile
                    ? {}
                    : {
                        left:      "50%",
                        top:       "50%",
                        transform: "translate(-50%,-50%)",
                        maxWidth:  "600px",
                        textAlign: "center",
                      }
                ),
                ...s3,
              }}
            >
              <span
                style={{
                  ...sup,
                  ...(isMobile ? {} : { textAlign: "center" }),
                }}
              >
                {t("slide3.suptitle")}
              </span>
              <h1
                style={{
                  ...h1s,
                  fontSize: isMobile
                    ? "clamp(1.4rem,6vw,2rem)"
                    : "clamp(1.8rem,4vw,3.2rem)",
                }}
              >
                {t("slide3.title")}
              </h1>
              <p
                style={{
                  ...bodys,
                  ...(isMobile
                    ? {}
                    : { margin: "0.8rem auto 0", textAlign: "center" }),
                }}
              >
                {t("slide3.subtitle")}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── STATIC CONTENT ─────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top:  vh * SCENES,
            left: 0,
            right: 0,
            zIndex: 11,
          }}
        >
          {/* ── Rounded inset card wrapping all static sections ──────── */}
          <div
            style={{
              margin:       "clamp(1rem,3vw,2rem)",   /* white-ish gap on all sides */
              borderRadius: "24px",
              overflow:     "hidden",
              background:
                "linear-gradient(160deg, #1c398e 0%, #0c2070 50%, #050b26 100%)",
            }}
          >
            {/* About section */}
            <section
              style={{
                padding:
                  "clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,7rem)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    display:     "inline-flex",
                    alignItems:  "center",
                    gap:         "8px",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      width:      "28px",
                      height:     "1px",
                      background: "rgba(160,196,255,0.5)",
                    }}
                  />
                  <span
                    style={{
                      fontSize:       "0.72rem",
                      fontWeight:     700,
                      letterSpacing:  "0.16em",
                      textTransform:  "uppercase",
                      color:          "rgba(160,196,255,0.7)",
                    }}
                  >
                    {t("static.label")}
                  </span>
                </div>

                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap:                 "clamp(2rem,5vw,5rem)",
                    alignItems:          "start",
                  }}
                >
                  <h2
                    style={{
                      margin:        0,
                      fontSize:      "clamp(1.8rem,4vw,3.5rem)",
                      fontWeight:    800,
                      letterSpacing: "-0.03em",
                      lineHeight:    1.0,
                      color:         "#f4f7fa",
                    }}
                  >
                    {t("static.title")}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <p
                      style={{
                        margin:     0,
                        fontSize:   "clamp(0.9rem,1.3vw,1.05rem)",
                        lineHeight: 1.7,
                        color:      "rgba(200,218,250,0.72)",
                      }}
                    >
                      {t("static.p1")}
                    </p>
                    <p
                      style={{
                        margin:     0,
                        fontSize:   "clamp(0.9rem,1.3vw,1.05rem)",
                        lineHeight: 1.7,
                        color:      "rgba(200,218,250,0.72)",
                      }}
                    >
                      {t("static.p2")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            <div
              style={{
                height:     "1px",
                background: "rgba(255,255,255,0.07)",
                margin:     "0 clamp(1.5rem,8vw,7rem)",
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
                  display:             "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap:                 "clamp(1rem,2vw,1.4rem)",
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
                      delay:    i * 0.1,
                      ease:     [0.22, 1, 0.36, 1],
                    }}
                  >
                    <GlassCard
                      style={{
                        padding: "clamp(1.4rem,2.5vw,2.2rem)",
                        height:  "100%",
                      }}
                    >
                      <p
                        style={{
                          margin:        "0 0 0.5rem",
                          fontSize:      "0.7rem",
                          fontWeight:    700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color:         "rgba(100,150,255,0.75)",
                        }}
                      >
                        {t(`static.${k}.label`)}
                      </p>
                      <h3
                        style={{
                          margin:     "0 0 0.6rem",
                          fontSize:   "clamp(1.1rem,1.8vw,1.4rem)",
                          fontWeight: 700,
                          color:      "#f4f7fa",
                        }}
                      >
                        {t(`static.${k}.title`)}
                      </h3>
                      <p
                        style={{
                          margin:     0,
                          fontSize:   "clamp(0.82rem,1.1vw,0.95rem)",
                          lineHeight: 1.65,
                          color:      "rgba(200,218,250,0.62)",
                        }}
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
                height:     "1px",
                background: "rgba(255,255,255,0.07)",
                margin:     "0 clamp(1.5rem,8vw,7rem)",
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
                    padding:        "clamp(2rem,4vw,3rem)",
                    display:        "flex",
                    flexDirection:  isMobile ? "column" : "row",
                    alignItems:     isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    gap:            "2rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin:     "0 0 0.4rem",
                        fontSize:   "clamp(1.2rem,2vw,1.8rem)",
                        fontWeight: 700,
                        color:      "#f4f7fa",
                      }}
                    >
                      {t("static.cta.title")}
                    </h3>
                    <p
                      style={{
                        margin:     0,
                        fontSize:   "clamp(0.85rem,1.2vw,1rem)",
                        color:      "rgba(200,218,250,0.60)",
                        lineHeight: 1.6,
                      }}
                    >
                      {t("static.cta.subtitle")}
                    </p>
                  </div>
                  <a
                    href="/contatti"
                    style={{
                      display:        "inline-flex",
                      alignItems:     "center",
                      gap:            "8px",
                      padding:        "12px 28px",
                      borderRadius:   "100px",
                      background:     "rgba(255,255,255,0.12)",
                      border:         "1px solid rgba(255,255,255,0.22)",
                      color:          "#f4f7fa",
                      fontSize:       "clamp(0.82rem,1vw,0.92rem)",
                      fontWeight:     600,
                      letterSpacing:  "0.05em",
                      textDecoration: "none",
                      whiteSpace:     "nowrap",
                    }}
                  >
                    {t("static.cta.link")} ↗
                  </a>
                </GlassCard>
              </motion.div>
            </section>
          </div>

          {/* Whitespace gap before footer */}
          <div style={{ height: "clamp(3rem,6vh,5rem)" }} />

          <Footer />
        </div>

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </div>
    </>
  );
}