import Link from "next/link";
import { projects } from "@/data/projects";
import { brandMarqueeBottomRow, brandMarqueeTopRow } from "@/data/brands";
import { bannerTypeChip } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import FilmGrain from "@/components/FilmGrain";
import VideoModalProvider from "@/components/VideoModalProvider";

const HomeIntro = dynamic(() => import("@/components/HomeIntro"), {
  loading: () => <div className="h-[200vh] w-full bg-[var(--color-bg)]" aria-hidden />,
});
const BrandsGradientBridge = dynamic(
  () => import("@/components/BrandsGradientBridge"),
  {
    loading: () => (
      <div className="h-[120vh] w-full bg-transparent" aria-hidden />
    ),
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

export default function Home() {
  return (
    <VideoModalProvider projects={projects}>
      <HomeIntro />
      <TopEyeBanner />
      <div className="relative isolate z-[15] -mt-[10rem] min-h-[100dvh] overflow-visible bg-black">
        <div className="relative z-0">
          <BrandsGradientBridge heightVh={120} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
          style={{
            top: "clamp(6rem, 18vh, 14rem)",
            background:
              "linear-gradient(to bottom, rgb(0 0 0 / 0) 0%, rgb(0 0 0 / 0.38) 14%, rgb(0 0 0 / 0.7) 26%, rgb(0 0 0 / 0.92) 38%, rgb(0 0 0 / 0.97) 48%, rgb(0 0 0 / 1) 58%, rgb(0 0 0 / 1) 100%)",
          }}
        />
        {/*
          Bound to the dark column (not `fixed`/viewport) so it doesn't bleed
          above the column and stack a 2nd grain layer over the global
          `html::before` grain — that double-up was the hard seam at the column's
          top edge. `.film-grain` keeps `background-attachment: fixed`, so the
          texture stays viewport-locked and continuous with `html::before`.
        */}
        <FilmGrain className="absolute inset-0 z-[1]" />
        <div className="relative z-[2]">
          <BrandMarquee
            topRow={brandMarqueeTopRow}
            bottomRow={brandMarqueeBottomRow}
          />
          <div aria-hidden className="h-[clamp(2rem,8vh,6rem)] w-full" />
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
              <Link
                href="/contact"
                className={cn(
                  bannerTypeChip,
                  "uppercase text-[1.125em] text-white/70 transition hover:text-white hover:underline underline-offset-4 decoration-1 pointer-events-auto",
                )}
              >
                CONTACT
              </Link>
              <Link
                href="/portfolio"
                className={cn(
                  bannerTypeChip,
                  "uppercase text-[1.125em] text-white/70 transition hover:text-white hover:underline underline-offset-4 decoration-1 pointer-events-auto",
                )}
              >
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
                <span className="text-sm text-white/40">Tyler Yoon, 2026</span>
              </p>
            </div>
          </section>
        </div>
      </div>
      <VideoModal />
    </VideoModalProvider>
  );
}
