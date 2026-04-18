'use client'

import { motion, useTransform } from 'framer-motion'
import { introVideoScaleForProgress } from '@/config/introMotion'
import { useIntroScroll } from '@/components/providers/IntroScrollProvider'

export default function IntroGate() {
  const { introSectionRef, scrollYProgress } = useIntroScroll()
  const scale = useTransform(scrollYProgress, introVideoScaleForProgress)

  return (
    <section ref={introSectionRef} className="relative z-20 h-[200vh]">
      <div className="sticky top-0 h-[100dvh] min-h-0 w-full overflow-hidden">
        {/* Full-viewport bleed; full width on wide / horizontal screens (no max-width cap) */}
        <motion.div
          data-intro-video-layer
          className="relative z-10 h-full w-full max-w-none overflow-hidden rounded-none bg-black shadow-none"
          style={{ scale }}
        >
          <video
            src="/video/intro-placeholder.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}
