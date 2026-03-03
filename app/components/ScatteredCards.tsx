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

// Angoli finali del ventaglio — distribuiti simmetricamente
// La carta centrale (index 2) rimane diritta, le laterali ruotano
const FAN_ANGLES = [-38, -19, 0, 19, 38];

// Piccolo offset verticale per le carte esterne — effetto arco
const FAN_Y_OFFSET = [18, 6, 0, 6, 18];

function Card({
  item,
  index,
  smoothSpread,
  isActive,
  onClick,
  total,
}: {
  item: CardItem;
  index: number;
  smoothSpread: MotionValue<number>;
  isActive: boolean;
  onClick: () => void;
  total: number;
}) {
  const targetAngle   = FAN_ANGLES[index] ?? 0;
  const targetYOffset = FAN_Y_OFFSET[index] ?? 0;

  // Ruota attorno al pivot in basso al centro (transformOrigin: bottom center)
  const rotate  = useTransform(smoothSpread, [0, 1], [0, targetAngle]);
  const y       = useTransform(smoothSpread, [0, 1], [0, targetYOffset]);

  // Le carte sotto la centrale vengono leggermente abbassate per dare profondità
  const baseZIndex = total - Math.abs(index - Math.floor(total / 2));

  return (
    <motion.div
      onClick={onClick}
      style={{
        rotate,
        y,
        // Pivot in basso al centro — crea l'effetto mazzo che si apre
        originX: "50%",
        originY: "100%",
        zIndex: isActive ? 50 : baseZIndex,
        position: "absolute",
        bottom: 0,
        left: "50%",
        marginLeft: -95, // metà della larghezza (190/2)
      }}
      className={clsx(
        "w-[190px] h-[265px]",
        "rounded-2xl overflow-hidden",
        "cursor-pointer",
        "shadow-[0_6px_24px_rgba(0,0,0,0.28),0_20px_60px_rgba(0,0,0,0.22)]",
        "ring-1 ring-white/15",
      )}
      whileHover={{
        scale: 1.06,
        zIndex: 40,
        transition: { type: "spring", stiffness: 320, damping: 26 },
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={item.image}
          alt={item.label}
          fill
          className="object-cover"
          sizes="190px"
        />

        {/* Vignetta fotografica */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        {/* Riflesso topside */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />

        {/* Bordo interno */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
          <p className="text-white/75 text-[0.65rem] font-semibold tracking-[0.14em] uppercase leading-none">
            {item.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScatteredCards({
  items,
  progress,
  spreadStart = 2.3,
  spreadEnd = 3.0,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const spreadProgress = useTransform(progress, [spreadStart, spreadEnd], [0, 1]);
  const smoothSpread = useSpring(spreadProgress, {
    stiffness: 70,
    damping: 24,
  });

  const uiOpacity = useTransform(progress, [spreadStart + 0.1, spreadStart + 0.4], [0, 1]);

  const cards = items.slice(0, 5);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pb-20 select-none overflow-hidden">
      {/* Stack con pivot in basso */}
      <div
        className="relative flex items-end justify-center"
        style={{ width: "100%", height: 320 }}
      >
        {cards.map((item, index) => (
          <Card
            key={item.id}
            item={item}
            index={index}
            smoothSpread={smoothSpread}
            isActive={activeIndex === index}
            onClick={() => setActiveIndex(i => i === index ? null : index)}
            total={cards.length}
          />
        ))}
      </div>
    </div>
  );
}