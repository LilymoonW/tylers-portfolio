'use client'

import type { CSSProperties, RefObject } from 'react'
import { useCallback, useId, useEffect, useLayoutEffect, useRef, useState, useEffectEvent } from 'react'
import { useSpring } from 'framer-motion'

import baseEyeAsset from '@/assets/base-eye.webp'
import eyeBaseDownAsset from '@/assets/eye-base-down.webp'
import eyeBaseUpAsset from '@/assets/eye-base-up.webp'
import eyeBlink1Asset from '@/assets/eye-blink-1.webp'
import eyeBlink2Asset from '@/assets/eye-blink-2.webp'
import eyeBlink3Asset from '@/assets/eye-blink-3.webp'
import eyeBoundsAsset from '@/assets/eye-bounds.webp'
import eyeGlintAccentAsset from '@/assets/eye-glint-accent.webp'
import eyeGlintAsset from '@/assets/eye-glint.webp'

function bundledAssetHref(mod: string | { src: string }): string {
  return typeof mod === 'string' ? mod : mod.src
}

/** Luminance mask for the glint stack. Bundled with a content hash, so the href is stable and cacheable. */
const eyeBoundsHref = bundledAssetHref(eyeBoundsAsset)

const baseEyeHref = bundledAssetHref(baseEyeAsset)
const eyeBaseUpHref = bundledAssetHref(eyeBaseUpAsset)
const eyeBaseDownHref = bundledAssetHref(eyeBaseDownAsset)
const eyeGlintHref = bundledAssetHref(eyeGlintAsset)
const eyeGlintAccentHref = bundledAssetHref(eyeGlintAccentAsset)
const eyeBlink1Href = bundledAssetHref(eyeBlink1Asset)
const eyeBlink2Href = bundledAssetHref(eyeBlink2Asset)
const eyeBlink3Href = bundledAssetHref(eyeBlink3Asset)
const EYE_BLINK_HREFS = [eyeBlink1Href, eyeBlink2Href, eyeBlink3Href] as const

/** Sclera / lid art (`base-eye`, `eye-base-up`, `eye-base-down`). */
function isEyeWhiteLidHref(href: string): boolean {
  return href === baseEyeHref || href === eyeBaseUpHref || href === eyeBaseDownHref
}

function isBlinkLidHref(href: string): boolean {
  return (EYE_BLINK_HREFS as readonly string[]).includes(href)
}

/** Opacity for sclera lid art (`base-eye`, `eye-base-up`, `eye-base-down`) — matched strength. */
const EYE_NEUTRAL_BASE_LID_OPACITY = 0.92
/** Subtracted from base / up / down lid `<image>` opacity only (0–1); glints unchanged. */
const EYE_LID_OPACITY_SUB = 0.04
/** Subtracted from blink-1 / blink-2 / blink-3 lid `<image>` opacity (0–1). */
const EYE_BLINK_FRAME_OPACITY_SUB = 0.06
/** Final multiplier on every lid `<image>` (sclera, gaze frames, blink overlays). Glints unchanged. */
const EYE_LID_OPACITY_MULT = 0.92
/** Brightness on the masked glint stack (rear + specular, pointer-driven). */
const EYE_GLINT_BRIGHTNESS = 1.3

function lidSurfaceOpacity(href: string): number {
  let raw: number
  if (isBlinkLidHref(href)) raw = Math.max(0, 1 - EYE_BLINK_FRAME_OPACITY_SUB)
  else if (isEyeWhiteLidHref(href)) raw = Math.max(0, EYE_NEUTRAL_BASE_LID_OPACITY - EYE_LID_OPACITY_SUB)
  else raw = 1
  return raw * EYE_LID_OPACITY_MULT
}

function eyeGlintMaskGroupStyle(show: boolean): CSSProperties {
  return {
    opacity: show ? 1 : 0,
    mixBlendMode: 'screen',
    filter: `brightness(${EYE_GLINT_BRIGHTNESS})`,
  }
}

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
/** Upward travel cap (screen px) for the rear eyeball; tighter than horizontal so gaze stays lower when the pointer is above the banner. */
const POINTER_MAX_SCREEN_UP_PX = 18
/**
 * Looser upward cap for the front specular only (`eyeGlintAccent`); rear still uses
 * `POINTER_MAX_SCREEN_UP_PX`.
 */
