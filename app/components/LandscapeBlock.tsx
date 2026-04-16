"use client";
 
import { useEffect, useState } from "react";
 
export default function LandscapeBlock() {
  const [show, setShow] = useState(false);
 
  useEffect(() => {
    const check = () => {
      const isMobile = window.matchMedia("(pointer: coarse)").matches;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isShortViewport = window.innerHeight < 500; // tablet landscape → non bloccare
      setShow(isMobile && isLandscape && isShortViewport);
    };
 
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
 
  if (!show) return null;
 
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "linear-gradient(160deg, rgb(28,57,142) 0%, rgb(5,11,38) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Icona rotazione */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "spin 2s ease-in-out infinite alternate" }}
      >
        <style>{`
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(-90deg); }
          }
        `}</style>
        {/* Telefono stilizzato */}
        <rect x="18" y="8" width="28" height="48" rx="5" stroke="#c8d8f8" strokeWidth="2.5" fill="none"/>
        <circle cx="32" cy="50" r="2.5" fill="#c8d8f8"/>
        <rect x="26" y="12" width="12" height="2" rx="1" fill="#c8d8f8"/>
      </svg>
 
      <p style={{ color: "#f4f7fa", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.02em" }}>
        Ruota il dispositivo
      </p>
      <p style={{ color: "#c8d8f8", fontSize: "0.85rem", maxWidth: 260, lineHeight: 1.5 }}>
        Per la migliore esperienza, usa il dispositivo in modalità verticale.
      </p>
    </div>
  );
}