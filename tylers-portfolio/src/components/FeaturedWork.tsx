'use client'

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { ProjectThumbnailMedia } from './ProjectThumbnailMedia'
import { useVideoModal } from './VideoModalProvider'
import { formatNumber, cn } from '@/lib/utils'
import { useInViewActive } from '@/hooks/useInViewActive'
import {
  bannerTypeCardMeta,
  bannerTypeCardTitleLight,
  bannerTypeChip,
  bannerTypeMetaLight,
} from '@/config/scrollBanner'

/** ~px/s along the track — duration scales with measured period so speed stays stable when the roster changes. */
const FEATURED_MARQUEE_PX_PER_SEC = 52

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const isActive = useInViewActive(sectionRef, { rootMargin: '0px', threshold: 0 })
  const trackRef = useRef<HTMLDivElement>(null)
  const [periodPx, setPeriodPx] = useState(0)

  const doubled = useMemo(() => [...projects, ...projects], [projects])

  const measurePeriod = useCallback(() => {
    const track = trackRef.current
    if (!track || projects.length === 0) return
    const cards = track.querySelectorAll<HTMLElement>('[data-marquee-card]')
    if (cards.length < projects.length * 2) return
    const a = cards[0].getBoundingClientRect().left
    const b = cards[projects.length].getBoundingClientRect().left
    const px = Math.round(b - a)
    if (px > 0) setPeriodPx(px)
  }, [projects.length])

  useLayoutEffect(() => {
    if (!isActive) return
    measurePeriod()
    const ro = new ResizeObserver(() => measurePeriod())
    const el = trackRef.current
    if (el) ro.observe(el)
    window.addEventListener('resize', measurePeriod)
    const id = window.requestAnimationFrame(() => measurePeriod())
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measurePeriod)
      window.cancelAnimationFrame(id)
    }
  }, [isActive, measurePeriod])

  const durationSec =
    periodPx > 0 ? Math.max(28, periodPx / FEATURED_MARQUEE_PX_PER_SEC) : 45

  return (
    <section id="featured" ref={sectionRef} className="relative z-[20] pt-0 pb-24">
      {/*
        Hide horizontal marquee bleed without clipping hover motion vertically: plain
        `overflow-x-hidden` forces `overflow-y` to compute to `auto`, which chops off the
        `whileHover` translateY on the cards. `overflow-x: clip` keeps Y visible per CSS Overflow 3.
      */}
      <div className="relative overflow-x-clip overflow-y-visible">
        <div
          ref={trackRef}
          className="featured-work-track relative flex w-max items-end gap-6 md:gap-8"
          style={
            {
              '--featured-period': `${periodPx}px`,
              '--featured-duration': `${durationSec}s`,
              '--featured-play-state': isActive ? 'running' : 'paused',
            } as CSSProperties
          }
        >
          {doubled.map((project, i) => (
            <CarouselCard key={`${project.id}-${i}`} project={project} priorityThumbnail={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CarouselCard({ project, priorityThumbnail = false }: { project: Project; priorityThumbnail?: boolean }) {
  const { openModal } = useVideoModal()
  const cardHref = project.cardHref?.trim()

  const cardInner = (
    <div
      className={cn(
        'group relative flex w-full flex-col justify-end overflow-hidden rounded-xl border border-white/5 p-4 shadow-xl transition-all duration-500'
      )}
      style={{ aspectRatio: '9/16' }}
    >
      <ProjectThumbnailMedia src={project.thumbnail} zoom={project.thumbnailZoom} priority={priorityThumbnail} />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/30 to-black/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-orange/25 via-red/15 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/40"
        aria-hidden
      />
      {/* View count badge */}
      <div
        className={cn(
          bannerTypeMetaLight,
          'absolute top-3 right-3 z-10 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm'
        )}
      >
        {formatNumber(project.viewCount, 'abbreviated')} views
      </div>

      {/* Play / external affordance on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          {cardHref ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </div>
      </div>

      {/* Info at bottom */}
      <div className="relative z-50 text">
        <h3
          className={cn(
            bannerTypeCardTitleLight,
            'group-hover:text-bright-blue transition-colors duration-300'
          )}
        >
          {project.title}
        </h3>
        <p
          className={cn(
            bannerTypeCardMeta,
            'group-hover:text-white/80 transition-colors duration-300'
          )}
        >
          {project.brand} &middot; {project.duration}
        </p>
        <div className="mt-2 flex gap-1">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                bannerTypeChip,
                'rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70 group-hover:bg-bright-blue/20 group-hover:text-bright-blue transition-colors duration-300'
              )}
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const hoverMotion = { y: -16 }
  const hoverTransition = { type: 'spring', stiffness: 300, damping: 20 } as const

  if (cardHref) {
    return (
      <motion.a
        href={cardHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-[220px] shrink-0 cursor-pointer no-underline md:w-[280px]"
        whileHover={hoverMotion}
        transition={hoverTransition}
        data-cursor="expand"
        data-marquee-card
      >
        {cardInner}
      </motion.a>
    )
  }

  return (
    <motion.div
      className="w-[220px] shrink-0 cursor-pointer md:w-[280px]"
      onClick={() => openModal(project)}
      whileHover={hoverMotion}
      transition={hoverTransition}
      data-cursor="play"
      data-marquee-card
    >
      {cardInner}
    </motion.div>
  )
}
