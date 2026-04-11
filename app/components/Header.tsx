"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, MotionValue } from "framer-motion";

interface Props {
  headerTheme?: MotionValue<number>;
}

export default function Header({ headerTheme }: Props) {
  const [hidden, setHidden] = useState(false);
  const [isDark, setIsDark] = useState(false); // true = dark bg → white logo
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Hide/show on scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  // Subscribe to headerTheme MotionValue:
  // 0 = dark background → white logo
  // 1 = light background → blue logo
  useEffect(() => {
    if (!headerTheme) return;
    // Read initial value
    setIsDark(headerTheme.get() < 0.5);
    // Subscribe to changes
    const unsubscribe = headerTheme.on("change", (v) => {
      setIsDark(v < 0.5);
    });
    return unsubscribe;
  }, [headerTheme]);

  return (
    <motion.div
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-150%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background:          "rgba(255, 255, 255, 0.18)",
        backdropFilter:      "blur(32px) saturate(180%)",
        WebkitBackdropFilter:"blur(32px) saturate(180%)",
        border:              "1px solid rgba(255,255,255,0.22)",
        boxShadow:           "0 8px 40px rgba(12,24,70,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
      className="flex mt-2
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        min-w-[84vw]
        min-h-[70px]
        rounded-full
        items-center
        justify-center
        p-4
        backdrop-saturate-150
        rounded-3xl
        after:absolute after:inset-0
        after:rounded-3xl
        after:border after:border-[#F4F7FA]/20
        after:pointer-events-none
        shadow-[12px_12px_32px_rgba(0,0,0,0.18)]
        overflow-hidden
        "
    >
      {isDark && <motion.img
        src="/full-logo-sinersys.png"
        alt="Logo Sinersys"
        className="relative z-10 h-12 object-contain absolute"
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />}
      {!isDark && <motion.img
        src="/full-logo-sinersys_blu.png"
        alt="Logo Sinersys"
        className="relative z-10 h-12 object-contain absolute"
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />}
    </motion.div>
  );
}