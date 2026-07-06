// app/containers/LenisProvider.tsx
"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface LenisContextValue {
  lenis: Lenis | null;
  /** true su dispositivi touch: qui NON usiamo Lenis, si usa lo scroll nativo */
  isTouch: boolean;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  isTouch: false,
});

export function useLenis() {
  return useContext(LenisContext);
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touch = isTouchDevice();
    setIsTouch(touch);

    // Su touch manteniamo lo scroll nativo (come già facevi per-pagina):
    // Lenis va usato solo su desktop/mouse per lo smoothing, evitando
    // conflitti col sistema di scroll nativo/momentum di iOS/Android.
    if (touch) {
      setReady(true);
      return;
    }

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    setReady(true);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Non renderizzare i figli finché non sappiamo se siamo touch o no,
  // per evitare che le pagine partano con un valore isTouch sbagliato
  // e debbano poi "correggersi" (stesso tipo di bug del Fix 2).
  if (!ready) return null;

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, isTouch }}>
      {children}
    </LenisContext.Provider>
  );
}