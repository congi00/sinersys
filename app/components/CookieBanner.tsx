"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent } from "./useCookieConsent";
import CookieDetails from "./CookieDetails";

// This component is self-contained — just mount <CookieBanner /> anywhere in your layout.
// It reads/writes localStorage automatically via useCookieConsent.

export default function CookieBanner() {
  const {
    consent, showBanner, showDetails,
    acceptAll, rejectAll, saveCustom,
    openDetails, closeDetails,
  } = useCookieConsent();

  return (
    <>
      {/* ── Main banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && !showDetails && (
          <motion.div
            key="cookie-banner"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:  "fixed",
              bottom:    "24px",
              left:      "24px",
              transform: "translateX(-50%)",
              zIndex:    9999,
              width:     "min(92vw, 640px)",
            }}
          >
            {/* Glass card */}
            <div style={{
              background:          "rgba(28, 57, 142, 0.18)",
              backdropFilter:      "blur(32px) saturate(180%)",
              WebkitBackdropFilter:"blur(32px) saturate(180%)",
              border:              "1px solid rgba(255,255,255,0.22)",
              borderRadius:        "20px",
              padding:             "28px 28px 22px",
              boxShadow:           "0 8px 40px rgba(12,24,70,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
              position:            "relative",
              overflow:            "hidden",
            }}>
              {/* Subtle shimmer overlay */}
              <div style={{
                position:      "absolute",
                top:           0, left: 0, right: 0,
                height:        "1px",
                background:    "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                pointerEvents: "none",
              }} />

              {/* Icon + title */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0,
                }}>
                  🍪
                </div>
                <h2 style={{
                  margin: 0, fontSize: "1.05rem", fontWeight: 700,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  color: "#f4f7fa",
                  fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
                }}>
                  Preferenze Cookie
                </h2>
              </div>

              {/* Body */}
              <p style={{
                margin: "0 0 20px",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "rgba(200, 216, 248, 0.85)",
                fontFamily: "'Barlow', system-ui, sans-serif",
              }}>
                Utilizziamo i cookie per migliorare la tua esperienza di navigazione, 
                mostrare contenuti personalizzati e analizzare il traffico. 
                Puoi accettare tutti i cookie, rifiutarli o personalizzare le tue preferenze.
              </p>

              {/* Buttons */}
              <div style={{
                display: "flex", gap: "10px", flexWrap: "wrap",
              }}>
                {/* Personalizza */}
                <button
                  onClick={openDetails}
                  style={{
                    flex:            "1 1 auto",
                    minWidth:        "110px",
                    padding:         "10px 16px",
                    borderRadius:    "10px",
                    border:          "1px solid rgba(255,255,255,0.25)",
                    background:      "rgba(255,255,255,0.06)",
                    color:           "rgba(200,216,248,0.9)",
                    fontSize:        "0.82rem",
                    fontWeight:      600,
                    letterSpacing:   "0.06em",
                    textTransform:   "uppercase",
                    cursor:          "pointer",
                    transition:      "background 0.2s, border-color 0.2s",
                    fontFamily:      "'Barlow Condensed', 'Arial Narrow', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                >
                  Personalizza
                </button>

                {/* Rifiuta */}
                <button
                  onClick={rejectAll}
                  style={{
                    flex:          "1 1 auto",
                    minWidth:      "100px",
                    padding:       "10px 16px",
                    borderRadius:  "10px",
                    border:        "1px solid rgba(255,255,255,0.25)",
                    background:    "rgba(255,255,255,0.06)",
                    color:         "rgba(200,216,248,0.9)",
                    fontSize:      "0.82rem",
                    fontWeight:    600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor:        "pointer",
                    transition:    "background 0.2s",
                    fontFamily:    "'Barlow Condensed', 'Arial Narrow', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  Rifiuta
                </button>

                {/* Accetta tutti */}
                <button
                  onClick={acceptAll}
                  style={{
                    flex:          "1 1 auto",
                    minWidth:      "120px",
                    padding:       "10px 20px",
                    borderRadius:  "10px",
                    border:        "1px solid rgba(255,255,255,0.35)",
                    background:    "rgba(255,255,255,0.18)",
                    color:         "#f4f7fa",
                    fontSize:      "0.82rem",
                    fontWeight:    700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor:        "pointer",
                    transition:    "background 0.2s, box-shadow 0.2s",
                    boxShadow:     "0 2px 12px rgba(255,255,255,0.08)",
                    fontFamily:    "'Barlow Condensed', 'Arial Narrow', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.28)";
                    (e.target as HTMLButtonElement).style.boxShadow  = "0 2px 20px rgba(255,255,255,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
                    (e.target as HTMLButtonElement).style.boxShadow  = "0 2px 12px rgba(255,255,255,0.08)";
                  }}
                >
                  Accetta tutti
                </button>
              </div>

              {/* Privacy link */}
              <p style={{
                margin: "14px 0 0",
                fontSize: "0.73rem",
                color: "rgba(200,216,248,0.45)",
                fontFamily: "'Barlow', system-ui, sans-serif",
              }}>
                Consultando la nostra{" "}
                <a href="/privacy" style={{ color: "rgba(200,216,248,0.75)", textDecoration: "underline" }}>
                  Privacy Policy
                </a>{" "}
                e la{" "}
                <a href="/cookies" style={{ color: "rgba(200,216,248,0.75)", textDecoration: "underline" }}>
                  Cookie Policy
                </a>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detailed preferences panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showDetails && (
          <CookieDetails
            consent={consent}
            onSave={saveCustom}
            onAcceptAll={acceptAll}
            onClose={closeDetails}
          />
        )}
      </AnimatePresence>
    </>
  );
}