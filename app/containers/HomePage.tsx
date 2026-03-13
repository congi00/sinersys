"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import {
  motion,
  useTransform,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as THREE from "three";

interface Props {
  progressMotion: MotionValue<number>;
  introFinished: boolean;
}

// ---------------------------------------------------------------------------
// Three.js dezoom helpers
// ---------------------------------------------------------------------------
const DEZOOM_DURATION = 3800;
const START_SCALE     = 4.8;

function applyCoverUV(
  texture: THREE.Texture,
  imgW: number, imgH: number,
  vpW: number, vpH: number
) {
  const imgAspect = imgW / imgH;
  const vpAspect  = vpW  / vpH;
  let repeatX: number, repeatY: number, offsetX: number, offsetY: number;
  if (imgAspect > vpAspect) {
    repeatY = 1; repeatX = vpAspect / imgAspect;
    offsetX = (1 - repeatX) / 2; offsetY = 0;
  } else {
    repeatX = 1; repeatY = imgAspect / vpAspect;
    offsetX = 0; offsetY = (1 - repeatY) / 2;
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
    const vpW = canvas.clientWidth, vpH = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(vpW, vpH, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.OrthographicCamera(-vpW/2, vpW/2, vpH/2, -vpH/2, 0.1, 100);
    camera.position.z = 10;
    const scene = new THREE.Scene();
    const state = { vpW, vpH, imgW: 0, imgH: 0, startTime: null as number|null, rafId: 0, done: false };

    const geo = new THREE.PlaneGeometry(vpW, vpH);
    const mat = new THREE.MeshBasicMaterial();
    const plane = new THREE.Mesh(geo, mat);
    scene.add(plane);

    const texture = new THREE.TextureLoader().load(imageSrc, (tex) => {
      const img = tex.image as HTMLImageElement;
      state.imgW = img.naturalWidth || img.width;
      state.imgH = img.naturalHeight || img.height;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      applyCoverUV(tex, state.imgW, state.imgH, state.vpW, state.vpH);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      mat.map = tex; mat.needsUpdate = true;
      setPlane(START_SCALE);
      renderer.render(scene, camera);
      state.startTime = performance.now();
      loop();
    });

    function setPlane(s: number) {
      plane.scale.set(s, s, 1);
      plane.position.set(state.vpW*(1-s)/2, state.vpH*(s-1)/2, 0);
    }
    function easeOutQuart(t: number) { return 1 - Math.pow(1-t, 4); }
    function loop() {
      if (state.done) return;
      state.rafId = requestAnimationFrame(loop);
      const raw = Math.min((performance.now() - (state.startTime ?? performance.now())) / DEZOOM_DURATION, 1);
      setPlane(START_SCALE - (START_SCALE-1) * easeOutQuart(raw));
      renderer.render(scene, camera);
      if (raw >= 1) {
        state.done = true;
        cancelAnimationFrame(state.rafId);
        setPlane(1);
        renderer.render(scene, camera);
        requestAnimationFrame(() => onComplete());
      }
    }

    function onResize() {
      const nw = canvas.clientWidth, nh = canvas.clientHeight;
      state.vpW = nw; state.vpH = nh;
      renderer.setSize(nw, nh, false);
      camera.left=-nw/2; camera.right=nw/2; camera.top=nh/2; camera.bottom=-nh/2;
      camera.updateProjectionMatrix();
      plane.geometry.dispose();
      (plane as THREE.Mesh).geometry = new THREE.PlaneGeometry(nw, nh);
      if (state.imgW && texture.image) applyCoverUV(texture, state.imgW, state.imgH, nw, nh);
    }
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(state.rafId);
      renderer.dispose(); mat.dispose(); geo.dispose(); texture.dispose();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomePage({ progressMotion, introFinished }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const dispatch    = useAppDispatch();
  const homeTexts   = useTranslations("homepage");

  const [dezoomDone, setDezoomDone] = useState(false);
  useThreeDezoom(canvasRef, "/homepageimage.png", introFinished, () => setDezoomDone(true));

  const slide0Opacity = useTransform(progressMotion, [0, 0.05], [0, 1]);

  return (
    <>
      <div className={clsx("relative w-full h-full overflow-hidden rounded-[inherit]")}>

        {/* Static image — always visible, never fades. z:1 */}
        <img
          src="/homepageimage.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
        />

        {/* Dezoom canvas — plays over the image, then removed from DOM */}
        <AnimatePresence>
          {introFinished && !dezoomDone && (
            <motion.canvas
              key="dezoom-canvas"
              ref={canvasRef}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
              style={{ display: "block", zIndex: 2 }}
            />
          )}
        </AnimatePresence>

        {/* Slide 0 text — appears after dezoom, over the image */}
        {dezoomDone && (
          <motion.div
            style={{ opacity: slide0Opacity, zIndex: 3 }}
            className="absolute inset-0 flex items-center justify-center px-[60px] whitespace-pre-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="text-center">
              <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] font-bold">
                {homeTexts("slide0.title")}
              </h1>
              <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] font-light">
                {homeTexts("slide0.subtitle")}
              </h2>
            </div>
          </motion.div>
        )}
      </div>

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