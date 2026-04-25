'use client'

import { useScroll, useTransform, useMotionValue, useMotionValueEvent } from 'framer-motion'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const LABEL = 'AS SEEN ON'
const CHAR_COUNT = LABEL.length

/**
 * Scroll progress 0 = section entering, 1 = exiting toward top.
 * Scrolling down from above: full line from the start of the pass, then erase by ~0.5 (eyes centered),
 * hold empty, type in, full again for the top exit.
 */
const SCROLL_ERASE_START = 0.28
const SCROLL_ERASE_END = 0.5
/** Longer empty hold after erase (before type-in returns). */
const SCROLL_TYPE_START = 0.62
const SCROLL_TYPE_END = 0.78

function lengthFromScrollProgress(t: number): number {
  if (t < SCROLL_ERASE_START) return CHAR_COUNT
  if (t <= SCROLL_ERASE_END) {
    const span = SCROLL_ERASE_END - SCROLL_ERASE_START
    const u = span > 0 ? (t - SCROLL_ERASE_START) / span : 1
    return CHAR_COUNT * (1 - u)
  }
  if (t < SCROLL_TYPE_START) return 0
  if (t <= SCROLL_TYPE_END) {
    const span = SCROLL_TYPE_END - SCROLL_TYPE_START
    const u = span > 0 ? (t - SCROLL_TYPE_START) / span : 1
    return CHAR_COUNT * u
  }
  return CHAR_COUNT
}

const glyphStack = cn(
  'font-display font-light italic uppercase tracking-tight',
  'col-start-1 row-start-1 block text-center leading-[0.9] tracking-[-0.03em] whitespace-nowrap',
)

type AsSeenOnEyesOverlayProps = {
  className?: string
  /** Section whose scroll through the viewport drives backspace / typewriter. */
  scrollTargetRef: RefObject<HTMLElement | null>
  /** Larger headline over the eyes on portrait / vertical viewports. */
  portraitLayout?: boolean
}

/**
 * “AS SEEN ON” over the eyes: scroll down → letters erase end-first (backspace);
 * further scroll (section exiting) → letters return left-to-right (typewriter).
 */
export default function AsSeenOnEyesOverlay({
  className,
  scrollTargetRef,
  portraitLayout = false,
}: AsSeenOnEyesOverlayProps) {
  const reduced = useMotionValue(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => reduced.set(mq.matches ? 1 : 0)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [reduced])

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef,
    offset: ['start end', 'end start'],
  })

  const floatLen = useTransform([scrollYProgress, reduced], ([p, r]) => {
    if (r) return CHAR_COUNT
    const t = typeof p === 'number' ? p : 0
    return lengthFromScrollProgress(t)
  })

  const visibleCount = useTransform(floatLen, (v) =>
    Math.min(CHAR_COUNT, Math.max(0, Math.round(v))),
  )

  const [len, setLen] = useState(CHAR_COUNT)

  useMotionValueEvent(visibleCount, 'change', (v) => {
    setLen(v)
  })

  const slice = LABEL.slice(0, len)
  const fontSize = portraitLayout
    ? 'clamp(1.45rem, 7.5vw, 5rem)'
    : 'clamp(1.05rem, 5.25vw, 3.25rem)'
  const padding = '0.18em 0.32em'

  return (
    <div
      className={cn(
        'pointer-events-none flex w-full items-center justify-center',
        className,
      )}
    >
      <span className="sr-only">As seen on</span>
      <div
        className="relative inline-grid w-max shrink-0 place-items-center overflow-visible"
        style={{ transform: 'translate(-0.065em, -0.02em)' }}
      >
        <h2
          aria-hidden
          className={cn(glyphStack, 'relative z-[1] min-h-[1lh] text-white')}
          style={{ fontSize, padding }}
        >
          {slice.length === 0 ? '\u200b' : slice}
        </h2>
      </div>
    </div>
  )
}
