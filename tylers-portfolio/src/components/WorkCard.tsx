'use client'

import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { formatNumber } from '@/lib/utils'

interface WorkCardProps {
  project: Project
  onClick: () => void
}

export default function WorkCard({ project, onClick }: WorkCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={onClick}
      data-cursor="play"
    >
      <div className="relative rounded-xl overflow-hidden bg-surface border border-white/5 hover:border-white/15 transition-colors">
        {/* Thumbnail - vertical */}
        <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/30 to-indigo/30" />

          {/* Views badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/70">
            {formatNumber(project.viewCount, 'abbreviated')}
          </div>

          {/* Hover play icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-display text-base uppercase truncate">{project.title}</h3>
          <p className="text-muted text-[11px] mt-0.5">
            {project.brand} &middot; {project.duration}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
