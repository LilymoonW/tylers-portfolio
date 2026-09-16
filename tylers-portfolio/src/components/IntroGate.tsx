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
  useSyncExternalStore,
} from "react";
import {
  introAllWorkLabel,
  introContactLabel,
  introSideCaptionBelowVideoGapPx,
  introSideCaptionScroll,
  introVideoBottomForScale,
  introVideoScaleForProgress,
} from "@/config/introMotion";
import { bannerTypeBase } from "@/config/scrollBanner";
import IntroScrollIndicator from "@/components/IntroScrollIndicator";
import {
  getMotionState,
  onMotionStateChange,
} from "@/components/MotionToggle";
import { useIntroScroll } from "@/components/providers/IntroScrollProvider";
import { useInViewActive } from "@/hooks/useInViewActive";
import { cn } from "@/lib/utils";

const INTRO_VIDEO_SRC = "/video/yoon-front-vid.mp4#t=0.001";
const INTRO_VIDEO_POSTER = "/video/posters/yoon-front-vid.jpg";
/** How many `pause` events may trigger a `play()` retry before we stop fighting the browser. */
const MAX_PAUSE_RETRIES = 3;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotion() {
  return false;
}

/**
 * The intro video only runs while the site-wide motion switch is on. `getMotionState()` already
 * defaults to `'paused'` for `prefers-reduced-motion`, and `MotionToggle` lets those visitors opt in.
 */
function introMotionAllowed() {
  return getMotionState() === "running";
}

/** `play()` rejected because the browser wants a user gesture first — retrying cannot help. */
function isNotAllowedError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: unknown }).name === "NotAllowedError"
  );
}

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
  const { introSectionRef, scrollYProgress } = useIntroScroll();
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isActive = useInViewActive(introSectionRef, {
    rootMargin: "0px",
    threshold: 0,
  });
  const scale = useTransform(scrollYProgress, introVideoScaleForProgress);

  const vw = useMotionValue(0);
  /** Sticky box height (px): the video layer fills it before `scale` is applied. */
  const vh = useMotionValue(0);
  useLayoutEffect(() => {
    const set = () => {
      vw.set(window.innerWidth);
      vh.set(stickyRef.current?.clientHeight || window.innerHeight);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [vw, vh]);

  const sideInsetPx = useTransform([scale, vw], ([s, w]) => {
    const sc = typeof s === "number" ? s : 1;
    const width = typeof w === "number" ? w : 0;
    return Math.max(0, ((1 - sc) / 2) * width);
  });

  /** Captions hang just under the scaled video: its bottom edge is `(1 + s) / 2 * H` from the box top. */
  const sideCaptionsY = useTransform([scale, vh], ([s, h]) => {
    const sc = typeof s === "number" ? s : 1;
    const height = typeof h === "number" ? h : 0;
    return (
      introVideoBottomForScale(sc, height) + introSideCaptionBelowVideoGapPx
    );
  });

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

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

  useMotionValueEvent(scrollYProgress, "change", syncSideCaptions);

  useLayoutEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "true");
    // Autoplay is opted into here rather than in the markup so the browser never starts the
    // video on its own for visitors whose motion is paused — they keep the poster instead.
    if (introMotionAllowed()) {
      v.autoplay = true;
      v.setAttribute("autoplay", "");
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (!isActive) {
      v.pause();
      return;
    }

    let destroyed = false;
    let autoplayBlocked = false;
    let pauseRetries = 0;

    const tryPlay = () => {
      if (destroyed || autoplayBlocked) return;
      if (document.visibilityState !== "visible") return;
      if (!introMotionAllowed()) return;
      v.muted = true;
      v.defaultMuted = true;
      requestAnimationFrame(() => {
        if (destroyed || autoplayBlocked) return;
        if (!v.paused) return;
        if (!introMotionAllowed()) return;
        v.play().catch((err: unknown) => {
          if (isNotAllowedError(err)) autoplayBlocked = true;
        });
      });
    };

    v.muted = true;

    const onReady = () => tryPlay();
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("canplay", onReady);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !v.ended) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !v.ended) tryPlay();
    };
    window.addEventListener("pageshow", onPageShow);

    // Mobile Safari/Chrome can pause at frame 0 right after reload.
    // Retry briefly while the intro is active to force the first play state.
    const playWatchdogId = window.setInterval(() => {
      if (v.paused && !v.ended) tryPlay();
    }, 220);
    const stopWatchdogId = window.setTimeout(() => {
      window.clearInterval(playWatchdogId);
    }, 2200);

    const onPause = () => {
      if (destroyed || v.ended) return;
      // Paused on purpose (motion switch) — leave it alone.
      if (!introMotionAllowed()) return;
      if (pauseRetries >= MAX_PAUSE_RETRIES) return;
      if (v.currentTime <= 0.08 || document.visibilityState === "visible") {
        pauseRetries += 1;
        tryPlay();
      }
    };
    v.addEventListener("pause", onPause);

    // Site-wide motion switch: stop on 'paused', resume on 'running'.
    const unsubscribeMotion = onMotionStateChange((state) => {
      if (destroyed) return;
      if (state === "paused") {
        if (!v.paused) v.pause();
        return;
      }
      // Flipping the switch is a user gesture, so an earlier NotAllowedError no longer applies.
      autoplayBlocked = false;
      pauseRetries = 0;
      tryPlay();
    });

    if (!introMotionAllowed()) {
      if (!v.paused) v.pause();
    } else if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    }

    return () => {
      destroyed = true;
      window.clearInterval(playWatchdogId);
      window.clearTimeout(stopWatchdogId);
      unsubscribeMotion();
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
            src={INTRO_VIDEO_SRC}
            poster={INTRO_VIDEO_POSTER}
            muted
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
            "pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-start gap-0 will-change-transform",
            "landscape:flex-row landscape:justify-between landscape:gap-4",
          )}
          style={{
            y: sideCaptionsY,
            paddingLeft: sideInsetPx,
            paddingRight: sideInsetPx,
          }}
        >
          <Link
            href="/portfolio"
            className={cn(
              bannerTypeBase,
              "pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl",
              "hover:underline underline-offset-4 decoration-1",
            )}
            aria-label="All work"
            tabIndex={allWorkText === "" ? -1 : undefined}
          >
            <span>{allWorkText}</span>
          </Link>
          <Link
            href="/contact"
            className={cn(
              bannerTypeBase,
              "pointer-events-auto min-w-0 shrink text-left leading-none text-ink tracking-tight text-base portrait:sm:text-lg landscape:text-xl landscape:text-right",
              "hover:underline underline-offset-4 decoration-1",
            )}
            aria-label="Contact"
            tabIndex={contactText === "" ? -1 : undefined}
          >
            <span>{contactText}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