const FRONT_SPECULAR_MAX_SCREEN_UP_PX = 31
/** Shared horizontal baseline (rear layer applies `REAR_EYEBALL_POINTER_MULT_*` on top). */
const POINTER_SENSITIVITY_X = 1.06
/** Shared vertical sensitivity for both glint layers (rear + specular). */
const POINTER_SENSITIVITY_Y = 0.22
/**
 * Frontmost masked layer (`eyeGlintAccent`, second `<g>`): strong motion.
 * Rear / larger layer (`eyeGlint`, first `<g>`): `POINTER_SENSITIVITY_*` × rear multipliers — slower.
 */
const FRONT_SPECULAR_POINTER_SENSITIVITY_X = 1.1
const FRONT_SPECULAR_POINTER_Y_MULT = 1.06
const REAR_EYEBALL_POINTER_MULT_X = 0.6
const REAR_EYEBALL_POINTER_MULT_Y = 0.74
// Portrait should track pointer more subtly to avoid crowding on narrow layouts.
const PORTRAIT_POINTER_MOTION_SCALE = 0.58

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

/** Closing leg: 1→2 and 2→3 (indices 0→1→2), each step this long (ms). */
const BLINK_CLOSE_FRAME_MS = 220
/** Opening leg: 3→2 and 2→1 (indices 2→1→0), faster steps (ms). */
const BLINK_OPEN_FRAME_MS = 120
/** Full blink duration until gaze art returns (ms). */
const BLINK_TOTAL_MS = 3 * BLINK_CLOSE_FRAME_MS + 2 * BLINK_OPEN_FRAME_MS
/** Random idle gap before the next blink starts. */
const EYE_BLINK_IDLE_MIN_MS = 2800
const EYE_BLINK_IDLE_MAX_MS = 7200

function eyeBaseTwitchTransform(scaleY: number) {
  return `translate(${EYE_PIVOT_X} ${EYE_PIVOT_Y}) scale(1 ${scaleY}) translate(${-EYE_PIVOT_X} ${-EYE_PIVOT_Y})`
}

/** Two-eye layout: each eye shrunk to this fraction of the original. */
const DUAL_EYE_SCALE = 0.4
/**
 * Horizontal offset from SVG center to each eye's center (viewBox px).
 * Lower = eyes sit closer together; higher = more gap between them.
 */
const DUAL_EYE_OFFSET_X = EYE_VIEWBOX_W * 0.178

/**
 * Ellipse around each eye's center that defines the hover "close" hit area (viewBox units, before
 * each eye's wrap scale is applied — so the screen-space radius is this × `DUAL_EYE_SCALE`).
 * Decrease to make the eyes only react when the cursor is very close; increase for a looser feel.
 */
const EYE_HOVER_HIT_RX = EYE_VIEWBOX_W * 0.22
const EYE_HOVER_HIT_RY = EYE_VIEWBOX_H * 0.28
/**
 * Added to `-ox + …` for the mirrored eye’s glints (viewBox X). **Larger → highlight shifts
 * screen-left**; use smaller numbers to nudge **screen-right**.
 */
const RIGHT_EYE_GLINT_BIAS_X = 20
/** Extra term in CSS px (→ viewBox via current SVG width); same direction rule as `BIAS_X`. */
const RIGHT_EYE_GLINT_NUDGE_SCREEN_PX = 1
/** Pull right-eye glints (rear + specular) this many CSS px toward the screen-right edge. */
const RIGHT_EYE_GLINT_SHIFT_RIGHT_SCREEN_PX = 38

function viewBoxXFromScreenPx(svgWidthPx: number, screenPx: number) {
  if (!Number.isFinite(svgWidthPx) || svgWidthPx < 1) return 0
  return screenPx * (EYE_VIEWBOX_W / svgWidthPx)
}

/**
 * Outer wrapper transform that positions/shrinks one eye. `signX = -1` mirrors the whole eye
 * (base art + bounds mask + glint layers) horizontally, making the right-hand copy.
 */
