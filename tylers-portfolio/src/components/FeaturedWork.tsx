'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { useVideoModal } from './VideoModalProvider'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const [paused, setPaused] = useState(false)

  // Triple the list for seamless infinite loop
  const tripled = [...projects, ...projects, ...projects]

  return (
    <section id="featured" className="py-24 overflow-hidden">
      <ScrollReveal>
        <p className="text-center text-sm md:text-base text-muted mb-16 tracking-widest uppercase">
          Featured Work
        </p>
      </ScrollReveal>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex items-end gap-6 md:gap-8 animate-carousel"
          style={{
            width: 'max-content',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {tripled.map((project, i) => (
            <CarouselCard key={`${project.id}-${i}`} project={project} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-carousel {
          animation: carousel 40s linear infinite;
        }
      `}</style>
    </section>
  )
}

function CarouselCard({ project }: { project: Project }) {
  const { openModal } = useVideoModal()

  return (
    <motion.div
      className="flex-shrink-0 w-[220px] md:w-[280px] cursor-pointer"
      onClick={() => openModal(project)}
      whileHover={{ y: -16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      data-cursor="play"
    >
      {/* Aceternity-style card with background image swap on hover */}
      <div
        className={cn(
          "group w-full overflow-hidden relative rounded-xl shadow-xl flex flex-col justify-end p-4 border border-white/5",
          // Default background - placeholder gradient (replace with project thumbnail)
          "bg-gradient-to-br from-deep-blue/80 via-indigo/60 to-surface bg-cover bg-center",
          // Hover background - swap to different image/gif
          "hover:bg-gradient-to-br hover:from-orange/40 hover:via-red/30 hover:to-surface",
          // Dark overlay on hover for text readability
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black/40",
          "transition-all duration-500"
        )}
        style={{ aspectRatio: '9/16' }}
      >
        {/* View count badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/80 z-10">
          {formatNumber(project.viewCount, 'abbreviated')} views
        </div>

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>

        {/* Info at bottom */}
        <div className="relative z-50 text">
          <h3 className="font-display text-xl md:text-2xl uppercase text-white group-hover:text-bright-blue transition-colors duration-300">
            {project.title}
          </h3>
          <p className="font-normal text-sm text-white/60 mt-1 group-hover:text-white/80 transition-colors duration-300">
            {project.brand} &middot; {project.duration}
          </p>
          <div className="flex gap-1 mt-2">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/70 uppercase tracking-wider group-hover:bg-bright-blue/20 group-hover:text-bright-blue transition-colors duration-300"
              >
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
