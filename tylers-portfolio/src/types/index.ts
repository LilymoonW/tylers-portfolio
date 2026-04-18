export interface Project {
  /** Matches `title`; used for `#work/` deep links (encoded in the URL hash). */
  id: string
  title: string
  duration: string
  year: number
  role: string
  thumbnail: string
  /** Optional zoom on raster thumbnail (e.g. 1.08); parent should clip with `overflow-hidden`. */
  thumbnailZoom?: number
  embedUrl: string
  tags: string[]
  viewCount: number
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
}

export interface Tool {
  id: string
  name: string
  iconSrc: string
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
