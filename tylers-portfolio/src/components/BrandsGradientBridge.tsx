'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import { isChromiumBasedBrowser, isSafariBrowser } from '@/lib/browser'
import { useInViewActive } from '@/hooks/useInViewActive'

/* -----------------------------------------------------------------------
 *  EDIT THESE TO CHANGE THE GRADIENT COLORS.
 *  Order is inside → outside (core of the ellipse → outer halo).
 *  Use any valid CSS color (hex, rgb, rgba, hsl, named color).
 * ---------------------------------------------------------------------*/
const GRADIENT_COLORS = {
  /** Darkest color — sits at the center of the ellipse. */
  core: 'rgb(24, 28, 42)',
  /** Deep accent between core and mid. */
  inner: 'rgb(37, 40, 58)',
  /** Mid band color. */
  mid: 'rgb(35, 42, 62)',
  /** Brightest band just before the halo fades out. */
  outer: 'rgb(103, 118, 148)',
}

/** Halo tint — use for blend bands next to the bridge (stats / about). */
export const BRIDGE_BLEND_OUTER = GRADIENT_COLORS.outer

/** Background behind the radial ellipse (top color → bottom color). */
const BACKDROP_COLORS = {
  top: '#ebe6de',
  bottom: '#f7f4ef',
}

/** Softness of the glow — higher = more dreamy / blurred. */
const BLUR_PX = 44
const BLUR_PX_NARROW = 22
const BLUR_PX_SAFARI = 18
/** Large CSS `filter: blur()` radii are disproportionately expensive on Chromium compositors. */
const BLUR_PX_CHROMIUM = 26

/** Paint past the layout box so the field fades to black before content below. */
const ABOVE_BRANDS_VISUAL_BLEED_VH = 55

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
  const [mounted, setMounted] = useState(false)
  const [resolvedBlurPx, setResolvedBlurPx] = useState(blurPx)
  const isActive = useInViewActive(trackRef, { rootMargin: '260px 0px', threshold: 0 })
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  })

  // Keep the gradient base pinned in place while still allowing subtle "warp" growth.
  // Previously, animated `y` offsets made the whole ellipse appear to drift.
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 1.25, 1.42])
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0, 1, 1, 0])

  const c = { ...GRADIENT_COLORS, ...colors }
  const defaultBackdrop =
    placement === 'below-stats'
      ? { top: '#f7f4ef', bottom: '#ffffff' }
      : BACKDROP_COLORS
  const b = { ...defaultBackdrop, ...backdrop }

  const visualBleedVh =
    placement === 'above-brands' ? ABOVE_BRANDS_VISUAL_BLEED_VH : 0
  const paintHeight =
    visualBleedVh > 0
      ? `calc(${heightVh}vh + ${visualBleedVh}vh)`
      : `${heightVh}vh`
  const backdropGradient =
    placement === 'above-brands'
      ? `linear-gradient(to bottom, ${b.top} 0%, ${b.bottom} 100%)`
      : `linear-gradient(to bottom, ${b.top} 0%, ${b.bottom} 100%)`
  const radialY = placement === 'below-stats' ? '-20%' : '120%'
  const transformOrigin =
    placement === 'below-stats' ? '50% 0%' : '50% 100%'

  useEffect(() => {
    setMounted(true)
    const narrow = window.matchMedia('(max-width: 1024px)')
    const sync = () => {
      let next = blurPx
      if (isSafariBrowser()) next = Math.min(next, BLUR_PX_SAFARI)
      else if (isChromiumBasedBrowser()) next = Math.min(next, BLUR_PX_CHROMIUM)
      if (narrow.matches) next = Math.min(next, BLUR_PX_NARROW)
      setResolvedBlurPx(next)
    }
    sync()
    narrow.addEventListener('change', sync)
    return () => narrow.removeEventListener('change', sync)
  }, [blurPx])

  return (
    <section
      ref={trackRef}
      aria-hidden
      className="relative w-full overflow-visible"
      style={{ height: `${heightVh}vh` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 w-full overflow-visible"
        style={{ height: paintHeight }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: backdropGradient,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 w-full overflow-visible"
          style={{ height: `${heightVh}vh` }}
        >
          <motion.div
            className={`absolute inset-0 ${isActive ? 'will-change-transform' : ''}`}
            style={{
              background: `radial-gradient(ellipse 110vw 110% at 50% ${radialY}, ${c.core} 0%, ${c.inner} 18%, ${c.mid} 34%, ${c.outer} 56%, transparent 86%)`,
              scale: !mounted ? 0.45 : isActive ? scale : 1,
              opacity: !mounted ? 0 : isActive ? opacity : 0,
              transformOrigin,
              filter: `blur(${resolvedBlurPx}px)`,
            }}
          />
        </div>
      </div>
    </section>
  )
}
