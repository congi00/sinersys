"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isDark?: boolean;
}

export default function SocialSwitcher({ isDark }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  const SOCIALS = [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/yourcompany",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="4"
            fill={isDark ? "#F4F7FA" : "#1c398e"}
          />
          <path
            d="M7 10v7M7 7v.5"
            stroke={isDark ? "#1c398e" : "#F4F7FA"}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M11 17v-3.5c0-1.5 1-2.5 2.5-2.5S16 12 16 13.5V17"
            stroke={isDark ? "#1c398e" : "#F4F7FA"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 10v7"
            stroke={isDark ? "#1c398e" : "#F4F7FA"}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "researchgate",
      label: "ResearchGate",
      href: "https://www.researchgate.net/profile/Antonio-Luca-Biagini",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.8"
          />
          <path
            d="M8.2 15.8V8.2h3.2c1.9 0 3 .9 3 2.4 0 1-.5 1.8-1.5 2.2l1.9 2.9"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.2 12.9h1.1"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/yourhandle",
      icon: (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5.5"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.8"
          />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill={isDark ? "#F4F7FA" : "#1c398e"}
          />
        </svg>
      ),
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@yourchannel",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="4"
            stroke={isDark ? "#F4F7FA" : "#1c398e"}
            strokeWidth="1.8"
          />
          <path
            d="M10 9.5l5 2.5-5 2.5V9.5z"
            fill={isDark ? "#F4F7FA" : "#1c398e"}
          />
        </svg>
      ),
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger pill */}
      <motion.div
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.93 }}
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px 16px 6px 16px",
          borderRadius: "100px",
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          boxShadow:
            "0 2px 12px rgba(12,24,70,0.18), inset 0 1px 0 rgba(255,255,255,0.14)",
          color: isDark ? "#F4F7FA" : "#1c398e",
          fontSize: "0.82rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "pointer",
          userSelect: "none",
          transition: "opacity 0.2s",
          alignItems: "center",
        }}
        aria-label="Social links"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {SOCIALS.map((social, i) => (
          <motion.a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            role="option"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: i * 0.04,
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              //   display: "flex",
              //   alignItems: "center",
              //   gap: "10px",
              //   padding: "6px 12px",
              //   marginTop: "3px",
              //   borderRadius: "12px",
              //   background: "transparent",
              //   border: "1px solid transparent",
              cursor: "pointer",
              color: "rgba(200,218,250,0.85)",
              fontWeight: 400,
              //   letterSpacing: "0.02em",
              //   textDecoration: "none",
            }}
          >
            <span style={{ flexShrink: 0 }}>{social.icon}</span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
