"use client";

import { useRef } from "react";
import { motion, useTransform, MotionValue, useInView } from "framer-motion";
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
  spreadEnd,
}: {
  item: CardItem;
  index: number;
  progress: MotionValue<number>;
  spreadStart: number;
  spreadEnd: number;
}) {
  // Ogni carta entra con un leggero delay basato sull'indice
  const cardStart = spreadStart + index * 0.08;
  const cardEnd = cardStart + 0.25;

  const opacity = useTransform(progress, [cardStart, cardEnd], [0, 1]);
  const y = useTransform(progress, [cardStart, cardEnd], [40, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="flex-shrink-0 w-[72vw] sm:w-[440px] flex flex-col group cursor-pointer"
    >
      {/* Foto */}
      <div className="relative w-full aspect-[3/4] rounded-l overflow-hidden">
        <Image
          src={item.image}
          alt={item.label}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 72vw, 340px"
        />
        {/* Overlay sottile al hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Testo sotto */}
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-[1.05rem] font-semibold text-[#f4f7fa] leading-tight">
            {item.title ?? item.label}
          </h3>
          {item.subtitle && (
            <p className="text-[0.85rem] text-[#5C8BAF] leading-snug">
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
    <div className="w-full flex flex-col gap-8 py-10 px-6">
      {/* Scrollabile orizzontalmente su mobile, griglia su desktop */}
      <div
        className={clsx(
          // Mobile: scroll orizzontale
          "flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4",
          // Desktop: griglia fissa
          "sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:pb-0",
          // Nascondi scrollbar visivamente
          "scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
      >
        {cards.map((item, index) => (
          <div key={item.id} className="snap-start">
            <ProjectCard
              item={item}
              index={index}
              progress={progress}
              spreadStart={spreadStart}
              spreadEnd={spreadEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
  In page.tsx aggiorna gli items così:

  items={[
    { id: "1", image: "/images/1.jpg", label: "1", title: "Superhead", subtitle: "Premium mountain stay booking platform\n\n360 Brand Development and Product Development" },
    { id: "2", image: "/images/2.jpg", label: "2", title: "Pellegrin",  subtitle: "Jewelry house in Provence\n\nDevelopment strategy and digitalization" },
    { id: "3", image: "/images/3.jpg", label: "3", title: "Lumara Vision", subtitle: "Solution for digitizing maritime oil and gas operations\n\nUX and app development" },
    { id: "4", image: "/images/4.jpg", label: "4", title: "Progetto 4", subtitle: "Descrizione" },
    { id: "5", image: "/images/5.jpg", label: "5", title: "Progetto 5", subtitle: "Descrizione" },
  ]}
*/