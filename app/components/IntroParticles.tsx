"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectIOS } from "../support/useViewportHeight";

// ─── Asset list da precaricare durante l'intro ────────────────────────────────
const VIDEO_ASSETS = [
  "/apwecintro.mp4",
  "/apwecintro1.mp4",
  "/apwecprod.webm",
  "/apwecprod1.webm",
];
const IMAGE_ASSETS = [
  "/sinVidr.gif",
  "/aboutus.webp",
];

// ─── Chiave sessionStorage ────────────────────────────────────────────────────
const INTRO_KEY = "sinersys_intro_seen";

type Props = {
  onFinish:  () => void;
  showIntro: boolean;
};

// ─── Preload helpers ──────────────────────────────────────────────────────────

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve();
    img.onerror = () => resolve(); // non bloccare se un asset manca
    img.src = src;
  });
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload  = "metadata"; // solo metadata — non scaricare tutto
    video.muted    = true;
    video.oncanplay = () => resolve();
    video.onerror   = () => resolve();
    // timeout di sicurezza: se dopo 4s non è pronto, vai avanti
    const t = setTimeout(resolve, 4000);
    video.src = src;
    video.load();
    video.addEventListener("canplay", () => clearTimeout(t), { once: true });
  });
}

// Carica tutti gli asset e segnala la percentuale di avanzamento
function preloadAll(onProgress: (pct: number) => void): Promise<void> {
  const all = [...VIDEO_ASSETS, ...IMAGE_ASSETS];
  let done = 0;

  const tasks = all.map((src) => {
    const p = src.match(/\.(mp4|webm)$/)
      ? preloadVideo(src)
      : preloadImage(src);
    return p.then(() => {
      done++;
      onProgress(Math.round((done / all.length) * 100));
    });
  });

  return Promise.all(tasks).then(() => {});
}

// ─── Rilevamento device lento (heuristica semplice) ──────────────────────────
function isSlowDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  // navigator.hardwareConcurrency disponibile su tutti i browser moderni
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency;
  if (cores !== undefined && cores <= 2) return true;
  // deviceMemory è Chrome-only ma utile
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem <= 2) return true;
  return false;
}

