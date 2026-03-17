"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CookieConsent } from "./useCookieConsent";

interface Props {
  consent:      CookieConsent;
  onSave:       (custom: Partial<Pick<CookieConsent, "analytics" | "marketing" | "preferences">>) => void;
  onAcceptAll:  () => void;
  onClose:      () => void;
}

interface CategoryDef {
  key:         keyof Pick<CookieConsent, "analytics" | "marketing" | "preferences">;
  label:       string;
  description: string;
  required:    false;
}

const CATEGORIES: (CategoryDef | { key: "necessary"; label: string; description: string; required: true })[] = [
  {
    key:         "necessary",
    label:       "Necessari",
    required:    true,
    description: "Indispensabili per il funzionamento del sito. Includono sessione, autenticazione e sicurezza. Non possono essere disattivati.",
  },
  {
    key:         "analytics",
    label:       "Analitici",
    required:    false,
    description: "Ci aiutano a capire come gli utenti interagiscono con il sito, quali pagine visitano e dove si trovano gli errori. Dati aggregati e anonimi.",
  },
  {
    key:         "marketing",
    label:       "Marketing",
    required:    false,
    description: "Utilizzati per mostrare pubblicità pertinente in base ai tuoi interessi e per misurare l'efficacia delle campagne pubblicitarie.",
  },
  {
    key:         "preferences",
    label:       "Preferenze",
    required:    false,
    description: "Memorizzano le tue preferenze di navigazione (lingua, regione, tema) per offrirti un'esperienza personalizzata.",
  },
];

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width:         "44px",
        height:        "24px",
        borderRadius:  "12px",
        background:    checked
          ? "rgba(255,255,255,0.45)"
          : "rgba(255,255,255,0.10)",
        border:        `1px solid ${checked ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
        cursor:        disabled ? "not-allowed" : "pointer",
        position:      "relative",
        flexShrink:    0,
        transition:    "background 0.25s, border-color 0.25s",
        opacity:       disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position:   "absolute",
        top:        "3px",
        left:       checked ? "22px" : "3px",
        width:      "16px",
        height:     "16px",
        borderRadius: "50%",
        background: checked ? "#f4f7fa" : "rgba(200,216,248,0.5)",
        transition: "left 0.25s cubic-bezier(0.22,1,0.36,1)",
        boxShadow:  "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

export default function CookieDetails({ consent, onSave, onAcceptAll, onClose }: Props) {
  const [local, setLocal] = useState({
    analytics:   consent.analytics,
    marketing:   consent.marketing,
    preferences: consent.preferences,
  });
  const [expanded, setExpanded] = useState<string | null>("necessary");

  const toggle = (key: "analytics" | "marketing" | "preferences") =>
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <motion.div
      key="cookie-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position:  "fixed",
        inset:     0,
        zIndex:    9999,
        display:   "flex",
        alignItems:"center",
        justifyContent: "center",
        padding:   "16px",
        background: "rgba(12,24,70,0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.94, y: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width:       "min(96vw, 560px)",
          maxHeight:   "88vh",
          overflowY:   "auto",
          borderRadius:"22px",
          background:  "rgba(20, 44, 110, 0.55)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border:      "1px solid rgba(255,255,255,0.22)",
          boxShadow:   "0 20px 60px rgba(12,24,70,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
          position:    "relative",
        }}
      >
        {/* Header */}
        <div style={{
          padding:       "24px 24px 16px",
          borderBottom:  "1px solid rgba(255,255,255,0.10)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          position:      "sticky",
          top:           0,
          background:    "rgba(20,44,110,0.7)",
          backdropFilter:"blur(20px)",
          borderRadius:  "22px 22px 0 0",
          zIndex:        2,
        }}>
          <div>
            <h2 style={{
              margin: 0, fontSize: "1.1rem", fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              color: "#f4f7fa",
              fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
            }}>
              Gestione Cookie
            </h2>
            <p style={{
              margin: "4px 0 0", fontSize: "0.78rem",
              color: "rgba(200,216,248,0.6)",
              fontFamily: "'Barlow', system-ui, sans-serif",
            }}>
              Personalizza le tue preferenze di privacy
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              width: "32px", height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(200,216,248,0.8)",
              fontSize: "14px", flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Categories */}
        <div style={{ padding: "12px 16px" }}>
          {CATEGORIES.map((cat) => {
            const isOn = cat.required ? true : local[cat.key as "analytics" | "marketing" | "preferences"];
            const isOpen = expanded === cat.key;

            return (
              <div
                key={cat.key}
                style={{
                  marginBottom: "8px",
                  borderRadius: "12px",
                  background:   isOpen ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                  border:       `1px solid ${isOpen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"}`,
                  overflow:     "hidden",
                  transition:   "background 0.2s, border-color 0.2s",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : cat.key)}
                  style={{
                    display:       "flex",
                    alignItems:    "center",
                    gap:           "12px",
                    padding:       "14px 16px",
                    cursor:        "pointer",
                  }}
                >
                  {/* Expand arrow */}
                  <span style={{
                    color:      "rgba(200,216,248,0.5)",
                    fontSize:   "10px",
                    transition: "transform 0.2s",
                    transform:  isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}>▶</span>

                  <span style={{
                    flex:          1,
                    fontSize:      "0.88rem",
                    fontWeight:    600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color:         "#f4f7fa",
                    fontFamily:    "'Barlow Condensed', 'Arial Narrow', sans-serif",
                  }}>
                    {cat.label}
                  </span>

                  {cat.required ? (
                    <span style={{
                      fontSize:    "0.68rem",
                      color:       "rgba(200,216,248,0.45)",
                      fontFamily:  "'Barlow', system-ui, sans-serif",
                      letterSpacing: "0.04em",
                    }}>
                      SEMPRE ATTIVO
                    </span>
                  ) : (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={isOn}
                        onChange={() => toggle(cat.key as "analytics" | "marketing" | "preferences")}
                      />
                    </div>
                  )}
                </div>

                {/* Expandable description */}
                {isOpen && (
                  <div style={{
                    padding:    "0 16px 14px 38px",
                    fontSize:   "0.8rem",
                    lineHeight: 1.6,
                    color:      "rgba(200,216,248,0.7)",
                    fontFamily: "'Barlow', system-ui, sans-serif",
                  }}>
                    {cat.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding:       "16px 16px 20px",
          display:       "flex",
          gap:           "10px",
          borderTop:     "1px solid rgba(255,255,255,0.08)",
          position:      "sticky",
          bottom:        0,
          background:    "rgba(20,44,110,0.7)",
          backdropFilter:"blur(20px)",
          borderRadius:  "0 0 22px 22px",
        }}>
          <button
            onClick={() => onSave(local)}
            style={{
              flex:          1,
              padding:       "11px 16px",
              borderRadius:  "10px",
              border:        "1px solid rgba(255,255,255,0.25)",
              background:    "rgba(255,255,255,0.08)",
              color:         "rgba(200,216,248,0.9)",
              fontSize:      "0.8rem",
              fontWeight:    600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor:        "pointer",
              fontFamily:    "'Barlow Condensed', 'Arial Narrow', sans-serif",
              transition:    "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
          >
            Salva preferenze
          </button>
          <button
            onClick={onAcceptAll}
            style={{
              flex:          1,
              padding:       "11px 16px",
              borderRadius:  "10px",
              border:        "1px solid rgba(255,255,255,0.35)",
              background:    "rgba(255,255,255,0.18)",
              color:         "#f4f7fa",
              fontSize:      "0.8rem",
              fontWeight:    700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor:        "pointer",
              fontFamily:    "'Barlow Condensed', 'Arial Narrow', sans-serif",
              transition:    "background 0.2s",
              boxShadow:     "0 2px 12px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background  = "rgba(255,255,255,0.28)";
              (e.target as HTMLButtonElement).style.boxShadow   = "0 2px 20px rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background  = "rgba(255,255,255,0.18)";
              (e.target as HTMLButtonElement).style.boxShadow   = "0 2px 12px rgba(255,255,255,0.08)";
            }}
          >
            Accetta tutti
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}