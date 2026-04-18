'use client'

import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { formatNumber, cn } from '@/lib/utils'
import { bannerTypeBase, bannerTypeChip } from '@/config/scrollBanner'
import { ProjectThumbnailMedia } from '@/components/ProjectThumbnailMedia'
import { PinContainer } from '@/components/ui/3d-pin'

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
      className="cursor-pointer"
      onClick={onClick}
      data-cursor="play"
    >
      <PinContainer
        title={`${project.brand} · ${project.duration}`}
        containerClassName="w-full h-[420px] md:h-[480px]"
      >
        <div className="flex flex-col w-[160px] md:w-[200px]">
          {/* Thumbnail */}
          <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '9/16' }}>
            <ProjectThumbnailMedia src={project.thumbnail} zoom={project.thumbnailZoom} />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 to-transparent"
              aria-hidden
            />

            {/* Views badge */}
            <div
              className={cn(
                bannerTypeChip,
                'absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm'
              )}
            >
              {formatNumber(project.viewCount, 'abbreviated')}
            </div>

            {/* Play icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 transition-opacity z-10">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-3">
            <h3 className={cn(bannerTypeBase, 'truncate text-base leading-none text-white')}>
              {project.title}
            </h3>
            <p className={cn(bannerTypeBase, 'mt-0.5 text-[11px] leading-none text-white/70')}>
              {project.role} · {project.year}
            </p>
            <div className="flex gap-1 mt-2">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    bannerTypeChip,
                    'rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-white/70'
                  )}
                >
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PinContainer>
    </motion.div>
  )
}
