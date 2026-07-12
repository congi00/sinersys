"use client";
import { useEffect, useState } from "react";

export function useFullViewportHeight() {
  const [height, setHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      let h = window.innerHeight;

      // Se visualViewport disponibile, usalo (include keyboard, tab bar mobile)
      if (window.visualViewport) {
        h = window.visualViewport.height;
      }

      setHeight(h);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    // Aggiorna anche su scroll per Safari glass edition
    window.addEventListener("scroll", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
      window.removeEventListener("scroll", updateHeight);
    };
  }, []);

  return height;
}

export function useViewportHeight(isIOS: boolean) {
  const [vh, setVh] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = requestAnimationFrame(() => {
        const el = document.createElement("div");
        el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${isIOS?"lvh":"dvh"};pointer-events:none;visibility:hidden;`;
        document.body.appendChild(el);
        const h = el.getBoundingClientRect().height;
        document.body.removeChild(el);
        setVh(h);
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [isIOS]);
  return vh;
}

export function detectIOS() {
    const ua = navigator.userAgent;
  
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
    return iOS;
  }