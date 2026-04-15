'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface SignatureRevealProps {
  /** SVG path data for the signature. Replace with Tyler's actual signature path. */
  pathData?: string
  className?: string
  color?: string
  strokeWidth?: number
}

// Placeholder signature path -- replace with Tyler's actual signature SVG path
const DEFAULT_SIGNATURE_PATH =
  'M10,80 Q30,10 50,80 T90,80 T130,80 Q150,60 170,80 Q190,40 210,80 L230,80 Q250,30 270,80 L290,75'

export default function SignatureReveal({
  pathData = DEFAULT_SIGNATURE_PATH,
  className = '',
  color = '#0066FF',
  strokeWidth = 2,
}: SignatureRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.6'],
  })

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 100"
        className="w-full max-w-md mx-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow/ghost path */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.1}
        />
        {/* Animated drawing path */}
        <motion.path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength,
            opacity,
          }}
        />
      </svg>
    </div>
  )
}
