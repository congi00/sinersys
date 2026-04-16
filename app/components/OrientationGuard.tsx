"use client";

import { useEffect, useState } from "react";

export default function OrientationGuard() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(1024);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(orientation: landscape)");

    const handler = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
    };

    setIsLandscape(media.matches);
    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, []);
  if (!mounted) return null;
  if (!isMobile || !isLandscape) return null;

  return (
    <div style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        touchAction: "none",
    }}>
      <div style={{
        textAlign: "center",
      }}>
        <h2>Usa il sito in verticale</h2>
        <p>Ruota il dispositivo</p>
      </div>
    </div>
  );
}