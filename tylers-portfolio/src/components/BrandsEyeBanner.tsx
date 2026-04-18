'use client'

import { useId, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSpring } from 'framer-motion'

import baseEyeAsset from '@/assets/base-eye.png'
import eyeBaseDownAsset from '@/assets/eye-base-down.png'
import eyeBaseUpAsset from '@/assets/eye-base-up.png'
import eyeGlintAccentAsset from '@/assets/eye-glint-accent.png'
import eyeGlintAsset from '@/assets/eye-glint.png'

function bundledAssetHref(mod: string | { src: string }): string {
  return typeof mod === 'string' ? mod : mod.src
}

const EYE_BOUNDS_PATH = '/images/eye-bounds.png'

const baseEyeHref = bundledAssetHref(baseEyeAsset)
const eyeBaseUpHref = bundledAssetHref(eyeBaseUpAsset)
const eyeBaseDownHref = bundledAssetHref(eyeBaseDownAsset)
const eyeGlintHref = bundledAssetHref(eyeGlintAsset)
const eyeGlintAccentHref = bundledAssetHref(eyeGlintAccentAsset)

const EYE_VIEWBOX_W = 1024
const EYE_VIEWBOX_H = 576
/** `feGaussianBlur` on the bounds mask (user units); softens the clip edge slightly. */
const MASK_EDGE_FEATHER_STDDEV = 8
const EYE_PIVOT_X = EYE_VIEWBOX_W * 0.5
const EYE_PIVOT_Y = EYE_VIEWBOX_H * 0.46
const EYE_BALL_SCALE = 1.22
/** Glint art vs previous size (0.7 = 30% smaller). */
const EYE_GLINT_SIZE = 0.7
const EYE_BALL_REST_OFFSET_X = -36
/** Uniform scale applied to the glint layer (about the pivot). */
const EYE_GLINT_SCALE = EYE_BALL_SCALE * EYE_GLINT_SIZE
/** Extra multiplier on the moving “eyeball” / glint only. */
const EYE_BALL_DISPLAY_SCALE = EYE_GLINT_SCALE * 1.2

const POINTER_MAX_SCREEN_PX = 96
/**
 * Screen-space cap for upward glint travel (negative Y). Smaller than
 * `POINTER_MAX_SCREEN_PX` so the eye does not sit too high when the pointer is
 * above the banner (e.g. right after scrolling).
 */
/** Upward travel cap (screen px) for the rear eyeball only. */
const POINTER_MAX_SCREEN_UP_PX = 16
/**
 * Looser upward cap for the front specular only (`eyeGlintAccent`); rear still uses
 * `POINTER_MAX_SCREEN_UP_PX`.
 */
const FRONT_SPECULAR_MAX_SCREEN_UP_PX = 28
/** Shared horizontal baseline (rear layer applies `REAR_EYEBALL_POINTER_MULT_*` on top). */
const POINTER_SENSITIVITY_X = 1.02
const POINTER_SENSITIVITY_Y = 0.2
/**
 * Frontmost masked layer (`eyeGlintAccent`, second `<g>`): strong motion.
 * Rear / larger layer (`eyeGlint`, first `<g>`): `POINTER_SENSITIVITY_*` × rear multipliers — slower.
 */
const FRONT_SPECULAR_POINTER_SENSITIVITY_X = 0.97
const FRONT_SPECULAR_POINTER_Y_MULT = 1
const REAR_EYEBALL_POINTER_MULT_X = 0.52
const REAR_EYEBALL_POINTER_MULT_Y = 0.68

/** Looser than before so motion trails the cursor slightly. */
const spring = { stiffness: 60, damping: 22, mass: 0.55 }
/** Visual update cadence for the eyeball (frames per second). */
const EYE_UPDATE_FPS = 30
const EYE_UPDATE_INTERVAL_MS = 1000 / EYE_UPDATE_FPS

/** Vertical “twitch” on the lid/base art only (not glints). Slower cadence + stronger squash than before. */
const EYE_BASE_TWITCH_FPS = 2.5
const EYE_BASE_TWITCH_INTERVAL_MS = 1000 / EYE_BASE_TWITCH_FPS
/** `scaleY` on alternating ticks (< 1 = squashed). */
const EYE_BASE_TWITCH_SCALE_Y = 0.978

function eyeBaseTwitchTransform(scaleY: number) {
  return `translate(${EYE_PIVOT_X} ${EYE_PIVOT_Y}) scale(1 ${scaleY}) translate(${-EYE_PIVOT_X} ${-EYE_PIVOT_Y})`
}

/**
 * Base lid art uses **viewport**-normalized Y (see `nyLidForFrame` in the pointer handler), not SVG
 * `ny`. SVG `ny` grows huge when the cursor is below/above the banner while listening on `window`,
 * so thresholds on it never behaved like “mostly neutral.” Neutral when `UP_ENTER < nyLid < DOWN_ENTER`.
 */
