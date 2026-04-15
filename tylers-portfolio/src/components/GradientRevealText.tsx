'use client'

import { motion } from 'framer-motion'

interface GradientRevealTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export default function GradientRevealText({
  text,
  className = '',
  delay = 3.5,
  duration = 1.5,
}: GradientRevealTextProps) {
  const chars = text.split('')

  return (
    <span className={`inline-flex flex-wrap justify-center ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block text-white"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.5,
            delay: delay + i * (duration / chars.length),
            ease: 'easeOut',
          }}
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.1)',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
