'use client'

import { useLayoutEffect, useRef } from 'react'

import { useLenis } from '@/components/providers/SmoothScrollProvider'
import { isBackForwardNavigation } from '@/lib/navigationType'

/**
 * Project detail routes must start at the hero, not mid-page / end of long content —
 * same issue as portfolio index (Lenis + scroll restoration / wheel page origin).
 * Skipped on Back/Forward so the browser can restore the previous position, and it
 * runs once per route (not again when Lenis resolves a frame after mount).
 */
export default function ProjectScrollToTop({ routeKey }: { routeKey: string }) {
  const lenis = useLenis()
  const handledRouteRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (handledRouteRef.current === routeKey) return
    handledRouteRef.current = routeKey
    if (isBackForwardNavigation()) return
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [lenis, routeKey])

  return null
}
