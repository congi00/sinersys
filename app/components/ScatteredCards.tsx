"use client";

import {
  motion,
  useTransform,
  MotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import clsx from "clsx";

type CardItem = {
  id: string;
  image: string;
  label: string;
};

type Props = {
  items: CardItem[]; // deve essere 5
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

  // curva 0 → 1 → 0
  const spreadProgress = useTransform(
    progress,
    [spreadStart, (spreadStart + spreadEnd) / 2, spreadEnd],
    [0, 1, 0]
  );

  const smoothSpread = useSpring(spreadProgress, {
    stiffness: 120,
    damping: 20,
  });

  // Layout fisso per 5 card
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
            style={{
              x,
              y,
              rotate,
              scale,
              zIndex: 10 - index,
            }}
            className={clsx(
              "absolute w-[300px] h-[420px]",
              "rounded-3xl overflow-hidden",
              "shadow-[0_30px_60px_rgba(0,0,0,0.25)]",
              "bg-white p-3"
            )}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="object-cover"
              />

              {/* overlay sfumatura */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* label */}
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