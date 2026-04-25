'use client'

import { useCallback, useLayoutEffect } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
import { introVideoScaleForProgress } from '@/config/introMotion'
import { scrollBannerConfig } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import { useLenis } from '@/components/providers/SmoothScrollProvider'
import { useIntroScroll } from '@/components/providers/IntroScrollProvider'
import { useIntroHeroMobileLayout } from '@/hooks/useCoarsePointer'

export default function ScrollNav() {
  const lenis = useLenis()
  const { scrollYProgress } = useIntroScroll()
  const cfg = scrollBannerConfig
  const heroMobileLayout = useIntroHeroMobileLayout()

  const vw = useMotionValue(0)
  useLayoutEffect(() => {
    const set = () => vw.set(window.innerWidth)
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [vw])

  /** Measured distance viewport top → scaled intro layer top (matches real layout, not dvh math). */
  const videoGapTop = useMotionValue(0)

  const measureVideoTop = useCallback(() => {
    const el = document.querySelector('[data-intro-video-layer]')
    if (!el || !(el instanceof HTMLElement)) return
    const top = el.getBoundingClientRect().top
    videoGapTop.set(Math.max(0, top))
  }, [videoGapTop])

  useLayoutEffect(() => {
    if (heroMobileLayout) {
      videoGapTop.set(0)
      return
    }
    measureVideoTop()
    window.addEventListener('resize', measureVideoTop)
    window.addEventListener('scroll', measureVideoTop, { passive: true })
    const onLenisScroll = () => measureVideoTop()
    lenis?.on('scroll', onLenisScroll)
    return () => {
      window.removeEventListener('resize', measureVideoTop)
      window.removeEventListener('scroll', measureVideoTop)
      lenis?.off('scroll', onLenisScroll)
    }
  }, [heroMobileLayout, lenis, measureVideoTop, videoGapTop])

  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (heroMobileLayout) return
    measureVideoTop()
  })

  const videoScale = useTransform(scrollYProgress, (p) =>
    heroMobileLayout ? 1 : introVideoScaleForProgress(p),
  )

  const sideInsetPx = useTransform([videoScale, vw], ([s, w]) => {
    const sc = typeof s === 'number' ? s : 1
    const width = typeof w === 'number' ? w : 0
    return Math.max(0, ((1 - sc) / 2) * width)
  })

  const navTopPx = useTransform(videoGapTop, (gap) => {
    const g = typeof gap === 'number' ? gap : 0
    const H = cfg.heightPx
    return Math.min(g / 2 - H / 2, g - H) + cfg.offsetDownPx
  })

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const rowClass = cn(
    'pointer-events-none relative mx-auto flex w-full',
    cfg.rowLayoutClassName,
    cfg.rowItemsAlignClassName,
    cfg.rowMaxWidthClassName,
    cfg.rowPaddingXClassName,
    cfg.rowPaddingYClassName,
  )

  const navButtons = (
    <>
      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          cfg.labelClassName,
          cfg.tylerExtraClassName,
          'pointer-events-auto min-w-0 shrink text-left transition-opacity hover:opacity-80',
        )}
        data-cursor="expand"
      >
        TYLER
      </button>

      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          cfg.labelClassName,
          cfg.yoonExtraClassName,
          'pointer-events-auto min-w-0 shrink text-right transition-opacity hover:opacity-80',
        )}
        data-cursor="expand"
      >
        YOON
      </button>
    </>
  )

  if (heroMobileLayout) {
    return (
      <nav
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] bg-transparent pt-[max(env(safe-area-inset-top),10px)]"
        suppressHydrationWarning
      >
        <div
          className={cn(
            rowClass,
            'mx-auto w-full max-w-[min(100%,40rem)]',
            'pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))]',
          )}
          style={{ height: cfg.heightPx }}
        >
          {navButtons}
        </div>
      </nav>
    )
  }

  return (
    <motion.nav
      suppressHydrationWarning
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] bg-transparent will-change-transform"
      style={{ y: navTopPx }}
    >
      <motion.div
        className={rowClass}
        style={{
          height: cfg.heightPx,
          paddingLeft: sideInsetPx,
          paddingRight: sideInsetPx,
        }}
      >
        {navButtons}
      </motion.div>
    </motion.nav>
  )
}
