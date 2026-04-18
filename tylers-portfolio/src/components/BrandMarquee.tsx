'use client'

import type { Brand } from '@/types'
import {
  brandMarqueeAsSeenOnConfig,
  brandMarqueeTracksConfig,
} from '@/config/brandMarquee'
import { bannerTypeEyebrowLight } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'
import type { CSSProperties } from 'react'

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

  const img = (
    <img
      src={brand.logoSrc}
      alt={brand.name}
      decoding="async"
      className="block h-auto w-auto max-w-full object-contain object-center opacity-50 grayscale transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
      style={{ maxHeight: slotH, maxWidth: maxW, width: 'auto', height: 'auto' }}
    />
  )

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
        {img}
      </a>
    ) : (
      <span className="m-0 inline-flex max-w-full items-center justify-center border-0 p-0" data-cursor="expand">
        {img}
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
  const seen = brandMarqueeAsSeenOnConfig
  const tracks = brandMarqueeTracksConfig
  const seenStyle = {
    marginBottom: `${seen.marginBottomPx}px`,
    transform: `translateY(${seen.offsetYPx}px)`,
    ...(typeof seen.labelFontSizePx === 'number'
      ? { fontSize: `${seen.labelFontSizePx}px`, lineHeight: 1.05 }
      : {}),
  }

  const brandsSectionStyle = {
    ['--brand-marquee-duration']: `${tracks.marqueeDurationSec}s`,
    ['--brand-marquee-logo-gap']: `${tracks.logoGapPx}px`,
  } as CSSProperties

  return (
    <section
      id="brands"
      className="relative z-[1] pt-16 pb-2 -mt-[200px] overflow-hidden"
      style={brandsSectionStyle}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: '#000000',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 220px)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 220px)',
        }}
      />
      <div className="relative z-[1]">
        <ScrollReveal>
          <p
            className={cn(
              'block text-center',
              bannerTypeEyebrowLight,
              seen.labelTextClassName ?? ''
            )}
            style={seenStyle}
          >
            {seen.label}
          </p>
        </ScrollReveal>

        <div
          className="flex flex-col"
          style={{ gap: `${tracks.rowGapPx}px` }}
        >
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
