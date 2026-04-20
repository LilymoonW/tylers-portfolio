'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const FALLBACK =
  'pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-deep-blue/80 via-indigo/60 to-surface'

type ProjectThumbnailMediaProps = {
  src: string
  /** Merged onto both `<img>` and fallback `<div>`. */
  className?: string
  /** > 1 zooms in slightly (cropped by ancestor `overflow-hidden`). Default 1. */
  zoom?: number
}

/**
 * Full-bleed cover image for a project thumbnail; falls back to the indigo gradient if `src` is empty or fails to load.
 */
export function ProjectThumbnailMedia({ src, className, zoom = 1 }: ProjectThumbnailMediaProps) {
  const [failed, setFailed] = useState(false)
  const z = Number.isFinite(zoom) && zoom > 1 ? zoom : 1

  if (failed || !src.trim()) {
    return <div className={cn(FALLBACK, className)} aria-hidden />
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setFailed(true)}
      className={cn(
        'pointer-events-none absolute inset-0 z-0 h-full w-full object-cover',
        z > 1 && 'will-change-transform',
        className
      )}
      style={
        z > 1
          ? { transform: `scale(${z})`, transformOrigin: 'center center' }
          : undefined
      }
    />
  )
}
