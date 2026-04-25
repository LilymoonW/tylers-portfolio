'use client'

import { useLayoutEffect } from 'react'

import { useLenis } from '@/components/providers/SmoothScrollProvider'

/**
 * Project detail routes must start at the hero, not mid-page / end of long content —
 * same issue as portfolio index (Lenis + scroll restoration / wheel page origin).
 */
export default function ProjectScrollToTop({ routeKey }: { routeKey: string }) {
  const lenis = useLenis()

  useLayoutEffect(() => {
    const goTop = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo(0, 0)
      }
    }
    goTop()
    const id = requestAnimationFrame(goTop)
    return () => cancelAnimationFrame(id)
  }, [lenis, routeKey])

  return null
}
