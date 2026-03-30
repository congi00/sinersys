"use client";

import { useState, useRef } from "react";
import { motion, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { Plus } from "@deemlol/next-icons";

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  progress: MotionValue<number>;
  // Passa il range di progress in cui la sezione è visibile
  // es. progressStart=3.5, progressEnd=5.0
  progressStart?: number;
  progressEnd?: number;
  items?: FaqItem[];
  title?: string;
  suptitle?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: "What exactly does Nfinite sell?",
    answer:
      "Nfinite develops and sells a high-performance paper-based material that replaces conventional plastic packaging. Our material is fully recyclable, compostable, and designed to meet the same mechanical requirements as traditional plastic films.",
  },
  {
    question: "Does Nfinite paper require lamination?",
    answer:
      "No lamination needed. Our proprietary coating technology provides barrier properties directly on the paper surface, eliminating the need for multi-layer lamination processes while maintaining excellent moisture and oxygen resistance.",
  },
  {
    question: "Will it run on existing packing lines?",
    answer:
      "Yes. Nfinite paper is engineered to be drop-in compatible with standard horizontal and vertical form-fill-seal machines, with minimal to no equipment modifications required.",
  },
  {
    question: "Does Nfinite paper contain metal?",
    answer:
      "No. Our material is entirely metal-free, making it fully compatible with microwave use and industrial composting streams, as well as standard paper recycling facilities.",
  },
  {
    question: "What's the aspect of Nfinite paper?",
    answer:
      "Nfinite paper looks and feels just like paper. Our coating is fully transparent, so it doesn't have a metallic appearance on the inside or outside.",
  },
];

export default function FaqSection({
  progress,
  progressStart = 6.2,
  progressEnd = 7.0,
  items = DEFAULT_ITEMS,
  title = "Here are the essentials about our product, how it works, and what makes it different.",
  suptitle = "FAQ",
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Animazione di entrata della sezione
  const sectionOpacity = useTransform(
    progress,
    [progressStart, progressStart + 0.1],
    [0, 1]
  );
  const sectionY = useTransform(
    progress,
    [progressStart, progressStart + 0.1],
    [60, 0]
  );

  // Animazione staggered per ogni item
  const getItemOpacity = (index: number) =>
    useTransform(
      progress,
      [
        progressStart + 0.1 + index * 0.07,
        progressStart + 0.2 + index * 0.07,
      ],
      [0, 1]
    );

  const getItemY = (index: number) =>
    useTransform(
      progress,
      [
        progressStart + 0.1 + index * 0.07,
        progressStart + 0.2 + index * 0.07,
      ],
      [32, 0]
    );

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <motion.section
      style={{ opacity: sectionOpacity, y: sectionY }}
      className="w-full mx-auto px-5 py-16"
    >
      {/* Header */}
      <motion.div className="mb-12 text-left sm:text-center">
        <span
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase
            border border-current rounded-full px-4 py-1.5 mb-6 font-light
            text-[#1c398e]"
        >
          {suptitle}
        </span>
        <h2
          className="font-bold leading-tight text-[#1c398e] text-[3.0rem] sm:text-[4.2rem] sm:text-center text-left"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
      </motion.div>

      {/* Items */}
      <div className="divide-y divide-[#1c398e]">
        {items.map((item, index) => {
          const itemOpacity = getItemOpacity(index);
          const itemY = getItemY(index);
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={index}
              style={{ opacity: itemOpacity, y: itemY }}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between py-5 text-left group"
                aria-expanded={isOpen}
              >
                <span
                  className="font-regular text-[#1c398e] pr-4
                    group-hover:text-[#1c398e] transition-colors duration-200 text-[1.55rem] sm:text-[1.8rem]"
                >
                  {item.question}
                </span>

                {/* Icona + che ruota a × */}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center
                    rounded-full border border-[#E5E7EB]
                    text-[#1c398e] group-hover:border-[#1c398e]
                    transition-colors duration-200"
                >
                  <Plus size={14} />
                </motion.span>
              </button>

              {/* Risposta con AnimatePresence per unmount pulito */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
                      opacity: { duration: 0.25, ease: "easeOut" },
                    }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-[1.15rem] sm:text-[1.4rem] font-light text-[#5c8baf] leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}