import WorkPageClient from '@/components/work/WorkPageClient'
import { projects } from '@/data/projects'

export default function WorkPage() {
  return <WorkPageClient projects={projects} />
}
