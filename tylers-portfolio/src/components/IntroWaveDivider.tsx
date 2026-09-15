'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { SIGNATURE_OUTER_TEXTURE_OPACITY } from '@/config/signature'
import { useInViewActive } from '@/hooks/useInViewActive'
import { cn } from '@/lib/utils'

/**
 * Paths from `public/sig-2026.svg` — keep `d` strings in sync when replacing the asset.
 */
const SIGNATURE_PATHS = [
  "M1013.98,103.96c86.39-10.34,172.83-20.4,259.45-27.57,36.11-2.69,72.3-5.68,108.52-4.62,7.26.32,14.53.72,21.83,2.27,2.76.71,5.76,1.37,8.28,3.32,9.56,8.34-11.49,17.8-16.06,20.21-16.92,8.1-34.44,14.14-51.89,20.08-69.91,23.01-140.76,41.52-211.59,59.63-141.49,35.67-284.42,67.5-427.15,95.37-93.43,17.85-188.65,35.38-282.75,46.21-107.04,15.12-214.25,32.05-322.16,33.76-11.06-.09-22.23-.43-33.33-2.04-6.02-1.09-12.37-1.93-18.26-5.79-1.21-.85-2.59-1.91-4.02-3.95-.7-1.02-1.42-2.36-1.88-4.01-1.22-4.12-.21-8.99,1.85-12.17,4.75-7.36,11.99-11.1,18.45-14.96,30.35-16.05,62.25-26.05,94.01-36.47,112.34-34.81,226.41-60.39,340.6-84.13,171.24-34.96,343.41-63.42,516.12-85.12h-.02ZM1013.98,103.96c-287.32,37.77-574.12,93.09-853.69,182.91-27.55,9.46-55.39,19.26-81.84,32.23-6.31,3.19-12.76,6.65-18.4,10.96-1.32,1.02-2.55,2.12-3.42,3.1-.43.47-.76.95-.88,1.16-.15.22.08.13.22-1.01.05-.55,0-1.33-.18-1.92-.18-.61-.4-1-.52-1.18-.26-.36-.13-.13.24.07.73.49,2.1,1.07,3.53,1.52,6.35,1.87,13.37,2.48,20.08,2.88,35.77,1.53,71.7-1.95,107.41-5.27,74.99-7.48,151.36-18.6,226.15-29.83,110.67-13.44,223.01-33.54,333.13-53.94,127.24-23.87,258.65-50.13,385-78.8,71-16.38,142.05-32.93,212.12-54.51,20.76-6.85,42.03-12.96,61.52-24.01,2.28-1.44,4.47-2.89,6.14-5.08.46-.64.63-1.25.58-1.44.02-.19-.3-.75-.89-1.23-2.14-1.57-4.58-2.26-7.08-2.89-14.07-3.06-28.67-3.03-42.99-3.2-14.45-.01-28.9.44-43.35,1.07-101.19,5.02-202.08,16.61-302.87,28.41h-.01Z",
  "M560.75,229.05c-9.31,16.47-51.67,93.16-33.72,105.92,4.05,2.42,9.81,1.2,14.3-.17,5.02-1.46,9.23-4.39,13.51-7.4,5.69-4.11,11.12-8.66,16.48-13.29,21.36-18.7,41.38-38.95,61.5-59,15.19-15.07,30.05-30.44,45.9-44.87,2.7-2.4,5.39-4.77,8.49-7,2.19-1.52,5.57-3.86,8.23-1.39,2.39,2.47.27,6.92-1.12,9.32-75.39,92.41-153.48,183.17-221.57,281.16-3.07,4.71-6.07,9.48-8.65,14.29-.64,1.2-1.25,2.4-1.79,3.59-.53,1.17-1.01,2.38-1.26,3.32-.13.43-.13.91-.14.61-.01-.08-.03-.26-.14-.52-.1-.26-.32-.64-.67-.97-.35-.34-.79-.56-1.11-.66-.32-.1-.53-.11-.65-.11,4.78-2.16,10.2-7,14.64-10.93,6.81-6.17,17.45-17.17,24.15-23.82,123.99-125.11,237.59-260.88,333.82-408.56,3.18-4.74,6.33-9.48,9.74-14.18,1.77-2.26,3.25-4.74,5.76-6.5.39-.2.76-.54,2.02-.66,1.45-.29,3.44,1.41,3.51,2.19.34.81.33,1.22.38,1.61.1,1.58-.3,3.17-.61,4.63-1.66,7.16-4.37,14.07-7.23,20.66-9.22,20.98-19.85,41.13-30.45,61.38-34.21,65.55-71.81,129.34-102.95,196.38-2.28,5.17-4.48,10.37-6.35,15.62-1.25,3.73-2.69,7.66-2.76,11.46,0,.49.13.92.13.88,0,0-.11-.16-.27-.24-.15-.08-.25-.07-.19-.07.7-.08,1.86-.6,2.63-1.09,3.46-2.13,6.75-4.76,9.92-7.39,17.15-14.67,32.7-31.42,48.15-47.92,30.98-33.36,60.51-67.99,91.33-101.55,6-6.29,11.62-12.75,18.51-18.25.91-.62,2.09-1.57,3.6-1.61.55-.08,1.81.37,2.26,1.22.44.77.42,1.26.44,1.62-.1,2.07-.98,3.68-1.74,5.43-8.47,17.9-23.7,42.21-33.63,59.63-5.64,9.78-11.48,19.61-16.28,29.79-1.02,2.47-2.57,5.36-2.65,7.93,0,.01,0-.01-.07-.14-.07-.1-.23-.28-.39-.33-.32-.13-.29-.04-.14-.09,1.36-.4,2.6-1.35,3.91-2.27,4.39-3.31,8.5-7.24,12.6-11.16,8.23-7.87,16.49-15.71,24.8-23.5,16.66-15.56,33.34-31.07,50.71-45.86,5.3-4.29,10.41-9.07,16.51-12.41.41-.17.76-.36,1.47-.46.31-.01.94-.14,1.71.51.7.74.6,1.41.59,1.73-.55,2.81-2.55,4.88-4.02,7.15-5.49,7.57-16.6,26.04-14.8,35.48,1.22,3.02,8.22-4.23,9.49-5.61,27.31-29.25,61.85-51,97.31-69.03,40.88-19.97,85.44-35.33,130.03-42.02.04.22-.11.42-.32.46-80.36,15.05-168.11,52.36-225.03,112.43-2.66,2.66-7.42,8.24-11.83,7.09-6.3-2.79-.07-17.23,1.91-21.84,2.37-5.28,5.21-10.31,8.38-15.12,1.85-2.91,4.18-5.64,5.69-8.71.12-.25.19-.55.19-.55.02-.02-.1.25.34.74.51.4.74.27.71.3.01,0-.09.02-.19.06-5.91,3.14-10.86,7.93-16.11,12.19-8.62,7.38-17.05,15.02-25.42,22.7-16.74,15.4-33.23,31.08-49.59,46.88-4.11,3.96-8.22,7.95-12.9,11.52-2.3,1.78-7.82,5.51-9.18.62-.36-3.76,1.56-7.01,2.86-10.27,8.66-18.02,23.38-42.2,33.43-59.74,6.03-11.01,12.92-21.75,17.42-33.36.02-.09.02-.17.02-.15.02.02-.05.14.21.6.32.65,1.32.85,1.55.75-.22.07-.82.45-1.3.81-6.44,5.2-12.1,11.71-17.83,17.77-30.64,33.62-60.1,68.41-90.96,101.89-15.58,16.76-31.03,33.54-48.44,48.54-3.39,2.82-6.76,5.56-10.58,7.92-1.69.91-3.06,1.77-5.3,1.82-3.11.06-4.85-2.89-4.79-5.54,0-4.78,1.59-9.05,3.01-13.37,1.93-5.48,4.15-10.78,6.44-16.03,11.61-26.07,24.95-51.33,38.17-76.55,31.44-60.53,65.99-119.51,94.23-181.58,2.2-5.18,4.31-10.36,5.76-15.62.6-2.25,1.31-4.46,1.48-6.72.01.04-.03.09.16.57-.05.44,1.62,1.87,2.7,1.63.91-.1.95-.27,1.04-.29-1.35,1.24-2.68,3.18-3.91,4.82-5.49,7.7-13.55,20.15-18.93,28.25-96.82,147.83-210.85,284.07-336.15,408.55-5.7,5.71-12.7,12.63-19.1,17.69-2.97,2.32-6.13,4.82-9.83,6.46-1.61.66-3.41,1.17-5.37.57-.66-.2-1.42-.6-2.02-1.18-1.11-.88-1.46-2.29-1.66-3.41-.16-1.72.12-2.66.33-3.6,2.74-8.67,8.11-16.09,12.8-23.6,3.16-4.81,6.4-9.53,9.69-14.21,66.98-92.23,141.05-178.93,214.03-266.37,0,0-.4.63-.4.63.48-1.04.99-2.06,1.23-3.07.03-.12.04-.21.04-.21.01,0-.03.08.1.49.08.23.22.51.52.83.29.3.7.51.98.59.59.15.73.05.77.06.04-.02-.25.08-.51.21-3.56,2.01-6.72,4.91-9.96,7.67-5.29,4.64-10.45,9.51-15.59,14.41-10.27,9.81-20.41,19.79-30.59,29.74-20.45,19.87-40.8,39.83-62.53,58.35-5.47,4.61-11.04,9.1-16.96,13.23-4.46,3.05-9.26,6.18-14.59,7.62-5.42,1.51-11.65,2.72-16.79-.42-16.12-10.73,7.63-57.6,14.09-71.31,6.35-12.77,13.2-25.27,20.51-37.49.11-.19.36-.25.55-.14.19.11.25.36.14.55h0Z",
] as const

