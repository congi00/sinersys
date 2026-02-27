"use client";

import { useEffect, useState } from "react";

export function useViewportHeight() {
  const [height, setHeight] = useState<string>("100dvh");

  useEffect(() => {
    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 1px;
      bottom: 0;
      pointer-events: none;
      visibility: hidden;
    `;
    document.body.appendChild(el);

    const measure = () => {
      // Un elemento fixed con top:0 e bottom:0 si estende
      // fino al bordo REALE del viewport inclusa la tab bar glass
      const h = el.getBoundingClientRect().height;
      setHeight(`${h}px`);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      document.body.removeChild(el);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return height;
}