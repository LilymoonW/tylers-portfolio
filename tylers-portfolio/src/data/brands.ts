import type { Brand } from '@/types'

/**
 * Brand logos for the marquee — **two independent rows** (`brandMarqueeTopRow` / `brandMarqueeBottomRow`).
 *
 * Raster marks: `public/images/brands/logos/` (top: mlb, espn, seahawks, penn-state; bottom: usc, wbc, playmaker, bleacher-report).
 *
 * **Links:** add optional `url` on any row (full URL). Logos without `url` stay non-clickable until you add one.
 */
export const brandMarqueeTopRow: Brand[] = [
  {
    id: 'MLB',
    name: 'MLB',
    logoSrc: '/images/brands/logos/mlb.png',
    // url: 'https://www.mlb.com',
  },
  {
    id: 'ESPN',
    name: 'ESPN',
    logoSrc: '/images/brands/logos/espn.png',
    // url: 'https://www.espn.com',
  },
  {
    id: 'seahawks',
    name: 'Seahawks',
    logoSrc: '/images/brands/logos/seahawks.png',
    // url: 'https://www.seahawks.com',
  },
  {
    id: 'penn-state-top',
    name: 'Penn State',
    logoSrc: '/images/brands/logos/penn-state.png',
    // url: 'https://www.psu.edu',
  },
]

export const brandMarqueeBottomRow: Brand[] = [
  {
    id: 'USC',
    name: 'USC',
    logoSrc: '/images/brands/logos/usc.png',
    // url: 'https://www.usc.edu',
  },
  {
    id: 'WBC',
    name: 'WBC',
    logoSrc: '/images/brands/logos/wbc.png',
  },
  {
    id: 'playmaker',
    name: 'Playmaker',
    logoSrc: '/images/brands/logos/playmaker.png',
  },
  {
    id: 'bleacher-report',
    name: 'Bleacher Report',
    logoSrc: '/images/brands/logos/bleacher-report.png',
    // url: 'https://bleacherreport.com',
  },
]

/** All marquee brands (top then bottom) — useful if you need one list elsewhere. */
export const brands: Brand[] = [...brandMarqueeTopRow, ...brandMarqueeBottomRow]
