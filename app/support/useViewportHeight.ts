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

export function detectIOS() {
    const ua = navigator.userAgent;
  
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
    return iOS;
  }