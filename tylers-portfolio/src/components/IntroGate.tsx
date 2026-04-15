'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollLock } from '@/hooks/useScrollLock'

type Phase = 'fullscreen' | 'zooming' | 'done'

export default function IntroGate() {
  const [phase, setPhase] = useState<Phase>('fullscreen')
  const [showSkip, setShowSkip] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useScrollLock(phase !== 'done')

  const skip = useCallback(() => {
    setPhase('done')
  }, [])

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches
    setIsMobile(mobile)

    // Show skip button after 0.5s
    const skipTimer = setTimeout(() => setShowSkip(true), 500)
    // Start zoom-out after 2s (1.5s on mobile for faster experience)
    const zoomDelay = mobile ? 1500 : 2000
    const zoomTimer = setTimeout(() => setPhase('zooming'), zoomDelay)
    // Complete after zoom animation
    const doneTimer = setTimeout(() => setPhase('done'), zoomDelay + 1500)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(zoomTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  // Mini-player size: smaller on mobile
  const miniWidth = isMobile ? 160 : 280
  const miniHeight = isMobile ? 90 : 158
  const miniBottom = isMobile ? 16 : 24
  const miniRight = isMobile ? 16 : 24

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9998] bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative overflow-hidden"
            initial={{ width: '100vw', height: '100vh', borderRadius: 0 }}
            animate={
              phase === 'zooming'
                ? {
                    width: miniWidth,
                    height: miniHeight,
                    borderRadius: 12,
                    x: `calc(50vw - ${miniWidth / 2 + miniRight}px)`,
                    y: `calc(50vh - ${miniHeight / 2 + miniBottom}px)`,
                  }
                : { width: '100vw', height: '100vh', borderRadius: 0, x: 0, y: 0 }
            }
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <video
              src="/video/intro-placeholder.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Skip button */}
          <AnimatePresence>
            {showSkip && phase === 'fullscreen' && (
              <motion.button
                className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-white/60 hover:text-white text-xs md:text-sm uppercase tracking-widest z-10 transition-colors px-3 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={skip}
                data-cursor="expand"
              >
                Skip
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
