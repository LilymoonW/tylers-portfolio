"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  introAllWorkLabel,
  introContactLabel,
  introSideCaptionBelowVideoGapPx,
  introSideCaptionScroll,
  introVideoScaleForProgress,
} from "@/config/introMotion";
import { bannerTypeBase } from "@/config/scrollBanner";
import IntroScrollIndicator from "@/components/IntroScrollIndicator";
import { useIntroScroll } from "@/components/providers/IntroScrollProvider";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useInViewActive } from "@/hooks/useInViewActive";
import { cn } from "@/lib/utils";

function captionSliceForProgress(
  p: number,
  reduceMotion: boolean,
  label: string,
) {
  const { start, end } = introSideCaptionScroll;
  if (p <= start) return "";
  if (reduceMotion) return label;
  if (p >= end) return label;
  const u = (p - start) / (end - start);
  const n = Math.min(label.length, Math.ceil(u * label.length));
  return label.slice(0, n);
}

export default function IntroGate() {
  const lenis = useLenis();
  const { introSectionRef, scrollYProgress } = useIntroScroll();
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isActive = useInViewActive(introSectionRef, {
    rootMargin: "0px",
    threshold: 0,
  });
  const scale = useTransform(scrollYProgress, introVideoScaleForProgress);

  const vw = useMotionValue(0);
  useLayoutEffect(() => {
    const set = () => vw.set(window.innerWidth);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [vw]);

  const sideInsetPx = useTransform([scale, vw], ([s, w]) => {
    const sc = typeof s === "number" ? s : 1;
    const width = typeof w === "number" ? w : 0;
    return Math.max(0, ((1 - sc) / 2) * width);
  });

  const [reduceMotion, setReduceMotion] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const [allWorkText, setAllWorkText] = useState("");
  const [contactText, setContactText] = useState("");
  const syncSideCaptions = useCallback(
    (p: number) => {
      const nextAll = captionSliceForProgress(
        p,
        reduceMotion,
        introAllWorkLabel,
      );
      const nextContact = captionSliceForProgress(
        p,
        reduceMotion,
        introContactLabel,
      );
      setAllWorkText((prev) => (prev === nextAll ? prev : nextAll));
      setContactText((prev) => (prev === nextContact ? prev : nextContact));
    },
    [reduceMotion],
  );

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      syncSideCaptions(scrollYProgress.get());
    });
    return () => cancelAnimationFrame(id);
  }, [scrollYProgress, syncSideCaptions]);

  const [sideCaptionsTopPx, setSideCaptionsTopPx] = useState<number | null>(
    null,
  );
  const measureSideCaptionsTop = useCallback(() => {
    const sticky = stickyRef.current;
    const video = document.querySelector("[data-intro-video-layer]");
    if (!sticky || !video || !(video instanceof HTMLElement)) return;
    const stickyRect = sticky.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    const next = Math.round(
      videoRect.bottom - stickyRect.top + introSideCaptionBelowVideoGapPx,
    );
    setSideCaptionsTopPx((prev) =>
      prev != null && Math.abs(prev - next) < 1 ? prev : next,
    );
  }, []);

  useLayoutEffect(() => {
    measureSideCaptionsTop();
    window.addEventListener("resize", measureSideCaptionsTop);
    return () => {
      window.removeEventListener("resize", measureSideCaptionsTop);
    };
  }, [measureSideCaptionsTop]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    syncSideCaptions(p);
    measureSideCaptionsTop();
  });

  /** Lenis smooth-scroll can decouple rAF timing from Framer’s internal scroll reads — resample here. */
  useEffect(() => {
    if (!lenis) return;
    const onLenisScroll = () => {
      syncSideCaptions(scrollYProgress.get());
      measureSideCaptionsTop();
    };
    lenis.on("scroll", onLenisScroll);
    return () => {
      lenis.off("scroll", onLenisScroll);
    };
  }, [lenis, measureSideCaptionsTop, scrollYProgress, syncSideCaptions]);

  useLayoutEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("autoplay", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "true");
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (!isActive) {
      v.pause();
      return;
    }

    let destroyed = false;
    const tryPlay = () => {
      if (destroyed) return;
      if (document.visibilityState !== "visible") return;
      v.muted = true;
      v.defaultMuted = true;
      requestAnimationFrame(() => {
        if (destroyed) return;
        if (!v.paused) return;
        void v.play().catch(() => {});
      });
    };

    v.muted = true;

    const onReady = () => tryPlay();
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("canplay", onReady);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) tryPlay();
    };
    window.addEventListener("pageshow", onPageShow);

    // Mobile Safari/Chrome can pause at frame 0 right after reload.
    // Retry briefly while the intro is active to force the first play state.
    const playWatchdogId = window.setInterval(() => {
      if (!isActive) return;
      if (v.paused && !v.ended) tryPlay();
    }, 220);
    const stopWatchdogId = window.setTimeout(() => {
      window.clearInterval(playWatchdogId);
    }, 2200);

    const onPause = () => {
      if (!isActive) return;
      if (v.currentTime <= 0.08 || document.visibilityState === "visible") {
        tryPlay();
      }
    };
    v.addEventListener("pause", onPause);

    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    }

    return () => {
      destroyed = true;
      window.clearInterval(playWatchdogId);
      window.clearTimeout(stopWatchdogId);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("canplay", onReady);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [isActive]);

  return (
    <section ref={introSectionRef} className="relative z-20 h-[200vh]">
      <div
        ref={stickyRef}
        data-intro-sticky
        className="sticky top-0 h-[100dvh] min-h-0 w-full overflow-hidden"
      >
        <motion.div
          data-intro-video-layer
          className="relative isolate z-10 h-full min-h-full w-full min-w-full max-w-none overflow-hidden rounded-none bg-black shadow-none"
          style={{ scale, transformOrigin: "50% 50%" }}
        >
          <video
            ref={videoRef}
            src="/video/yoon-front-vid.mp4#t=0.001"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            className="absolute inset-0 z-[2] h-full w-full min-h-full min-w-full object-cover object-center"
          />
          <IntroScrollIndicator
            videoRef={videoRef}
            scrollYProgress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        </motion.div>

        <motion.div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-20 flex flex-col items-start gap-0 will-change-transform",
            "landscape:flex-row landscape:justify-between landscape:gap-4",
          )}
          style={
            sideCaptionsTopPx == null
              ? {
                  bottom: "2rem",
                  paddingLeft: sideInsetPx,
                  paddingRight: sideInsetPx,
                }
              : {
                  top: 0,
                  y: sideCaptionsTopPx,
                  paddingLeft: sideInsetPx,
                  paddingRight: sideInsetPx,
                }
          }
        >
          <Link
            href="/portfolio"
            className={cn(
              bannerTypeBase,
              "pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl",
              "hover:underline underline-offset-4 decoration-1",
            )}
            aria-label="Go to portfolio page"
          >
            <span aria-live="polite">{allWorkText}</span>
          </Link>
          <Link
            href="/contact"
            className={cn(
              bannerTypeBase,
              "pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl landscape:text-right",
              "hover:underline underline-offset-4 decoration-1",
            )}
            aria-label="Go to contact page"
          >
            <span aria-live="polite">{contactText}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
