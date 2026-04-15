'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import ParallaxLayers from './ParallaxLayers'
import GradientRevealText from './GradientRevealText'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[200vh]"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background layers */}
        <ParallaxLayers />

        {/* Hero content overlay */}
        <div className="relative z-10 text-center px-4">
          {/* Logo */}
          <motion.div
            className="mx-auto mb-6 w-20 h-20 md:w-28 md:h-28"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 3.2, ease: 'easeOut' }}
          >
            <Image
              src="/yoonLogo.png"
              alt="Tyler Yoon logo"
              width={112}
              height={112}
              className="w-full h-full object-contain"
              priority
            />
          </motion.div>

          {/* Name - gradient reveal text */}
          <h1 className="font-display text-[clamp(4rem,15vw,12rem)] leading-[0.9] uppercase tracking-tight">
            <GradientRevealText text="Tyler Yoon" delay={3.5} duration={1.5} />
          </h1>

          {/* Tagline */}
          <motion.p
            className="mt-4 text-lg md:text-xl text-white/60 max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 5, ease: 'easeOut' }}
          >
            VFX Editor & Visual Storyteller
          </motion.p>

          {/* Scroll prompt */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 5.5 }}
          >
            <motion.div
              className="w-[1px] h-12 bg-white/30 mx-auto"
              animate={{ scaleY: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">
              Scroll to explore
            </p>
          </motion.div>
        </div>

        {/* Bottom gradient fade to bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
      </div>
    </section>
  )
}
