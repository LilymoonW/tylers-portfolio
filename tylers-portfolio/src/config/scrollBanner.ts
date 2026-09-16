import { cn } from '@/lib/utils'

/**
 * Core voice shared with the TYLER / YOON banner: Bebas-style display, bold, italic, caps.
 * Add `leading-none` + `bannerTypeNavSizes` + a color for exact nav match.
 */
export const bannerTypeBase =
  'font-display font-bold italic uppercase tracking-tight'

/** Pixel sizes used by the fixed nav labels (portrait / landscape). */
const bannerTypeNavSizes =
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

/** Card / row titles on dark surfaces. */
export const bannerTypeCardTitleLight = cn(
  bannerTypeBase,
  'leading-none text-xl md:text-2xl text-white'
)

/** Small meta / labels on dark. */
export const bannerTypeMetaLight = cn(bannerTypeBase, 'text-xs text-white/80 leading-none')

/** Pill / chip text. */
export const bannerTypeChip = cn(bannerTypeBase, 'text-xs leading-none tracking-tight')

/** Modal title on light surface. */
export const bannerTypeModalTitle = cn(bannerTypeBase, 'leading-none text-2xl text-ink')

/** Modal meta (brand, role, year). */
export const bannerTypeModalMeta = cn(bannerTypeBase, 'text-sm leading-relaxed text-muted mt-1')

/** Accent stat line in modal (e.g. view count). */
export const bannerTypeModalAccent = cn(bannerTypeBase, 'leading-none text-lg text-bright-blue')

/** Secondary line under carousel / card titles on imagery. */
export const bannerTypeCardMeta = cn(
  bannerTypeBase,
  'text-sm leading-relaxed text-white/60 mt-1'
)
