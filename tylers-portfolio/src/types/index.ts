export interface Project {
  id: string
  title: string
  duration: string
  year: number
  role: string
  thumbnail: string
  embedUrl: string
  tags: string[]
  viewCount: number
  toolsUsed: string[]
  brand: string
  description: string
  featured: boolean
  aspectRatio: '9:16' | '16:9' | '1:1'
}

export interface Brand {
  id: string
  name: string
  logoSrc: string
  url?: string
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
