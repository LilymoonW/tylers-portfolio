'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorGradient() {
  const cursorX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
  const cursorY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0)

  // Slow, soft spring for ambient feel
  const springConfig = { damping: 30, stiffness: 30, mass: 2 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Initialize to center
    cursorX.set(window.innerWidth / 2)
    cursorY.set(window.innerHeight / 2)

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Primary warm glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '80vmax',
          height: '80vmax',
          background:
            'radial-gradient(circle, rgba(255,102,0,0.2) 0%, rgba(255,0,0,0.08) 35%, rgba(45,0,80,0.12) 55%, transparent 70%)',
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Secondary cool accent (offset up-left for depth) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '60vmax',
          height: '60vmax',
          background:
            'radial-gradient(circle, rgba(0,102,255,0.1) 0%, rgba(0,170,221,0.06) 40%, transparent 65%)',
          x,
          y,
          translateX: '-70%',
          translateY: '-70%',
        }}
      />
    </div>
  )
}
