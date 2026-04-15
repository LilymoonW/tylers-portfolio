'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface FullBleedDividerProps {
  gradient?: string
  height?: string
}

export default function FullBleedDivider({
  gradient = 'from-deep-blue via-indigo to-bg',
  height = 'h-64 md:h-96',
}: FullBleedDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <div ref={ref} className={`relative ${height} overflow-hidden`}>
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        style={{ y }}
      />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/textures/grain.png')] bg-repeat mix-blend-overlay" />
    </div>
  )
}
