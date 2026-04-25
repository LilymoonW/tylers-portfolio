'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project } from '@/types'

interface VideoModalContextType {
  activeProject: Project | null
  openModal: (project: Project) => void
  closeModal: () => void
}

const VideoModalContext = createContext<VideoModalContextType>({
  activeProject: null,
  openModal: () => {},
  closeModal: () => {},
})

export function useVideoModal() {
  return useContext(VideoModalContext)
}

function decodePortfolioHashId(fragment: string) {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}

/** `#portfolio/id` (current) or legacy `#work/id` from older shares. */
function projectIdFromLocationHash(hash: string): string | null {
  if (hash.startsWith('#portfolio/')) return hash.slice('#portfolio/'.length)
  if (hash.startsWith('#work/')) return hash.slice('#work/'.length)
  return null
}

export default function VideoModalProvider({ children, projects }: { children: ReactNode; projects: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const openModal = useCallback((project: Project) => {
    const external = project.cardHref?.trim()
    if (external) {
      window.open(external, '_blank', 'noopener,noreferrer')
      return
    }
    setActiveProject(project)
    document.body.classList.add('scroll-locked')
    window.history.pushState(null, '', `#portfolio/${encodeURIComponent(project.id)}`)
  }, [])

  const closeModal = useCallback(() => {
    setActiveProject(null)
    document.body.classList.remove('scroll-locked')
    window.history.pushState(null, '', window.location.pathname)
  }, [])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash
      const raw = projectIdFromLocationHash(hash)
      if (raw != null) {
        const id = decodePortfolioHashId(raw)
        const project =
          projects.find((p) => p.id === id) ?? projects.find((p) => p.id === raw)
        if (project) {
          const external = project.cardHref?.trim()
          if (external) {
            window.open(external, '_blank', 'noopener,noreferrer')
            window.history.replaceState(null, '', window.location.pathname)
            return
          }
          setActiveProject(project)
          document.body.classList.add('scroll-locked')
          return
        }
      }
      setActiveProject(null)
      document.body.classList.remove('scroll-locked')
    }

    window.addEventListener('popstate', handlePopState)

    // Check hash on mount
    handlePopState()

    return () => window.removeEventListener('popstate', handlePopState)
  }, [projects])

  return (
    <VideoModalContext.Provider value={{ activeProject, openModal, closeModal }}>
      {children}
    </VideoModalContext.Provider>
  )
}
