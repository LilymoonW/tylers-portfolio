"use client";

import type { Brand } from "@/types";
import { brandMarqueeTracksConfig } from "@/config/brandMarquee";
import { bannerTypeBase } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useInViewActive } from "@/hooks/useInViewActive";

function BrandLogoSlot({
  brand,
  logoMaxHeightPx,
  logoSlotMaxWidthPx,
}: {
  brand: Brand;
  logoMaxHeightPx: number;
  logoSlotMaxWidthPx: number;
}) {
  const scale = brand.logoScale ?? 1;
  const slotH = Math.round(logoMaxHeightPx * scale);
  const slotW = logoSlotMaxWidthPx;
  const brightness = brand.logoBrightness;

  /*
   * Fixed-size slot so `next/image fill` has a positioned ancestor with known
   * dimensions → Next.js serves the logo as WebP/AVIF automatically (vs the
   * old `<img>` which always served the original PNG). `object-contain` keeps
   * aspect ratio; the slot width is uniform so marquee gaps are consistent.
   */
  const imgEl = (
    <div className="relative" style={{ width: slotW, height: slotH }}>
      <Image
        src={brand.logoSrc}
        alt={brand.name}
        fill
        sizes={`${slotW}px`}
        className="brand-logo-img object-contain object-center opacity-50 transition-[opacity,filter] duration-300 group-hover/logo:opacity-100"
        style={brightness != null ? ({ '--logo-brightness': brightness } as CSSProperties) : undefined}
        loading="eager"
      />
    </div>
  );

  const href = brand.url?.trim();
  const inner =
    href != null && href !== "" ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="m-0 flex items-center justify-center border-0 p-0 no-underline outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
      >
        {imgEl}
      </a>
    ) : (
      <span className="m-0 flex items-center justify-center border-0 p-0">
        {imgEl}
      </span>
    );

  return (
    <div
      className="brand-logo group/logo box-border shrink-0"
      style={{ width: slotW, height: slotH, flex: "0 0 auto" }}
      title={brand.name}
    >
      {inner}
    </div>
  );
}

function MarqueeTrack({
  trackId,
  brands,
  direction,
  logoMaxHeightPx,
  logoSlotMaxWidthPx,
}: {
  /** Keeps React keys (and mental model) disjoint from the other row even if `brand.id` repeats. */
  trackId: "top" | "bottom";
  brands: Brand[];
  direction: "forward" | "reverse";
  logoMaxHeightPx: number;
  logoSlotMaxWidthPx: number;
}) {
  /*
   * Two copies per strip is deliberate. The `-50%` keyframe only needs the two strips to be
   * identical, but one strip must also be at least as wide as the viewport or the row's far
   * edge shows through at the end of every loop; a single copy is only ~1120-1344px here.
   */
  return (
    <div className="brand-marquee-row">
      <div
        className={cn(
          "brand-marquee-track",
          direction === "reverse" && "brand-marquee-track--reverse",
        )}
      >
        <div className="brand-marquee-strip">
          {brands.map((brand, i) => (
            <BrandLogoSlot
              key={`${trackId}-${brand.id}-${direction}-${i}`}
              brand={brand}
              logoMaxHeightPx={logoMaxHeightPx}
              logoSlotMaxWidthPx={logoSlotMaxWidthPx}
            />
          ))}
        </div>
        <div className="brand-marquee-strip" aria-hidden>
          {brands.map((brand, i) => (
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
  );
}

export default function BrandMarquee({
  topRow,
  bottomRow,
}: {
  topRow: Brand[];
  bottomRow: Brand[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isActive = useInViewActive(sectionRef, {
    rootMargin: "0px",
    threshold: 0,
  });
  const tracks = brandMarqueeTracksConfig;

  const brandsSectionStyle = {
    ["--brand-marquee-duration"]: `${tracks.marqueeDurationSec}s`,
    ["--brand-marquee-logo-gap"]: `${tracks.logoGapPx}px`,
    ["--brand-marquee-play-state"]: isActive ? "running" : "paused",
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="brands"
      /* In normal flow on the dark column. z-30 keeps the moving logos above the fixed grain (z-20). */
      className="relative z-[30] pt-8 pb-24"
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
        <div
          className="flex w-full min-w-0 flex-col"
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
  );
}
