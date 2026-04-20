import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Project } from '@/types'
import ProjectVideoPlayer from '@/components/work/ProjectVideoPlayer'
import { bannerTypeChip } from '@/config/scrollBanner'
import { cn, formatNumber } from '@/lib/utils'

function TemplateSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 md:p-7">
      <p className={cn(bannerTypeChip, 'mb-4 uppercase text-black/45')}>{label}</p>
      {children}
    </section>
  )
}

export default function ProjectPageTemplate({ project }: { project: Project }) {
  const titleUpper = project.title.toUpperCase()
  const breakToken = ' 32 TEAM '
  const titleNeedsBreak = titleUpper.includes(breakToken)
  const [titleBeforeBreak, titleAfterBreak] = titleNeedsBreak
    ? titleUpper.split(breakToken)
    : [titleUpper, '']

  return (
    <main className="project-page-uppercase mx-auto min-h-screen w-full max-w-[1400px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <div className="mb-6 flex justify-center">
          <Link
            href="/work"
            className={cn(
              bannerTypeChip,
              'uppercase text-black/65 transition hover:text-black hover:underline underline-offset-4 decoration-1',
            )}
          >
            Back
          </Link>
        </div>
        <h1
          className="w-full font-display text-4xl font-bold italic uppercase tracking-[-0.03em] text-black md:text-6xl"
          style={{ textAlign: 'justify', textJustify: 'inter-word', textAlignLast: 'justify' }}
        >
          {titleNeedsBreak ? (
            <>
              {titleBeforeBreak} 32
              <br />
              TEAM {titleAfterBreak}
            </>
          ) : (
            titleUpper
          )}
        </h1>
      </header>

      <div className="space-y-5 md:space-y-6">
        <TemplateSection label="Media">
          <div className="flex w-full justify-center">
            <div
              className={cn(
                'w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]',
                'aspect-square max-w-[680px]',
              )}
            >
              {project.videoSrc ? (
                <ProjectVideoPlayer src={project.videoSrc} poster={project.thumbnail} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-xs text-black/45 md:text-sm">
                  VIDEO GOES HERE
                </div>
              )}
            </div>
          </div>
        </TemplateSection>

        <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 md:p-7">
          <p className="project-page-bio whitespace-pre-line font-display text-sm font-bold italic leading-[1.2] tracking-[-0.01em] text-black/75 md:text-base">
            {project.bio ?? 'Add your project bio here.'}
          </p>
        </section>

        <TemplateSection label="Project Info">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, 'uppercase text-black/45')}>Brand</p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">{project.brand}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, 'uppercase text-black/45')}>Year</p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">{project.year}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, 'uppercase text-black/45')}>Role</p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">{project.role}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, 'uppercase text-black/45')}>Views</p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">
                {formatNumber(project.viewCount, 'abbreviated')}
              </p>
            </div>
          </div>
        </TemplateSection>

        <TemplateSection label="Videographers">
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className="mt-1 text-sm uppercase text-black/55 md:text-base">AJ Poindexter</p>
            </div>
          </div>
        </TemplateSection>
      </div>
    </main>
  )
}
