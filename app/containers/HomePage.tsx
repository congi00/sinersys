"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { useRef, useEffect } from "react";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

interface Props {
  progressMotion: MotionValue<number>;
  onVideoDuration?: (duration: number) => void;
}

export default function HomePage({ progressMotion, onVideoDuration }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const openContact = useAppSelector((state) => state.siteState.openContact);
  const dispatch = useAppDispatch();
  const homeTexts = useTranslations("homepage");

  const borderRadius = useTransform(progressMotion, [0, 1, 1.8, 2.3], [24, 0, 0, 24]);

  // Crossfade senza buchi:
  // image0: sempre visibile finché il video non è già sopra
  const image0Opacity = useTransform(progressMotion, [0.15, 0.3], [1, 0]);
  // video: fa fade-in sopra image0, poi resta a 1 finché image1 non è già sopra
  const videoOpacity  = useTransform(progressMotion, [0.15, 0.3], [0, 1]);
  // image1: fa fade-in sopra il video (il video rimane sotto, non scompare prima)
  const image1Opacity = useTransform(progressMotion, [0.85, 1.0], [0, 1]);

  // Testi
  const slide0Opacity = useTransform(progressMotion, [0, 0.15], [1, 0]);
  const slide0Y       = useTransform(progressMotion, [0, 0.2], [0, -40]);
  const slide1Opacity = useTransform(progressMotion, [0.9, 1.0, 1.7, 1.9], [0, 1, 1, 0]);
  const slide1Y       = useTransform(progressMotion, [0.8, 1.0], [120, 0]);

  // Scrubbing: progress [0, 1.0] → currentTime [0, duration]
  useMotionValueEvent(progressMotion, "change", (p) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const t = Math.max(0, Math.min(1, p / 1.0));
    video.currentTime = t * video.duration;
  });

  // Comunica durata al parent per adattare totalHeight / spacerPx
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      onVideoDuration?.(video.duration);
    };
    video.addEventListener("loadedmetadata", onLoaded);
    // Se già caricato
    if (video.readyState >= 1) onLoaded();
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [onVideoDuration]);

  return (
    <motion.div
      style={{ borderRadius }}
      className={clsx(
        "relative w-full h-full",
        "flex items-center justify-center text-center",
        "overflow-hidden"
      )}
    >
      {/* Layer 1: immagine iniziale — scompare solo DOPO che il video è già visibile */}
      <motion.img
        src="/homepageimage.png"
        alt=""
        style={{ opacity: image0Opacity }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Layer 2: video scrubbed — appare sopra image0, resta sotto image1 */}
      <motion.video
        ref={videoRef}
        src="/city-loopj.mp4"
        muted
        playsInline
        preload="auto"
        style={{ opacity: videoOpacity }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Layer 3: immagine finale — appare sopra il video */}
      <motion.img
        src="/images/2.jpg"
        alt=""
        style={{ opacity: image1Opacity }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Slide 0 testo */}
      <motion.div
        style={{ opacity: slide0Opacity, y: slide0Y }}
        className="absolute px-[60px] whitespace-pre-line z-10"
      >
        <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] font-bold">
          {homeTexts("slide0.title")}
        </h1>
        <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] font-light">
          {homeTexts("slide0.subtitle")}
        </h2>
      </motion.div>

      {/* Slide 1 testo */}
      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y, top: "150px" }}
        className="absolute px-[20px] z-10"
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

      <ContactDrawer
        open={openContact}
        onClose={() => {
          dispatch(setOpenContact(false));
          dispatch(setNavigationState(0));
        }}
      />
    </motion.div>
  );
}