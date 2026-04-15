'use client'

import { Timeline } from '@/components/ui/timeline'
import ScrollReveal from './ScrollReveal'

const timelineData = [
  {
    title: '2024',
    content: (
      <div>
        <p className="mb-4 text-sm text-white/70">
          Senior VFX Editor &middot; Freelance
        </p>
        <p className="text-sm text-white/50 leading-relaxed">
          Working with top brands and artists on high-energy commercial campaigns,
          music videos, and social media content. Specializing in After Effects,
          Blender, and Cinema 4D for cutting-edge VFX work.
        </p>
      </div>
    ),
  },
  {
    title: '2023',
    content: (
      <div>
        <p className="mb-4 text-sm text-white/70">
          VFX Editor &middot; Creative Studio
        </p>
        <p className="text-sm text-white/50 leading-relaxed">
          Led VFX editing for major brand campaigns. Developed a workflow that
          cut post-production time by 40% while maintaining quality. Collaborated
          with directors and producers on narrative-driven commercial projects.
        </p>
      </div>
    ),
  },
  {
    title: '2022',
    content: (
      <div>
        <p className="mb-4 text-sm text-white/70">
          Junior Editor &middot; Production House
        </p>
        <p className="text-sm text-white/50 leading-relaxed">
          Started as a junior editor working on short-form content and social
          media edits. Quickly moved into VFX work, learning compositing and
          motion graphics on the job.
        </p>
      </div>
    ),
  },
  {
    title: '2021',
    content: (
      <div>
        <p className="mb-4 text-sm text-white/70">
          Editing Intern &middot; Media Company
        </p>
        <p className="text-sm text-white/50 leading-relaxed">
          First professional editing experience. Learned the fundamentals of
          pacing, rhythm, and storytelling through editing. Discovered a passion
          for visual effects and post-production.
        </p>
      </div>
    ),
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-7xl uppercase mb-4">
            About
          </h2>
        </ScrollReveal>

        {/* Bio */}
        <ScrollReveal delay={0.1}>
          <div className="mb-20 max-w-2xl space-y-4">
            <p className="text-lg text-white/80 leading-relaxed">
              I&apos;m Tyler Yoon, a VFX editor who lives at the intersection of
              storytelling and visual effects. I believe every cut should have a
              reason and every frame should feel intentional.
            </p>
            <p className="text-white/60 leading-relaxed">
              From high-energy commercials to experimental music videos, I bring
              visual concepts to life through precise editing and creative VFX
              work.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal delay={0.2}>
          <h3 className="font-display text-3xl uppercase text-muted mb-12">
            Experience
          </h3>
        </ScrollReveal>

        <Timeline data={timelineData} />
      </div>
    </section>
  )
}
