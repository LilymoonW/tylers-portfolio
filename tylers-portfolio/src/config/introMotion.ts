/** Shared scroll window for under-video captions (`IntroGate`). */
export const introSideCaptionScroll = {
  start: 0.5,
  end: 0.8,
} as const

export const introAllWorkLabel = 'ALL WORK' as const
export const introContactLabel = 'CONTACT' as const

/** Tight gap from the scaled intro video’s bottom edge to caption baselines. */
export const introSideCaptionBelowVideoGapPx = 8

/** Delay after the intro mounts (whether or not the video plays) before the scroll hint appears. */
export const introScrollIndicatorDelayMs = 2000

/** Hide the scroll hint once intro scroll progress passes this threshold. */
export const introScrollIndicatorHideProgress = 0.02

/**
 * Intro sticky video scale vs scroll progress (`IntroGate` + banner alignment).
 * Video is full-bleed width and scales from the center (`transform-origin: 50% 50%`).
 */
export function introVideoScaleForProgress(scrollProgress: number) {
  const t = Math.min(Math.max(scrollProgress, 0), 1)
  return 1 + t * (0.3 - 1)
}

/**
 * Edges of the scaled intro video layer, in px from the top of the sticky box it fills
 * (`IntroGate`). The layer is the full box height `H` scaled about its centre, so its
 * top sits at `(1 - s) / 2 * H` and its bottom at `(1 + s) / 2 * H`.
 */
export function introVideoTopForScale(scale: number, stickyHeightPx: number) {
  return ((1 - scale) / 2) * stickyHeightPx
}

export function introVideoBottomForScale(scale: number, stickyHeightPx: number) {
  return ((1 + scale) / 2) * stickyHeightPx
}

/**
 * Viewport top (px, ≤ 0) of the intro sticky box at a given scroll progress. The box is
 * pinned at 0 until the section’s bottom edge reaches the box’s bottom edge, then it
 * scrolls away with the section (`ScrollNav` uses this to follow the video off-screen).
 */
export function introStickyTopForProgress(
  scrollProgress: number,
  stickyHeightPx: number,
  sectionHeightPx: number,
) {
  const t = Math.min(Math.max(scrollProgress, 0), 1)
  return Math.min(0, sectionHeightPx * (1 - t) - stickyHeightPx)
}
