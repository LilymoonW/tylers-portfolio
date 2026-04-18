'use client'

import { useId } from 'react'

/**
 * Full-viewport film grain via SVG `feTurbulence` (no bitmap — works without `/textures/grain.png`).
 * Opacity from `--grain-opacity` in `globals.css`. Hidden under `prefers-reduced-motion` via `.grain`.
 */
export default function GrainOverlay() {
  const raw = useId()
  const uid = raw.replace(/:/g, '')
  const filterId = `${uid}-grain`

  return (
    <svg
      className="grain pointer-events-none fixed inset-0 z-40 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        opacity: 'var(--grain-opacity)',
        mixBlendMode: 'multiply',
      }}
    >
      <defs>
        <filter
          id={filterId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="4"
            seed="31"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#fff" filter={`url(#${filterId})`} />
    </svg>
  )
}
