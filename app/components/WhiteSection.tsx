"use client";

import {
  motion,
  useTransform,
  MotionValue,
} from "framer-motion";
import CallToActionHome from "./CallToActionHome";

interface Props {
  progressMotion: MotionValue<number>;
  isMobile:       boolean;
  vhUnit:         string;
  setOpen: Function;
}

const MARQUEE_TEXT = "SINERSYS · NEW ENERGY FRONTIERS · ";

// Quante copie del testo nel track — abbastanza da riempire 200% di larghezza
// anche su schermi larghi. Con font piccolo su mobile ne servono meno.
const COPIES = 6;

export default function WhiteSection({ progressMotion, isMobile, vhUnit, setOpen }: Props) {
  const sectionOpacity = useTransform(progressMotion, [6.0, 6.1], [0, 1]);
  const sectionY       = useTransform(progressMotion, [6.0, 6.35], [0, 0]);
  const sectionCTAY    = useTransform(
    progressMotion,
    [6.0, 6.35, 7.0, 7.01, 7.8],
    [0, 0, -320, -320, -1000]
  );
  const sectionCTAFlex = useTransform(
    progressMotion,
    [6.0, 6.35, 7.0, 7.1, 7.8],
    ["0 0 66.667%", "0 0 66.667%", "0 0 100%", "0 0 100%", "0 0 66.667%"]
  );

  // Font size: su mobile più piccolo così il testo non è più largo del viewport
  // in una singola copia (il loop funziona se ogni copia è < 100vw)
  const fontSize = isMobile ? "clamp(2.5rem, 8vw, 3rem)" : "clamp(5rem, 5.5vw, 7rem)";
  // Velocità: testo più piccolo → animazione più lenta per sembrare fluida
  const duration = isMobile ? "12s" : "22s";

  return (
    <motion.div
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        29,
        background:    "#f4f7fa",
        opacity:       sectionOpacity,
        y:             sectionY,
        pointerEvents: "none",
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
      }}
    >
      {/* ── MARQUEE STRIP ───────────────────────────────────────────────────── */}
      <motion.div
        style={{
          flex:         "0 0 33.333%",
          display:      "flex",
          alignItems:   "center",
          overflow:     "hidden",
          borderBottom: "1px solid rgba(28,57,142,0.08)",
          position:     "relative",
          y:            sectionCTAY,
        }}
      >
        {/* Fade edges */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 60,
          background: "linear-gradient(to right, #f4f7fa, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 60,
          background: "linear-gradient(to left, #f4f7fa, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />

        {/*
          Il track contiene COPIES copie del testo affiancate.
          L'animazione sposta il track di -(100% / COPIES) che equivale
          esattamente a una copia → seamless loop senza salti.
          Non usiamo translateX(-50%) + 2 copie perché con font grandi
          una singola copia può essere più larga del viewport, rompendo il loop.
        */}
        <div
          className="marquee-track"
          style={{
            display:    "flex",
            whiteSpace: "nowrap",
            willChange: "transform",
            // L'animazione è definita inline per poter passare la duration dinamica
            animation:  `marquee-slide ${duration} linear infinite`,
          }}
        >
          {Array.from({ length: COPIES }).map((_, n) => (
            <span
              key={n}
              style={{
                fontSize,
                fontWeight:    800,
                letterSpacing: "-0.02em",
                paddingRight:  "2rem",
                // Gradient clip text
                background:           "linear-gradient(135deg, #1c398e 0%, #0a1540 55%, #2a52c9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
                // Evita che il background clip venga ricalcolato ad ogni frame
                // (bug noto su Chrome Android con gradient text + transform)
                display: "inline-block",
              }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>

        <style>{`
          /*
            Sposta di -(1/COPIES * 100%) = -16.666% per COPIES=6
            Quando ha percorso esattamente 1 copia, torna a 0 → loop perfetto.
          */
          @keyframes marquee-slide {
            from { transform: translateX(0); }
            to   { transform: translateX(calc(-100% / ${COPIES})); }
          }

          /* Pausa se l'utente preferisce ridurre le animazioni */
          @media (prefers-reduced-motion: reduce) {
            .marquee-track { animation-play-state: paused !important; }
          }
        `}</style>
      </motion.div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          flex:     sectionCTAFlex,
          position: "relative",
          padding:  isMobile ? "12px 12px 0" : "20px 20px 0",
          y:        sectionCTAY,
        }}
      >
        <CallToActionHome progressMotion={progressMotion} setOpen={setOpen} />
      </motion.div>
    </motion.div>
  );
}