"use client";

import { useCallback, useLayoutEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { introVideoScaleForProgress } from "@/config/introMotion";
import { scrollBannerConfig } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useIntroScroll } from "@/components/providers/IntroScrollProvider";

export default function ScrollNav() {
  const lenis = useLenis();
  const { scrollYProgress } = useIntroScroll();
  const cfg = scrollBannerConfig;

  const vw = useMotionValue(0);
  useLayoutEffect(() => {
    const set = () => vw.set(window.innerWidth);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [vw]);

  /** Measured distance viewport top → scaled intro layer top (matches real layout, not dvh math). */
  const videoGapTop = useMotionValue(0);

  const measureVideoTop = useCallback(() => {
    const el = document.querySelector("[data-intro-video-layer]");
    if (!el || !(el instanceof HTMLElement)) return;
    const top = el.getBoundingClientRect().top;
    videoGapTop.set(Math.max(0, top));
  }, [videoGapTop]);

  useLayoutEffect(() => {
    measureVideoTop();
    window.addEventListener("resize", measureVideoTop);
    window.addEventListener("scroll", measureVideoTop, { passive: true });
    const onLenisScroll = () => measureVideoTop();
    lenis?.on("scroll", onLenisScroll);
    return () => {
      window.removeEventListener("resize", measureVideoTop);
      window.removeEventListener("scroll", measureVideoTop);
      lenis?.off("scroll", onLenisScroll);
    };
  }, [lenis, measureVideoTop]);

  useMotionValueEvent(scrollYProgress, "change", measureVideoTop);

  const videoScale = useTransform(scrollYProgress, introVideoScaleForProgress);

  const sideInsetPx = useTransform([videoScale, vw], ([s, w]) => {
    const sc = typeof s === "number" ? s : 1;
    const width = typeof w === "number" ? w : 0;
    return Math.max(0, ((1 - sc) / 2) * width);
  });

  const navTopPx = useTransform(videoGapTop, (gap) => {
    const g = typeof gap === "number" ? gap : 0;
    const H = cfg.heightPx;
    return Math.min(g / 2 - H / 2, g - H) + cfg.offsetDownPx;
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