/**
 * Stacking for the in-flow signature (sibling after `IntroGate` — above intro `z-20`, below
 * `ScrollNav` `z-[100]`). Portaling was removed: fixed + getBoundingClientRect lagged behind
 * compositor scroll on mobile Safari; document flow keeps the mark locked to scroll.
 */
const SIGNATURE_OVERLAY_Z_CLASS = 'z-[45]'

/**
 * Display size: width clamps on the fixed wrapper (SVG is `w-full` `h-auto` inside).
 * Raise `270` / `27vw` to grow again.
 */
const SIGNATURE_OVERLAY_WIDTH_CLASSES =
  'w-[min(calc(27vw-10px),270px)] min-w-[min(105px,22vw)] max-w-[min(270px,85vw)]'

/** White mask stroke per reveal pass: wider = a bolder “ink” band while that segment draws on. */
const SIGNATURE_REVEAL_STROKE_WIDTH_STROKE_1 = 52
const SIGNATURE_REVEAL_STROKE_WIDTH_STROKE_2 = 24

/**
 * Reveal progress 0..1 (from `revealProgress`): outline fills [0, FIRST_END],
 * script fills [SECOND_START, 1]. Overlap makes the 2nd stroke start sooner; a
 * longer span for stroke 2 makes it complete slower for the same scroll range.
 */
