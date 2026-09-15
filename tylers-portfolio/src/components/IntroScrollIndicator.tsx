'use client'

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState, type RefObject } from 'react'
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
  /** Set once the show delay has elapsed; scroll progress is ignored until then. */
  const eligibleRef = useRef(false)
  const hasScheduledRef = useRef(false)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!eligibleRef.current) return
    setVisible(p <= introScrollIndicatorHideProgress)
  })

  useEffect(() => {
    const v = videoRef.current
    let delayTimer: number | null = null

    const scheduleShow = () => {
      if (hasScheduledRef.current) return
      hasScheduledRef.current = true
      delayTimer = window.setTimeout(() => {
        delayTimer = null
        eligibleRef.current = true
        setVisible(scrollYProgress.get() <= introScrollIndicatorHideProgress)
      }, introScrollIndicatorDelayMs)
    }

    // The hint must not depend on playback (the video sits on its poster while motion is paused):
    // arm the delay from mount. `playing` stays as a second trigger; it is a no-op once scheduled.
    scheduleShow()
    const onPlaying = () => scheduleShow()
    v?.addEventListener('playing', onPlaying)

    return () => {
      v?.removeEventListener('playing', onPlaying)
      if (delayTimer != null) window.clearTimeout(delayTimer)
      hasScheduledRef.current = false
      eligibleRef.current = false
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
