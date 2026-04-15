'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Project } from '@/types'
import FilterChips from './FilterChips'
import WorkCard from './WorkCard'
import { useVideoModal } from './VideoModalProvider'
import ScrollReveal from './ScrollReveal'

export default function AllWork({ projects }: { projects: Project[] }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const { openModal } = useVideoModal()

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [projects])

  const filtered = useMemo(() => {
    if (activeFilters.length === 0) return projects
    return projects.filter((p) => p.tags.some((t) => activeFilters.includes(t)))
  }, [projects, activeFilters])

  const handleToggle = (tag: string) => {
    if (tag === '__clear__') {
      setActiveFilters([])
      return
    }
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <section id="work" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-7xl uppercase mb-8">
            All Work
          </h2>
        </ScrollReveal>

        <FilterChips tags={allTags} active={activeFilters} onToggle={handleToggle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <WorkCard
                key={project.id}
                project={project}
                onClick={() => openModal(project)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
