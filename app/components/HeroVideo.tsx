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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attributi richiesti da Safari per l'autoplay
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x-webkit-airplay", "deny");

    // Su Safari è necessario chiamare load() esplicitamente
    // prima di play(), altrimenti il video resta fermo
    const tryPlay = () => {
      video.load();
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Se il primo tentativo fallisce (policy autoplay),
          // aspetta un'interazione dell'utente e riprova
          setFailed(true);
          const resume = () => {
            video.play().catch(() => {});
            setFailed(false);
            document.removeEventListener("touchstart", resume);
            document.removeEventListener("click", resume);
          };
          document.addEventListener("touchstart", resume, { once: true });
          document.addEventListener("click", resume, { once: true });
        });
      }
    };

    // Piccolo delay: su Safari iOS il video element a volte
    // non è ancora pronto nel primo tick dopo il mount
    const timer = setTimeout(tryPlay, 0);
    return () => clearTimeout(timer);
  }, []);

  // Cambio sorgente quando passa da mobile a desktop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [isMobile]);

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
        src={isMobile ? "/apwecintro.mp4" : "/apwecintro1.mp4"}
        // Preload metadata prima, poi il browser decide se caricare tutto
        preload="metadata"
        autoPlay
        loop
        muted
        // playsInline è l'attributo React ufficiale
        playsInline
        // Disabilita i controlli nativi iOS
        controls={false}
        style={{
          // Copre l'intera area del parent (che in page.tsx è fixed + full-screen)
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // "cover" garantisce che riempia tutta l'area senza bande nere
          objectFit: "cover",
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