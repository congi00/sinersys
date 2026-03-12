"use client";

import { motion, useTransform, MotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "@deemlol/next-icons";
import clsx from "clsx";

type CardItem = {
  id: string;
  image: string;
  label: string;
  title?: string;
  subtitle?: string;
  link?: string;
};

type Props = {
  items: CardItem[];
  progress: MotionValue<number>;
  spreadStart?: number;
  spreadEnd?: number;
};

function ProjectCard({
  item,
  index,
  progress,
  spreadStart,
}: {
  item: CardItem;
  index: number;
  progress: MotionValue<number>;
  spreadStart: number;
}) {
  // Stagger: ogni carta ha un delay crescente
  const cardStart = spreadStart + index * 0.1;
  const cardEnd   = cardStart + 0.3;

  // Uscita: tutte le carte escono insieme leggermente dopo
  const exitStart = spreadStart + 0.9;
  const exitEnd   = spreadStart + 1.1;

  const rawOpacity = useTransform(
    progress,
    [cardStart, cardEnd, exitStart, exitEnd],
    [0, 1, 1, 0]
  );
  // Spring sull'opacità per un fade più morbido
  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 });

  // Entrata dal basso con clip — effetto "emerge"
  const rawY = useTransform(
    progress,
    [cardStart, cardEnd, exitStart, exitEnd],
    [60, 0, 0, -30]
  );
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });

  // Scala leggera all'entrata
  const rawScale = useTransform(
    progress,
    [cardStart, cardEnd],
    [0.92, 1]
  );
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="flex-shrink-0 w-[72vw] sm:w-auto flex flex-col group cursor-pointer"
    >
      {/* Foto */}
      <div className="relative w-full aspect-[3/4] rounded-l overflow-hidden">
        <Image
          src={item.image}
          alt={item.label}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 72vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      </div>

      {/* Testo sotto */}
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-[1.05rem] font-semibold text-[#f4f7fa] leading-tight">
            {item.title ?? item.label}
          </h3>
          {item.subtitle && (
            <p className="text-[0.85rem] text-[#5C8BAF] leading-snug whitespace-pre-line">
              {item.subtitle}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-0.5">
          <ArrowUpRight size={18} className="text-[#f4f7fa] opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ScatteredCards({
  items,
  progress,
  spreadStart = 2.3,
  spreadEnd = 3.2,
}: Props) {
  const cards = items.slice(0, 5);

  return (
    <div className="w-full py-10 px-6">
      <div
        className={clsx(
          // Mobile: scroll orizzontale
          "flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4",
          // Desktop: griglia centrata a larghezza fissa
          "sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:pb-0",
          "sm:max-w-5xl sm:mx-auto sm:gap-6",
          // Nascondi scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
      >
        {cards.map((item, index) => (
          <div key={item.id} className="snap-start">
            <ProjectCard
              item={item}
              index={index}
              progress={progress}
              spreadStart={spreadStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
}