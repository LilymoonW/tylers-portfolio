import Link from "next/link";
import dynamic from "next/dynamic";
import { projects } from "@/data/projects";
import { brandMarqueeBottomRow, brandMarqueeTopRow } from "@/data/brands";
import { bannerTypeChip } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import MotionToggle from "@/components/MotionToggle";
import VideoModalProvider from "@/components/VideoModalProvider";

const HomeIntro = dynamic(() => import("@/components/HomeIntro"), {
  loading: () => <div className="h-[200vh] w-full bg-[var(--color-bg)]" aria-hidden />,
});
const BrandsGradientBridge = dynamic(
  () => import("@/components/BrandsGradientBridge"),
  {
    loading: () => <div className="h-[85vh] w-full" aria-hidden />,
  },
);
const BrandMarquee = dynamic(() => import("@/components/BrandMarquee"), {
  loading: () => (
    <div className="h-[260px] w-full bg-transparent" aria-hidden />
  ),
});
const TopEyeBanner = dynamic(() => import("@/components/TopEyeBanner"));
const FeaturedWork = dynamic(() => import("@/components/FeaturedWork"), {
  loading: () => (
    <div className="h-[600px] w-full bg-transparent" aria-hidden />
  ),
});
const VideoModal = dynamic(() => import("@/components/VideoModal"));

const featuredProjects = projects.filter((p) => p.featured);

const footerLinkClass = cn(
  bannerTypeChip,
  "uppercase text-[1.125em] text-white/70 transition hover:text-white hover:underline underline-offset-4 decoration-1 pointer-events-auto",
);

/*
 * Layer order, bottom to top: page paper (html) → intro + signature (transparent,
 * in flow) → BrandsGradientBridge (paper → glow → black, sized by its own height)
 * → the dark column, which starts exactly where the bridge ends. The film grain is
 * one fixed layer (`body::after`, z-20 in globals.css), so nothing here paints its
 * own. The column must not create a stacking context (no z-index) so the marquee
 * (z-30) and the featured row (z-40) can sit above the grain while the black
 * background stays under it.
 */
export default function Home() {
  return (
    <VideoModalProvider projects={featuredProjects}>
      <main id="main">
        <h1 className="sr-only">Tyler Yoon, VFX editor and motion designer</h1>
        <HomeIntro />
        <TopEyeBanner />
        <BrandsGradientBridge heightVh={85} />
        {/* -mt-px: overlap the bridge's fractional (vh) bottom edge so no paper hairline shows. */}
        <div className="relative -mt-px bg-black">
          <BrandMarquee
            topRow={brandMarqueeTopRow}
            bottomRow={brandMarqueeBottomRow}
          />
          {/* Own compositing layer + fixed-width opaque box: the label swap repaints one clean rect. */}
          <div className="relative z-[30] flex transform-gpu justify-center px-6 pb-[clamp(2rem,8vh,6rem)]">
            <MotionToggle
              className={cn(
                footerLinkClass,
                "min-w-[14ch] bg-black px-2 py-1 text-center text-white/50",
              )}
            />
          </div>
          <div className="relative z-[40] isolate">
            <FeaturedWork projects={featuredProjects} />
          </div>
          <section
            className="relative z-[40] flex flex-col gap-[8rem]"
            aria-label="More"
          >
            <nav
              className="relative z-[60] flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 pt-[clamp(3rem,10vh,5rem)] pointer-events-auto"
              aria-label="Page footer"
            >
              <Link href="/contact" className={footerLinkClass}>
                CONTACT
              </Link>
              <Link href="/portfolio" className={footerLinkClass}>
                PORTFOLIO
              </Link>
            </nav>
            <div className="mx-auto max-w-2xl px-6 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] text-center">
              <p className="font-body text-balance text-base leading-relaxed text-white/60">
                NYC-based VFX, motion graphics, and design.
                <br />
                Video content producer for Major League Baseball.
                <br />
                <br />
                <span className="text-sm text-white/60">Tyler Yoon, 2026</span>
              </p>
            </div>
          </section>
        </div>
      </main>
      <VideoModal />
    </VideoModalProvider>
  );
}
