'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stat } from '@/types'
import { formatNumber } from '@/lib/utils'
import { bannerTypeStatLabel, bannerTypeStatValue } from '@/config/scrollBanner'
import { useLenis } from '@/components/providers/SmoothScrollProvider'
import ScrollReveal from './ScrollReveal'

/** Section center this far below the viewport bottom → progress 0; ramp begins before the row is on screen. */
function progressLeadBelowViewport(vh: number) {
  return Math.min(vh * 0.38, 440)
}

/**
 * Y (px from top of viewport) where the stats block **center** reaches `scrollProgress === 1`.
 * **Smaller** fraction = completion **higher** in the viewport (less scroll to finish). Larger = lower (more scroll).
 */
const STATS_COUNT_COMPLETE_VIEWPORT_Y_FRACTION = 0.45

export default function StatsSection({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement | null>(null)
  const lenis = useLenis()
  const [scrollProgress, setScrollProgress] = useState(0)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return

    const vh = window.innerHeight
    const countCompleteY = vh * STATS_COUNT_COMPLETE_VIEWPORT_Y_FRACTION
    const rect = el.getBoundingClientRect()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lead = progressLeadBelowViewport(vh)

    if (reduceMotion) {
      const visible = rect.top < vh + lead && rect.bottom > 0
      setScrollProgress(visible ? 1 : 0)
      return
    }

    const centerY = rect.top + rect.height / 2
    const startY = vh + lead
    const endY = countCompleteY
    // Progress 0 when center is still `lead` below the fold; 1 when center crosses `countCompleteY`.
    const p = (startY - centerY) / (startY - endY)
    setScrollProgress(Math.min(1, Math.max(0, p)))
  }, [])

  useEffect(() => {
    measure()
    const onScroll = () => measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    lenis?.on('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      lenis?.off('scroll', onScroll)
    }
  }, [lenis, measure])

  return (
    <section id="stats" ref={ref} className="relative overflow-visible py-24">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.id} delay={i * 0.1} className="min-w-0">
              <StatItem stat={stat} scrollProgress={scrollProgress} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, scrollProgress }: { stat: Stat; scrollProgress: number }) {
  /** Scroll 0 → half the stat; scroll 1 → full value. */
  const scaled = stat.value * (0.5 + 0.5 * scrollProgress)
  const raw = stat.displayValue ?? formatNumber(Math.round(scaled), stat.format)

  return (
    <div className="min-w-0 text-center">
      <p className={bannerTypeStatValue}>
        {stat.prefix}
        {raw}
        {stat.suffix}
      </p>
      <p className={bannerTypeStatLabel}>{stat.label}</p>
    </div>
  )
}
