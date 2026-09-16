"use client";

import { useLayoutEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import {
  introStickyTopForProgress,
  introVideoScaleForProgress,
  introVideoTopForScale,
} from "@/config/introMotion";
import { scrollBannerConfig } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useIntroScroll } from "@/components/providers/IntroScrollProvider";

export default function ScrollNav() {
  const lenis = useLenis();
  const { introSectionRef, scrollYProgress } = useIntroScroll();
  const cfg = scrollBannerConfig;

  const vw = useMotionValue(0);
  /** Intro sticky box height (px) — the box `IntroGate` scales its video inside. */
  const vh = useMotionValue(0);
  /** Intro section height (px) — the sticky box scrolls away with it after the pinned range. */
  const sectionH = useMotionValue(0);
  useLayoutEffect(() => {
    const set = () => {
      const sticky = document.querySelector("[data-intro-sticky]");
      const stickyH =
        sticky instanceof HTMLElement && sticky.clientHeight > 0
          ? sticky.clientHeight
          : window.innerHeight;
      const sectionEl = introSectionRef.current;
      vw.set(window.innerWidth);
      vh.set(stickyH);
      sectionH.set(
        sectionEl && sectionEl.clientHeight > 0
          ? sectionEl.clientHeight
          : stickyH * 2,
      );
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [introSectionRef, sectionH, vh, vw]);

  const videoScale = useTransform(scrollYProgress, introVideoScaleForProgress);

  const sideInsetPx = useTransform([videoScale, vw], ([s, w]) => {
    const sc = typeof s === "number" ? s : 1;
    const width = typeof w === "number" ? w : 0;
    return Math.max(0, ((1 - sc) / 2) * width);
  });

  /**
   * Viewport top of the scaled intro layer, derived from the same numbers `IntroGate` uses instead
   * of measuring the DOM: the sticky box is pinned at 0 while the section scrolls through its
   * pinned range, then leaves with it, and the video scales about the box centre.
   */
  const videoGapTop = useTransform(
    [scrollYProgress, videoScale, vh, sectionH],
    ([p, s, h, sh]) => {
      const progress = typeof p === "number" ? p : 0;
      const sc = typeof s === "number" ? s : 1;
      const stickyH = typeof h === "number" ? h : 0;
      const sectionHeight = typeof sh === "number" ? sh : stickyH * 2;
      const boxTop = introStickyTopForProgress(
        progress,
        stickyH,
        sectionHeight,
      );
      return Math.max(0, boxTop + introVideoTopForScale(sc, stickyH));
    },
  );

  const navTopPx = useTransform(videoGapTop, (gap) => {
    const g = typeof gap === "number" ? gap : 0;
    const H = cfg.heightPx;
    return Math.min(g / 2 - H / 2, g - H) + cfg.offsetDownPx;
  });

  /**
   * TYLER / YOON must not be tab stops while the label row is tucked above the viewport, i.e.
   * while the row's vertical centre (where the labels sit) is at or above `y = 0`.
   */
  const [navHidden, setNavHidden] = useState(true);
  useMotionValueEvent(navTopPx, "change", (top) => {
    const hidden = top + cfg.heightPx / 2 <= 0;
    setNavHidden((prev) => (prev === hidden ? prev : hidden));
  });

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const rowClass = cn(
    "pointer-events-none relative mx-auto flex w-full",
    cfg.rowLayoutClassName,
    cfg.rowItemsAlignClassName,
    cfg.rowMaxWidthClassName,
    cfg.rowPaddingXClassName,
    cfg.rowPaddingYClassName,
  );

  return (
    <motion.nav
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] bg-transparent will-change-transform"
      style={{ y: navTopPx }}
    >
      <motion.div
        className={rowClass}
        style={{
          height: cfg.heightPx,
          paddingLeft: sideInsetPx,
          paddingRight: sideInsetPx,
        }}
      >
        <button
          type="button"
          onClick={scrollToTop}
          tabIndex={navHidden ? -1 : undefined}
          className={cn(
            cfg.labelClassName,
            cfg.tylerExtraClassName,
            "pointer-events-auto shrink-0 text-left transition-opacity hover:opacity-80",
          )}
        >
          TYLER
        </button>

        <button
          type="button"
          onClick={scrollToTop}
          tabIndex={navHidden ? -1 : undefined}
          className={cn(
            cfg.labelClassName,
            cfg.yoonExtraClassName,
            "pointer-events-auto shrink-0 text-right transition-opacity hover:opacity-80",
          )}
        >
          YOON
        </button>
      </motion.div>
    </motion.nav>
  );
}
