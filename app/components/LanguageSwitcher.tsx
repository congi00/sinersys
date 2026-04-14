"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const LOCALES: { code: string; label: string; flag: string }[] = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
];
interface Props {
  isDark?: Boolean;
}

export default function LanguageSwitcher({ isDark }: Props) {
  const locale            = useLocale();
  const router            = useRouter();
  const [open, setOpen]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref               = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  function switchLocale(next: string) {
    if (next === locale) { setOpen(false); return; }
    // Write cookie — picked up by getRequestConfig on next request
    document.cookie = `locale=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    setOpen(false);
    // router.refresh() re-runs server components so next-intl reads the new cookie
    startTransition(() => router.refresh());
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>

      {/* Trigger pill */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.93 }}
        style={{
          display:              "inline-flex",
          alignItems:           "center",
          gap:                  "8px",
          padding:              "8px 16px 8px 12px",
          borderRadius:         "100px",
          background:           "rgba(255,255,255,0.10)",
          border:               "1px solid rgba(255,255,255,0.22)",
          backdropFilter:       "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          boxShadow:            "0 2px 12px rgba(12,24,70,0.18), inset 0 1px 0 rgba(255,255,255,0.14)",
          color:                isDark ? "#F4F7FA" : "#1c398e",
          fontSize:             "0.82rem",
          fontWeight:           600,
          letterSpacing:        "0.06em",
          textTransform:        "uppercase",
          cursor:               "pointer",
          userSelect:           "none",
          opacity:              isPending ? 0.6 : 1,
          transition:           "opacity 0.2s",
        }}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={{ fontSize: "1.05rem", lineHeight: 1 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, opacity: 0.65 }}
        >
          <motion.path d="M2 4.5L6 8L10 4.5" stroke="#f4f7fa" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" color={isDark ? "#F4F7FA" : "#1c398e"} />
        </motion.svg>
      </motion.button>

      {/* Dropdown — opens upward, z-index above everything */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: 6,  scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 4,   scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:             "absolute",
              bottom:               "calc(100% + 10px)",
              right:                 "-35%",
              transform:            "translateX(-50%)",
              zIndex:               99999,
              minWidth:             "168px",
              background:           "#1c398eee",
              backdropFilter:       "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border:               "1px solid rgba(255,255,255,0.16)",
              borderRadius:         "18px",
              boxShadow:            "0 20px 60px rgba(5,11,38,0.65), inset 0 1px 0 rgba(255,255,255,0.10)",
              padding:              "6px",
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
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.09)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            "10px",
                    width:          "100%",
                    padding:        "6px 12px",
                    marginTop: "3px",
                    borderRadius:   "12px",
                    background:     isActive ? "rgba(255,255,255,0.10)" : "transparent",
                    border:         isActive ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
                    cursor:         "pointer",
                    color:          isActive ? "#f4f7fa" : "rgba(200,218,250,0.65)",
                    fontSize:       "0.9rem",
                    fontWeight:     isActive ? 600 : 400,
                    letterSpacing:  "0.02em",
                    textAlign:      "left",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>{loc.flag}</span>
                  <span style={{ flex: 1 }}>{loc.label}</span>
                  {isActive && (
                    <motion.svg
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      width="13" height="13" viewBox="0 0 13 13" fill="none"
                    >
                      <path d="M2 6.5L5 9.5L11 3.5" stroke="#7eb3ff"
                            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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