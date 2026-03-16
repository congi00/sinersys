"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, MotionValue } from "framer-motion";

interface Props {
  headerTheme?: MotionValue<number>;
}

export default function Header({headerTheme} : Props) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    if (latest > previous && latest > 80) {
      // Scrollando verso il basso
      setHidden(true);
    } else {
      // Scrollando verso l'alto
      setHidden(false);
    }

    lastScrollY.current = latest;
  });

  return (
    <motion.div
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-150%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex mt-2
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        min-w-[84vw] 
        min-h-[70px] 
        rounded-full 
        items-center 
        justify-center 
        p-4 
        bg-[#F4F7FA]/20
        backdrop-blur-xl
        backdrop-saturate-150
        rounded-3xl
        border border-[#F4F7FA]/30
        after:absolute after:inset-0
        after:rounded-3xl
        after:border after:border-[#F4F7FA]/20
        after:pointer-events-none
        shadow-[12px_12px_32px_rgba(0,0,0,0.18)]
        overflow-hidden
        before:absolute before:inset-0
        before:bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.15)_10%,rgba(255,255,255,0)_20%)]
        before:pointer-events-none"
    >
      <img
        src={(headerTheme == new MotionValue(0) || undefined ) ? "/logoblu.png" : "/logobianco.png"}
        alt="Logo Sinersys"
        className="relative z-10 h-12 object-contain"
      />
    </motion.div>
  );
}