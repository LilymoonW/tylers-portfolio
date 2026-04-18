'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* -----------------------------------------------------------------------
 *  EDIT THESE TO CHANGE THE GRADIENT COLORS.
 *  Order is inside → outside (core of the ellipse → outer halo).
 *  Use any valid CSS color (hex, rgb, rgba, hsl, named color).
 * ---------------------------------------------------------------------*/
const GRADIENT_COLORS = {
  /** Darkest color — sits at the center of the ellipse. */
  core: '#000000',
  /** Deep accent between core and mid. */
  inner: 'rgb(0, 0, 0)',
  /** Mid band color. */
  mid: 'rgb(0, 0, 0)',
  /** Brightest band just before the halo fades out. */
  outer: 'rgb(45, 52, 66)',
}

/** Halo tint — use for blend bands next to the bridge (stats / about). */
export const BRIDGE_BLEND_OUTER = GRADIENT_COLORS.outer

/** Background behind the radial ellipse (top color → bottom color). */
const BACKDROP_COLORS = {
  top: '#ebe6de',
  bottom: '#000000',
}

/** Softness of the glow — higher = more dreamy / blurred. */
const BLUR_PX = 44

type GradientColorOverrides = Partial<typeof GRADIENT_COLORS>
type BackdropOverrides = Partial<typeof BACKDROP_COLORS>

/** `above-brands`: paper → black, glow from bottom (intro into dark strip). `below-stats`: black → white, same glow flipped to the top — mirror of above-brands. */
export type BrandsGradientPlacement = 'above-brands' | 'below-stats'

type Props = {
  heightVh?: number
  colors?: GradientColorOverrides
  backdrop?: BackdropOverrides
  blurPx?: number
  placement?: BrandsGradientPlacement
}

export default function BrandsGradientBridge({
  heightVh = 180,
  colors,
  backdrop,
  blurPx = BLUR_PX,
  placement = 'above-brands',
}: Props) {
  const trackRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 1.6, 1.85])
  const yAbove = useTransform(scrollYProgress, [0, 0.5, 1], ['30%', '-4%', '-22%'])
  const yBelow = useTransform(scrollYProgress, [0, 0.5, 1], ['-30%', '4%', '22%'])
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0, 1, 1, 0])

  const c = { ...GRADIENT_COLORS, ...colors }
  const defaultBackdrop =
    placement === 'below-stats'
      ? { top: '#000000', bottom: '#ffffff' }
      : BACKDROP_COLORS
  const b = { ...defaultBackdrop, ...backdrop }

  const radialY = placement === 'below-stats' ? '-20%' : '120%'
  const transformOrigin =
    placement === 'below-stats' ? '50% 0%' : '50% 100%'
  const y = placement === 'below-stats' ? yBelow : yAbove

  return (
    <section
      ref={trackRef}
      aria-hidden
      className="relative w-full"
      style={{ height: `${heightVh}vh` }}
    >
      <div className="pointer-events-none sticky top-0 isolate h-[100svh] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${b.top} 0%, ${b.bottom} 100%)`,
          }}
        />
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            background: `radial-gradient(ellipse 110vw 110% at 50% ${radialY}, ${c.core} 0%, ${c.inner} 18%, ${c.mid} 34%, ${c.outer} 56%, transparent 86%)`,
            scale,
            y,
            opacity,
            transformOrigin,
            filter: `blur(${blurPx}px)`,
          }}
        />
        <div className="gradient-film-grain absolute inset-0 z-[1]" aria-hidden />
      </div>
    </section>
  )
}
