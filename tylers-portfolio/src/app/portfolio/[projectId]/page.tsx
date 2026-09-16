import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectPageTemplate from '@/components/work/ProjectPageTemplate'
import ProjectScrollToTop from '@/components/work/ProjectScrollToTop'
import { projects } from '@/data/projects'

type ProjectPageProps = {
  params: Promise<{ projectId: string }>
}

const siteTitle = 'Tyler Yoon'
/** Search / share snippets are cut at a word boundary around this length. */
const descriptionMaxChars = 160

function decodeProjectId(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function findProject(projectId: string) {
  const decodedId = decodeProjectId(projectId)
  return projects.find((item) => item.id === projectId || item.id === decodedId)
}

/** Collapse the bio's line breaks / doubled spaces and trim to ~`max` chars without splitting a word. */
function summarize(text: string, max = descriptionMaxChars) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const head = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${head.replace(/[\s,;:]+$/, '')}…`
}

export function generateStaticParams() {
  // Provide raw ids; Next handles path encoding for static params.
  return projects.map((project) => ({ projectId: project.id }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = findProject(projectId)
  // Unknown id: return nothing so the root layout's site metadata applies unchanged.
  if (!project) return {}

  const title = `${project.title} · ${siteTitle}`
  const description = summarize(
    project.bio ?? `${project.role} for ${project.brand} (${project.year}).`,
  )
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: siteTitle,
      type: 'website',
      images: [{ url: project.thumbnail }],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const project = findProject(projectId)

  if (!project) notFound()

  return (
    <>
      <ProjectScrollToTop routeKey={project.id} />
      <ProjectPageTemplate project={project} />
    </>
  )
}
