'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SIGNATURE_OUTER_TEXTURE_OPACITY } from '@/config/signature'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const SIG_SRC = '/sig-2026.svg'
const SIGNATURE_INK_TEXTURE_SRC = '/textures/marker-ink-texture.png'

/** Same viewBox aspect as `sig-2026.svg` for layout + texture mask alignment. */
const SIG_ASPECT_RATIO = 1456.98 / 556.61
const SIGNATURE_INNER_BLUR_PX = 10

/**
 * Contact-section signature — Tailwind on the aspect wrapper below.
 * Tweak `max-w-[min(20rem,88vw)]` (~320px cap) or pass `imageClassName` from `ContactSection`.
 */
const SIGNATURE_WRAP_CLASS = 'relative mx-auto w-full max-w-[min(20rem,88vw)]'

interface SignatureRevealProps {
  className?: string
  /** Extra classes on the signature frame (e.g. `max-w-md`) — merged with `SIGNATURE_WRAP_CLASS`. */
  imageClassName?: string
  /** Decorative signature in contact — empty string hides from assistive tech. */
  alt?: string
}

export default function SignatureReveal({
  className = '',
  imageClassName,
  alt = '',
}: SignatureRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.6'],
  })

  const opacity = useTransform(scrollYProgress, [0.2, 0.58], [0, 1], { clamp: true })

  return (
    <div ref={containerRef} className={cn('relative z-20', className)}>
      <motion.div
        style={{ opacity, aspectRatio: SIG_ASPECT_RATIO }}
        className={cn('signature-marker-on-paper', SIGNATURE_WRAP_CLASS, imageClassName)}
      >
        <div
          className="absolute inset-0"
          style={{ filter: `blur(${SIGNATURE_INNER_BLUR_PX}px)` }}
        >
          <Image
            src={SIG_SRC}
            alt={alt}
            fill
            sizes="(max-width: 768px) 88vw, 20rem"
            className="absolute inset-0 block h-full w-full object-contain select-none"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            mixBlendMode: 'screen',
            opacity: SIGNATURE_OUTER_TEXTURE_OPACITY,
            backgroundImage: `url(${SIGNATURE_INK_TEXTURE_SRC})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '220px 220px',
            maskImage: `url(${SIG_SRC})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(${SIG_SRC})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      </motion.div>
    </div>
  )
}
