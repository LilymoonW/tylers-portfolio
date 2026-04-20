'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

type InViewOptions = {
  rootMargin?: string
  threshold?: number | number[]
  initialInView?: boolean
}

/**
 * Lightweight in-view gate for pausing offscreen animation/listener work.
 * `initialInView` defaults to true so content is active before first observer tick.
 */
export function useInViewActive(
  ref: RefObject<Element | null>,
  { rootMargin = '0px', threshold = 0, initialInView = true }: InViewOptions = {},
) {
  const [isActive, setIsActive] = useState(initialInView)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting)
      },
      { root: null, rootMargin, threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, threshold])

  return isActive
}
