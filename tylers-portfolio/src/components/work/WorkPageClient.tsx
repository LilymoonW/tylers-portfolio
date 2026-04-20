'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import type { Project } from '@/types'
import { bannerTypeBase, bannerTypeChip, bannerTypeEyebrowLight } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'

const LiquidGradientBackground = dynamic(
  () => import('@/components/LiquidGradientBackground'),
  { ssr: false },
)

// 3D wheel is heavy (3D transforms + RAF loop) — lazy-load client-side only.
const ProjectsWheel3D = dynamic(() => import('@/components/work/ProjectsWheel3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center text-black/40">Loading wheel…</div>
  ),
})

type FilterValue = 'all' | string

function normalize(text: string) {
  return text.trim().toLowerCase()
}

// SVG fractal-noise tile used for grain overlays. feTurbulence produces true
// random noise (no concentric rings like repeating-radial-gradient), and
// `stitchTiles='stitch'` keeps the pattern seamless when the browser tiles it.
// The feComponentTransfer stretches contrast so the noise has more deep
// blacks / bright whites instead of midtone gray — reads as punchier grain.
const GRAIN_NOISE_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/><feComponentTransfer><feFuncR type='linear' slope='2.2' intercept='-0.6'/><feFuncG type='linear' slope='2.2' intercept='-0.6'/><feFuncB type='linear' slope='2.2' intercept='-0.6'/></feComponentTransfer></filter><rect width='260' height='260' filter='url(%23n)'/></svg>\")"

// Single SVG alpha mask for the liquid stack — avoids `mask-composite: intersect`
// (silhouette + CSS radial), which often rasterizes a hard rectangular seam.
const PORTFOLIO_LIQUID_MASK = 'url(#portfolio-reveal-mask)'

