'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useScrollLock } from '@/hooks/useScrollLock'

export default function IntroGate() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [locked, setLocked] = useState(true)

  // Lock scroll for 2 seconds on load -- pure fullscreen, nothing else visible
  useScrollLock(locked)

  useEffect(() => {
    const timer = setTimeout(() => setLocked(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Video starts fullscreen, shrinks as you scroll, stays centered, keeps playing
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.3])
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], [0, 12, 20])

  return (
    <>
      {/* Fullscreen overlay that covers ALL UI (grain, cursor, nav) during lock */}
      <AnimatePresence>
        {locked && (
          <motion.div
            className="fixed inset-0 z-[99999] bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <video
              src="/video/intro-placeholder.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll-driven shrinking video */}
      <section ref={containerRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            className="relative overflow-hidden"
            style={{
              width: '100vw',
              height: '100vh',
              scale,
              borderRadius,
            }}
          >
            <video
              src="/video/intro-placeholder.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>
    </>
  )
}
