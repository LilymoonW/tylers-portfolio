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

export default function VideoModalProvider({ children, projects }: { children: ReactNode; projects: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const openModal = useCallback((project: Project) => {
    setActiveProject(project)
    document.body.classList.add('scroll-locked')
    window.history.pushState(null, '', `#work/${project.id}`)
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
      if (hash.startsWith('#work/')) {
        const id = hash.replace('#work/', '')
        const project = projects.find((p) => p.id === id)
        if (project) {
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
