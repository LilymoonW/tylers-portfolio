'use client'

import ScrollReveal from './ScrollReveal'

export default function AboutSection() {
  return (
    <section id="about" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-7xl uppercase mb-8">
            About
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Bio */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              <p className="text-lg text-white/80 leading-relaxed">
                I&apos;m Tyler Yoon, a VFX editor who lives at the intersection of
                storytelling and visual effects. I believe every cut should have a
                reason and every frame should feel intentional.
              </p>
              <p className="text-white/60 leading-relaxed">
                From high-energy commercials to experimental music videos, I bring
                visual concepts to life through precise editing and creative VFX
                work. My approach combines technical expertise with an instinct
                for rhythm and pacing.
              </p>
              <p className="text-white/60 leading-relaxed">
                When I&apos;m not editing, you&apos;ll find me experimenting with new
                visual techniques and pushing the boundaries of what&apos;s possible
                in post-production.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-6">
              <h3 className="font-display text-2xl uppercase text-muted">Experience</h3>

              {[
                { year: '2024', role: 'Senior VFX Editor', company: 'Freelance' },
                { year: '2023', role: 'VFX Editor', company: 'Creative Studio' },
                { year: '2022', role: 'Junior Editor', company: 'Production House' },
                { year: '2021', role: 'Editing Intern', company: 'Media Company' },
              ].map((item) => (
                <div
                  key={item.year}
                  className="flex items-start gap-4 border-l border-white/10 pl-4 hover:border-bright-blue transition-colors"
                >
                  <span className="font-display text-bright-blue text-lg">{item.year}</span>
                  <div>
                    <p className="text-white/80">{item.role}</p>
                    <p className="text-muted text-sm">{item.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
