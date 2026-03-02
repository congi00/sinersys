"use client";

import {
  motion,
  useTransform,
  MotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";

type CardItem = {
  id: string;
  image: string;
  label: string;
};

type Props = {
  items: CardItem[];
  progress: MotionValue<number>;
  spreadStart?: number;
  spreadEnd?: number;
};

export default function ScatteredCards({
  items,
  progress,
  spreadStart = 2.2,
  spreadEnd = 3.4,
}: Props) {

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const spreadProgress = useTransform(
    progress,
    [spreadStart, (spreadStart + spreadEnd) / 2, spreadEnd],
    [0, 1, 0]
  );

  const smoothSpread = useSpring(spreadProgress, {
    stiffness: 120,
    damping: 20,
  });

  const layout = [
    { x: -120, y: -270, rotate: -42 },
    { x: 80, y: -260, rotate: 26 },
    { x: 50, y: -10, rotate: 40 },
    { x: -160, y: 170, rotate: -28 },
    { x: 160, y: 180, rotate: 10 },
  ];

  return (
    <div className="relative h-[700px] flex items-center justify-center">
      {items.slice(0, 5).map((item, index) => {

        const target = layout[index];

        const x = useTransform(smoothSpread, [0, 1], [0, target.x]);
        const y = useTransform(smoothSpread, [0, 1], [0, target.y]);
        const rotate = useTransform(
          smoothSpread,
          [0, 1],
          [0, target.rotate]
        );
        const scale = useTransform(smoothSpread, [0, 1], [0.92, 1]);

        return (
          <motion.div
            key={item.id}
            onClick={() => setActiveIndex(index)}
            style={{
              x,
              y,
              rotate,
              scale,
              zIndex:
                activeIndex === index
                  ? 50
                  : 10 - index,
            }}
            className={clsx(
              "absolute w-[300px] h-[420px]",
              "rounded-3xl overflow-hidden",
              "shadow-[0_30px_60px_rgba(0,0,0,0.25)]",
              " p-[10px] cursor-pointer",
              "bg-[#2f3651]/20",
              "after:absolute after:inset-0",
              "after:rounded-3xl",
              "after:border after:border-white/20",
              "after:pointer-events-none",
              "before:absolute before:inset-0",
              "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.15)_10%,rgba(255,255,255,0)_20%)]",
              "before:pointer-events-none",
              "backdrop-blur-xl backdrop-saturate-150",
              "border border-[#F4F7FA]/30",
              "shadow-[12px_12px_32px_rgba(0,0,0,0.18)]",
            )}
            whileTap={{ scale: 1.08 }}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white text-lg font-medium leading-snug">
                {item.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}