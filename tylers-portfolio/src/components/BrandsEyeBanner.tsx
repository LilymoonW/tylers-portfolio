'use client'

import { useEffect, useRef, useState } from 'react'

import AnimatedEyes from '@/components/AnimatedEyes'
import AsSeenOnEyesOverlay from '@/components/AsSeenOnEyesOverlay'

const EYE_SECTION_BLUR_MAX_PX = 2
const EYE_SECTION_BLUR_MIN_PX = 0
// Portion around viewport center where blur stays pinned at 0.
const EYE_SECTION_ZERO_BLUR_ZONE = 0.3

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/**
 * Inline "as seen on" section between the brand marquee and featured work. Wraps `AnimatedEyes`
 * with section-specific layout — negative margins to tuck under the marquee, top-fade gradient,
 * and distance-based blur that softens the eyes as the section leaves the viewport center.
 */
export default function BrandsEyeBanner() {
  const [sectionBlurPx, setSectionBlurPx] = useState(EYE_SECTION_BLUR_MAX_PX)
  const eyesScrollSectionRef = useRef<HTMLDivElement>(null)

  // Ease blur down when the section nears viewport center, then increase it
  // again as it moves away.
  useEffect(() => {
    let rafId = 0
    const updateBlur = () => {
      rafId = 0
      const el = eyesScrollSectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = Math.max(window.innerHeight, 1)
      const sectionCenterY = rect.top + rect.height * 0.5
      const viewportCenterY = vh * 0.5
      const normalizedDistance = clamp(
        Math.abs(sectionCenterY - viewportCenterY) / (vh * 0.5),
        0,
        1,
      )
      const beyondZeroZone = clamp(
        (normalizedDistance - EYE_SECTION_ZERO_BLUR_ZONE) / (1 - EYE_SECTION_ZERO_BLUR_ZONE),
        0,
        1,
      )
      const nextBlur =
        EYE_SECTION_BLUR_MIN_PX +
        (EYE_SECTION_BLUR_MAX_PX - EYE_SECTION_BLUR_MIN_PX) * beyondZeroZone
      setSectionBlurPx(nextBlur)
    }
    const scheduleBlurUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(updateBlur)
    }
    scheduleBlurUpdate()
    window.addEventListener('scroll', scheduleBlurUpdate, { passive: true })
    window.addEventListener('resize', scheduleBlurUpdate)
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleBlurUpdate)
      window.removeEventListener('resize', scheduleBlurUpdate)
    }
  }, [])

  return (
    <div
      ref={eyesScrollSectionRef}
      className="relative z-[1] flex w-full justify-center px-[2vw] py-0"
      style={{
        marginTop: 'calc(-1 * clamp(5rem, 9vw, 8rem))',
        marginBottom: 'calc(-1 * clamp(5rem, 9vw, 8rem))',
        filter: `blur(${sectionBlurPx.toFixed(2)}px)`,
      }}
    >
      <div className="relative isolate w-full max-w-[min(96vw,2000px)]">
        <AnimatedEyes />
        <AsSeenOnEyesOverlay
          scrollTargetRef={eyesScrollSectionRef}
          className="absolute inset-0 z-20 mx-auto max-w-[min(96vw,2000px)] px-[6%]"
        />
      </div>
    </div>
  )
}
