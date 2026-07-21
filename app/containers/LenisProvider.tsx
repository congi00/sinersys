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
  isTouch: boolean;
  /** Richiede un ricalcolo esplicito delle dimensioni di Lenis. */
  requestResize: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  isTouch: false,
  requestResize: () => {},
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

  const requestResize = useCallback(() => {
    // rAF: aspetta che il layout del frame corrente sia commesso
    // prima di far ricalcolare a Lenis dimensions.limit.
    requestAnimationFrame(() => {
      lenisRef.current?.resize();
    });
  }, []);

  useEffect(() => {
    const touch = isTouchDevice();
    setIsTouch(touch);

    if (touch) {
      setReady(true);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      autoResize: false, // ricalcolo manuale, guidato da requestResize()
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // fallback: continua comunque a reagire ai resize della finestra
    // (orientamento, ridimensionamento manuale del browser)
    const onWindowResize = () => lenis.resize();
    window.addEventListener("resize", onWindowResize);

    setReady(true);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  if (!ready) return null;

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, isTouch, requestResize }}>
      {children}
    </LenisContext.Provider>
  );
}