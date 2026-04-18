import { projects } from '@/data/projects'
import { brandMarqueeBottomRow, brandMarqueeTopRow } from '@/data/brands'
import { stats } from '@/data/stats'
import IntroGate from '@/components/IntroGate'
import IntroWaveDivider from '@/components/IntroWaveDivider'
import ScrollNav from '@/components/ScrollNav'
import { IntroScrollProvider } from '@/components/providers/IntroScrollProvider'
import BrandMarquee from '@/components/BrandMarquee'
import BrandsEyeBanner from '@/components/BrandsEyeBanner'
import BrandsGradientBridge from '@/components/BrandsGradientBridge'
import FeaturedWork from '@/components/FeaturedWork'
import StatsSection from '@/components/StatsSection'
import VideoModalProvider from '@/components/VideoModalProvider'
import VideoModal from '@/components/VideoModal'

const featuredProjects = projects.filter((p) => p.featured)

/** Black → paper: `color-mix` ramp from black to `--color-white`. */
const paperBridgeGradient = `linear-gradient(to bottom in oklch, ${Array.from(
  { length: 36 },
  (_, i) => {
    const t = i / 35
    const pos = `${(t * 100).toFixed(2)}%`
    if (i === 35) return `var(--color-white, #ebe6de) ${pos}`
    const w = (t * 100).toFixed(4)
    const b = (100 - Number(w)).toFixed(4)
    return `color-mix(in oklch, var(--color-white, #ebe6de) ${w}%, black ${b}%) ${pos}`
  },
).join(', ')})`

export default function Home() {
  return (
    <VideoModalProvider projects={projects}>
      <IntroScrollProvider>
        <IntroGate />
        <IntroWaveDivider />
        <ScrollNav />
      </IntroScrollProvider>
      <div className="relative z-[15] overflow-visible" style={{ backgroundColor: '#000000' }}>
        <BrandsGradientBridge />
        <BrandMarquee topRow={brandMarqueeTopRow} bottomRow={brandMarqueeBottomRow} />
        <BrandsEyeBanner />
        <FeaturedWork projects={featuredProjects} />
        <StatsSection stats={stats} />
        <div className="pointer-events-none relative left-1/2 z-[1] w-screen shrink-0 -translate-x-1/2 -mt-[min(10vh,6.5rem)]">
          <div
            aria-hidden
            className="paper-bridge-strip relative isolate h-[min(120vh,1100px)] w-full overflow-hidden"
          >
            <div className="absolute inset-0" style={{ background: paperBridgeGradient }} />
            <div className="gradient-film-grain absolute inset-0" aria-hidden />
          </div>
        </div>
      </div>
      <VideoModal />
    </VideoModalProvider>
  )
}
