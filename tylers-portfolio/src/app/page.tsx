import { projects } from '@/data/projects'
import { brands } from '@/data/brands'
import { tools } from '@/data/tools'
import { stats } from '@/data/stats'
import { showcaseItems } from '@/data/showcase'
import IntroGate from '@/components/IntroGate'
import Hero from '@/components/Hero'
import ScrollNav from '@/components/ScrollNav'
import BrandMarquee from '@/components/BrandMarquee'
import FullBleedDivider from '@/components/FullBleedDivider'
import ScrollShowcase from '@/components/ScrollShowcase'
import FeaturedWork from '@/components/FeaturedWork'
import StatsSection from '@/components/StatsSection'
import AllWork from '@/components/AllWork'
import ToolsShowcase from '@/components/ToolsShowcase'
import AboutSection from '@/components/AboutSection'
import ContactSection from '@/components/ContactSection'
import VideoModalProvider from '@/components/VideoModalProvider'
import VideoModal from '@/components/VideoModal'

const featuredProjects = projects.filter((p) => p.featured)

export default function Home() {
  return (
    <VideoModalProvider projects={projects}>
      <IntroGate />
      <Hero />
      <ScrollNav />
      <BrandMarquee brands={brands} />
      <FullBleedDivider gradient="from-deep-blue via-indigo to-bg" />
      <ScrollShowcase title="Selected Work" items={showcaseItems} />
      <FeaturedWork projects={featuredProjects} />
      <StatsSection stats={stats} />
      <FullBleedDivider gradient="from-indigo via-deep-blue to-bg" />
      <AllWork projects={projects} />
      <ToolsShowcase tools={tools} />
      <FullBleedDivider gradient="from-deep-blue via-bg to-indigo" />
      <AboutSection />
      <ContactSection />
      <VideoModal />
    </VideoModalProvider>
  )
}
