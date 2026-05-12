"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type MediaItem = {
  type: "video" | "image";
  src: string;
  caption?: string;
  date?: string;
  poster?: string;
};

interface VintageMediaViewerProps {
  items: MediaItem[];
  /** Intensità dell'effetto vintage: 0 (leggero) → 1 (pesante). Default 0.6 */
  vintageIntensity?: number;
  className?: string;
}

/* ─── Grain SVG — generato una volta sola ────────────────────────────────── */
const GRAIN_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E";

/* ─── Sprocket holes ─────────────────────────────────────────────────────── */
function SprocketRow() {
  return (
    <div className="flex gap-[10px] py-1 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className="w-[18px] h-[13px] rounded-[3px] flex-shrink-0"
          style={{
            background: "#0d0b08",
            border: "1.5px solid #3d3020",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────── */
function Thumbnail({
  item,
  active,
  idx,
  onClick,
}: {
  item: MediaItem;
  active: boolean;
  idx: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex-shrink-0 cursor-pointer overflow-hidden"
      style={{
        width: 76,
        height: 54,
        border: active
          ? "2px solid #c4a35a"
          : "2px solid rgba(61,48,32,0.6)",
        transition: "border-color 0.2s",
      }}
    >
      {item.type === "video" ? (
        <video
          src={item.src}
          muted
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(65%) contrast(1.05) brightness(0.78) saturate(0.55)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <img
          src={item.src}
          alt={item.caption ?? `Frame ${idx + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(65%) contrast(1.05) brightness(0.78) saturate(0.55)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* grain overlay */}
      {/* <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${GRAIN_URL}")`,
          backgroundSize: "100px 100px",
          mixBlendMode: "overlay",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      /> */}
      {/* type badge */}
      <span
        className="absolute bottom-[3px] right-[3px] text-[9px] tracking-wider"
        style={{
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          borderRadius: 24,
        }}
      >
        {item.type === "video" ? "VID" : "FOT"}
      </span>
      {/* vignette */}
      {/* <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      /> */}
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function VintageMediaViewer({
  items,
  vintageIntensity = 0.6,
  className = "",
}: VintageMediaViewerProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayHint, setShowPlayHint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const item = items[current];
  const isVideo = item?.type === "video";

  /* sepia/brightness modulated by vintageIntensity */
  const sepia = Math.round(40 + vintageIntensity * 40);
  const brightness = (0.95 - vintageIntensity * 0.12).toFixed(2);
  const saturate = (0.9 - vintageIntensity * 0.45).toFixed(2);
  const mediaFilter = `sepia(${sepia}%) contrast(1.08) brightness(${brightness}) saturate(${saturate})`;

  /* ── autoplay on item change ────────────────────────────────────────── */
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const vid = videoRef.current;
    vid.load();
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setShowPlayHint(false))
        .catch(() => setShowPlayHint(true));
    }
  }, [current, isVideo]);

  const handleStageClick = useCallback(() => {
    if (!isVideo || !videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVideo]);

  const handlePrev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const handleNext = () => setCurrent((c) => (c + 1) % items.length);

  /* ── keyboard navigation ────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " " && isVideo) {
        e.preventDefault();
        handleStageClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideo]);

  if (!items.length) return null;

  return (
    <>
      <h1 className="text-3xl sm:text-5xl mt-2 mb-8 text-[#f4f7fa] text-center">Galleria Fotografica</h1>
      <div
        className={clsx(
          `relative select-none ${className} min-w-[60%] max-w-[60%] ml-[20%] mb-12`,
          "backdrop-blur-2xl",
          "bg-white/10",
          "border border-white/20",
          "shadow-[0_8px_40px_rgba(0,0,0,0.25)]",
          "overflow-hidden"
      )}
        style={{
          borderRadius: 24,
          padding: "20px 18px 16px",
        }}
        role="region"
        aria-label="Archivio media"
      >

        {/* ── media stage ─────────────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{
            aspectRatio: "16 / 9",
            borderRadius: " 24px 24px 0 0"
          }}
          onClick={handleStageClick}
          aria-label={isVideo ? "Clicca per play/pausa" : item?.caption}
        >
          {/* ── media ─────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={item.src}
                  poster={item.poster}
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: mediaFilter,
                  }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.caption ?? `Frame ${current + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: mediaFilter,
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── vignette ─────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 80%, rgba(0,0,0,0.15) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* ── grain ────────────────────────────────────────────────── */}
          {/* <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${GRAIN_URL}")`,
              backgroundSize: "180px 180px",
              mixBlendMode: "overlay",
              opacity: 0.45 + vintageIntensity * 0.25,
              pointerEvents: "none",
              zIndex: 3,
            }}
          /> */}

          {/* ── scratches ────────────────────────────────────────────── */}
          {/* <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 4,
              overflow: "hidden",
            }}
          >
            {[
              { left: "22%", delay: "0s", opacity: 0.35, w: 1 },
              { left: "65%", delay: "1.3s", opacity: 0.22, w: 2 },
              { left: "43%", delay: "2.7s", opacity: 0.18, w: 1 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: s.left,
                  width: s.w,
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(255,240,180,0.22) 20%, rgba(255,240,180,0.22) 80%, transparent 100%)",
                  opacity: s.opacity * vintageIntensity,
                  animation: `scratchFlicker 3.5s ${s.delay} infinite`,
                }}
              />
            ))}
          </div> */}

          {/* ── light flicker ────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,240,200,0.04)",
              pointerEvents: "none",
              zIndex: 5,
              animation: "lightFlicker 9s infinite",
              opacity: vintageIntensity,
            }}
          />

          {/* ── film counter ─────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              fontSize: 11,
              color: "#fff",
              letterSpacing: "0.15em",
              zIndex: 7,
            }}
          >
            ■ {String(current + 1).padStart(3, "0")}
          </div>

          {/* ── play hint overlay ─────────────────────────────────────── */}
          <AnimatePresence>
            {isVideo && (showPlayHint || !isPlaying) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.32)",
                  zIndex: 8,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "2.5px solid rgba(232,213,163,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(10,8,6,0.55)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon
                      points="8,5 20,12 8,19"
                      fill="rgba(232,213,163,0.85)"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── prev / next arrows ────────────────────────────────────── */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Precedente"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 9,
                  borderRadius: 3,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 24,
                  transition: "background 0.15s",
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Successivo"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 9,
                  borderRadius: 3,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 24,
                  transition: "background 0.15s",
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* ── caption ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mt-2 px-[2px]">
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              letterSpacing: "0.06em",
              maxWidth: "70%",
              lineHeight: 1.5,
              opacity: 0.85,
              fontStyle: "italic",
            }}
          >
            {item.caption ?? "—"}
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              letterSpacing: "0.12em",
              opacity: 0.8,
              whiteSpace: "nowrap",
            }}
          >
            {item.date ?? "—"}
          </span>
        </div>

        {/* ── thumbnail strip ───────────────────────────────────────────── */}
        {items.length > 1 && (
          <div
            className="flex gap-[6px] mt-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((it, i) => (
              <Thumbnail
                key={i}
                item={it}
                active={i === current}
                idx={i}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        )}

        {/* ── brand strip ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-3">
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
          <span
            style={{
              fontSize: 9,
              color: "#fff",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isPlaying ? "#c4a35a" : "#8b1a1a",
                animation: isPlaying ? "none" : "statusBlink 2s infinite",
              }}
            />
            Media
          </span>
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
        </div>

        {/* ── keyframe animations (injected once) ──────────────────────── */}
        <style>{`
          @keyframes scratchFlicker {
            0%, 100% { opacity: 0; }
            8%, 10%  { opacity: 1; }
            48%, 50% { opacity: 0.6; }
            88%, 89% { opacity: 0.8; }
          }
          @keyframes lightFlicker {
            0%, 100% { opacity: 0; }
            14%       { opacity: 1; }
            15%       { opacity: 0.2; }
            16%       { opacity: 0.8; }
            50%       { opacity: 0; }
            71%       { opacity: 0.5; }
            72%       { opacity: 0; }
          }
          @keyframes statusBlink {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.15; }
          }
        `}</style>
      </div>
    </>
  );
}