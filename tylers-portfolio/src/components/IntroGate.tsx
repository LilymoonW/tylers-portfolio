'use client'

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  introAllWorkLabel,
  introContactLabel,
  introSideCaptionBelowVideoGapPx,
  introSideCaptionScroll,
  introVideoScaleForProgress,
} from '@/config/introMotion'
import { bannerTypeBase } from '@/config/scrollBanner'
import { useIntroScroll } from '@/components/providers/IntroScrollProvider'
import { useIntroHeroMobileLayout } from '@/hooks/useCoarsePointer'
import { useInViewActive } from '@/hooks/useInViewActive'
import { cn } from '@/lib/utils'

function captionSliceForProgress(
  p: number,
  reduceMotion: boolean,
  label: string,
) {
  const { start, end } = introSideCaptionScroll
  if (p <= start) return ''
  if (reduceMotion) return label
  if (p >= end) return label
  const u = (p - start) / (end - start)
  const n = Math.min(label.length, Math.ceil(u * label.length))
  return label.slice(0, n)
}

export default function IntroGate() {
  const { introSectionRef, scrollYProgress } = useIntroScroll()
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isActive = useInViewActive(introSectionRef, { rootMargin: '0px', threshold: 0 })
  /** Must be true on first paint on phones — delayed “after mount” left video inside `scale()` and broke WebKit autoplay. */
  const heroMobileLayout = useIntroHeroMobileLayout()
  /** Desktop only — on phones (Safari + Chrome), keep video out of a transformed ancestor (muted autoplay). */
  const heroScale = useTransform(scrollYProgress, introVideoScaleForProgress)
  const layoutScale = useTransform(scrollYProgress, (p) =>
    heroMobileLayout ? 1 : introVideoScaleForProgress(p),
  )

  const vw = useMotionValue(0)
  useLayoutEffect(() => {
    const set = () => vw.set(window.innerWidth)
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [vw])

  const sideInsetPx = useTransform([layoutScale, vw], ([s, w]) => {
    const sc = typeof s === 'number' ? s : 1
    const width = typeof w === 'number' ? w : 0
    return Math.max(0, ((1 - sc) / 2) * width)
  })

  const [reduceMotion, setReduceMotion] = useState(false)
  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const [allWorkText, setAllWorkText] = useState('')
  const [contactText, setContactText] = useState('')
  const syncSideCaptions = useCallback(
    (p: number) => {
      const nextAll = captionSliceForProgress(p, reduceMotion, introAllWorkLabel)
      const nextContact = captionSliceForProgress(p, reduceMotion, introContactLabel)
      setAllWorkText((prev) => (prev === nextAll ? prev : nextAll))
      setContactText((prev) => (prev === nextContact ? prev : nextContact))
    },
    [reduceMotion],
  )

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      syncSideCaptions(scrollYProgress.get())
    })
    return () => cancelAnimationFrame(id)
  }, [scrollYProgress, syncSideCaptions])

  const [sideCaptionsTopPx, setSideCaptionsTopPx] = useState<number | null>(null)
  const measureSideCaptionsTop = useCallback(() => {
    const sticky = stickyRef.current
    const video = document.querySelector('[data-intro-video-layer]')
    if (!sticky || !video || !(video instanceof HTMLElement)) return
    const stickyRect = sticky.getBoundingClientRect()
    const videoRect = video.getBoundingClientRect()
    const next = Math.round(
      videoRect.bottom - stickyRect.top + introSideCaptionBelowVideoGapPx,
    )
    setSideCaptionsTopPx((prev) =>
      prev != null && Math.abs(prev - next) < 1 ? prev : next,
    )
  }, [])

  useLayoutEffect(() => {
    if (heroMobileLayout) return
    measureSideCaptionsTop()
    window.addEventListener('resize', measureSideCaptionsTop)
    return () => {
      window.removeEventListener('resize', measureSideCaptionsTop)
    }
  }, [heroMobileLayout, measureSideCaptionsTop])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    syncSideCaptions(p)
    if (!heroMobileLayout) measureSideCaptionsTop()
  })

  useLayoutEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', 'true')
    v.setAttribute('muted', '')
  }, [heroMobileLayout])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    if (!isActive) {
      v.pause()
      return
    }

    const tryPlay = () => {
      v.muted = true
      void v.play().catch(() => {})
    }

    v.muted = true

    const onReady = () => tryPlay()
    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay()
    } else {
      v.addEventListener('loadeddata', onReady, { once: true })
      v.addEventListener('canplay', onReady, { once: true })
      return () => {
        v.removeEventListener('loadeddata', onReady)
        v.removeEventListener('canplay', onReady)
      }
    }
  }, [isActive, heroMobileLayout])

  const introVideoSrc =
    '/video/yoon-front-vid.mp4' + (heroMobileLayout ? '#t=0.001' : '')

  const introVideoLayerClass =
    'relative z-10 h-full w-full max-w-none overflow-hidden rounded-none bg-black shadow-none'
  const introVideoEl = (
    <video
      ref={videoRef}
      src={introVideoSrc}
      autoPlay
      muted
      loop
      playsInline
      preload={heroMobileLayout ? 'auto' : 'metadata'}
      controls={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
  const introVideoLayer = heroMobileLayout ? (
    <div data-intro-video-layer className={introVideoLayerClass}>
      {introVideoEl}
    </div>
  ) : (
    <motion.div data-intro-video-layer className={introVideoLayerClass} style={{ scale: heroScale }}>
      {introVideoEl}
    </motion.div>
  )

  const captionLinks = (
    <>
      <Link
        href="/portfolio"
        className={cn(
          bannerTypeBase,
          'pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl',
          'hover:underline underline-offset-4 decoration-1',
        )}
        data-cursor="expand"
        aria-label="Go to portfolio page"
      >
        <span aria-live="polite">{allWorkText}</span>
      </Link>
      <Link
        href="/contact"
        className={cn(
          bannerTypeBase,
          'pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl landscape:text-right',
          'hover:underline underline-offset-4 decoration-1',
        )}
        data-cursor="expand"
        aria-label="Go to contact page"
      >
        <span aria-live="polite">{contactText}</span>
      </Link>
    </>
  )

  return (
    <section
      ref={introSectionRef}
      className="relative z-20 h-[200vh]"
      suppressHydrationWarning
    >
      <div
        ref={stickyRef}
        data-intro-sticky
        className={cn(
          'sticky top-0 min-h-0 w-full overflow-hidden',
          heroMobileLayout
            ? 'flex h-[100dvh] flex-col'
            : 'h-[100dvh]',
        )}
      >
        {heroMobileLayout ? (
          <>
            <div className="relative z-10 min-h-0 w-full min-w-0 flex-1 basis-0">
              <div className="absolute inset-0 z-10 min-h-0">{introVideoLayer}</div>
            </div>
            <div
              className={cn(
                'relative z-20 flex shrink-0 flex-col items-start gap-1 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2',
                'pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]',
                'landscape:flex-row landscape:justify-between landscape:gap-4',
              )}
            >
              {captionLinks}
            </div>
          </>
        ) : (
          <>
            {introVideoLayer}
            <motion.div
              className={cn(
                'pointer-events-none absolute inset-x-0 z-20 flex flex-col items-start gap-0 will-change-transform',
                'landscape:flex-row landscape:justify-between landscape:gap-4',
              )}
              style={
                sideCaptionsTopPx == null
                  ? {
                      bottom: '2rem',
                      paddingLeft: sideInsetPx,
                      paddingRight: sideInsetPx,
                    }
                  : {
                      top: 0,
                      y: sideCaptionsTopPx,
                      paddingLeft: sideInsetPx,
                      paddingRight: sideInsetPx,
                    }
              }
            >
              {captionLinks}
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
