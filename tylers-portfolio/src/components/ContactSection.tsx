'use client'

import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import SignatureReveal from './SignatureReveal'

export default function ContactSection() {
  return (
    <section id="contact" className="py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Signature that draws as you scroll */}
        <SignatureReveal className="mb-12" />

        <ScrollReveal>
          <p className="text-muted text-sm uppercase tracking-[0.3em] mb-4">
            Still here?
          </p>
          <h2 className="font-display text-6xl md:text-8xl uppercase mb-6">
            Let&apos;s Work
            <br />
            <span className="text-bright-blue">Together</span>
          </h2>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            Got a project in mind? I&apos;m always open to discussing new ideas
            and creative collaborations.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <motion.a
            href="mailto:tyler@example.com"
            className="inline-block px-8 py-4 rounded-full bg-bright-blue text-white font-display text-xl uppercase tracking-wider hover:bg-bright-blue/80 transition-colors"
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
                className="text-muted text-sm uppercase tracking-widest hover:text-white transition-colors"
                data-cursor="expand"
              >
                {platform}
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-white/5">
          <p className="text-muted/50 text-xs">
            &copy; {new Date().getFullYear()} Tyler Yoon. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  )
}
