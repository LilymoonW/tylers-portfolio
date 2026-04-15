'use client'

import type { Brand } from '@/types'
import ScrollReveal from './ScrollReveal'

export default function BrandMarquee({ brands }: { brands: Brand[] }) {
  // Double the list for seamless loop
  const doubled = [...brands, ...brands]

  return (
    <section id="brands" className="py-16 overflow-hidden border-y border-white/5">
      <ScrollReveal>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted mb-8">
          Brands I&apos;ve worked with
        </p>
      </ScrollReveal>

      <div
        className="group flex items-center gap-16 whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        <div className="flex items-center gap-16 animate-marquee group-hover:[animation-play-state:paused]">
          {doubled.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              data-cursor="expand"
            >
              {/* Placeholder text until logos are provided */}
              <span className="font-display text-2xl uppercase tracking-wider text-white/70 hover:text-white transition-colors">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-16 animate-marquee group-hover:[animation-play-state:paused]" aria-hidden>
          {doubled.map((brand, i) => (
            <div
              key={`${brand.id}-dup-${i}`}
              className="flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <span className="font-display text-2xl uppercase tracking-wider text-white/70 hover:text-white transition-colors">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
