'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import type { Stat } from '@/types'
import { useCountUp } from '@/hooks/useCountUp'
import { formatNumber } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'

export default function StatsSection({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="stats" className="py-24" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.id} delay={i * 0.1}>
              <StatItem stat={stat} inView={isInView} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, inView }: { stat: Stat; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView)
  const displayValue = formatNumber(count, stat.format)

  return (
    <div className="text-center">
      <p className="font-display text-5xl md:text-7xl text-bright-blue">
        {stat.prefix}
        {displayValue}
        {stat.suffix}
      </p>
      <p className="text-muted text-sm uppercase tracking-widest mt-2">{stat.label}</p>
    </div>
  )
}
