'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ScrollReveal from './ScrollReveal'

export interface ShowcaseItem {
  id: string
  label: string
  defaultSrc: string
  hoverSrc: string
}

interface ScrollShowcaseProps {
  title?: string
  items: ShowcaseItem[]
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="flex-shrink-0 flex flex-col items-center gap-4 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      data-cursor="expand"
    >
      <div className="relative w-40 h-56 md:w-52 md:h-72">
        {/* Default image */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <Image
            src={item.defaultSrc}
            alt={item.label}
            fill
            className="object-contain"
          />
        </div>

        {/* Hover image */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <Image
            src={item.hoverSrc}
            alt={`${item.label} hover`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Label */}
      <motion.p
        className="text-xs md:text-sm uppercase tracking-widest text-muted transition-colors"
        animate={{ color: isHovered ? '#0066FF' : '#888899' }}
      >
        {item.label}
      </motion.p>
    </motion.div>
  )
}

export default function ScrollShowcase({ title = 'Selected Work', items }: ScrollShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-24">
      {title && (
        <ScrollReveal>
          <p className="text-center text-sm md:text-base text-muted mb-16 tracking-widest uppercase">
            {title}
          </p>
        </ScrollReveal>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="flex items-end justify-center gap-8 md:gap-14 px-8 md:px-16 min-w-max mx-auto">
          {items.map((item) => (
            <ScrollReveal key={item.id} delay={0.05}>
              <ShowcaseCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
