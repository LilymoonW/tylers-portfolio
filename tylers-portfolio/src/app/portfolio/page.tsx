import type { Metadata } from 'next'
import WorkPageClient from '@/components/work/WorkPageClient'
import { projects } from '@/data/projects'

export const metadata: Metadata = {
  title: 'Portfolio | Tyler Yoon',
  description:
    'Selected VFX and motion projects — filter by brand and year.',
}

export default function PortfolioPage() {
  return <WorkPageClient projects={projects} />
}
