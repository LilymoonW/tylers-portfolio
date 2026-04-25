'use client'

import type { Brand } from '@/types'
import { brandMarqueeTracksConfig } from '@/config/brandMarquee'
import { bannerTypeBase } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import { useRef, type CSSProperties } from 'react'
import { useInViewActive } from '@/hooks/useInViewActive'

function BrandLogoSlot({
  brand,
  logoMaxHeightPx,
  logoSlotMaxWidthPx,
}: {
  brand: Brand
  logoMaxHeightPx: number
  logoSlotMaxWidthPx: number
}) {
  const scale = brand.logoScale ?? 1
  const slotH = Math.round(logoMaxHeightPx * scale)
  /** Cell width follows rendered logo (≤ max); strip `gap` is edge clearance → center pitch = w₁/2 + gap + w₂/2. */
  const maxW = logoSlotMaxWidthPx
  const brightness = brand.logoBrightness

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- marquee logos are small, local assets with fixed slot sizing
    <img
      src={brand.logoSrc}
      alt={brand.name}
      className="block h-auto w-auto max-w-full object-contain object-center opacity-50 grayscale transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
      style={{ maxHeight: slotH, maxWidth: maxW, width: 'auto', height: 'auto' }}
      loading="lazy"
      decoding="async"
    />
  )

  const imgNode =
    brightness != null ?
      (
        <span
          className="inline-flex max-w-full items-center justify-center"
          style={{ filter: `brightness(${brightness})` }}
        >
          {img}
        </span>
      ) :
      img

  const href = brand.url?.trim()
  const inner =
    href != null && href !== '' ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="m-0 inline-flex max-w-full items-center justify-center border-0 p-0 no-underline outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
        data-cursor="expand"
      >
        {imgNode}
      </a>
    ) : (
      <span className="m-0 inline-flex max-w-full items-center justify-center border-0 p-0" data-cursor="expand">
        {imgNode}
      </span>
    )

  return (
    <div
      className="group/logo box-border inline-flex max-w-full shrink-0 items-center justify-center"
      style={{
        height: slotH,
        maxWidth: maxW,
        flex: '0 0 auto',
        width: 'max-content',
      }}
      title={brand.name}
    >
      {inner}
    </div>
  )
}

function MarqueeTrack({
  trackId,
  brands,
  direction,
  logoMaxHeightPx,
  logoSlotMaxWidthPx,
}: {
  /** Keeps React keys (and mental model) disjoint from the other row even if `brand.id` repeats. */
  trackId: 'top' | 'bottom'
  brands: Brand[]
  direction: 'forward' | 'reverse'
  logoMaxHeightPx: number
  logoSlotMaxWidthPx: number
}) {
  const doubled = [...brands, ...brands]

  return (
    <div className="brand-marquee-row">
      <div
        className={cn(
          'brand-marquee-track',
          direction === 'reverse' && 'brand-marquee-track--reverse'
        )}
      >
        <div className="brand-marquee-strip">
          {doubled.map((brand, i) => (
            <BrandLogoSlot
              key={`${trackId}-${brand.id}-${direction}-${i}`}
              brand={brand}
              logoMaxHeightPx={logoMaxHeightPx}
              logoSlotMaxWidthPx={logoSlotMaxWidthPx}
            />
          ))}
        </div>
        <div className="brand-marquee-strip" aria-hidden>
          {doubled.map((brand, i) => (
            <BrandLogoSlot
              key={`${trackId}-${brand.id}-${direction}-dup-${i}`}
              brand={brand}
              logoMaxHeightPx={logoMaxHeightPx}
              logoSlotMaxWidthPx={logoSlotMaxWidthPx}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BrandMarquee({
  topRow,
  bottomRow,
}: {
  topRow: Brand[]
  bottomRow: Brand[]
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const isActive = useInViewActive(sectionRef, { rootMargin: '0px', threshold: 0 })
  const tracks = brandMarqueeTracksConfig

  const brandsSectionStyle = {
    ['--brand-marquee-duration']: `${tracks.marqueeDurationSec}s`,
    ['--brand-marquee-logo-gap']: `${tracks.logoGapPx}px`,
    ['--brand-marquee-play-state']: isActive ? 'running' : 'paused',
  } as CSSProperties

  return (
    <section
      ref={sectionRef}
      id="brands"
      /*
       * `pb-40` (160px) gives the backdrop gradient runway below the last
       * logo row. Without it, the gradient container is too short to reach
       * its fully-opaque stop (#000 at 520px), so it ends at ~0.57 alpha
       * black right under the logos — which reads as a hard horizontal edge
       * where it meets the solid parent black. With the extra bottom space
       * the gradient fully resolves to #000 before the section ends.
       *
       * `-mb-40` reclaims that space in layout so downstream sections don't
       * shift.
       */
      className="relative z-[10] pt-8 pb-24 -mt-[320px] -mb-24"
      style={brandsSectionStyle}
    >
      <div className="relative z-[1] w-full min-w-0">
        <h2
          className={cn(
            bannerTypeBase,
            "mb-8 text-center text-base leading-none text-white/65",
          )}
        >
          AS SEEN ON
        </h2>
        <div className="flex w-full min-w-0 flex-col" style={{ gap: `${tracks.rowGapPx}px` }}>
          <MarqueeTrack
            trackId="top"
            brands={topRow}
            direction="forward"
            logoMaxHeightPx={tracks.logoMaxHeightPx}
            logoSlotMaxWidthPx={tracks.logoSlotMaxWidthPx}
          />
          <MarqueeTrack
            trackId="bottom"
            brands={bottomRow}
            direction="reverse"
            logoMaxHeightPx={tracks.logoMaxHeightPx}
            logoSlotMaxWidthPx={tracks.logoSlotMaxWidthPx}
          />
        </div>
      </div>
    </section>
  )
}
