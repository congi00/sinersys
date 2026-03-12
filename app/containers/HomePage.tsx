"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import {
  motion,
  useTransform,
  MotionValue,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { useRef, useEffect, useState } from "react";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as THREE from "three";

interface Props {
  progressMotion: MotionValue<number>;
  onVideoDuration?: (duration: number) => void;
  introFinished: boolean;
}

// ---------------------------------------------------------------------------
// Three.js dezoom
// ---------------------------------------------------------------------------
const DEZOOM_DURATION = 3800;
const START_SCALE = 4.8;

/**
 * Set texture repeat/offset to replicate CSS object-fit:cover + object-position:center.
 *
 * Three.js texture UV:  (0,0) = bottom-left, (1,1) = top-right
 * CSS object-fit:cover: scale the image so it fully covers the box,
 *                       then center it.
 *
 * We keep the plane exactly vpW×vpH (same as the viewport).
 * We crop the texture so only the visible portion shows, matching CSS exactly.
 */
function applyCoverUV(
  texture: THREE.Texture,
  imgW: number, imgH: number,
  vpW: number,  vpH: number
) {
  const imgAspect = imgW / imgH;
  const vpAspect  = vpW  / vpH;

  let repeatX: number, repeatY: number, offsetX: number, offsetY: number;

  if (imgAspect > vpAspect) {
    // Image is wider than viewport → fit by height, crop sides
    repeatY = 1;
    repeatX = vpAspect / imgAspect;   // < 1 → shows a horizontal slice
    offsetX = (1 - repeatX) / 2;     // center horizontally
    offsetY = 0;
  } else {
    // Image is taller than viewport → fit by width, crop top/bottom
    repeatX = 1;
    repeatY = imgAspect / vpAspect;  // < 1 → shows a vertical slice
    offsetX = 0;
    offsetY = (1 - repeatY) / 2;    // center vertically
  }

  texture.repeat.set(repeatX, repeatY);
  texture.offset.set(offsetX, offsetY);
  texture.needsUpdate = true;
}