const EYE_BASE_NY_UP_ENTER = -0.76
const EYE_BASE_NY_DOWN_ENTER = 0.76

type EyeBaseFrame = 'neutral' | 'up' | 'down'

function lidFrameFromNyLid(nyLid: number): EyeBaseFrame {
  if (nyLid <= EYE_BASE_NY_UP_ENTER) return 'up'
  if (nyLid >= EYE_BASE_NY_DOWN_ENTER) return 'down'
  return 'neutral'
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function BrandsEyeBanner() {
  const rawId = useId()
  const maskId = `eye-bounds-mask-${rawId.replace(/:/g, '')}`
  const maskFeatherFilterId = `${maskId}-feather`

  /**
   * SVG masks often keep a stale bitmap for plain `/images/…` URLs. Load bounds as a fresh `blob:`
   * on every mount (`cache: 'reload'`) so the clip always matches the file on disk right now.
   */
  const [boundsPaintHref, setBoundsPaintHref] = useState<string | null>(null)
  const boundsBlobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(EYE_BOUNDS_PATH, { cache: 'reload' })
        if (!res.ok) return
        const blob = await res.blob()
        const u = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(u)
          return
        }
        if (boundsBlobUrlRef.current) URL.revokeObjectURL(boundsBlobUrlRef.current)
        boundsBlobUrlRef.current = u
        setBoundsPaintHref(u)
      } catch {
        if (!cancelled) setBoundsPaintHref(EYE_BOUNDS_PATH)
      }
    })()

    return () => {
      cancelled = true
      if (boundsBlobUrlRef.current) {
        URL.revokeObjectURL(boundsBlobUrlRef.current)
        boundsBlobUrlRef.current = null
      }
      setBoundsPaintHref(null)
    }
  }, [])

  const svgRef = useRef<SVGSVGElement>(null)
  const baseEyeTwitchRef = useRef<SVGGElement>(null)
  const glintGroupRef = useRef<SVGGElement>(null)
  const accentGlintGroupRef = useRef<SVGGElement>(null)
  const glintX = useSpring(0, spring)
  const glintY = useSpring(0, spring)
  const accentGlintX = useSpring(0, spring)
  const accentGlintY = useSpring(0, spring)

  const [eyeBaseFrame, setEyeBaseFrame] = useState<EyeBaseFrame>('neutral')
  const eyeBaseFrameRef = useRef<EyeBaseFrame>('neutral')

  const syncGlintGroupTransform = (g: SVGGElement | null, ox: number, oy: number) => {
    if (!g) return
    g.setAttribute(
      'transform',
      `translate(${EYE_PIVOT_X} ${EYE_PIVOT_Y}) translate(${ox} ${oy}) scale(${EYE_BALL_DISPLAY_SCALE}) translate(${-EYE_PIVOT_X} ${-EYE_PIVOT_Y})`,
    )
  }

  useLayoutEffect(() => {
    const ox = EYE_BALL_REST_OFFSET_X
    syncGlintGroupTransform(glintGroupRef.current, ox, 0)
    syncGlintGroupTransform(accentGlintGroupRef.current, ox, 0)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let squished = false
    const tick = () => {
      squished = !squished
      const g = baseEyeTwitchRef.current
      if (g) {
        g.setAttribute('transform', eyeBaseTwitchTransform(squished ? EYE_BASE_TWITCH_SCALE_Y : 1))
      }
    }
    const id = window.setInterval(tick, EYE_BASE_TWITCH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  /**
   * Poll the underlying springs on an rAF loop and commit the transform at ~`EYE_UPDATE_FPS`,
   * giving the eye a stepped / low-frame-rate feel instead of continuous 60 fps motion.
   */
  useEffect(() => {
    let rafId = 0
    let lastCommitMs = 0
    let lastOx = Number.NaN
    let lastOy = Number.NaN
    let lastAx = Number.NaN
    let lastAy = Number.NaN
    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      if (now - lastCommitMs < EYE_UPDATE_INTERVAL_MS) return
      lastCommitMs = now
      const ox = glintX.get() + EYE_BALL_REST_OFFSET_X
      const oy = glintY.get()
      const ax = accentGlintX.get() + EYE_BALL_REST_OFFSET_X
      const ay = accentGlintY.get()

      if (ox === lastOx && oy === lastOy && ax === lastAx && ay === lastAy) return
      lastOx = ox
      lastOy = oy
      lastAx = ax
      lastAy = ay
      syncGlintGroupTransform(glintGroupRef.current, ox, oy)
      syncGlintGroupTransform(accentGlintGroupRef.current, ax, ay)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [glintX, glintY, accentGlintX, accentGlintY])

  useEffect(() => {
    const setFromPointer = (e: PointerEvent) => {
      const svg = svgRef.current
      if (!svg) return
      const r = svg.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return
      const cx = r.left + r.width * 0.5
      const cy = r.top + r.height * 0.5
      const nx = (e.clientX - cx) / (r.width * 0.5)
      const ny = (e.clientY - cy) / (r.height * 0.5)

      const vh = Math.max(1, window.innerHeight)
      const nyLid = clamp((e.clientY - vh * 0.5) / (vh * 0.5), -1, 1)
      const nextFrame = lidFrameFromNyLid(nyLid)
      if (nextFrame !== eyeBaseFrameRef.current) {
        eyeBaseFrameRef.current = nextFrame
        setEyeBaseFrame(nextFrame)
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const txPxRear = clamp(
        nx * POINTER_MAX_SCREEN_PX * POINTER_SENSITIVITY_X * REAR_EYEBALL_POINTER_MULT_X,
        -POINTER_MAX_SCREEN_PX,
        POINTER_MAX_SCREEN_PX,
      )
      const rawTyPxRear =
        ny * POINTER_MAX_SCREEN_PX * POINTER_SENSITIVITY_Y * REAR_EYEBALL_POINTER_MULT_Y
      const tyPxRear = clamp(rawTyPxRear, -POINTER_MAX_SCREEN_UP_PX, POINTER_MAX_SCREEN_PX)
      glintX.set(txPxRear * (EYE_VIEWBOX_W / r.width))
      glintY.set(tyPxRear * (EYE_VIEWBOX_H / r.height))

      const txPxFront = clamp(
        nx * POINTER_MAX_SCREEN_PX * FRONT_SPECULAR_POINTER_SENSITIVITY_X,
        -POINTER_MAX_SCREEN_PX,
        POINTER_MAX_SCREEN_PX,
      )
      const rawTyPxFront =
        ny * POINTER_MAX_SCREEN_PX * POINTER_SENSITIVITY_Y * FRONT_SPECULAR_POINTER_Y_MULT
      const tyPxFront = clamp(
        rawTyPxFront,
        -FRONT_SPECULAR_MAX_SCREEN_UP_PX,
        POINTER_MAX_SCREEN_PX,
      )
      accentGlintX.set(txPxFront * (EYE_VIEWBOX_W / r.width))
      accentGlintY.set(tyPxFront * (EYE_VIEWBOX_H / r.height))
    }

    const reset = () => {
      glintX.set(0)
      glintY.set(0)
      accentGlintX.set(0)
      accentGlintY.set(0)
      eyeBaseFrameRef.current = 'neutral'
      setEyeBaseFrame('neutral')
    }

    window.addEventListener('pointermove', setFromPointer, { passive: true })
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('pointermove', setFromPointer)
      window.removeEventListener('blur', reset)
    }
  }, [glintX, glintY, accentGlintX, accentGlintY])

  return (
    <div
      className="relative z-[1] flex w-full justify-center px-[2vw] py-0"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="relative w-full max-w-[min(96vw,2000px)]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${EYE_VIEWBOX_W} ${EYE_VIEWBOX_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Stylized illustration of an eye"
        >
          {boundsPaintHref ? (
            <defs>
              <filter
                id={maskFeatherFilterId}
                x="-8%"
                y="-8%"
                width="116%"
                height="116%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation={MASK_EDGE_FEATHER_STDDEV} />
              </filter>
              <mask
                key={boundsPaintHref}
                id={maskId}
                ref={(el) => el?.setAttribute('mask-type', 'luminance')}
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={EYE_VIEWBOX_W}
                height={EYE_VIEWBOX_H}
              >
                <image
                  href={boundsPaintHref}
                  width={EYE_VIEWBOX_W}
                  height={EYE_VIEWBOX_H}
                  preserveAspectRatio="none"
                  filter={`url(#${maskFeatherFilterId})`}
                />
              </mask>
            </defs>
          ) : null}

          {boundsPaintHref ? (
            <image
              href={boundsPaintHref}
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
              opacity={0}
            />
          ) : null}

          <g ref={baseEyeTwitchRef} transform={eyeBaseTwitchTransform(1)}>
            <image
              key={eyeBaseFrame}
              href={
                eyeBaseFrame === 'up'
                  ? eyeBaseUpHref
                  : eyeBaseFrame === 'down'
                    ? eyeBaseDownHref
                    : baseEyeHref
              }
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
            />
          </g>

          <g
            mask={boundsPaintHref ? `url(#${maskId})` : undefined}
            style={{
              opacity: boundsPaintHref ? 1 : 0,
              mixBlendMode: 'screen',
            }}
          >
            <g ref={glintGroupRef} transform="translate(0 0)">
              <image
                href={eyeGlintHref}
                width={EYE_VIEWBOX_W}
                height={EYE_VIEWBOX_H}
                preserveAspectRatio="none"
              />
            </g>
            <g
              ref={accentGlintGroupRef}
              transform="translate(0 0)"
              style={{ mixBlendMode: 'screen' }}
            >
              <image
                href={eyeGlintAccentHref}
                width={EYE_VIEWBOX_W}
                height={EYE_VIEWBOX_H}
                preserveAspectRatio="none"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
