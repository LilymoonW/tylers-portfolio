"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import type { Project } from "@/types";
import { bannerTypeBase, bannerTypeChip } from "@/config/scrollBanner";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useInViewActive } from "@/hooks/useInViewActive";
import { cn } from "@/lib/utils";
import ProjectsGrid from "@/components/work/ProjectsGrid";
import FilmGrain from "@/components/FilmGrain";

type FilterValue = "all" | string;

// SVG alpha mask for the hero fill behind PORTFOLIO (same defs as the wordmark mask).
const PORTFOLIO_HERO_FILL_MASK = "url(#portfolio-reveal-mask)";

export default function WorkPageClient({ projects }: { projects: Project[] }) {
  const lenis = useLenis();
  // Always open the portfolio at the top (hero + filters), not mid-scroll in the
  // wheel scrub track — avoids browser scroll restoration / bfcache landing in the pin.
  useLayoutEffect(() => {
    const goTop = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    };
    goTop();
    const id = requestAnimationFrame(goTop);
    return () => cancelAnimationFrame(id);
  }, [lenis]);
  const [brand, setBrand] = useState<FilterValue>("all");
  const [year, setYear] = useState<FilterValue>("all");
  const [sortOpen, setSortOpen] = useState(false);

  const activeFilterCount =
    (brand !== "all" ? 1 : 0) + (year !== "all" ? 1 : 0);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([name]) => name);
  }, [projects]);
  const years = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => String(p.year)))).sort(
        (a, b) => Number(b) - Number(a),
      ),
    [projects],
  );

  const filtered = useMemo(() => {
    return [...projects]
      .filter((p) => {
        if (brand !== "all" && p.brand !== brand) return false;
        if (year !== "all" && String(p.year) !== year) return false;
        return true;
      })
      .sort((a, b) => b.viewCount - a.viewCount || b.year - a.year);
  }, [projects, brand, year]);

  const resetFilters = () => {
    setBrand("all");
    setYear("all");
  };

  // Text blur uses sprung `tmx/tmy` so the soft pocket trails the cursor.
  // Pointer `tmxRaw/tmyRaw` feed those springs (same box as the <h1> masks).
  const sharpHeadingRef = useRef<HTMLHeadingElement>(null);
  const portfolioHeroRef = useRef<HTMLDivElement>(null);
  const heroSpotlightActive = useInViewActive(portfolioHeroRef, {
    rootMargin: "0px",
    threshold: 0,
  });
  const tmxRaw = useMotionValue(50);
  const tmyRaw = useMotionValue(50);
  // Soft trailing springs. Lower stiffness / higher mass = more lag.
  // Tuned for a visible ~200 ms catch-up — the halo clearly trails the
  // cursor instead of sticking to it.
  const springConfig = { stiffness: 120, damping: 28, mass: 1 };
  const tmx = useSpring(tmxRaw, springConfig);
  const tmy = useSpring(tmyRaw, springConfig);

  // Portrait / vertical viewports: tighter halos so blurs do not dominate the
  // narrow wordmark (CSS filter blur + SVG mask blur + smaller mask pockets).
  const [portraitLayout, setPortraitLayout] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(orientation: portrait)");
    const sync = () => setPortraitLayout(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // One clamp for every PORTFOLIO layer (SVG mask + h1s) so portrait
  // shrink stays aligned and centered in the existing `inline-grid` stack.
  // Low minimums + vw so “PORTFOLIO” can shrink on very narrow viewports (was 4.2rem
  // min in landscape, which overflowed and looked off-center).
  const portfolioHeroFontSize = useMemo(
    () =>
      portraitLayout
        ? "clamp(1.75rem, min(12vw, 12dvh), 5.4rem)"
        : "clamp(2rem, 11.5vw, 9.6rem)",
    [portraitLayout],
  );
  const portfolioHeroPadding = useMemo(
    () => (portraitLayout ? "0.32em 0.45em" : "0.35em 0.5em"),
    [portraitLayout],
  );
  // Italic uppercase glyphs read optically right-heavy; nudge left so the
  // wordmark feels centered to the eye on both desktop and portrait.
  // Smaller nudge on thin widths would need resize state; very light nudge only.
  const portfolioVisualCenterOffset = useMemo(
    () => (portraitLayout ? "-0.01em" : "-0.012em"),
    [portraitLayout],
  );
  // Expand the shared hero box so blurred mask “feathers” and the fill gradient
  // can reach the outer edges without a rectangular clip (larger = softer falloff to white).
  const portfolioHeroBleedPadding = useMemo(
    () =>
      portraitLayout
        ? "clamp(1.35rem, 9vw, 5.2rem)"
        : "clamp(1.5rem, 11vw, 9.5rem)",
    [portraitLayout],
  );

  useEffect(() => {
    if (!heroSpotlightActive) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (pending == null) return;
      const { x: clientX, y: clientY } = pending;
      pending = null;
      const textEl = sharpHeadingRef.current;
      if (!textEl) return;
      const r = textEl.getBoundingClientRect();
      if (r.width >= 1 && r.height >= 1) {
        tmxRaw.set(((clientX - r.left) / r.width) * 100);
        tmyRaw.set(((clientY - r.top) / r.height) * 100);
      }
    };

    const schedule = (clientX: number, clientY: number) => {
      pending = { x: clientX, y: clientY };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onMouseMove = (event: MouseEvent) =>
      schedule(event.clientX, event.clientY);
    const onTouch = (event: TouchEvent) => {
      const t = event.touches[0] ?? event.changedTouches[0];
      if (t) schedule(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tmxRaw, tmyRaw, heroSpotlightActive]);

  useEffect(() => {
    if (heroSpotlightActive) return;
    tmxRaw.set(50);
    tmyRaw.set(50);
  }, [heroSpotlightActive, tmxRaw, tmyRaw]);

  // Radial masks for the duplicated PORTFOLIO text. Softer outer stops so the
  // pocket does not cut off with a visible rectangular alpha cliff.
  const textSharpMask = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, transparent 0px, transparent min(4vmin, 20px), rgba(0,0,0,0.4) min(8vmin, 34px), black min(14vmin, 55px))`;
  const textSharpMaskPortrait = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, transparent 0px, transparent min(3vmin, 14px), rgba(0,0,0,0.4) min(6vmin, 24px), black min(10vmin, 40px))`;
  const textBlurRevealMask = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, black 0px, black min(11vmin, 48px), rgba(0,0,0,0.78) min(15vmin, 62px), rgba(0,0,0,0.42) min(19vmin, 78px), rgba(0,0,0,0.16) min(24vmin, 96px), transparent min(34vmin, 150px))`;
  const textBlurRevealMaskPortrait = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, black 0px, black min(8vmin, 34px), rgba(0,0,0,0.78) min(11vmin, 44px), rgba(0,0,0,0.42) min(14vmin, 55px), rgba(0,0,0,0.16) min(18vmin, 68px), transparent min(24vmin, 105px))`;

  return (
    <main className="relative isolate min-h-screen overflow-visible bg-white text-black">
      <FilmGrain className="absolute inset-0 z-[1]" />
      <div className="relative z-[2]">
        <section className="mx-auto w-full max-w-[1400px] overflow-visible px-3 min-[420px]:px-5 sm:px-6 pt-10 md:pt-14">
          <div className="flex items-center justify-between">
            <Link
              href="/contact"
              className={cn(
                bannerTypeChip,
                "uppercase text-black/70 transition hover:text-black hover:underline underline-offset-4 decoration-1",
              )}
            >
              CONTACT
            </Link>
            <Link
              href="/"
              className={cn(
                bannerTypeChip,
                "uppercase text-black/70 transition hover:text-black hover:underline underline-offset-4 decoration-1",
              )}
            >
              HOME
            </Link>
          </div>

          {/* Keep hero centered in the section/content axis. */}
          <div className="relative mt-4 w-full overflow-visible">
            {/* PORTFOLIO — gradient + mask live in the same box as the <h1>s so
              spotlight `%` shares the heading's coordinate system (the old
              full-bleed layer used different springs and often missed the
              letterform mask entirely). */}
            <div className="relative z-[1] flex w-full min-w-0 justify-center overflow-visible py-16 md:py-24">
              <div
                ref={portfolioHeroRef}
                className="relative mx-auto inline-grid w-full min-w-0 max-w-full place-items-center justify-items-center overflow-visible"
                style={{
                  padding: portfolioHeroBleedPadding,
                  transform: `translateX(${portfolioVisualCenterOffset})`,
                }}
              >
                <svg
                  aria-hidden
                  focusable="false"
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
                  style={{ overflow: "visible" }}
                >
                  <defs>
                    {/* Large filter region + no clip on <mask>: SVG masks default to
                      overflow:hidden, which cuts off feGaussianBlur and draws a
                      hard rectangular edge behind the wordmark. */}
                    <filter
                      id="portfolio-mask-blur"
                      x="-160%"
                      y="-160%"
                      width="420%"
                      height="420%"
                    >
                      <feGaussianBlur stdDeviation="28" />
                    </filter>
                    <filter
                      id="portfolio-mask-blur-portrait"
                      x="-160%"
                      y="-160%"
                      width="420%"
                      height="420%"
                    >
                      <feGaussianBlur stdDeviation="17" />
                    </filter>
                    <mask
                      id="portfolio-reveal-mask"
                      maskUnits="userSpaceOnUse"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                      overflow="visible"
                      style={{ maskType: "alpha" }}
                    >
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        filter={
                          portraitLayout
                            ? "url(#portfolio-mask-blur-portrait)"
                            : "url(#portfolio-mask-blur)"
                        }
                        style={{
                          fontSize: portfolioHeroFontSize,
                          fontFamily:
                            "var(--font-display), 'Bebas Neue', system-ui, sans-serif",
                          fontWeight: 700,
                          fontStyle: "italic",
                          letterSpacing: "-0.03em",
                          textTransform: "uppercase",
                        }}
                      >
                        PORTFOLIO
                      </text>
                    </mask>
                  </defs>
                </svg>

                <motion.div
                  className="pointer-events-none absolute inset-0 z-0 overflow-visible"
                  style={{
                    maskImage: PORTFOLIO_HERO_FILL_MASK,
                    WebkitMaskImage: PORTFOLIO_HERO_FILL_MASK,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskMode: "alpha",
                  }}
                >
                  {/* Static light fill (liquid WebGL removed). */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 100% 90% at 50% 42%, rgb(245 252 255) 0%, rgb(232 248 255) 35%, rgb(214 238 252) 68%, rgb(196 228 248) 100%)",
                    }}
                  />
                  <FilmGrain className="absolute inset-0 z-[1]" />
                </motion.div>

                {/* Royal blue glow — two stacked copies + heavy blur so the halo reads clearly under the black blur. */}
                <motion.h1
                  aria-hidden
                  className="relative z-[0] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-[#4169E1]"
                  style={{
                    gridArea: "1 / 1",
                    fontSize: portfolioHeroFontSize,
                    padding: portfolioHeroPadding,
                    filter: portraitLayout ? "blur(5px)" : "blur(8px)",
                    maskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    WebkitMaskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    maskMode: "alpha",
                  }}
                >
                  PORTFOLIO
                </motion.h1>
                <motion.h1
                  aria-hidden
                  className="relative z-[0] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-[#4169E1]"
                  style={{
                    gridArea: "1 / 1",
                    fontSize: portfolioHeroFontSize,
                    padding: portfolioHeroPadding,
                    filter: portraitLayout ? "blur(6px)" : "blur(10px)",
                    maskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    WebkitMaskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    maskMode: "alpha",
                  }}
                >
                  PORTFOLIO
                </motion.h1>
                <motion.h1
                  aria-hidden
                  className="relative z-[0] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-black"
                  style={{
                    gridArea: "1 / 1",
                    fontSize: portfolioHeroFontSize,
                    padding: portfolioHeroPadding,
                    filter: portraitLayout ? "blur(3px)" : "blur(5px)",
                    maskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    WebkitMaskImage: portraitLayout
                      ? textBlurRevealMaskPortrait
                      : textBlurRevealMask,
                    maskMode: "alpha",
                  }}
                >
                  PORTFOLIO
                </motion.h1>
                <motion.h1
                  ref={sharpHeadingRef}
                  className="relative z-[1] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-black"
                  style={{
                    gridArea: "1 / 1",
                    fontSize: portfolioHeroFontSize,
                    padding: portfolioHeroPadding,
                    maskImage: portraitLayout
                      ? textSharpMaskPortrait
                      : textSharpMask,
                    WebkitMaskImage: portraitLayout
                      ? textSharpMaskPortrait
                      : textSharpMask,
                    maskMode: "alpha",
                  }}
                >
                  PORTFOLIO
                </motion.h1>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 pb-20">
          {/* "SORT" trigger — gates brand/year filters + reset. */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              aria-controls="work-sort-panel"
              className="group inline-flex items-baseline gap-2.5 text-black outline-none"
            >
              <span
                className="font-display font-bold italic uppercase leading-none tracking-[-0.03em] underline-offset-4 decoration-1 transition-colors group-hover:underline"
                style={{ fontSize: "clamp(1.125rem, 2vw, 1.625rem)" }}
              >
                SORT
              </span>
              {activeFilterCount > 0 && (
                <span
                  aria-label={`${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`}
                  className="inline-flex h-4 min-w-[1rem] translate-y-[-0.2em] items-center justify-center rounded-full bg-black px-1.5 text-[0.6rem] font-semibold text-white"
                >
                  {activeFilterCount}
                </span>
              )}
              <motion.svg
                aria-hidden
                focusable="false"
                viewBox="0 0 16 16"
                width="12"
                height="12"
                animate={{ rotate: sortOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="translate-y-[-0.05em] text-black/70 transition-colors group-hover:text-black"
              >
                <path
                  d="M3 6l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {sortOpen && (
              <motion.div
                key="work-sort-panel"
                id="work-sort-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 overflow-hidden"
              >
                <div className="rounded-2xl border border-black/10 bg-black/[0.02]">
                  <div className="space-y-3 px-4 py-4 md:px-5 md:py-5">
                    <FilterRow
                      label="Brand"
                      values={brands}
                      selected={brand}
                      onChange={setBrand}
                    />
                    <FilterRow
                      label="Year"
                      values={years}
                      selected={year}
                      onChange={setYear}
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className={cn(
                          bannerTypeChip,
                          "rounded-full border border-black/20 bg-black/[0.03] px-3 py-2 text-black/70 transition hover:bg-black/10 hover:text-black",
                        )}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-6 py-10 text-center">
              <p className={cn(bannerTypeBase, "normal-case text-black/65")}>
                No projects match these filters. Try clearing one or more
                selections.
              </p>
            </div>
          ) : (
            <ProjectsGrid projects={filtered} />
          )}
          <p className={cn(bannerTypeBase, "mt-8 text-center text-black/55")}>
            ADDING MORE WORK SOON...
          </p>
        </section>

        <section className="mx-auto flex w-full max-w-[1400px] items-end justify-center px-6 pb-14 pt-20 md:pb-20 md:pt-28">
          <Link
            href="/contact"
            className="text-center font-display font-bold italic uppercase leading-none tracking-[-0.03em] text-black transition hover:underline underline-offset-4 decoration-1"
            style={{ fontSize: "clamp(0.69rem, 2vw, 1.38rem)" }}
          >
            CONTACT
          </Link>
        </section>
      </div>
    </main>
  );
}

function FilterRow({
  label,
  values,
  selected,
  onChange,
}: {
  label: string;
  values: string[];
  selected: FilterValue;
  onChange: (next: FilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn(bannerTypeChip, "min-w-14 text-black/55")}>
        {label}
      </span>
      <FilterChip
        value="all"
        label="All"
        selected={selected === "all"}
        onSelect={onChange}
      />
      {values.map((value) => (
        <FilterChip
          key={value}
          value={value}
          label={label === "Tag" ? value.replace(/-/g, " ") : value}
          selected={selected === value}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}

function FilterChip({
  value,
  label,
  selected,
  onSelect,
}: {
  value: FilterValue;
  label: string;
  selected: boolean;
  onSelect: (next: FilterValue) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        bannerTypeChip,
        "rounded-full border px-3 py-1.5 transition",
        selected
          ? "border-black/60 bg-black/10 text-black"
          : "border-black/20 bg-black/[0.03] text-black/65 hover:bg-black/10 hover:text-black",
      )}
    >
      {label}
    </button>
  );
}
