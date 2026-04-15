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
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * (duration / chars.length),
            ease: 'easeOut',
          }}
        >
          <motion.span
            className="inline-block"
            style={{
              background: 'linear-gradient(90deg, #0066FF, #00AADD, #FF6600, #0066FF)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 6,
              delay: delay + i * (duration / chars.length),
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </motion.span>
      ))}
    </span>
  )
}
