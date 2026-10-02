"use client";

import { useRef, useEffect, useState } from "react";
import { MotionValue } from "framer-motion";

interface Props {
  progressMotion: MotionValue<number>;
  isMobile: boolean;
}

export default function HeroVideo({ isMobile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const hasStartedRef = useRef(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Sorgente corretta per il device corrente. Calcolata qui (non in più
  // effect separati) per evitare chiamate ridondanti a video.load(), che
  // forzano il browser a ri-scaricare il file anche quando l'URL non è
  // davvero cambiato: era questa la causa delle richieste duplicate da
  // ~1-3MB viste nel report delle performance.
  const targetSrc = isMobile ? "/apwecintro1.mp4" : "/apwecintro.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attributi richiesti da Safari per l'autoplay
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x-webkit-airplay", "deny");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Imposta la src solo alla prima volta che il video diventa
          // visibile: niente .load() ripetuti, il browser gestisce da sé
          // la cache quando la src cambia realmente (es. mobile → desktop).
          setVideoSrc((prev) => (prev === targetSrc ? prev : targetSrc));
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
  
    observer.observe(video);
  
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSrc]);

  // Se il device cambia (resize mobile↔desktop) mentre il video è già
  // visibile, aggiorna solo la src: il browser re-innesca il download da
  // solo perché l'attributo src cambia, senza bisogno di .load() esplicito.
  useEffect(() => {
    if (!videoSrc || videoSrc === targetSrc) return;
    setVideoSrc(targetSrc);
  }, [targetSrc, videoSrc]);

  return (
    <>
      {/* Overlay tap-to-play visibile solo se l'autoplay è stato bloccato */}
      {failed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            cursor: "pointer",
          }}
          onClick={() => {
            videoRef.current?.play().catch(() => {});
            setFailed(false);
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Triangolo play */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        // Cambia sorgente in base al viewport
        src={videoSrc ?? undefined}
        // Preload metadata prima, poi il browser decide se caricare tutto
        preload="metadata"
        autoPlay
        muted
        poster="/poster.webp" //#TOFIX
        // playsInline è l'attributo React ufficiale
        playsInline
        // Disabilita i controlli nativi iOS
        controls={false}
        aria-hidden="true"
        style={{
          // Copre l'intera area del parent (che in page.tsx è fixed + full-screen)
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // "cover" garantisce che riempia tutta l'area senza bande nere
          objectFit: "cover",
          objectPosition: isMobile? "-50px bottom" : "center 70px",
          // Evita il flickering su Safari durante il caricamento
          backgroundColor: "transparent",
          // Disabilita le ottimizzazioni GPU che su alcuni Safari causano
          // artefatti visivi con video in loop
          willChange: "auto",
        }}
      />
    </>
  );
}