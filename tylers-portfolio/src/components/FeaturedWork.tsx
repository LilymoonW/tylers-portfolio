'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '@/types'
import TiltCard from './TiltCard'
import { useVideoModal } from './VideoModalProvider'
import { formatNumber } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <section id="featured" className="py-24">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-7xl uppercase">
            Featured Work
          </h2>
          <p className="text-muted mt-2">Drag to browse</p>
        </ScrollReveal>
      </div>

      <div ref={constraintsRef} className="overflow-hidden px-6">
        <motion.div
          className="flex gap-6 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
        >
          {projects.map((project) => (
            <FeaturedCard key={project.id} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturedCard({ project }: { project: Project }) {
  const { openModal } = useVideoModal()

  return (
    <TiltCard className="flex-shrink-0 w-[280px] md:w-[320px]">
      <motion.div
        className="relative rounded-xl overflow-hidden bg-surface border border-white/5 cursor-pointer group"
        onClick={() => openModal(project)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        data-cursor="play"
      >
        {/* Thumbnail - vertical */}
        <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
          {/* Placeholder gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/50 to-indigo/50" />

          {/* View count badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/80">
            {formatNumber(project.viewCount, 'abbreviated')} views
          </div>

          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-xl uppercase">{project.title}</h3>
          <p className="text-muted text-xs mt-1">
            {project.brand} &middot; {project.duration}
          </p>
          <div className="flex gap-1 mt-2">
            {project.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-muted uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
}
