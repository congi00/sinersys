"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onFinish: () => void;
};

export default function IntroParticles({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<1 | 2 | 3 | 4>(1); // 🔥 REF e non state
  const [, forceRender] = useState(0); // solo per aggiornare bg/logo

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    ctx.scale(dpr, dpr);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const centerX = W / 2;
    const centerY = H / 2;

    const COUNT = 700;
    const BOX_W = 200;
    const BOX_H = 30;

    let frame: number;
    let time = 0;

    const particles = new Array(COUNT).fill(0).map((_, i) => {
      const colFactor = i / COUNT;

      return {
        x: centerX + (Math.random() - 0.5) * BOX_W,
        y: centerY + (Math.random() - 0.5) * BOX_H,
        baseY: centerY + (Math.random() - 0.5) * BOX_H,
        offset: colFactor * 6,
        vx: 0,
        vy: 0,
      };
    });

    function animate() {
      ctx.clearRect(0, 0, W, H);
      time += 0.015;

      const phase = phaseRef.current; // 🔥 sempre aggiornato

      particles.forEach((p) => {
        if (phase === 1 || phase === 2) {
          const sync = Math.min(time / 15, 1);
          const speed = 1 + sync * 3;
          const amplitudeY = 10 + sync * 200;
          const wave = Math.sin(time * speed + p.offset * (1 - sync));
          p.y = p.baseY + wave * amplitudeY;
        } else if (phase === 3) {
          p.x += (centerX - p.x) * 0.15;
          p.y += (centerY - p.y) * 0.15;
        } else if (phase === 4) {
          // Se non hanno ancora velocità, generala
          if (p.vx === 0 && p.vy === 0) {
            const angle = Math.random() * Math.PI * 2;
            const power = 5 + Math.random() * 8;
            p.vx = Math.cos(angle) * power;
            p.vy = Math.sin(angle) * power;
          }

          // Aggiorna posizione
          p.x += p.vx;
          p.y += p.vy;

          // Piccola decelerazione
          p.vx *= 0.99;
          p.vy *= 0.99;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle =
          phase >= 4 ? "rgba(0,0,0,0.7)" : "rgba(180,240,255,0.95)";
        ctx.fill();
      });

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    // Timeline senza ri-render multipli
    setTimeout(() => {
      phaseRef.current = 2;
    }, 4000);

    setTimeout(() => {
      phaseRef.current = 3;
    }, 5200);

    setTimeout(() => {
      phaseRef.current = 4;
      forceRender((n) => n + 1); // aggiorna bg/logo
    }, 6000);

    setTimeout(() => {
      cancelAnimationFrame(frame);
      onFinish();
    }, 8500);

    return () => cancelAnimationFrame(frame);
  }, []);

  const phase = phaseRef.current;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-colors duration-700 ${
        phase >= 4 ? "bg-white" : "bg-blue-900"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {phase >= 4 && (
        <motion.img
          src="/full-logo-sinersys.png"
          initial={{ opacity: 0, scale: 0.6, filter: "invert(0)" }} // bianco originale
          animate={{ opacity: 1, scale: 3, filter: "invert(1)" }} // diventa nero
          transition={{ duration: 4 }}
          className="absolute inset-0 m-auto w-44"
        />
      )}
    </div>
  );
}
