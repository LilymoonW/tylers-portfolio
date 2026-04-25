'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'

/**
 * `data-cursor="system"` — use the OS cursor and hide the custom ring (e.g. over cross-origin
 * iframes, where the prior mouseenter/leave + ring fights the embed’s own pointer).
 * Resolved via `elementFromPoint` on `mousemove` so the iframe node is hit correctly.
 */
export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [showRing, setShowRing] = useState(true)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'expand'>('default')
  const lastSystemRef = useRef<boolean | null>(null)
  const lastExpandRef = useRef<boolean | null>(null)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const ringSize = cursorVariant === 'default' ? 20 : 30
  const holeSize = ringSize * 0.5

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const showId = window.requestAnimationFrame(() => setIsVisible(true))
    document.documentElement.style.cursor = 'none'

    /** `elementFromPoint` + DOM walks are costly; one hit-test per frame is enough for cursor mode. */
    let hitRaf = 0
    let hitScheduled = false
    let pendingX = 0
    let pendingY = 0

    const flushHitTest = () => {
      hitScheduled = false
      hitRaf = 0
      const x = pendingX
      const y = pendingY

      const el = document.elementFromPoint(x, y)
      if (!el) {
        if (lastSystemRef.current !== false) {
          lastSystemRef.current = false
          setShowRing(true)
        }
        if (lastExpandRef.current !== false) {
          lastExpandRef.current = false
          setCursorVariant('default')
        }
        document.documentElement.style.cursor = 'none'
        return
      }

      const hit = el.closest('[data-cursor]')
      const attr = hit?.getAttribute('data-cursor') ?? null
      const useSystem = attr === 'system'
      const expand =
        !useSystem && (attr === 'expand' || attr === 'play')

      document.documentElement.style.cursor = useSystem ? 'auto' : 'none'

      if (lastSystemRef.current !== useSystem) {
        lastSystemRef.current = useSystem
        setShowRing(!useSystem)
      }
      if (lastExpandRef.current !== expand) {
        lastExpandRef.current = expand
        setCursorVariant(expand ? 'expand' : 'default')
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      pendingX = e.clientX
      pendingY = e.clientY
      if (!hitScheduled) {
        hitScheduled = true
        hitRaf = window.requestAnimationFrame(flushHitTest)
      }
    }

    document.addEventListener('mousemove', onMouseMove)

    return () => {
      window.cancelAnimationFrame(showId)
      if (hitRaf) window.cancelAnimationFrame(hitRaf)
      document.removeEventListener('mousemove', onMouseMove)
      lastSystemRef.current = null
      lastExpandRef.current = null
      document.documentElement.style.cursor = ''
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  if (!showRing) return null

  return (
    <>
      {/* Solid white circle cursor with inner hole */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none rounded-full overflow-hidden mix-blend-difference flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'rgba(255,255,255,1)',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
        }}
        transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute rounded-full bg-black/95"
          style={{
            width: holeSize,
            height: holeSize,
            translateX: '-50%',
            translateY: '-50%',
            left: '50%',
            top: '50%',
          }}
        />
      </motion.div>
    </>
  )
}
