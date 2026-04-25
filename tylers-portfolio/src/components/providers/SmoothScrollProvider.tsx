'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

import { isSafariBrowser } from '@/lib/browser'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    // Lenis + WebKit scroll compositing is a common source of jank on Safari; use native scroll.
    if (isSafariBrowser()) return

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.35,
    })

    const publishId = requestAnimationFrame(() => setLenis(instance))

    let rafLoopId = 0
    function raf(time: number) {
      instance.raf(time)
      rafLoopId = requestAnimationFrame(raf)
    }
    rafLoopId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(publishId)
      cancelAnimationFrame(rafLoopId)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
