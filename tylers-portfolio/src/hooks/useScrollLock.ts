'use client'

import { useEffect } from 'react'

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      document.body.classList.add('scroll-locked')
    } else {
      document.body.classList.remove('scroll-locked')
    }

    return () => {
      document.body.classList.remove('scroll-locked')
    }
  }, [locked])
}
