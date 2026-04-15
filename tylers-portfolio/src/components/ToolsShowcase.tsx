'use client'

import { motion } from 'framer-motion'
import type { Tool } from '@/types'
import ScrollReveal from './ScrollReveal'

export default function ToolsShowcase({ tools }: { tools: Tool[] }) {
  return (
    <section id="tools" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-7xl uppercase mb-4">
            Tools
          </h2>
          <p className="text-muted mb-12">Software I use to bring ideas to life.</p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.id} delay={i * 0.05}>
              <motion.div
                className="p-6 rounded-xl bg-surface border border-white/5 hover:border-bright-blue/30 transition-all group"
                whileHover={{ y: -4 }}
                data-cursor="expand"
              >
                {/* Placeholder icon */}
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-bright-blue/10 transition-colors">
                  <span className="font-display text-lg text-muted group-hover:text-bright-blue transition-colors">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase">{tool.name}</h3>
                <p className="text-muted text-xs uppercase tracking-widest mt-1">
                  {tool.category}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
