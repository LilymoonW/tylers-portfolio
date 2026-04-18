'use client'

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { useScroll, type MotionValue } from 'framer-motion'

type IntroScrollContextValue = {
  introSectionRef: RefObject<HTMLElement | null>
  scrollYProgress: MotionValue<number>
}

const IntroScrollContext = createContext<IntroScrollContextValue | null>(null)

export function IntroScrollProvider({ children }: { children: ReactNode }) {
  const introSectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: introSectionRef,
    offset: ['start start', 'end start'],
  })

  return (
    <IntroScrollContext.Provider value={{ introSectionRef, scrollYProgress }}>
      {children}
    </IntroScrollContext.Provider>
  )
}

export function useIntroScroll() {
  const ctx = useContext(IntroScrollContext)
  if (!ctx) {
    throw new Error('useIntroScroll must be used within IntroScrollProvider')
  }
  return ctx
}
