'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navSections } from '@/data/navigation'
import { useLenis } from '@/components/providers/SmoothScrollProvider'

export default function ScrollNav() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const lenis = useLenis()

  useEffect(() => {
    const heroEl = document.getElementById('hero')
    if (!heroEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show nav when hero is NOT fully in view
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [])

  // Track active section
  useEffect(() => {
    const sectionEls = navSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    )

    sectionEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -80 })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-black/30 border-b border-white/5"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo/Name */}
            <button
              onClick={() => scrollTo('hero')}
              className="font-display text-xl uppercase tracking-wider text-white/80 hover:text-white transition-colors"
              data-cursor="expand"
            >
              Tyler Yoon
            </button>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navSections.filter(s => s.id !== 'hero').map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`text-sm uppercase tracking-widest transition-colors ${
                    activeSection === section.id
                      ? 'text-bright-blue'
                      : 'text-white/50 hover:text-white'
                  }`}
                  data-cursor="expand"
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/60 hover:text-white"
              data-cursor="expand"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
