'use client'

import { bannerTypeBase } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'expand' | 'play'>('default')
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const ringX = useSpring(cursorX, springConfig)
  const ringY = useSpring(cursorY, springConfig)

  const ringSize = cursorVariant === 'default' ? 20 : 30
  const holeSize = ringSize * 0.5
  const maxHoleOffset = ringSize * 0.16

  // Inner hole leads a bit based on cursor-vs-ring delta, but remains clamped.
  const holeOffsetX = useTransform([cursorX, ringX, cursorY, ringY], (values) => {
    const [cx, rx, cy, ry] = values as [number, number, number, number]
    let dx = (cx - rx) * 0.35
    let dy = (cy - ry) * 0.35
    const magnitude = Math.hypot(dx, dy)
    if (magnitude > maxHoleOffset && magnitude > 0) {
      const scale = maxHoleOffset / magnitude
      dx *= scale
      dy *= scale
    }
    return dx
  })

  const holeOffsetY = useTransform([cursorX, ringX, cursorY, ringY], (values) => {
    const [cx, rx, cy, ry] = values as [number, number, number, number]
    let dx = (cx - rx) * 0.35
    let dy = (cy - ry) * 0.35
    const magnitude = Math.hypot(dx, dy)
    if (magnitude > maxHoleOffset && magnitude > 0) {
      const scale = maxHoleOffset / magnitude
      dx *= scale
      dy *= scale
    }
    return dy
  })

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
      const { target } = e
      if (!(target instanceof Element)) return
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

  return (
    <>
      {/* Solid white circle cursor with inner hole */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none rounded-full overflow-hidden mix-blend-difference flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'rgba(255,255,255,1)',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="absolute rounded-full bg-black/95"
          style={{
            width: holeSize,
            height: holeSize,
            x: holeOffsetX,
            y: holeOffsetY,
            translateX: '-50%',
            translateY: '-50%',
            left: '50%',
            top: '50%',
          }}
        />
        {cursorVariant === 'play' && (
          <span className={cn(bannerTypeBase, 'relative z-10 text-[10px] leading-none text-white')}>
            Play
          </span>
        )}
      </motion.div>
    </>
  )
}
