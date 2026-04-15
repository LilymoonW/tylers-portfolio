'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'expand' | 'play'>('default')
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const ringX = useSpring(cursorX, springConfig)
  const ringY = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    setIsVisible(true)
    document.documentElement.style.cursor = 'none'

    const onMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const onMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement
      const variant = target.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (variant === 'expand' || variant === 'play') {
        setCursorVariant(variant)
      }
    }

    const onMouseLeave = () => {
      setCursorVariant('default')
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseenter', onMouseEnter, true)
    document.addEventListener('mouseleave', onMouseLeave, true)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseenter', onMouseEnter, true)
      document.removeEventListener('mouseleave', onMouseLeave, true)
      document.documentElement.style.cursor = ''
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  const ringSize = cursorVariant === 'default' ? 36 : 64

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none rounded-full bg-white mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          width: 8,
          height: 8,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none rounded-full border border-white/50 mix-blend-difference flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {cursorVariant === 'play' && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            Play
          </span>
        )}
      </motion.div>
    </>
  )
}
