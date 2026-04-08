"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const LOCALES: { code: string; label: string; flag: string }[] = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
];

export default function LanguageSwitcher() {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  function switchLocale(next: string) {
    if (next === locale) { setOpen(false); return; }

    // Replace the locale segment: /it/about-us → /en/about-us
    const segments = pathname.split("/");
    // segments[0] is always "" (leading slash), segments[1] is the locale
    segments[1] = next;
    router.push(segments.join("/"));
    setOpen(false);
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>

      {/* ── Trigger button — same glass pill style as the rest of the menu ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.18)" }}
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            "8px",
          padding:        "8px 18px 8px 14px",
          borderRadius:   "100px",
          background:     "rgba(255,255,255,0.10)",
          border:         "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          boxShadow:      "0 2px 12px rgba(12,24,70,0.18), inset 0 1px 0 rgba(255,255,255,0.14)",
          color:          "#f4f7fa",
          fontSize:       "0.92rem",
          fontWeight:     500,
          cursor:         "pointer",
          letterSpacing:  "0.02em",
          userSelect:     "none",
        }}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{current.flag}</span>
        <span style={{ fontWeight: 600, letterSpacing: "0.04em", fontSize: "0.8rem", textTransform: "uppercase" }}>
          {current.code.toUpperCase()}
        </span>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ flexShrink: 0, opacity: 0.7 }}
        >
          <path d="M3 5L7 9L11 5" stroke="#f4f7fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      {/* ── Dropdown ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -6,  scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:     "absolute",
              // Open upward — menu button is at the bottom of the screen
              bottom:       "calc(100% + 10px)",
              right: "-25%",
              transform:    "translateX(-50%)",
              zIndex:       9999,
              minWidth:     "160px",
              background:   "#173078ee",
              backdropFilter:       "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border:       "1px solid rgba(255,255,255,0.18)",
              borderRadius: "18px",
              boxShadow:    "0 16px 48px rgba(5,11,38,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
              overflow:     "hidden",
              padding:      "6px",
            }}
          >
            {LOCALES.map((loc, i) => {
              const isActive = loc.code === locale;
              return (
                <motion.button
                  key={loc.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => switchLocale(loc.code)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    marginTop: "5px",
                    gap:            "10px",
                    width:          "100%",
                    padding:        "5px 14px",
                    borderRadius:   "12px",
                    background:     isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    border:         isActive ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
                    cursor:         "pointer",
                    textAlign:      "left",
                    color:          isActive ? "#f4f7fa" : "rgba(200,218,250,0.70)",
                    fontSize:       "0.9rem",
                    fontWeight:     isActive ? 600 : 400,
                    letterSpacing:  "0.02em",
                    transition:     "color 0.15s",
                  }}
                >
                  <span style={{ fontSize: "1.15rem", lineHeight: 1, flexShrink: 0 }}>{loc.flag}</span>
                  <span style={{ flex: 1 }}>{loc.label}</span>
                  {isActive && (
                    <motion.svg
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      style={{ flexShrink: 0, opacity: 0.8 }}
                    >
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="#a0c4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}