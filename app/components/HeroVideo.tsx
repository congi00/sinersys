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
          if (!videoSrc) {
            setVideoSrc(
              isMobile
                ? "/apwecintro1.mp4"
                : "/apwecintro.mp4"
            );
          }
  
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.25,
      }
    );
  
    observer.observe(video);
  
    return () => observer.disconnect();
  }, [videoSrc, isMobile]);

  useEffect(() => {
    if (!videoSrc) return;
  
    setVideoSrc(
      isMobile
        ? "/apwecintro1.mp4"
        : "/apwecintro.mp4"
    );
  }, [isMobile]);

  // Cambio sorgente quando passa da mobile a desktop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const rect = video.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) video.play().catch(() => {});
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
        src={videoSrc ?? undefined}
        // Preload metadata prima, poi il browser decide se caricare tutto
        preload="auto"
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
          objectPosition: isMobile? "-50px bottom" : "0 70px",
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