import { notFound } from 'next/navigation'
import ProjectPageTemplate from '@/components/work/ProjectPageTemplate'
import ProjectScrollToTop from '@/components/work/ProjectScrollToTop'
import { projects } from '@/data/projects'

type ProjectPageProps = {
  params: Promise<{ projectId: string }>
}

function decodeProjectId(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function generateStaticParams() {
  // Provide raw ids; Next handles path encoding for static params.
  return projects.map((project) => ({ projectId: project.id }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const decodedId = decodeProjectId(projectId)
  const project = projects.find(
    (item) => item.id === projectId || item.id === decodedId
  )

  if (!project) notFound()

  return (
    <>
      <ProjectScrollToTop routeKey={project.id} />
      <ProjectPageTemplate project={project} />
    </>
  )
}
