import { notFound } from 'next/navigation'
import ProjectPageTemplate from '@/components/work/ProjectPageTemplate'
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
  return projects.map((project) => ({ projectId: encodeURIComponent(project.id) }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const decodedId = decodeProjectId(projectId)
  const project = projects.find((item) => item.id === decodedId)

  if (!project) notFound()

  return <ProjectPageTemplate project={project} />
}
