"use client";

import { ReactElement, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import clsx from "clsx";

interface Props {
  link: string;
  text: string;
  icon: ReactElement;
  top: string;
  color: MotionValue;
}

export default function LinkButton({ link, text, icon, top, color }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springX = useSpring(mx, { stiffness: 120, damping: 12 });
  const springY = useSpring(my, { stiffness: 120, damping: 12 });

  const stretchX = useTransform(springX, [-50, 50], [0.95, 1.05]);
  const stretchY = useTransform(springY, [-50, 50], [1.05, 0.95]);

  const blobRadius = useTransform(
    springX,
    [-50, 0, 50],
    [
      "60% 40% 55% 45% / 60% 45% 55% 40%",
      "50% 50% 50% 50% / 50% 50% 50% 50%",
      "40% 60% 45% 55% / 45% 55% 40% 60%",
    ]
  );

  const [popping, setPopping] = useState(false);

  function triggerPop() {
    if (popping) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 600);
  }

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    mx.set(x * 0.4);
    my.set(y * 0.4);
  }

  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <Link href={link} className="inline-flex mt-8">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onClick={triggerPop}
        onFocus={triggerPop}
        whileTap={{ scale: 0.94 }}
        style={{
          scaleX: stretchX,
          scaleY: stretchY,
          top: top,
          color: color,
        }}
        whileHover="hover"
        initial="rest"
        animate="rest"
        variants={{
          rest: { paddingRight: "5rem" },
          hover: { paddingRight: "6.5rem" },
        }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={clsx(
          "relative flex items-center",
          "h-16 pl-8 pr-20",
          "rounded-full",
          "backdrop-blur-2xl",
          "bg-white/10",
          "border border-white/20",
          "shadow-[0_8px_40px_rgba(0,0,0,0.25)]",
          "text-white text-xl sm:text-2xl font-medium",
          "overflow-hidden"
        )}
      >
        {text}

        <AnimatePresence>
          {!popping && (
            <motion.div
              key="bubble"
              style={{ borderRadius: blobRadius }}
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              exit={{
                scale: [1, 1.35, 1.8],
                opacity: [1, 1, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(6px)"],
                x: [0, 6, 12],
              }}
              transition={{
                duration: 0.55,
                times: [0, 0.4, 1],
                ease: "easeOut",
              }}
              className={clsx(
                "absolute right-2",
                "w-12 h-12",
                "flex items-center justify-center",
                "backdrop-blur-md",
                "bg-white/20 border border-white/30"
              )}
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}