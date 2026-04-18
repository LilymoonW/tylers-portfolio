export type BrandMarqueeAsSeenOnConfig = {
  /** Copy shown above the marquee */
  label: string
  /** Space below the line before the logo row (px) — matches former `mb-8` at 32 */
  marginBottomPx: number
  /** Fine vertical nudge: positive moves down (px) */
  offsetYPx: number
  /** Extra Tailwind classes on the line (merged last), e.g. `tracking-widest` or `portrait:text-base` */
  labelTextClassName?: string
  /** Font size in px at all breakpoints; omit to use `bannerTypeEyebrowLight` scale */
  labelFontSizePx?: number
}

/**
 * Brands strip — “AS SEEN ON…” eyebrow: pixel spacing / nudge / size.
 */
export const brandMarqueeAsSeenOnConfig: BrandMarqueeAsSeenOnConfig = {
  label: 'AS SEEN ON...',
  marginBottomPx: 32,
  offsetYPx: 0,
  labelTextClassName: '',
  labelFontSizePx: 24,
}

/** Logo rows — edit `src/data/brands.ts`; raster files in `public/images/brands/logos/`. */
export const brandMarqueeTracksConfig = {
  /** Max height of each logo image (px) */
  logoMaxHeightPx: 44,
  /** Max rendered logo width (px); cell is `max-content` up to this cap so `logoGapPx` is edge clearance between marks */
  logoSlotMaxWidthPx: 160,
  /** Gap between the forward row and the reverse row (px) */
  rowGapPx: 28,
  /** Horizontal gap between logos (px) — same value for strip interior + between duplicated segments */
  logoGapPx: 64,
  /** One full loop duration (seconds); both rows use the same length, reverse row runs backward */
  marqueeDurationSec: 60,
}
