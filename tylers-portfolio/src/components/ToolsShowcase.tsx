'use client'

import type { Tool } from '@/types'
import { PinContainer } from '@/components/ui/3d-pin'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.id} delay={i * 0.05}>
              <div className="h-[320px] flex items-center justify-center" data-cursor="expand">
                <PinContainer
                  title={tool.category}
                  containerClassName="w-full h-[280px]"
                >
                  <div className="flex flex-col items-center justify-center w-[180px] p-4">
                    {/* Icon placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover/pin:bg-bright-blue/10 transition-colors">
                      <span className="font-display text-2xl text-muted group-hover/pin:text-bright-blue transition-colors">
                        {tool.name.charAt(0)}
                      </span>
                    </div>

                    <h3 className="font-display text-xl uppercase text-white text-center">
                      {tool.name}
                    </h3>
                    <p className="text-muted text-xs uppercase tracking-widest mt-2">
                      {tool.category}
                    </p>

                    {/* Gradient bar */}
                    <div className="w-full h-1 rounded-full mt-4 bg-gradient-to-r from-bright-blue via-cyan to-bright-blue/0" />
                  </div>
                </PinContainer>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