/** Higher = outline uses more of `revealProgress` (draws slower). */
const SIGNATURE_FIRST_STROKE_END = 0.44
/** Lower = script begins earlier + uses more of the scroll band (draws slower). */
const SIGNATURE_SECOND_STROKE_START = 0.06

/**
 * Fraction of the sentinel `useScroll` progress (0→1) to hold before the draw starts.
 * Higher = user scrolls more before the signature begins.
 */
const SIGNATURE_REVEAL_SCROLL_DELAY = 0.22

/** Tiled over masked ink — light-on-dark art; `screen` keeps black areas from punching holes in the ink. */
const SIGNATURE_INK_TEXTURE_SRC = '/textures/marker-ink-texture.png'
/** Soften ink fill only — grain texture stays sharp (sibling `<rect>`). */
const SIGNATURE_INNER_BLUR_PX = 10
/** Mobile / coarse pointer: skip blur + tiled texture (expensive compositing with masks). */
const SIGNATURE_INNER_BLUR_PX_LIGHT = 0

/**
 * White stroke that traces a single path and "draws on" via `pathLength` over
 * its `[segmentStart, segmentEnd]` band. Used inside a shared mask so every
 * pass contributes to one unified reveal region (see render below).
 */
function SequentialMaskStroke({
  d,
  segmentStart,
  segmentEnd,
  progress,
  strokeWidth,
}: {
  d: string
  segmentStart: number
  segmentEnd: number
  progress: MotionValue<number>
  strokeWidth: number
}) {
  const segmentPathLength = useTransform(progress, (latest: number) => {
    if (latest <= segmentStart) return 0
    if (latest >= segmentEnd) return 1
    return (latest - segmentStart) / (segmentEnd - segmentStart)
  })
  const segmentOpacity = useTransform(progress, (latest: number) => {
    return latest <= segmentStart ? 0 : 1
  })

  return (
    <motion.path
      d={d}
      fill="none"
      stroke="#ffffff"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pathLength: segmentPathLength, opacity: segmentOpacity }}
    />
  )
}

