'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ParallaxLayerConfig } from '@/types'

const placeholderLayers: ParallaxLayerConfig[] = [
  {
    defaultSrc: '/images/layers/layer-bg-default.png',
    hoverSrc: '/images/layers/layer-bg-hover.png',
    speed: 0.2,
    position: { x: '0%', y: '0%' },
    zIndex: 1,
    size: { width: '100%', height: '100%' },
  },
  {
    defaultSrc: '/images/layers/layer-mid-default.png',
    hoverSrc: '/images/layers/layer-mid-hover.png',
    speed: 0.5,
    position: { x: '10%', y: '5%' },
    zIndex: 2,
    size: { width: '80%', height: '80%' },
  },
  {
    defaultSrc: '/images/layers/layer-fg-default.png',
    hoverSrc: '/images/layers/layer-fg-hover.png',
    speed: 0.9,
    position: { x: '5%', y: '10%' },
    zIndex: 3,
    size: { width: '60%', height: '60%' },
  },
]

function ParallaxLayer({
  layer,
  scrollProgress,
}: {
  layer: ParallaxLayerConfig
  scrollProgress: ReturnType<typeof useTransform<number, number>>
}) {
  const [isHovered, setIsHovered] = useState(false)
  const y = useTransform(scrollProgress, [0, 1], [0, -200 * layer.speed])

  return (
    <motion.div
      className="absolute"
      style={{
        left: layer.position.x,
        top: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
        zIndex: layer.zIndex,
        y,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor="expand"
    >
      {/* Default image */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 0 : 1 }}
      >
        {/* Placeholder colored shape until Tyler provides PNGs */}
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: `linear-gradient(135deg, var(--color-deep-blue), var(--color-cyan))`,
            opacity: 0.3 + layer.speed * 0.3,
          }}
        />
        {/* When images are ready: */}
        {/* <img src={layer.defaultSrc} alt="" className="w-full h-full object-contain" /> */}
      </div>

      {/* Hover image */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: `linear-gradient(135deg, var(--color-orange), var(--color-red))`,
            opacity: 0.3 + layer.speed * 0.3,
          }}
        />
        {/* When images are ready: */}
        {/* <img src={layer.hoverSrc} alt="" className="w-full h-full object-contain" /> */}
      </div>
    </motion.div>
  )
}

export default function ParallaxLayers() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {placeholderLayers.map((layer, i) => (
        <ParallaxLayer
          key={i}
          layer={layer}
          scrollProgress={scrollYProgress}
        />
      ))}
    </div>
  )
}
