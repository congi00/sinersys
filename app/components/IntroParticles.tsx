"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { detectIOS } from "../support/useViewportHeight";
import { preloadOBJ } from "./HeroModel";

type Props = {
  onFinish:  () => void;
  showIntro: Boolean;
};

export default function IntroParticles({ onFinish, showIntro }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef<1 | 2 | 3 | 4>(1);
  const [, forceRender] = useState(0);

  const vhUnit = detectIOS() ? "lvh" : "dvh";

  useEffect(() => {
    // ── Preload the 3D model in the background immediately ────────────────
    // By the time IntroParticles finishes (~6 s), the OBJ will be ready
    // and HeroModel can use it from cache with zero extra load time.
    preloadOBJ("/APWEC.obj");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = "100dvw";
    canvas.style.height = `100${vhUnit}`;
    ctx.scale(dpr, dpr);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const centerX = W / 2;
    const centerY = H / 2;

    const COUNT = 900;
    const BOX_W = 450;
    const BOX_H = 70;

    let frame: number;
    let time     = 0;
    let lastTime = performance.now();

    const particles = new Array(COUNT).fill(0).map((_, i) => {
      const colFactor = i / COUNT;
      return {
        x:      centerX + (Math.random() - 0.5) * BOX_W,
        y:      centerY + (Math.random() - 0.5) * BOX_H,
        baseY:  centerY + (Math.random() - 0.5) * BOX_H,
        offset: colFactor * 6,
        vx: 0,
        vy: 0,
      };
    });

    function animate(now: number) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      time += delta * 2;

      const phase = phaseRef.current;

      if (phase >= 4) {
        ctx.fillStyle = "#F4F7FA";
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.clearRect(0, 0, W, H);
      }

      particles.forEach((p) => {
        if (phase === 1 || phase === 2 || phase === 3) {
          const sync      = Math.min(time / 13, 1);
          const speed     = 1 + sync * 5;
          const amplitudeY = 10 + sync * 200;
          const wave      = Math.sin(time * speed + p.offset * (1 - sync));
          p.y = p.baseY + wave * amplitudeY;
        } else if (phase === 4) {
          if (p.vx === 0 && p.vy === 0) {
            const angle = Math.random() * Math.PI * 2;
            const power = 2 + Math.random() * 8;
            p.vx = Math.cos(angle) * power;
            p.vy = Math.sin(angle) * power;
          }
          p.x  += p.vx;
          p.y  += p.vy;
          p.vx *= 0.99;
          p.vy *= 0.99;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle =
          phase >= 4 ? "rgba(97,188,211,1)" : "rgba(180,240,255,0.95)";
        ctx.fill();
      });

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    setTimeout(() => { phaseRef.current = 2; },        3000);
    setTimeout(() => { phaseRef.current = 3; },        3700);
    setTimeout(() => {
      phaseRef.current = 4;
      forceRender((n) => n + 1);
    }, 3800);
    setTimeout(() => {
      cancelAnimationFrame(frame);
      onFinish();
    }, 6000);

    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = phaseRef.current;

  return (
    <div
      className={clsx(
        "fixed inset-x-0 top-0 z-[9999] transition-colors duration-700",
        phase >= 4 ? "bg-[#F4F7FA]" : "bg-blue-900"
      )}
      style={{ height: `100${vhUnit}` }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {phase >= 4 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
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
            className="mt-4 sm:mt-6 flex flex-wrap justify-center text-black font-medium tracking-wider text-lg sm:text-3xl"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
            variants={{
              visible: { transition: { staggerChildren: 0.02 } },
            }}
          >
            {"NEW ENERGY FRONTIERS".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden:  { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0  },
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
        </div>
      )}
    </div>
  );
}