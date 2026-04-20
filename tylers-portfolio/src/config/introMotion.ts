/** Shared scroll window for under-video captions (`IntroGate`). */
export const introSideCaptionScroll = {
  start: 0.5,
  end: 0.8,
} as const

export const introAllWorkLabel = 'ALL WORK' as const
export const introContactLabel = 'CONTACT' as const

/** Tight gap from the scaled intro video’s bottom edge to caption baselines. */
export const introSideCaptionBelowVideoGapPx = 8

/**
 * Intro sticky video scale vs scroll progress (`IntroGate` + banner alignment).
 * Video is full-bleed width and scales from the center (`transform-origin: 50% 50%`).
 */
export function introVideoScaleForProgress(scrollProgress: number) {
  const t = Math.min(Math.max(scrollProgress, 0), 1)
  return 1 + t * (0.3 - 1)
}
