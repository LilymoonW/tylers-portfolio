'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(pointer: coarse)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

/** Primary input is touch — phones / most tablets. */
export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

function subscribeIntroHeroMobile(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mqs = [
    window.matchMedia('(pointer: coarse)'),
    window.matchMedia('(max-width: 767px)'),
    window.matchMedia('(hover: none)'),
  ]
  mqs.forEach((mq) => mq.addEventListener('change', callback))
  return () => mqs.forEach((mq) => mq.removeEventListener('change', callback))
}

/**
 * Phone-like layout for intro hero (no transform wrapper on video, flat scale for nav insets).
 * - `(pointer: coarse)` covers most phones (Safari + Chrome).
 * - `(max-width: 767px) and (hover: none)` catches Mobile Chrome builds that still report a fine
 *   pointer so the video would otherwise stay inside Framer `scale()` and fail muted autoplay.
 */
export function getIntroHeroMobileSnapshot() {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrowTouchLike =
    window.matchMedia('(max-width: 767px)').matches &&
    window.matchMedia('(hover: none)').matches
  return coarse || narrowTouchLike
}

export function useIntroHeroMobileLayout() {
  return useSyncExternalStore(subscribeIntroHeroMobile, getIntroHeroMobileSnapshot, () => false)
}