/**
 * Seam signature between intro and brands: anchored to the zero-height sentinel + vertical tweak.
 * Renders in document flow (not portaled) so vertical scroll stays pixel-locked on mobile WebKit.
 */
export default function IntroWaveDivider() {
  const rawMaskId = useId()
  const maskId = rawMaskId.replace(/:/g, '')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [lightEffects, setLightEffects] = useState(false)
  const isActive = useInViewActive(sentinelRef, { rootMargin: '260px 0px', threshold: 0 })
  /** Nudge vs sentinel top so the mark sits between scaled video and brands block (+ = lower on screen). */
  const BRANDS_TEXT_MIDPOINT_OFFSET_PX = 95
  /**
   * In-flow layout: the wrapper has 0 height (sentinel is h-0; SVG is absolute). The gradient
   * bridge starts right here and is transparent at its top, so the mark sits over paper.
   */
  const SIGNATURE_SEAM_RUNWAY_CLASS = 'pb-0'
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    /* Viewport band for scroll 0→1 — slightly tighter = a bit faster than 110% / -35%. */
    offset: ['start 104%', 'start -28%'],
  })
  const revealProgress = useTransform(
    scrollYProgress,
    [SIGNATURE_REVEAL_SCROLL_DELAY, 1],
    [0, 1],
    { clamp: true }
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const sync = () => setLightEffects(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const innerBlurPx = lightEffects ? SIGNATURE_INNER_BLUR_PX_LIGHT : SIGNATURE_INNER_BLUR_PX

  const signatureSvg = (
    <svg
      viewBox="0 0 1456.98 556.61"
      className="h-auto w-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {!lightEffects ? (
          <pattern
            id={`${maskId}-inkgrain`}
            patternUnits="userSpaceOnUse"
            width="340"
            height="340"
          >
            <image
              href={SIGNATURE_INK_TEXTURE_SRC}
              x="0"
              y="0"
              width="340"
              height="340"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        ) : null}
      </defs>
      {/*
        One shared reveal mask for every pass. Both glyphs are drawn as a single
        ink layer through this mask, so where a later stroke crosses ink that's
        already revealed it's white-on-white (adds nothing) — no fading "over a
        line that's already there". Each pass still traces its own path.
      */}
      <mask id={`${maskId}-ink`}>
        <rect x="0" y="0" width="1456.98" height="556.61" fill="#000000" />
        {SIGNATURE_PATHS.map((path, index) => (
          <SequentialMaskStroke
            key={`signature-stroke-${index}`}
            d={path}
            segmentStart={index === 0 ? 0 : SIGNATURE_SECOND_STROKE_START}
            segmentEnd={index === 0 ? SIGNATURE_FIRST_STROKE_END : 1}
            progress={revealProgress}
            strokeWidth={
              index === 0
                ? SIGNATURE_REVEAL_STROKE_WIDTH_STROKE_1
                : SIGNATURE_REVEAL_STROKE_WIDTH_STROKE_2
            }
          />
        ))}
      </mask>
      <g
        mask={`url(#${maskId}-ink)`}
        style={innerBlurPx > 0 ? { filter: `blur(${innerBlurPx}px)` } : undefined}
      >
        {SIGNATURE_PATHS.map((path, index) => (
          <path key={`signature-fill-${index}`} d={path} fill="var(--color-ink)" />
        ))}
      </g>
      {!lightEffects ? (
        <rect
          x="0"
          y="0"
          width="1456.98"
          height="556.61"
          fill={`url(#${maskId}-inkgrain)`}
          mask={`url(#${maskId}-ink)`}
          style={{
            mixBlendMode: 'screen',
            opacity: SIGNATURE_OUTER_TEXTURE_OPACITY,
          }}
        />
      ) : null}
    </svg>
  )

  return (
    <div
      className={cn(
        'relative w-full overflow-visible',
        SIGNATURE_OVERLAY_Z_CLASS,
        SIGNATURE_SEAM_RUNWAY_CLASS,
      )}
    >
      <div
        ref={sentinelRef}
        data-signature-sentinel
        className="h-0 w-full shrink-0"
        aria-hidden
      />
      {isActive ? (
        <div
          aria-hidden
          className={cn('pointer-events-none absolute left-1/2', SIGNATURE_OVERLAY_WIDTH_CLASSES)}
          style={{
            top: BRANDS_TEXT_MIDPOINT_OFFSET_PX,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {signatureSvg}
        </div>
      ) : null}
    </div>
  )
}