function useThreeDezoom(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imageSrc: string,
  play: boolean,
  onComplete: () => void
) {
  useEffect(() => {
    if (!play || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const vpW = canvas.clientWidth;
    const vpH = canvas.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(vpW, vpH, false);
    // Match sRGB output so colors are identical to a normal <img>
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ── Camera (orthographic, 1 unit = 1 CSS pixel) ───────────────────────
    const camera = new THREE.OrthographicCamera(
      -vpW / 2, vpW / 2, vpH / 2, -vpH / 2, 0.1, 100
    );
    camera.position.z = 10;

    const scene = new THREE.Scene();

    const state = {
      vpW, vpH,
      imgW: 0, imgH: 0,
      startTime: null as number | null,
      rafId: 0,
      done: false,
    };

    // ── Plane — always vpW × vpH, never bigger ────────────────────────────
    // The "zoom" is achieved by scaling the plane (and its UV crop stays fixed)
    const geo = new THREE.PlaneGeometry(vpW, vpH);
    const mat = new THREE.MeshBasicMaterial();
    const plane = new THREE.Mesh(geo, mat);
    scene.add(plane);

    // ── Texture ───────────────────────────────────────────────────────────
    const texture = new THREE.TextureLoader().load(imageSrc, (tex) => {
      const img  = tex.image as HTMLImageElement;
      state.imgW = img.naturalWidth  || img.width;
      state.imgH = img.naturalHeight || img.height;

      // Correct color space — crucial for matching <img> brightness/saturation
      tex.colorSpace = THREE.SRGBColorSpace;

      // UV crop = CSS object-fit:cover
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      applyCoverUV(tex, state.imgW, state.imgH, state.vpW, state.vpH);

      // Best quality
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      mat.map = tex;
      mat.needsUpdate = true;

      // Start at START_SCALE with bottom-right zoom origin
      setPlaneTransform(START_SCALE);
      renderer.render(scene, camera);

      state.startTime = performance.now();
      loop();
    });

    /**
     * Scale the plane from its bottom-right corner.
     *
     * Plane is vpW×vpH at scale=1, centered at (0,0).
     * At scale s its half-extents are vpW*s/2 × vpH*s/2.
     * To pin the bottom-right corner to (vpW/2, -vpH/2):
     *   cx = vpW/2 - vpW*s/2 = vpW*(1-s)/2
     *   cy = -vpH/2 + vpH*s/2 = vpH*(s-1)/2
     */
    function setPlaneTransform(s: number) {
      plane.scale.set(s, s, 1);
      plane.position.set(
        state.vpW * (1 - s) / 2,
        state.vpH * (s - 1) / 2,
        0
      );
    }

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function loop() {
      if (state.done) return;
      state.rafId = requestAnimationFrame(loop);

      const elapsed = performance.now() - (state.startTime ?? performance.now());
      const raw   = Math.min(elapsed / DEZOOM_DURATION, 1);
      const eased = easeOutQuart(raw);

      setPlaneTransform(START_SCALE - (START_SCALE - 1) * eased);
      renderer.render(scene, camera);

      if (raw >= 1) {
        state.done = true;
        cancelAnimationFrame(state.rafId);

        // Final frame: scale=1, position=(0,0) — identical to <img object-cover>
        setPlaneTransform(1);
        renderer.render(scene, camera);

        // Wait one composited frame before starting the fade-out
        requestAnimationFrame(() => onComplete());
      }
    }

    // ── Resize ────────────────────────────────────────────────────────────
    function onResize() {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      state.vpW = nw; state.vpH = nh;

      renderer.setSize(nw, nh, false);
      camera.left = -nw / 2; camera.right  =  nw / 2;
      camera.top  =  nh / 2; camera.bottom = -nh / 2;
      camera.updateProjectionMatrix();

      // Resize plane geometry
      plane.geometry.dispose();
      (plane as THREE.Mesh).geometry = new THREE.PlaneGeometry(nw, nh);

      // Recompute UV crop for new viewport size
      if (state.imgW && texture.image) {
        applyCoverUV(texture, state.imgW, state.imgH, nw, nh);
      }
    }

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(state.rafId);
      renderer.dispose();
      mat.dispose();
      geo.dispose();
      texture.dispose();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomePage({ progressMotion, onVideoDuration, introFinished }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const openContact = useAppSelector((state) => state.siteState.openContact);
  const dispatch    = useAppDispatch();
  const homeTexts   = useTranslations("homepage");

  const [dezoomDone, setDezoomDone] = useState(false);

  useThreeDezoom(canvasRef, "/homepageimage.png", introFinished, () => setDezoomDone(true));

  // ── Scroll transforms ────────────────────────────────────────────────────
  const borderRadius = useTransform(progressMotion, [0, 1], [24, 0]);

  const heroY       = useTransform(progressMotion, [0, 1.2], ["0%", "-100%"]);
  const heroOpacity = useTransform(progressMotion, [0.8, 1.2], [1, 0]);

  const slide0Opacity = useTransform(progressMotion, [0, 0.05, 0.7, 1.1], [0, 1, 1, 0]);
  const slide0Y       = useTransform(progressMotion, [0.7, 1.1], [0, -40]);

  const textDivY       = useTransform(progressMotion, [0.9, 1.5, 2.2, 2.8], ["60px", "0px", "0px", "-80px"]);
  const textDivOpacity = useTransform(progressMotion, [0.9, 1.4, 2.2, 2.7], [0, 1, 1, 0]);

  const videoSectionY       = useTransform(progressMotion, [2.4, 3.0], ["40px", "0px"]);
  const videoSectionOpacity = useTransform(progressMotion, [2.4, 2.9], [0, 1]);

  const slide1Opacity = useTransform(progressMotion, [2.6, 3.0, 3.8, 4.0], [0, 1, 1, 0]);
  const slide1Y       = useTransform(progressMotion, [2.5, 3.0], [80, 0]);

  useMotionValueEvent(progressMotion, "change", (p) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const t = Math.max(0, Math.min(1, (p - 2.5) / 1.5));
    video.currentTime = t * video.duration;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => onVideoDuration?.(video.duration);
    video.addEventListener("loadedmetadata", onLoaded);
    if (video.readyState >= 1) onLoaded();
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [onVideoDuration]);

  return (
    <>
      {/* ── SECTION 1 – Hero ──────────────────────────────────────────────── */}
      <motion.div
        style={{ borderRadius, y: heroY, opacity: heroOpacity }}
        className={clsx(
          "relative w-full h-full",
          "flex items-center justify-center text-center",
          "overflow-hidden"
        )}
      >
        {/*
          <img> lives at z:0, always present.
          At dezoom end the canvas renders scale=1 centered = identical crop.
          Canvas fades out over 0.5s → underlying <img> shows, zero pop.
        */}
        <img
          src="/homepageimage.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />

        <AnimatePresence>
          {introFinished && !dezoomDone && (
            <motion.canvas
              key="dezoom-canvas"
              ref={canvasRef}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
              style={{ display: "block", zIndex: 1 }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {dezoomDone && (
            <motion.div
              key="slide0-text"
              style={{ opacity: slide0Opacity, y: slide0Y, zIndex: 2 }}
              className="absolute px-[60px] whitespace-pre-line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] font-bold">
                {homeTexts("slide0.title")}
              </h1>
              <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] font-light">
                {homeTexts("slide0.subtitle")}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── SECTION 2 – Text div ──────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          y: textDivY,
          opacity: textDivOpacity,
          zIndex: 9,
          pointerEvents: "none",
        }}
        className="flex items-center justify-center px-8"
      >
        <div className="max-w-2xl text-center">
          <p className="text-[1.1rem] sm:text-[1.4rem] text-[#1c398e] font-medium leading-relaxed">
            {homeTexts("slide0.subtitle")}
          </p>
        </div>
      </motion.div>

      {/* ── SECTION 3 – Scrubbed video ────────────────────────────────────── */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          y: videoSectionY,
          opacity: videoSectionOpacity,
          zIndex: 8,
        }}
        className="flex items-center justify-center overflow-hidden"
      >
        <video
          ref={videoRef}
          src="/city-loopj.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <motion.div
          style={{ opacity: slide1Opacity, y: slide1Y, top: "150px" }}
          className="absolute px-[20px] z-10 text-center"
        >
          <h4 className="text-[1.15rem] sm:text-[1.7rem] mb-4 whitespace-pre-line text-[#D9D9D9] font-regular">
            {homeTexts("slide1.suptitle")}
          </h4>
          <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] font-bold">
            {homeTexts("slide1.title")}
          </h1>
          <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] font-light">
            {homeTexts("slide1.subtitle")}
          </h2>
          <LinkButton
            text={homeTexts("slide1.link")}
            link={"apwec"}
            icon={<ArrowUpRight size={20} className="text-[#f4f7fa]" />}
            top="200px"
          />
        </motion.div>
      </motion.div>

      <ContactDrawer
        open={openContact}
        onClose={() => {
          dispatch(setOpenContact(false));
          dispatch(setNavigationState(0));
        }}
      />
    </>
  );
}