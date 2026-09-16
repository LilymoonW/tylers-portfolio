'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

import { useInViewActive } from '@/hooks/useInViewActive'

/* -----------------------------------------------------------------------
 *  EDIT THESE TO CHANGE THE GLOW COLORS.
 *  Order is inside → outside (core of the ellipse → outer halo).
 *  Use any valid CSS color (hex, rgb, rgba, hsl, named color).
 * ---------------------------------------------------------------------*/
const GLOW_COLORS = {
  /** Darkest color — sits at the center of the ellipse. */
  core: 'rgb(24, 28, 42)',
  /** Deep accent between core and mid. */
  inner: 'rgb(37, 40, 58)',
  /** Mid band color. */
  mid: 'rgb(35, 42, 62)',
  /** Brightest band just before the halo fades out. */
  outer: 'rgb(103, 118, 148)',
}

/**
 * Paper → black, as fractions of this element's own height. The page paper shows
 * through the transparent top; the dark column below starts where this ends, so
 * the horizon never moves when content is added further down the page.
 */
const FADE_TO_BLACK =
  'rgb(0 0 0 / 0) 0%, rgb(0 0 0 / 0.12) 22%, rgb(0 0 0 / 0.5) 42%, rgb(0 0 0 / 0.86) 62%, rgb(0 0 0 / 1) 80%, rgb(0 0 0 / 1) 100%'

/** How far the glow drifts toward the pointer (fraction of the glow element's size). Fine pointers only. */
const POINTER_DRIFT_X = 0.03
const POINTER_DRIFT_Y = 0.02

type Props = {
  /** Height of the paper → black band. */
  heightVh?: number
}

/**
 * Seam between the paper intro and the dark column: one element, one gradient, one glow.
 *
 * The glow is a plain radial gradient (no `filter: blur`): it is wider than the viewport
 * and fades all the way to its edge, so no outline shows at any scale, and the only
 * per-frame work is a transform + opacity on a static texture. Scroll drives scale and
 * opacity; on desktop the pointer nudges it through a spring.
 */
export default function BrandsGradientBridge({ heightVh = 85 }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const isActive = useInViewActive(ref, { rootMargin: '260px 0px', threshold: 0 })
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.25, 1.45])
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0, 1, 1, 0])

  // Pointer position normalised to -1..1, eased through a spring so the glow lags the cursor.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 40, damping: 18, mass: 0.6 })
  const springY = useSpring(pointerY, { stiffness: 40, damping: 18, mass: 0.6 })
  const x = useTransform(springX, (v) => `${v * POINTER_DRIFT_X * 100}%`)
  const y = useTransform(springY, (v) => `${v * POINTER_DRIFT_Y * 100}%`)

  useEffect(() => {
    if (!isActive || reduceMotion) {
      pointerX.set(0)
      pointerY.set(0)
      return
    }
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const onMove = (e: PointerEvent) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [isActive, reduceMotion, pointerX, pointerY])

  const c = GLOW_COLORS

  return (
    <section
      ref={ref}
      aria-hidden
      /* Clip sideways only: the glow may spill up over the paper, never widen the page. */
      className="pointer-events-none relative w-full overflow-x-clip"
      style={{ height: `${heightVh}vh` }}
    >
      {/*
        The glow element is twice the bridge's size (one bridge-width past each side, one
        bridge-height above) and its ellipse fades to transparent well inside that box, so
        the element's own edges never show when it is scaled down. Center sits just below
        the bridge so the darkest core stays off-screen and only the halo is visible.
        The element stops 10% short of the bridge's bottom, inside the zone the fade has
        already painted solid black, so its composited edge can never peek out as a line
        (WebKit snaps transformed layers to device pixels differently from plain paint).
      */}
      <motion.div
        className="absolute"
        style={{
          left: '-50%',
          right: '-50%',
          top: '-100%',
          bottom: '10%',
          background: `radial-gradient(ellipse 55% 60% at 50% 125%, ${c.core} 0%, ${c.inner} 16%, ${c.mid} 32%, ${c.outer} 52%, transparent 100%)`,
          scale,
          opacity,
          x,
          y,
          transformOrigin: '50% 100%',
          willChange: isActive ? 'transform, opacity' : undefined,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${FADE_TO_BLACK})` }}
      />
    </section>
  )
}
