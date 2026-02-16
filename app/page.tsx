'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Lenis, { LenisOptions } from '@studio-freight/lenis'
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";
import HomePage from './containers/HomePage';


export default function Home() {
  const lenisRef = useRef<Lenis | null>(null)
  const progressMotion = useMotionValue(0)
  const scrollYMotion = useMotionValue(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.1,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      const progress = Math.min(e.scroll / e.limit, 1)
      progressMotion.set(progress)
      scrollYMotion.set(e.scroll)
    })

    return () => {
      lenis.destroy()
    }
  }, [progressMotion])

  const smooth = useSpring(progressMotion, {
    stiffness: 200,
    damping: 20,
  })

  // Animazione padding wrapper
  const wrapperPadding = useTransform(smooth, [0, 1], [16, 0])

  return (
    <div 
      className="bg-[#F4F7FA]">
      <main className="flex w-full flex flex-col">
        <Header />
        <motion.div
          style={{ padding: wrapperPadding }}
          className="flex flex-1 items-center justify-center"
        >
          <HomePage progressMotion={smooth} scrollYMotion={scrollYMotion} />
        </motion.div>
        <MenuButton />
      </main>
    </div>
  );
}