export default function IntroParticles({ onFinish }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const phaseRef     = useRef<1 | 2 | 3 | 4>(1);
  const loadPctRef   = useRef(0);       // percentuale asset caricati (0-100)
  const assetsReady  = useRef(false);   // tutti gli asset pronti
  const [phase, setPhase]     = useState<1 | 2 | 3 | 4>(1);
  const [loadPct, setLoadPct] = useState(0);

  const vhUnit = detectIOS() ? "lvh" : "dvh";

  // ── Aggiorna la percentuale visibile ────────────────────────────────────────
  const handleProgress = useCallback((pct: number) => {
    loadPctRef.current = pct;
    setLoadPct(pct);
    if (pct >= 100) assetsReady.current = true;
  }, []);

  // ── Canvas animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const slow = isSlowDevice();
    // Meno particelle su device lenti → meno lavoro sul main thread
    const COUNT = slow ? 300 : 700;
    // Su device lenti eseguiamo 1 frame ogni 2 (≈30fps invece di 60fps)
    const FRAME_SKIP = slow ? 2 : 1;

    const dpr = Math.min(window.devicePixelRatio, slow ? 1 : 1.5);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = "100dvw";
    canvas.style.height = `100${vhUnit}`;
    ctx.scale(dpr, dpr);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    const BOX_W = Math.min(450, W * 0.85);
    const BOX_H = 70;

    // Uso TypedArray per evitare GC pressure nel loop di animazione
    const px     = new Float32Array(COUNT);
    const py     = new Float32Array(COUNT);
    const baseY  = new Float32Array(COUNT);
    const offset = new Float32Array(COUNT);
    const vx     = new Float32Array(COUNT);
    const vy_arr = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      px[i]     = cx + (Math.random() - 0.5) * BOX_W;
      py[i]     = cy + (Math.random() - 0.5) * BOX_H;
      baseY[i]  = py[i];
      offset[i] = (i / COUNT) * 6;
    }

    let frame    = 0;
    let time     = 0;
    let lastTime = performance.now();
    let tick     = 0;

    const animate = (now: number) => {
      tick++;
      frame = requestAnimationFrame(animate);

      // Frame skip su device lenti
      if (tick % FRAME_SKIP !== 0) return;

      const delta = Math.min((now - lastTime) / 1000, 0.05); // cap a 50ms
      lastTime = now;
      time += delta * 2;

      const p = phaseRef.current;

      if (p >= 4) {
        ctx.fillStyle = "#F4F7FA";
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.clearRect(0, 0, W, H);
      }

      const color = p >= 4 ? "rgba(97,188,211,1)" : "rgba(180,240,255,0.95)";
      ctx.fillStyle = color;

      for (let i = 0; i < COUNT; i++) {
        if (p <= 3) {
          const sync  = Math.min(time / 13, 1);
          const speed = 1 + sync * 5;
          const amp   = 10 + sync * 200;
          py[i] = baseY[i] + Math.sin(time * speed + offset[i] * (1 - sync)) * amp;
        } else {
          if (vx[i] === 0 && vy_arr[i] === 0) {
            const angle = Math.random() * Math.PI * 2;
            const power = 2 + Math.random() * 8;
            vx[i]     = Math.cos(angle) * power;
            vy_arr[i] = Math.sin(angle) * power;
          }
          px[i] += vx[i];
          py[i] += vy_arr[i];
          vx[i] *= 0.99;
          vy_arr[i] *= 0.99;
        }

        ctx.beginPath();
        ctx.arc(px[i], py[i], 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sequenza timing: aspetta il caricamento asset ───────────────────────────
  useEffect(() => {
    // Avvia il preload in parallelo all'animazione
    preloadAll(handleProgress);

    // Funzione che aspetta una condizione con polling leggero
    const waitFor = (condition: () => boolean, cb: () => void) => {
      const check = () => {
        if (condition()) { cb(); return; }
        setTimeout(check, 100);
      };
      setTimeout(check, 100);
    };

    // Fase 2 → 3.7s oppure quando gli asset sono pronti (whichever is later)
    const t1 = setTimeout(() => {
      waitFor(() => assetsReady.current, () => {
        phaseRef.current = 2;
        setPhase(2);

        setTimeout(() => {
          phaseRef.current = 3;
          setPhase(3);
        }, 500);

        setTimeout(() => {
          phaseRef.current = 4;
          setPhase(4);
        }, 700);

        // L'animazione logo dura ~2s dopo la fase 4
        setTimeout(() => {
          onFinish();
        }, 1800);
      });
    }, 2800); // minimo 2.8s di particelle, poi aspetta assets

    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999]"
      style={{
        height: `100${vhUnit}`,
        background:
          phase >= 4
            ? "#F4F7FA"
            : "linear-gradient(180deg, rgb(28,57,142) 10%, rgb(0,86,191) 50%, rgb(5,11,38) 100%)",
        transition: "background 0.7s ease",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* ── Barra di caricamento (visibile solo nelle fasi 1-3) ─────────────── */}
      <AnimatePresence>
        {phase < 4 && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Logo reveal (fase 4) ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            key="logo"
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <motion.img
              src="/logoblu.svg"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 2 }}
              className="mb-4 w-[60px] sm:w-[90px]"
            />

            <motion.img
              src="/full-logo-sinersys.png"
              initial={{ opacity: 0, scale: 0.6, filter: "invert(0)" }}
              animate={{ opacity: 1, scale: 2.7, filter: "invert(1)" }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 1.5 }}
              className="w-28 sm:w-44"
            />

            <motion.h1
              className="mt-4 sm:mt-6 flex flex-wrap justify-center text-black font-medium tracking-wider text-lg sm:text-4xl"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
              variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
            >
              {"NEW ENERGY FRONTIERS".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden:  { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0  },
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}