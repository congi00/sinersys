'use client'

import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'
import Header from "./components/Header";
import MenuButton from "./components/MenuButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      if (!containerRef.current) return

      const maxScroll = 120 // px di scroll per arrivare a p-0
      const clamped = Math.min(scroll, maxScroll)

      // p-4 = 16px → 0px
      const padding = 16 * (1 - clamped / maxScroll)

      containerRef.current.style.padding = `${padding}px`
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="flex min-h-[100dvh] items-center justify-center p-4 bg-[#F4F7FA] flex-column">
      <main className="flex min-h-[96dvh] w-full max-w-3xl flex-col items-center justify-between bg-[#004D8A] sm:items-start rounded-3xl">
        <Header />
        <MenuButton />
      </main>
    </div>
  );
}
