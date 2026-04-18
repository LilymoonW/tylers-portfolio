/**
 * Intro sticky video scale vs scroll progress (`IntroGate` + banner alignment).
 * Video is full-bleed width and scales from the center (`transform-origin: 50% 50%`).
 */
export function introVideoScaleForProgress(scrollProgress: number) {
  const t = Math.min(Math.max(scrollProgress, 0), 1)
  return 1 + t * (0.3 - 1)
}
