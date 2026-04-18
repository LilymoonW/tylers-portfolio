'use client'

import { motion } from 'framer-motion'
import {
  bannerTypeBase,
  bannerTypeBodyInk,
  bannerTypeCta,
  bannerTypeEyebrowInk,
  bannerTypeFooter,
  bannerTypeHeroInk,
} from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'
import SignatureReveal from './SignatureReveal'

export default function ContactSection() {
  return (
    <section id="contact" className="py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Signature fades in on scroll — asset: `public/sig-2026.svg` */}
        <SignatureReveal className="mt-10 mb-12" />

        <ScrollReveal>
          <p className={cn(bannerTypeEyebrowInk, 'text-center mb-4')}>Still here?</p>
          <h2 className={cn(bannerTypeHeroInk, 'text-center mb-6')}>
            Let&apos;s Work
            <br />
            <span className="text-bright-blue">Together</span>
          </h2>
          <p className={cn(bannerTypeBodyInk, 'max-w-md mx-auto mb-8 text-center')}>
            Got a project in mind? I&apos;m always open to discussing new ideas
            and creative collaborations.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <motion.a
            href="mailto:tyler@example.com"
            className={cn(
              bannerTypeCta,
              'inline-block px-8 py-4 rounded-full bg-bright-blue hover:bg-bright-blue/80 transition-colors'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-cursor="expand"
          >
            Get in Touch
          </motion.a>
        </ScrollReveal>

        {/* Social links */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-center gap-6 mt-12">
            {['Instagram', 'YouTube', 'Vimeo', 'LinkedIn'].map((platform) => (
              <a
                key={platform}
                href="#"
                className={cn(
                  bannerTypeBase,
                  'text-sm leading-none text-muted hover:text-ink transition-colors'
                )}
                data-cursor="expand"
              >
                {platform}
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Footer */}
        <div className="mt-24 pt-8">
          <p className={bannerTypeFooter}>
            &copy; {new Date().getFullYear()} Tyler Yoon. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  )
}
