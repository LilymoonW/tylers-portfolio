import { cn } from '@/lib/utils'

/**
 * Core voice shared with the TYLER / YOON banner: Bebas-style display, bold, italic, caps.
 * Add `leading-none` + `bannerTypeNavSizes` + a color for exact nav match.
 */
export const bannerTypeBase =
  'font-display font-bold italic uppercase tracking-tight'

/** Pixel sizes used by the fixed nav labels (portrait / landscape). */
export const bannerTypeNavSizes =
  'leading-none text-ink portrait:text-3xl portrait:sm:text-4xl landscape:text-[3.375rem] landscape:sm:text-[3.75rem]'

/**
 * Top fixed banner (TYLER / YOON) — adjust font size, alignment, and layout here.
 *
 * - `heightPx`: row height (px) for layout + vertical position math — same in portrait and landscape.
 * - `offsetDownPx` shifts the whole banner downward from the computed position.
 * - `labelClassName`: same stack as site-wide `bannerTypeBase` + `bannerTypeNavSizes`.
 * - `tylerExtraClassName` / `yoonExtraClassName` for per-label nudges (`pl-*`, `translate-y-*`, …).
 * - Horizontal inset follows the intro video edges; keep `rowPaddingXClassName` empty unless you want extra static padding.
 */
export const scrollBannerConfig = {
  heightPx: 192,

  offsetDownPx: 50,

  labelClassName: cn(bannerTypeBase, bannerTypeNavSizes),

  tylerExtraClassName: '',

  yoonExtraClassName: '',

  rowLayoutClassName: 'justify-between',

  rowItemsAlignClassName: 'items-center',

  rowMaxWidthClassName: 'max-w-none',

  rowPaddingXClassName: '',

  rowPaddingYClassName: '',
} as const

/** Eyebrow / kicker on light backgrounds. */
export const bannerTypeEyebrowInk = cn(
  bannerTypeBase,
  'leading-none text-lg portrait:sm:text-sm text-muted'
)

/** Eyebrow on dark / over imagery. */
export const bannerTypeEyebrowLight = cn(
  bannerTypeBase,
  'leading-none text-xs portrait:sm:text-sm text-white/80'
)

/** Large display headline (contact hero, etc.). */
export const bannerTypeHeroInk = cn(
  bannerTypeBase,
  'leading-none text-5xl portrait:sm:text-6xl md:text-7xl md:landscape:text-8xl text-ink'
)

/** Section title on light bg. */
export const bannerTypeSectionInk = cn(
  bannerTypeBase,
  'leading-none text-4xl portrait:sm:text-5xl md:text-6xl md:landscape:text-7xl text-ink'
)

/** Secondary section heading. */
export const bannerTypeHeadingMuted = cn(
  bannerTypeBase,
  'leading-none text-3xl md:text-4xl text-muted'
)

/** Card / row titles on dark surfaces. */
export const bannerTypeCardTitleLight = cn(
  bannerTypeBase,
  'leading-none text-xl md:text-2xl text-white'
)

/** Supporting line on light bg. */
export const bannerTypeBodyInk = cn(bannerTypeBase, 'text-sm md:text-base text-ink leading-relaxed')

/** Supporting line on dark bg. */
export const bannerTypeBodyLight = cn(bannerTypeBase, 'text-sm md:text-base text-white/70 leading-relaxed')

/** Softer body on dark (timeline entries). */
export const bannerTypeBodyLightSoft = cn(bannerTypeBase, 'text-sm text-white/50 leading-relaxed')

/** Small meta / labels on dark. */
export const bannerTypeMetaLight = cn(bannerTypeBase, 'text-xs text-white/80 leading-none')

/** Stat number strip — capped below `text-7xl` so four-up grids do not collide. */
export const bannerTypeStatValue = cn(
  bannerTypeBase,
  'leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tabular-nums'
)

export const bannerTypeStatLabel = cn(
  bannerTypeBase,
  'leading-none text-xs md:text-sm text-white mt-2'
)

/** Marquee brand names. */
export const bannerTypeMarqueeBrand = cn(
  bannerTypeBase,
  'leading-none text-2xl text-white/70 hover:text-white transition-colors'
)

/** Pill / chip text. */
export const bannerTypeChip = cn(bannerTypeBase, 'text-xs leading-none tracking-tight')

/** Filter / small control. */
export const bannerTypeControl = cn(bannerTypeBase, 'text-xs leading-none')

/** Primary CTA (pill button). */
export const bannerTypeCta = cn(bannerTypeBase, 'leading-none text-xl text-white')

/** Footer / legal line on light bg. */
export const bannerTypeFooter = cn(bannerTypeBase, 'leading-none text-xs text-ink')

/** Modal title on light surface. */
export const bannerTypeModalTitle = cn(bannerTypeBase, 'leading-none text-2xl text-ink')

/** Modal meta (brand, role, year). */
export const bannerTypeModalMeta = cn(bannerTypeBase, 'text-sm leading-relaxed text-muted mt-1')

/** Accent stat line in modal (e.g. view count). */
export const bannerTypeModalAccent = cn(bannerTypeBase, 'leading-none text-lg text-bright-blue')

/** Year marker in vertical timeline. */
export const bannerTypeTimelineYear = cn(
  bannerTypeBase,
  'leading-none text-3xl md:text-4xl text-bright-blue mb-4'
)

/** Job title row in timeline entries (dark surfaces). */
export const bannerTypeTimelineJob = cn(
  bannerTypeBase,
  'text-sm text-white/70 mb-4 leading-relaxed'
)

/** Secondary line under carousel / card titles on imagery. */
export const bannerTypeCardMeta = cn(
  bannerTypeBase,
  'text-sm leading-relaxed text-white/60 mt-1'
)
