'use client'

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
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
import { useLenis } from '@/components/providers/SmoothScrollProvider'
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
  const lenis = useLenis()
  const { introSectionRef, scrollYProgress } = useIntroScroll()
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isActive = useInViewActive(introSectionRef, { rootMargin: '0px', threshold: 0 })
  const scale = useTransform(scrollYProgress, introVideoScaleForProgress)

  const vw = useMotionValue(0)
  useLayoutEffect(() => {
    const set = () => vw.set(window.innerWidth)
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [vw])

  const sideInsetPx = useTransform([scale, vw], ([s, w]) => {
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
      setAllWorkText(captionSliceForProgress(p, reduceMotion, introAllWorkLabel))
      setContactText(
        captionSliceForProgress(p, reduceMotion, introContactLabel),
      )
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
    setSideCaptionsTopPx(
      videoRect.bottom - stickyRect.top + introSideCaptionBelowVideoGapPx,
    )
  }, [])

  useLayoutEffect(() => {
    const rafMeasure = () => requestAnimationFrame(measureSideCaptionsTop)
    rafMeasure()
    window.addEventListener('resize', rafMeasure)
    window.addEventListener('scroll', rafMeasure, { passive: true })
    const onLenisScroll = () => rafMeasure()
    lenis?.on('scroll', onLenisScroll)
    return () => {
      window.removeEventListener('resize', rafMeasure)
      window.removeEventListener('scroll', rafMeasure)
      lenis?.off('scroll', onLenisScroll)
    }
  }, [lenis, measureSideCaptionsTop])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    syncSideCaptions(p)
    requestAnimationFrame(measureSideCaptionsTop)
  })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      void v.play().catch(() => {
        // Ignore autoplay race errors; browser policies may delay play.
      })
      return
    }
    v.pause()
  }, [isActive])

  return (
    <section ref={introSectionRef} className="relative z-20 h-[200vh]">
      <div
        ref={stickyRef}
        data-intro-sticky
        className="sticky top-0 h-[100dvh] min-h-0 w-full overflow-hidden"
      >
        {/* Full-viewport bleed; full width on wide / horizontal screens (no max-width cap) */}
        <motion.div
          data-intro-video-layer
          className="relative z-10 h-full w-full max-w-none overflow-hidden rounded-none bg-black shadow-none"
          style={{ scale }}
        >
          <video
            ref={videoRef}
            src="/video/yoon-front-vid.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 z-20 flex flex-row items-start justify-between gap-4"
          style={{
            top: sideCaptionsTopPx ?? undefined,
            bottom: sideCaptionsTopPx == null ? '2rem' : 'auto',
            paddingLeft: sideInsetPx,
            paddingRight: sideInsetPx,
          }}
        >
          <p
            className={cn(
              bannerTypeBase,
              'min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl',
            )}
            aria-live="polite"
          >
            {allWorkText}
          </p>
          <p
            className={cn(
              bannerTypeBase,
              'min-w-0 shrink text-right leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl',
            )}
            aria-live="polite"
          >
            {contactText}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