export default function WorkPageClient({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState<FilterValue>('all')
  const [tag, setTag] = useState<FilterValue>('all')
  const [year, setYear] = useState<FilterValue>('all')
  const [sortOpen, setSortOpen] = useState(false)

  const activeFilterCount =
    (brand !== 'all' ? 1 : 0) +
    (tag !== 'all' ? 1 : 0) +
    (year !== 'all' ? 1 : 0) +
    (query.trim().length > 0 ? 1 : 0)

  const brands = useMemo(
    () => Array.from(new Set(projects.map((p) => p.brand))).sort((a, b) => a.localeCompare(b)),
    [projects],
  )
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b)),
    [projects],
  )
  const years = useMemo(
    () => Array.from(new Set(projects.map((p) => String(p.year)))).sort((a, b) => Number(b) - Number(a)),
    [projects],
  )

  const filtered = useMemo(() => {
    const q = normalize(query)

    return [...projects]
      .filter((p) => {
        if (brand !== 'all' && p.brand !== brand) return false
        if (tag !== 'all' && !p.tags.includes(tag)) return false
        if (year !== 'all' && String(p.year) !== year) return false

        if (!q) return true
        const haystack = normalize([p.title, p.brand, p.role, p.tags.join(' '), p.toolsUsed.join(' ')].join(' '))
        return haystack.includes(q)
      })
      .sort((a, b) => b.year - a.year || b.viewCount - a.viewCount)
  }, [projects, brand, tag, year, query])

  const resetFilters = () => {
    setQuery('')
    setBrand('all')
    setTag('all')
    setYear('all')
  }

  // Text blur uses sprung `tmx/tmy` so the soft pocket trails the cursor.
  // Pointer `tmxRaw/tmyRaw` feed those springs (same box as the <h1> masks).
  const sharpHeadingRef = useRef<HTMLHeadingElement>(null)
  const tmxRaw = useMotionValue(50)
  const tmyRaw = useMotionValue(50)
  // Soft trailing springs. Lower stiffness / higher mass = more lag.
  // Tuned for a visible ~200 ms catch-up — the halo clearly trails the
  // cursor instead of sticking to it.
  const springConfig = { stiffness: 120, damping: 28, mass: 1 }
  const tmx = useSpring(tmxRaw, springConfig)
  const tmy = useSpring(tmyRaw, springConfig)

  // Portrait / vertical viewports: tighter halos so blurs do not dominate the
  // narrow wordmark (CSS filter blur + SVG mask blur + smaller mask pockets).
  const [portraitLayout, setPortraitLayout] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(orientation: portrait)')
    const sync = () => setPortraitLayout(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // One clamp for every PORTFOLIO layer (SVG mask + h1s + grain) so portrait
  // shrink stays aligned and centered in the existing `inline-grid` stack.
  const portfolioHeroFontSize = useMemo(
    () =>
      portraitLayout ? 'clamp(2.4rem, 12vw, 5.4rem)' : 'clamp(4.2rem, 11.5vw, 9.6rem)',
    [portraitLayout],
  )
  const portfolioHeroPadding = useMemo(
    () => (portraitLayout ? '0.32em 0.45em' : '0.35em 0.5em'),
    [portraitLayout],
  )
  // Italic uppercase glyphs read optically right-heavy; nudge left so the
  // wordmark feels centered to the eye on both desktop and portrait.
  const portfolioVisualCenterOffset = useMemo(
    () => (portraitLayout ? '-0.015em' : '-0.02em'),
    [portraitLayout],
  )
  // Expand the shared hero box so mask/filter edges sit farther away from text.
  const portfolioHeroBleedPadding = useMemo(
    () => (portraitLayout ? 'clamp(0.9rem, 4vw, 2.2rem)' : 'clamp(1.4rem, 5vw, 4rem)'),
    [portraitLayout],
  )

  useEffect(() => {
    const setFromClient = (clientX: number, clientY: number) => {
      const textEl = sharpHeadingRef.current
      if (!textEl) return
      const r = textEl.getBoundingClientRect()
      if (r.width >= 1 && r.height >= 1) {
        tmxRaw.set(((clientX - r.left) / r.width) * 100)
        tmyRaw.set(((clientY - r.top) / r.height) * 100)
      }
    }
    const onMouseMove = (event: MouseEvent) => setFromClient(event.clientX, event.clientY)
    const onTouch = (event: TouchEvent) => {
      const t = event.touches[0] ?? event.changedTouches[0]
      if (t) setFromClient(t.clientX, t.clientY)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [tmxRaw, tmyRaw])

  // Radial masks for the duplicated PORTFOLIO text. Softer outer stops so the
  // pocket does not cut off with a visible rectangular alpha cliff.
  const textSharpMask = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, transparent 0px, transparent min(4vmin, 20px), rgba(0,0,0,0.4) min(8vmin, 34px), black min(14vmin, 55px))`
  const textSharpMaskPortrait = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, transparent 0px, transparent min(3vmin, 14px), rgba(0,0,0,0.4) min(6vmin, 24px), black min(10vmin, 40px))`
  const textBlurRevealMask = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, black 0px, black min(11vmin, 48px), rgba(0,0,0,0.78) min(15vmin, 62px), rgba(0,0,0,0.42) min(19vmin, 78px), rgba(0,0,0,0.16) min(24vmin, 96px), transparent min(34vmin, 150px))`
  const textBlurRevealMaskPortrait = useMotionTemplate`radial-gradient(circle at ${tmx}% ${tmy}%, black 0px, black min(8vmin, 34px), rgba(0,0,0,0.78) min(11vmin, 44px), rgba(0,0,0,0.42) min(14vmin, 55px), rgba(0,0,0,0.16) min(18vmin, 68px), transparent min(24vmin, 105px))`

  return (
    <main className="relative min-h-screen overflow-visible bg-white text-black">
      <section className="mx-auto w-full max-w-[1400px] overflow-visible px-6 pt-10 md:pt-14">
        <div className="flex items-center justify-between">
          <p className={cn(bannerTypeEyebrowLight, 'uppercase text-black/60')}>PORTFOLIO</p>
          <Link
            href="/"
            className={cn(
              bannerTypeChip,
              'uppercase text-black/70 transition hover:text-black hover:underline underline-offset-4 decoration-1',
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
          <div className="relative z-[1] flex w-full min-w-0 justify-center overflow-visible py-14 md:py-20">
            {/* No `isolate`: `mix-blend-mode` on the grain layer should blend
                against the real page backdrop; isolation caused muddy fringe
                colors in stacked portrait layouts. */}
            <div
              className="relative mx-auto inline-grid min-w-0 place-items-center overflow-visible"
              style={{
                padding: portfolioHeroBleedPadding,
                transform: `translateX(${portfolioVisualCenterOffset})`,
              }}
            >
              <svg
                aria-hidden
                focusable="false"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/* Large filter region + no clip on <mask>: SVG masks default to
                      overflow:hidden, which cuts off feGaussianBlur and draws a
                      hard rectangular edge behind the wordmark. */}
                  <filter
                    id="portfolio-mask-blur"
                    x="-120%"
                    y="-120%"
                    width="340%"
                    height="340%"
                  >
                    <feGaussianBlur stdDeviation="28" />
                  </filter>
                  <filter
                    id="portfolio-mask-blur-portrait"
                    x="-120%"
                    y="-120%"
                    width="340%"
                    height="340%"
                  >
                    <feGaussianBlur stdDeviation="17" />
                  </filter>
                  <mask
                    id="portfolio-reveal-mask"
                    maskUnits="userSpaceOnUse"
                    x="-70%"
                    y="-70%"
                    width="240%"
                    height="240%"
                    overflow="visible"
                    style={{ maskType: 'alpha' }}
                  >
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      filter={
                        portraitLayout
                          ? 'url(#portfolio-mask-blur-portrait)'
                          : 'url(#portfolio-mask-blur)'
                      }
                      style={{
                        fontSize: portfolioHeroFontSize,
                        fontFamily:
                          "var(--font-display), 'Bebas Neue', system-ui, sans-serif",
                        fontWeight: 700,
                        fontStyle: 'italic',
                        letterSpacing: '-0.03em',
                        textTransform: 'uppercase',
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
                  maskImage: PORTFOLIO_LIQUID_MASK,
                  WebkitMaskImage: PORTFOLIO_LIQUID_MASK,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskMode: 'alpha',
                }}
              >
                <LiquidGradientBackground
                  fillContainer
                  color1="#4ABDD4"
                  color2="#6BCFE2"
                  color3="#8DDFEE"
                  color4="#B8EEF6"
                  color5="#E8FAFD"
                  color6="#5EC9DC"
                  backgroundColor="#9EE4F0"
                  animationSpeed={1.3}
                  gradientIntensity={2.55}
                  gradientSize={0.88}
                  gradientCount={16}
                  touchStrength={0.28}
                  grainIntensity={0.025}
                  color1Weight={0.85}
                  color2Weight={2.0}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                  style={{
                    opacity: 0.28,
                    backgroundImage: GRAIN_NOISE_URL,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '240px 240px',
                  }}
                />
              </motion.div>

              {/* Royal blue blur under the black blur so black always paints on
                  top in the cursor pocket; sharp headline stays above both. */}
              <motion.h1
                aria-hidden
                className="relative z-[0] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-[#4169E1]"
                style={{
                  gridArea: '1 / 1',
                  fontSize: portfolioHeroFontSize,
                  padding: portfolioHeroPadding,
                  filter: portraitLayout ? 'blur(5px)' : 'blur(8px)',
                  maskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  WebkitMaskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  maskMode: 'alpha',
                }}
              >
                PORTFOLIO
              </motion.h1>
              <motion.h1
                aria-hidden
                className="relative z-[0] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-black"
                style={{
                  gridArea: '1 / 1',
                  fontSize: portfolioHeroFontSize,
                  padding: portfolioHeroPadding,
                  filter: portraitLayout ? 'blur(3px)' : 'blur(5px)',
                  maskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  WebkitMaskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  maskMode: 'alpha',
                }}
              >
                PORTFOLIO
              </motion.h1>
              <motion.h1
                ref={sharpHeadingRef}
                className="relative z-[1] block overflow-visible text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9] text-black"
                style={{
                  gridArea: '1 / 1',
                  fontSize: portfolioHeroFontSize,
                  padding: portfolioHeroPadding,
                  maskImage: portraitLayout ? textSharpMaskPortrait : textSharpMask,
                  WebkitMaskImage: portraitLayout ? textSharpMaskPortrait : textSharpMask,
                  maskMode: 'alpha',
                }}
              >
                PORTFOLIO
              </motion.h1>

              {/* Grain painted only inside the PORTFOLIO letterforms via
                  background-clip: text, and only inside the cursor spotlight via
                  the same reveal mask used by the blurred copy. Sits above the
                  blurred <h1> so the grain reads crisply against the soft blur. */}
              <motion.div
                aria-hidden
                className="relative z-[2] block overflow-visible select-none text-center font-display font-bold italic uppercase tracking-[-0.03em] leading-[0.9]"
                style={{
                  gridArea: '1 / 1',
                  fontSize: portfolioHeroFontSize,
                  padding: portfolioHeroPadding,
                  color: 'transparent',
                  backgroundImage: GRAIN_NOISE_URL,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '180px 180px',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  mixBlendMode: 'overlay',
                  opacity: 1,
                  maskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  WebkitMaskImage: portraitLayout ? textBlurRevealMaskPortrait : textBlurRevealMask,
                  maskMode: 'alpha',
                }}
              >
                PORTFOLIO
              </motion.div>
            </div>
          </div>
        </div>

      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 pb-20">
        {/* "SORT" trigger — gates the whole search + reset + filters panel.
            Clicking the word expands the full controls below it. */}
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
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }}
            >
              SORT
            </span>
            {activeFilterCount > 0 && (
              <span
                aria-label={`${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
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
              transition={{ duration: 0.22, ease: 'easeInOut' }}
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
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-2xl border border-black/10 bg-black/[0.02]">
                <div className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                  <label htmlFor="work-search" className={cn(bannerTypeChip, 'text-black/60')}>
                    Search
                  </label>
                  <input
                    id="work-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Title, brand, role, tags..."
                    className={cn(
                      bannerTypeBase,
                      'h-10 w-full max-w-md rounded-full border border-black/20 bg-white px-4 text-sm normal-case text-black placeholder:text-black/35 focus:border-black/50 focus:outline-none',
                    )}
                  />
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={cn(
                      bannerTypeChip,
                      'rounded-full border border-black/20 bg-black/[0.03] px-3 py-2 text-black/70 transition hover:bg-black/10 hover:text-black',
                    )}
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-3 border-t border-black/10 px-4 py-4 md:px-5 md:py-5">
                  <FilterRow label="Brand" values={brands} selected={brand} onChange={setBrand} />
                  <FilterRow label="Tag" values={tags} selected={tag} onChange={setTag} />
                  <FilterRow label="Year" values={years} selected={year} onChange={setYear} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-6 py-10 text-center">
            <p className={cn(bannerTypeBase, 'normal-case text-black/65')}>
              No projects match these filters. Try clearing one or more selections.
            </p>
          </div>
        ) : (
          <ProjectsWheel3D
            projects={filtered}
            onSelect={(project) =>
              router.push(`/work/${encodeURIComponent(project.id)}`, { scroll: true })
            }
          />
        )}
      </section>

      {/* Sits after the wheel scrub track, so it only appears once users scroll
          past the pinned carousel sequence. */}
      <section className="mx-auto flex min-h-[62vh] w-full max-w-[1400px] items-end justify-center px-6 pb-14 md:min-h-[72vh] md:pb-20">
        <p
          className="text-center font-display font-bold italic uppercase leading-none tracking-[-0.03em] text-black"
          style={{ fontSize: 'clamp(1.1rem, 3.2vw, 2.2rem)' }}
        >
          CONTACT
        </p>
      </section>
    </main>
  )
}

function FilterRow({
  label,
  values,
  selected,
  onChange,
}: {
  label: string
  values: string[]
  selected: FilterValue
  onChange: (next: FilterValue) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn(bannerTypeChip, 'min-w-14 text-black/55')}>{label}</span>
      <FilterChip value="all" label="All" selected={selected === 'all'} onSelect={onChange} />
      {values.map((value) => (
        <FilterChip
          key={value}
          value={value}
          label={label === 'Tag' ? value.replace(/-/g, ' ') : value}
          selected={selected === value}
          onSelect={onChange}
        />
      ))}
    </div>
  )
}

function FilterChip({
  value,
  label,
  selected,
  onSelect,
}: {
  value: FilterValue
  label: string
  selected: boolean
  onSelect: (next: FilterValue) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        bannerTypeChip,
        'rounded-full border px-3 py-1.5 transition',
        selected
          ? 'border-black/60 bg-black/10 text-black'
          : 'border-black/20 bg-black/[0.03] text-black/65 hover:bg-black/10 hover:text-black',
      )}
    >
      {label}
    </button>
  )
}
