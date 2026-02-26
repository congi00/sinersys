"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  Variants,
} from "framer-motion";
import Image from "next/image";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 🌊 PARALLAX
  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden pt-28 pb-12 text-white"
    >
      {/* 🌊 PARALLAX BACKGROUND */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-gradient-to-br from-[#1c398e] to-[#4e67b1]"
      />

      {/* ✨ GLOW LIGHT LAYER */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-400 blur-[180px]"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative max-w-6xl mx-auto px-6"
      >
        {/* LOGO */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/full-logo-sinersys.png"
              alt="Sinersys Logo"
              width={260}
              height={80}
              priority
            />
          </div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-semibold tracking-widest"
          >
            NEW ENERGY FRONTIERS
          </motion.h2>
        </motion.div>

        {/* CARD */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          <div className="grid md:grid-cols-3 gap-12">
            {/* QUICK LINKS */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              {["Homepage", "APWEC", "Chi Siamo", "Certificazioni", "FAQ"].map(
                (item, i) => (
                  <GlowLink key={i}>{item}</GlowLink>
                )
              )}
            </div>

            {/* OTHER LINKS */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Other Links</h3>
              {["Galleria", "Codice Etico"].map((item, i) => (
                <GlowLink key={i}>{item}</GlowLink>
              ))}
            </div>

            {/* CONTATTI */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Contattaci</h3>
              <GlowLink>info@sinersys.it</GlowLink>
              <GlowLink>Via della Zecca, 1 - Bologna</GlowLink>
              <GlowLink>+39 346 756 3723</GlowLink>
              <GlowLink>www.sinersys.it</GlowLink>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM BAR */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mt-16 text-sm opacity-80 border-t border-white/20 pt-6"
        >
          <p>Sinersys - Motor Union Italia s.r.l.</p>
          <div className="flex gap-6">
            <GlowLink>Privacy</GlowLink>
            <GlowLink>Terms</GlowLink>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

function GlowLink({ children }: { children: React.ReactNode }) {
  return (
    <motion.a
      href="#"
      className="block relative text-white/80 mb-2 transition-colors"
      whileHover={{
        color: "#ffffff",
        textShadow:
          "0px 0px 8px rgba(255,255,255,0.8), 0px 0px 20px rgba(99,102,241,0.6)",
      }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.a>
  );
}