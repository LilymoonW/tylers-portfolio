import type { Brand } from '@/types'

/**
 * Brand logos for the marquee — **two independent rows** (`brandMarqueeTopRow` / `brandMarqueeBottomRow`).
 *
 * Raster marks: `public/images/brands/logos/` (top: mlb, espn, seahawks, penn-state, detroit-red-wings; bottom: usc, wbc, playmaker, bleacher-report, draftkings, wasserman).
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
  {
    id: 'detroit-red-wings',
    name: 'Detroit Red Wings',
    logoSrc: '/images/brands/logos/detroit-red-wings.png',
    logoBrightness: 0.56,
    // url: 'https://www.nhl.com/redwings',
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
  {
    id: 'draftkings',
    name: 'DraftKings',
    logoSrc: '/images/brands/logos/draftkings.png',
    logoBrightness: 0.56,
    // url: 'https://www.draftkings.com',
  },
  {
    id: 'wasserman',
    name: 'Wasserman',
    logoSrc: '/images/brands/logos/wasserman.png',
    // url: 'https://www.wasserman.com',
  },
]
