'use client'

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  introScrollIndicatorDelayMs,
  introScrollIndicatorHideProgress,
} from '@/config/introMotion'

type IntroScrollIndicatorProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  scrollYProgress: MotionValue<number>
  reduceMotion: boolean
}

export default function IntroScrollIndicator({
  videoRef,
  scrollYProgress,
  reduceMotion,
}: IntroScrollIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const [eligible, setEligible] = useState(false)
  const delayTimerRef = useRef<number | null>(null)
  const hasScheduledRef = useRef(false)

  const syncVisibility = useCallback(
    (p: number) => {
      if (!eligible) return
      setVisible(p <= introScrollIndicatorHideProgress)
    },
    [eligible],
  )

  useMotionValueEvent(scrollYProgress, 'change', syncVisibility)

  useEffect(() => {
    if (eligible) syncVisibility(scrollYProgress.get())
  }, [eligible, scrollYProgress, syncVisibility])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const scheduleShow = () => {
      if (hasScheduledRef.current) return
      hasScheduledRef.current = true
      delayTimerRef.current = window.setTimeout(() => {
        setEligible(true)
      }, introScrollIndicatorDelayMs)
    }

    const onPlaying = () => scheduleShow()

    v.addEventListener('playing', onPlaying)
    if (!v.paused && !v.ended && v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      scheduleShow()
    }

    return () => {
      v.removeEventListener('playing', onPlaying)
      if (delayTimerRef.current != null) window.clearTimeout(delayTimerRef.current)
    }
  }, [videoRef, scrollYProgress])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,6vh,3rem)] z-[3] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
          aria-hidden
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="36"
              height="20"
              viewBox="0 0 24 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
            >
              <path d="M5 5l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
