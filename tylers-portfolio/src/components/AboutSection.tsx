'use client'

import { Timeline } from '@/components/ui/timeline'
import {
  bannerTypeBase,
  bannerTypeBodyInk,
  bannerTypeBodyLightSoft,
  bannerTypeHeadingMuted,
  bannerTypeSectionInk,
  bannerTypeTimelineJob,
} from '@/config/scrollBanner'
import { cn } from '@/lib/utils'
import ScrollReveal from './ScrollReveal'

const timelineJobClass = bannerTypeTimelineJob
const timelineBodyClass = bannerTypeBodyLightSoft

const timelineData = [
  {
    title: '2024',
    content: (
      <div>
        <p className={timelineJobClass}>Senior VFX Editor &middot; Freelance</p>
        <p className={timelineBodyClass}>
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
        <p className={timelineJobClass}>VFX Editor &middot; Creative Studio</p>
        <p className={timelineBodyClass}>
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
        <p className={timelineJobClass}>Junior Editor &middot; Production House</p>
        <p className={timelineBodyClass}>
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
        <p className={timelineJobClass}>Editing Intern &middot; Media Company</p>
        <p className={timelineBodyClass}>
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
    <section id="about" className="relative py-24">
      <div className="relative z-[1] max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <h2 className={cn(bannerTypeSectionInk, 'mb-4')}>About</h2>
        </ScrollReveal>

        {/* Bio */}
        <ScrollReveal delay={0.1}>
          <div className="mb-20 max-w-2xl space-y-4">
            <p className={cn(bannerTypeBodyInk, 'text-lg')}>
              I&apos;m Tyler Yoon, a VFX editor who lives at the intersection of
              storytelling and visual effects. I believe every cut should have a
              reason and every frame should feel intentional.
            </p>
            <p className={cn(bannerTypeBase, 'text-sm md:text-base text-ink leading-relaxed')}>
              From high-energy commercials to experimental music videos, I bring
              visual concepts to life through precise editing and creative VFX
              work.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal delay={0.2}>
          <h3 className={cn(bannerTypeHeadingMuted, 'mb-12')}>Experience</h3>
        </ScrollReveal>

        <Timeline data={timelineData} />
      </div>
    </section>
  )
}
