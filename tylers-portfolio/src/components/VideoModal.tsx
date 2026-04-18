'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideoModal } from './VideoModalProvider'
import { tools as allTools } from '@/data/tools'
import { formatNumber, cn } from '@/lib/utils'
import {
  bannerTypeBase,
  bannerTypeChip,
  bannerTypeModalAccent,
  bannerTypeModalMeta,
  bannerTypeModalTitle,
} from '@/config/scrollBanner'

export default function VideoModal() {
  const { activeProject, closeModal } = useVideoModal()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }

    if (activeProject) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeProject, closeModal])

  return (
    <AnimatePresence>
      {activeProject && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-lg bg-surface rounded-2xl overflow-hidden border border-white/10"
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white transition-colors"
              data-cursor="expand"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Video embed - vertical 9:16 */}
            <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
              <iframe
                src={activeProject.embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={bannerTypeModalTitle}>{activeProject.title}</h3>
                  <p className={bannerTypeModalMeta}>
                    {activeProject.brand} &middot; {activeProject.role} &middot; {activeProject.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className={bannerTypeModalAccent}>
                    {formatNumber(activeProject.viewCount, 'abbreviated')} views
                  </p>
                  <p className={cn(bannerTypeBase, 'text-xs leading-none text-muted')}>
                    {activeProject.duration}
                  </p>
                </div>
              </div>

              {/* Tools used */}
              <div className="flex flex-wrap gap-2">
                {activeProject.toolsUsed.map((toolId) => {
                  const tool = allTools.find((t) => t.id === toolId)
                  return tool ? (
                    <span
                      key={toolId}
                      className={cn(
                        bannerTypeChip,
                        'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-muted'
                      )}
                    >
                      {tool.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