function eyeWrapTransform(offsetX: number, signX: 1 | -1) {
  const cx = EYE_VIEWBOX_W * 0.5
  const cy = EYE_VIEWBOX_H * 0.5
  return `translate(${cx} ${cy}) translate(${offsetX} 0) scale(${signX * DUAL_EYE_SCALE} ${DUAL_EYE_SCALE}) translate(${-cx} ${-cy})`
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

function lidImageHref(frame: EyeBaseFrame): string {
  if (frame === 'up') return eyeBaseUpHref
  if (frame === 'down') return eyeBaseDownHref
  return baseEyeHref
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Map 0 = banner hidden → shut, 1 = banner fully visible → open. Used by `TopEyeBanner`. */
function blinkFrameIndexFromBannerReveal(p: number): 0 | 1 | 2 | null {
  const progress = clamp(p, 0, 1)
  if (progress >= 0.97) return null
  const shut = 1 - progress
  return Math.min(2, Math.floor(shut * 3)) as 0 | 1 | 2
}

type AnimatedEyesProps = {
  className?: string
  ariaLabel?: string
  /**
   * Extra multiplier on the pointer-driven glint travel (applied on top of the
   * portrait/landscape motion scale). `1` = default inline behavior; smaller
   * values dampen how far the eyes track the cursor. Tweak per-instance to
   * e.g. shrink travel inside the small top banner.
   */
  pointerMotionScale?: number
  /**
   * Multiplier on the per-eye hover hit ellipses (viewBox radii). Use `> 1` in a short
   * cropped banner so each eye is easier to target.
   */
  hoverHitScale?: number
  /**
   * When set, `current` is 0 = top banner fully hidden, 1 = fully visible — lid frames follow
   * so eyes open/close with the banner slide. Updated each scroll sample (no React state).
   */
  bannerRevealRef?: RefObject<number>
}

/**
 * Self-contained animated dual-eye SVG: pointer tracking, idle blinking, per-eye hover-close,
 * and subtle base-lid twitch. Rendered as a single `<svg>` that fills its parent width.
 * See `BrandsEyeBanner` for section usage or `TopEyeBanner` for fixed-top usage.
 */
export default function AnimatedEyes({
  className,
  ariaLabel = 'Stylized illustration of two eyes',
  pointerMotionScale = 1,
  hoverHitScale = 1,
  bannerRevealRef,
}: AnimatedEyesProps) {
  const rawId = useId()
  const maskId = `eye-bounds-mask-${rawId.replace(/:/g, '')}`
  const maskFeatherFilterId = `${maskId}-feather`

  const svgRef = useRef<SVGSVGElement>(null)
  /**
   * Cached `svgRef` bounding rect. Pointer mapping and the right-eye glint bias both need it; instead
   * of a layout read per pointer event / animation frame it is measured lazily and dropped on
   * resize + scroll, so the next reader measures once.
   */
  const svgRectRef = useRef<DOMRect | null>(null)
  const readSvgRect = useCallback(() => {
    if (!svgRectRef.current) {
      const r = svgRef.current?.getBoundingClientRect() ?? null
      // Never cache a collapsed box (e.g. before layout); try again on the next read.
      if (r && r.width >= 1 && r.height >= 1) svgRectRef.current = r
      return r
    }
    return svgRectRef.current
  }, [])

  useEffect(() => {
    const invalidate = () => {
      svgRectRef.current = null
    }
    window.addEventListener('resize', invalidate)
    window.addEventListener('scroll', invalidate, { passive: true })
    return () => {
      window.removeEventListener('resize', invalidate)
      window.removeEventListener('scroll', invalidate)
    }
  }, [])
  const baseEyeTwitchRef = useRef<SVGGElement>(null)
  const glintGroupRef = useRef<SVGGElement>(null)
  const accentGlintGroupRef = useRef<SVGGElement>(null)
  const rightBaseEyeTwitchRef = useRef<SVGGElement>(null)
  const rightGlintGroupRef = useRef<SVGGElement>(null)
  const rightAccentGlintGroupRef = useRef<SVGGElement>(null)
  const glintX = useSpring(0, spring)
  const glintY = useSpring(0, spring)
  const accentGlintX = useSpring(0, spring)
  const accentGlintY = useSpring(0, spring)

  const [eyeBaseFrame, setEyeBaseFrame] = useState<EyeBaseFrame>('neutral')
  const eyeBaseFrameRef = useRef<EyeBaseFrame>('neutral')
  /** `null` = use gaze lid art; else index into `EYE_BLINK_HREFS` for both eyes. */
  const [blinkFrameIdx, setBlinkFrame] = useState<number | null>(null)

  /**
   * Per-eye hover overrides. When non-null the eye renders this blink frame instead of the shared
   * idle-blink frame, so each eye can close independently while the cursor is over it and stay
   * closed until the cursor leaves. The shared `blinkFrameIdx` timer keeps running underneath so
   * the two eyes still blink in unison whenever neither is in hover-override.
   */
  const [leftHoverIdx, setLeftHoverIdx] = useState<number | null>(null)
  const [rightHoverIdx, setRightHoverIdx] = useState<number | null>(null)
  /** Forced blink frame from top banner reveal; `null` = banner open enough for idle blinks. */
  const [bannerRevealBlinkIdx, setBannerRevealBlinkIdx] = useState<number | null>(null)
  const bannerRevealBlinkIdxRef = useRef<number | null>(null)
  const [portraitLayout, setPortraitLayout] = useState(false)
  const hoverRx = EYE_HOVER_HIT_RX * hoverHitScale
  const hoverRy = EYE_HOVER_HIT_RY * hoverHitScale
  const leftHoverIdxRef = useRef<number | null>(null)
  const rightHoverIdxRef = useRef<number | null>(null)
  const leftHoverTimers = useRef<number[]>([])
  const rightHoverTimers = useRef<number[]>([])

  const writeLeftHover = (v: number | null) => {
    leftHoverIdxRef.current = v
    setLeftHoverIdx(v)
  }
  const writeRightHover = (v: number | null) => {
    rightHoverIdxRef.current = v
    setRightHoverIdx(v)
  }
  const clearHoverTimers = (arr: React.MutableRefObject<number[]>) => {
    arr.current.forEach((id) => window.clearTimeout(id))
    arr.current = []
  }

  const startHoverClose = (side: 'L' | 'R') => {
    const timers = side === 'L' ? leftHoverTimers : rightHoverTimers
    const write = side === 'L' ? writeLeftHover : writeRightHover
    const ref = side === 'L' ? leftHoverIdxRef : rightHoverIdxRef
    clearHoverTimers(timers)
    const start = ref.current === null ? 0 : ref.current
    write(start)
    let d = 0
    for (let f = start + 1; f <= 2; f += 1) {
      d += BLINK_CLOSE_FRAME_MS
      timers.current.push(window.setTimeout(() => write(f), d))
    }
  }

  const startHoverOpen = (side: 'L' | 'R') => {
    const timers = side === 'L' ? leftHoverTimers : rightHoverTimers
    const write = side === 'L' ? writeLeftHover : writeRightHover
    const ref = side === 'L' ? leftHoverIdxRef : rightHoverIdxRef
    clearHoverTimers(timers)
    const start = ref.current
    if (start === null) return
    let d = 0
    for (let f = start - 1; f >= 0; f -= 1) {
      d += BLINK_OPEN_FRAME_MS
      timers.current.push(window.setTimeout(() => write(f), d))
    }
    d += BLINK_OPEN_FRAME_MS
    timers.current.push(window.setTimeout(() => write(null), d))
  }

  useEffect(() => {
    const leftTimersRef = leftHoverTimers
    const rightTimersRef = rightHoverTimers
    return () => {
      clearHoverTimers(leftTimersRef)
      clearHoverTimers(rightTimersRef)
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const sync = () => setPortraitLayout(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /**
   * Pre-decode the blink frames once on mount. Without this, the first swap to a fresh `<image>`
   * href takes a tick to decode and the specular briefly shows through between frames.
   */
  useEffect(() => {
    EYE_BLINK_HREFS.forEach((href) => {
      const img = new window.Image()
      img.decoding = 'async'
      img.src = href
    })
  }, [])

  const syncGlintGroupTransform = (g: SVGGElement | null, ox: number, oy: number) => {
    if (!g) return
    g.setAttribute(
      'transform',
      `translate(${EYE_PIVOT_X} ${EYE_PIVOT_Y}) translate(${ox} ${oy}) scale(${EYE_BALL_DISPLAY_SCALE}) translate(${-EYE_PIVOT_X} ${-EYE_PIVOT_Y})`,
    )
  }

  // Effect Event: effects read it without listing it as a dependency (it only reads refs + constants).
  const rightGlintBiasX = useEffectEvent(() => {
    const w = readSvgRect()?.width ?? EYE_VIEWBOX_W
    return (
      RIGHT_EYE_GLINT_BIAS_X +
      viewBoxXFromScreenPx(w, RIGHT_EYE_GLINT_NUDGE_SCREEN_PX) -
      viewBoxXFromScreenPx(w, RIGHT_EYE_GLINT_SHIFT_RIGHT_SCREEN_PX)
    )
  })

  useLayoutEffect(() => {
    const ox = EYE_BALL_REST_OFFSET_X
    const rx = rightGlintBiasX()
    syncGlintGroupTransform(glintGroupRef.current, ox, 0)
    syncGlintGroupTransform(accentGlintGroupRef.current, ox, 0)
    syncGlintGroupTransform(rightGlintGroupRef.current, -ox + rx, 0)
    syncGlintGroupTransform(rightAccentGlintGroupRef.current, -ox + rx, 0)
  }, [])

  useLayoutEffect(() => {
    if (!bannerRevealRef) return
    const next = blinkFrameIndexFromBannerReveal(bannerRevealRef.current)
    bannerRevealBlinkIdxRef.current = next
    setBannerRevealBlinkIdx(next)
  }, [bannerRevealRef])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let squished = false
    const tick = () => {
      squished = !squished
      const t = eyeBaseTwitchTransform(squished ? EYE_BASE_TWITCH_SCALE_Y : 1)
      baseEyeTwitchRef.current?.setAttribute('transform', t)
      rightBaseEyeTwitchRef.current?.setAttribute('transform', t)
    }
    const id = window.setInterval(tick, EYE_BASE_TWITCH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timeouts: number[] = []
    let cancelled = false

    const playBlink = () => {
      if (cancelled) return
      setBlinkFrame(0)
      const t1 = BLINK_CLOSE_FRAME_MS
      const t2 = 2 * BLINK_CLOSE_FRAME_MS
      const t3 = 3 * BLINK_CLOSE_FRAME_MS
      const t4 = 3 * BLINK_CLOSE_FRAME_MS + BLINK_OPEN_FRAME_MS
      const t5 = BLINK_TOTAL_MS
      timeouts.push(window.setTimeout(() => !cancelled && setBlinkFrame(1), t1))
      timeouts.push(window.setTimeout(() => !cancelled && setBlinkFrame(2), t2))
      timeouts.push(window.setTimeout(() => !cancelled && setBlinkFrame(1), t3))
      timeouts.push(window.setTimeout(() => !cancelled && setBlinkFrame(0), t4))
      timeouts.push(window.setTimeout(() => !cancelled && setBlinkFrame(null), t5))
    }

    const scheduleAfterIdle = () => {
      const idle =
        EYE_BLINK_IDLE_MIN_MS + Math.random() * (EYE_BLINK_IDLE_MAX_MS - EYE_BLINK_IDLE_MIN_MS)
      timeouts.push(
        window.setTimeout(() => {
          if (cancelled) return
          playBlink()
          timeouts.push(
            window.setTimeout(() => {
              if (!cancelled) scheduleAfterIdle()
            }, BLINK_TOTAL_MS),
          )
        }, idle),
      )
    }

    scheduleAfterIdle()
    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
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
      // Background tab: nothing is painted, so skip the spring reads, layout read and DOM writes.
      if (document.hidden) return
      if (bannerRevealRef) {
        const reveal = bannerRevealRef.current
        const bNext = blinkFrameIndexFromBannerReveal(reveal)
        if (bNext !== bannerRevealBlinkIdxRef.current) {
          bannerRevealBlinkIdxRef.current = bNext
          setBannerRevealBlinkIdx(bNext)
        }
        // Banner fully tucked away: keep the loop scheduled but do no work until it slides back in.
        if (reveal === 0) return
      }
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
      const rx = rightGlintBiasX()
      syncGlintGroupTransform(glintGroupRef.current, ox, oy)
      syncGlintGroupTransform(accentGlintGroupRef.current, ax, ay)
      syncGlintGroupTransform(rightGlintGroupRef.current, -ox + rx, oy)
      syncGlintGroupTransform(rightAccentGlintGroupRef.current, -ax + rx, ay)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [glintX, glintY, accentGlintX, accentGlintY, bannerRevealRef])

  useEffect(() => {
    const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let pointerRafId = 0
    let pointerX = 0
    let pointerY = 0

    const applyPointer = () => {
      pointerRafId = 0
      const r = readSvgRect()
      if (!r || r.width < 1 || r.height < 1) return
      const cx = r.left + r.width * 0.5
      const cy = r.top + r.height * 0.5
      const nx = (pointerX - cx) / (r.width * 0.5)
      const ny = (pointerY - cy) / (r.height * 0.5)

      const vh = Math.max(1, window.innerHeight)
      const nyLid = clamp((pointerY - vh * 0.5) / (vh * 0.5), -1, 1)
      const nextFrame = lidFrameFromNyLid(nyLid)
      if (nextFrame !== eyeBaseFrameRef.current) {
        eyeBaseFrameRef.current = nextFrame
        setEyeBaseFrame(nextFrame)
      }

      if (reduceMotionMq.matches) return
      const motionScale =
        (portraitLayout ? PORTRAIT_POINTER_MOTION_SCALE : 1) * pointerMotionScale

      const txPxRear = clamp(
        nx * POINTER_MAX_SCREEN_PX * POINTER_SENSITIVITY_X * REAR_EYEBALL_POINTER_MULT_X,
        -POINTER_MAX_SCREEN_PX,
        POINTER_MAX_SCREEN_PX,
      )
      const rawTyPxRear =
        ny * POINTER_MAX_SCREEN_PX * POINTER_SENSITIVITY_Y * REAR_EYEBALL_POINTER_MULT_Y
      const tyPxRear = clamp(rawTyPxRear, -POINTER_MAX_SCREEN_UP_PX, POINTER_MAX_SCREEN_PX)
      glintX.set(txPxRear * motionScale * (EYE_VIEWBOX_W / r.width))
      glintY.set(tyPxRear * motionScale * (EYE_VIEWBOX_H / r.height))

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
      accentGlintX.set(txPxFront * motionScale * (EYE_VIEWBOX_W / r.width))
      accentGlintY.set(tyPxFront * motionScale * (EYE_VIEWBOX_H / r.height))
    }

    /** Coalesce `pointermove`: keep only the latest coords and map them once per frame. */
    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX
      pointerY = e.clientY
      if (!pointerRafId) pointerRafId = requestAnimationFrame(applyPointer)
    }

    const reset = () => {
      glintX.set(0)
      glintY.set(0)
      accentGlintX.set(0)
      accentGlintY.set(0)
      eyeBaseFrameRef.current = 'neutral'
      setEyeBaseFrame('neutral')
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', reset)
    return () => {
      if (pointerRafId) cancelAnimationFrame(pointerRafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', reset)
    }
  }, [glintX, glintY, accentGlintX, accentGlintY, portraitLayout, pointerMotionScale, readSvgRect])

  /** Hover wins; then top-banner reveal sync; then shared idle blink. */
  const sharedBlinkIdx =
    bannerRevealRef && bannerRevealBlinkIdx !== null ? bannerRevealBlinkIdx : blinkFrameIdx
  const leftFrameIdx = leftHoverIdx ?? sharedBlinkIdx
  const rightFrameIdx = rightHoverIdx ?? sharedBlinkIdx
  const leftLidHref =
    leftFrameIdx !== null ? EYE_BLINK_HREFS[leftFrameIdx] : lidImageHref(eyeBaseFrame)
  const rightLidHref =
    rightFrameIdx !== null ? EYE_BLINK_HREFS[rightFrameIdx] : lidImageHref(eyeBaseFrame)
  const leftLidKey = leftFrameIdx !== null ? `blink-${leftFrameIdx}` : eyeBaseFrame
  const rightLidKey = rightFrameIdx !== null ? `blink-${rightFrameIdx}` : eyeBaseFrame
  const leftLidOpacity = lidSurfaceOpacity(leftLidHref)
  const rightLidOpacity = lidSurfaceOpacity(rightLidHref)
  /** Blink frames share one opacity curve (see `lidSurfaceOpacity`). */
  const blinkCoverOpacity = lidSurfaceOpacity(eyeBlink1Href)

  const showLeftGlints = leftFrameIdx === null
  const showRightGlints = rightFrameIdx === null

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${EYE_VIEWBOX_W} ${EYE_VIEWBOX_H}`}
      className={className ?? 'relative z-0 block h-auto w-full'}
      role="img"
      aria-label={ariaLabel}
    >
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
            href={eyeBoundsHref}
            width={EYE_VIEWBOX_W}
            height={EYE_VIEWBOX_H}
            preserveAspectRatio="none"
            filter={`url(#${maskFeatherFilterId})`}
          />
        </mask>
      </defs>

      <g transform={eyeWrapTransform(-DUAL_EYE_OFFSET_X, 1)}>
        <g ref={baseEyeTwitchRef} transform={eyeBaseTwitchTransform(1)}>
          <image
            key={`L-${leftLidKey}`}
            href={leftLidHref}
            width={EYE_VIEWBOX_W}
            height={EYE_VIEWBOX_H}
            preserveAspectRatio="none"
            opacity={leftLidOpacity}
          />
        </g>

        <g mask={`url(#${maskId})`} style={eyeGlintMaskGroupStyle(showLeftGlints)}>
          <rect width={EYE_VIEWBOX_W} height={EYE_VIEWBOX_H} fill="#000000" />
          <g ref={glintGroupRef}>
            <image
              href={eyeGlintHref}
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
            />
          </g>
          <g ref={accentGlintGroupRef} style={{ mixBlendMode: 'screen' }}>
            <image
              href={eyeGlintAccentHref}
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
            />
          </g>
        </g>

        {/* Blink overlays on top of glints; `visibility` toggles avoid decode flicker. */}
        {EYE_BLINK_HREFS.map((coverHref, i) => (
          <image
            key={`L-blink-cover-${i}`}
            href={coverHref}
            width={EYE_VIEWBOX_W}
            height={EYE_VIEWBOX_H}
            preserveAspectRatio="none"
            opacity={blinkCoverOpacity}
            visibility={leftFrameIdx === i ? 'visible' : 'hidden'}
          />
        ))}

        <ellipse
          cx={EYE_PIVOT_X}
          cy={EYE_PIVOT_Y}
          rx={hoverRx}
          ry={hoverRy}
          fill="transparent"
          pointerEvents="all"
          style={{ cursor: 'inherit' }}
          onPointerEnter={() => startHoverClose('L')}
          onPointerLeave={() => startHoverOpen('L')}
        />
      </g>

      <g transform={eyeWrapTransform(DUAL_EYE_OFFSET_X, -1)}>
        <g ref={rightBaseEyeTwitchRef} transform={eyeBaseTwitchTransform(1)}>
          <image
            key={`R-${rightLidKey}`}
            href={rightLidHref}
            width={EYE_VIEWBOX_W}
            height={EYE_VIEWBOX_H}
            preserveAspectRatio="none"
            opacity={rightLidOpacity}
          />
        </g>

        <g mask={`url(#${maskId})`} style={eyeGlintMaskGroupStyle(showRightGlints)}>
          <rect width={EYE_VIEWBOX_W} height={EYE_VIEWBOX_H} fill="#000000" />
          <g ref={rightGlintGroupRef}>
            <image
              href={eyeGlintHref}
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
            />
          </g>
          <g ref={rightAccentGlintGroupRef} style={{ mixBlendMode: 'screen' }}>
            <image
              href={eyeGlintAccentHref}
              width={EYE_VIEWBOX_W}
              height={EYE_VIEWBOX_H}
              preserveAspectRatio="none"
            />
          </g>
        </g>

        {EYE_BLINK_HREFS.map((coverHref, i) => (
          <image
            key={`R-blink-cover-${i}`}
            href={coverHref}
            width={EYE_VIEWBOX_W}
            height={EYE_VIEWBOX_H}
            preserveAspectRatio="none"
            opacity={blinkCoverOpacity}
            visibility={rightFrameIdx === i ? 'visible' : 'hidden'}
          />
        ))}

        <ellipse
          cx={EYE_PIVOT_X}
          cy={EYE_PIVOT_Y}
          rx={hoverRx}
          ry={hoverRy}
          fill="transparent"
          pointerEvents="all"
          style={{ cursor: 'inherit' }}
          onPointerEnter={() => startHoverClose('R')}
          onPointerLeave={() => startHoverOpen('R')}
        />
      </g>
    </svg>
  )
}
