export interface Project {
  /** Matches `title`; used for `#portfolio/` deep links (encoded in the URL hash). */
  id: string
  title: string
  /**
   * Explicit title rows for `/portfolio/[projectId]` — each entry is one justified row, rendered as
   * its own spaced line group. Omit to auto-chunk the title two words per row.
   */
  titleLines?: string[]
  duration: string
  year: number
  role: string
  thumbnail: string
  /** Optional zoom on raster thumbnail (e.g. 1.08); parent should clip with `overflow-hidden`. */
  thumbnailZoom?: number
  /**
   * CSS `object-position` applied to the thumbnail `<Image>` (e.g. `'center top'`, `'50% 30%'`).
   * Lets each project independently tune how a 9:16 source is cropped inside a non-matching
   * container (e.g. the square grid tiles on `/portfolio`). Default: `'center'`.
   */
  thumbnailObjectPosition?: string
  embedUrl: string
  /**
   * When set, the `/portfolio/[projectId]` media link shows an external-open affordance instead of
   * a play triangle (e.g. Instagram-only posts).
   */
  mediaExternalAffordance?: boolean
  /** Optional hosted video path for the dedicated `/portfolio/[projectId]` page media block. */
  videoSrc?: string
  /** Optional per-project bio shown on the dedicated `/portfolio/[projectId]` page. */
  bio?: string
  /** Credited videographers on `/portfolio/[projectId]` — each project supplies its own list (omit or `[]` to hide the block). */
  videographers?: string[]
  tags: string[]
  viewCount: number
  /** When true, `/portfolio/[projectId]` hides the Views row in Project Info. */
  hideProjectViews?: boolean
  toolsUsed: string[]
  brand: string
  featured: boolean
  aspectRatio: '9:16' | '16:9' | '1:1'
  /** If set, featured carousel (and similar) opens this URL in a new tab instead of the video modal. */
  cardHref?: string
}

export interface Brand {
  id: string
  name: string
  logoSrc: string
  url?: string
  /** Multiplier for marquee slot height + image max height (default 1). Slot width stays the global logo column width. */
  logoScale?: number
  /** CSS `brightness()` multiplier on the raster (1 = default; 0.8 ≈ 20% darker). */
  logoBrightness?: number
}

export interface Tool {
  id: string
  name: string
  category: string
}

export interface Stat {
  id: string
  label: string
  value: number
  suffix?: string
  prefix?: string
  format: 'number' | 'abbreviated'
  displayValue?: string
}

export interface NavSection {
  id: string
  label: string
}

export interface ParallaxLayerConfig {
  defaultSrc: string
  hoverSrc: string
  speed: number
  position: { x: string; y: string }
  zIndex: number
  size: { width: string; height: string }
}
