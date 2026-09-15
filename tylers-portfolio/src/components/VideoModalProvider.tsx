'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { Project } from '@/types'
import { useLenis } from '@/components/providers/SmoothScrollProvider'
import { useScrollLock } from '@/hooks/useScrollLock'

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

function findProjectByHashId(list: Project[], raw: string): Project | undefined {
  const id = decodePortfolioHashId(raw)
  return list.find((p) => p.id === id) ?? list.find((p) => p.id === raw)
}

/** Current URL minus the hash — used to clear a `#portfolio/…` deep link in place. */
function locationWithoutHash() {
  return window.location.pathname + window.location.search
}

export default function VideoModalProvider({ children, projects }: { children: ReactNode; projects: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const lenis = useLenis()
  // True while the open modal owns a history entry pushed by `openModal`, so close can pop it.
  const pushedHistoryRef = useRef(false)

  // Adds/removes `scroll-locked` on body, including on unmount (client nav away with the modal open).
  useScrollLock(activeProject !== null)

  // Freeze Lenis behind the modal; the modal root carries `data-lenis-prevent` so it can scroll natively.
  useEffect(() => {
    if (!activeProject || !lenis) return
    lenis.stop()
    return () => lenis.start()
  }, [activeProject, lenis])

  const openModal = useCallback((project: Project) => {
    setActiveProject(project)
    window.history.pushState(null, '', `#portfolio/${encodeURIComponent(project.id)}`)
    pushedHistoryRef.current = true
  }, [])

  const closeModal = useCallback(() => {
    setActiveProject(null)
    if (pushedHistoryRef.current) {
      // Pop the entry `openModal` pushed so Back does not re-open the modal.
      pushedHistoryRef.current = false
      window.history.back()
      return
    }
    // Opened from a deep link or Forward: nothing of ours to pop, just drop the hash.
    window.history.replaceState(null, '', locationWithoutHash())
  }, [])

  // Keep the modal in sync with the URL hash: deep links on mount and browser Back/Forward.
  useEffect(() => {
    let disposed = false

    const syncFromHash = () => {
      const raw = projectIdFromLocationHash(window.location.hash)
      if (raw == null) {
        setActiveProject(null)
        return
      }
      const local = findProjectByHashId(projects, raw)
      if (local) {
        setActiveProject(local)
        return
      }
      // The provider may only receive the featured subset; fall back to the full catalogue.
      void import('@/data/projects').then(({ projects: all }) => {
        if (disposed || projectIdFromLocationHash(window.location.hash) !== raw) return
        const found = findProjectByHashId(all, raw)
        if (found) setActiveProject(found)
      })
    }

    const handlePopState = () => {
      // Any history traversal invalidates the entry we may have pushed.
      pushedHistoryRef.current = false
      syncFromHash()
    }

    window.addEventListener('popstate', handlePopState)
    // Deferred so the mount check does not set state synchronously inside the effect body.
    const initialSync = window.setTimeout(syncFromHash, 0)

    return () => {
      disposed = true
      window.clearTimeout(initialSync)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [projects])

  return (
    <VideoModalContext.Provider value={{ activeProject, openModal, closeModal }}>
      {children}
    </VideoModalContext.Provider>
  )
}
