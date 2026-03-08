"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { motion, useTransform, MotionValue } from "framer-motion";
import LinkButton from "../components/LinkButton";
import { ArrowUpRight } from "@deemlol/next-icons";
import { Canvas } from "@react-three/fiber";
import HeroScene from "../components/HeroScene";
import { useRef, useEffect } from "react";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

interface Props {
  progressMotion: MotionValue<number>;
}

export default function HomePage({ progressMotion }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const openContact = useAppSelector((state) => state.siteState.openContact);
  const dispatch = useAppDispatch();
  const homeTexts = useTranslations("homepage");

  const slide0Opacity = useTransform(progressMotion, [0, 0.2], [1, 0]);
  const slide0Y = useTransform(progressMotion, [0, 0.2], [0, -120]);
  const slide1Opacity = useTransform(progressMotion, [1.2, 1.3, 1.8, 1.9], [0, 1, 1, 0]);
  const slide1Y = useTransform(progressMotion, [0.8, 1.0], [120, 0]);
  const borderRadius = useTransform(progressMotion, [0, 1, 1.8, 2.3], [24, 0, 0, 24]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      style={{ borderRadius }}
      className={clsx(
        "relative w-full h-full",
        "flex items-center justify-center text-center",
        "overflow-hidden"
        // Nessun bg-* qui: il canvas copre tutto visivamente.
        // background transparent sul wrapper in page.tsx → tab bar iOS trasparente.
      )}
    >
      <div ref={canvasContainerRef} className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
          }}
          camera={{ position: [0, 0, 10], fov: 40 }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        >
          <HeroScene progress={progressMotion} />
        </Canvas>
      </div>

      <motion.div
        style={{ opacity: slide0Opacity, y: slide0Y }}
        className="absolute px-[60px] whitespace-pre-line"
      >
        <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] line-height-40 font-bold">
          {homeTexts("slide0.title")}
        </h1>
        <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] line-height-40 font-light">
          {homeTexts("slide0.subtitle")}
        </h2>
      </motion.div>

      <motion.div
        style={{ opacity: slide1Opacity, y: slide1Y , top: "150px"}}
        className="absolute px-[20px]"
      >
        <h4 className="text-[1.15rem] sm:text-[1.7rem] mb-4 whitespace-pre-line text-[#D9D9D9] line-height-20 font-regular">
          {homeTexts("slide1.suptitle")}
        </h4>
        <h1 className="text-[3.0rem] sm:text-[4.2rem] text-[#f4f7fa] line-height-40 font-bold">
          {homeTexts("slide1.title")}
        </h1>
        <h2 className="text-[1.65rem] sm:text-[2.25rem] mt-4 whitespace-pre-line text-[#f4f7fa] line-height-40 font-light">
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
          dispatch(setOpenContact(false))
          dispatch(setNavigationState(0))
        }}
      />
    </motion.div>
  );
}