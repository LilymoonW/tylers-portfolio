"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import AnimatedEyes from "@/components/AnimatedEyes";
import { bannerTypeBase } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

/**
 * While sentinel `top` is above this (less negative / further down the page), the banner
 * stays fully tucked above the viewport. Decrease by N to require ~Npx more scroll before
 * motion starts (vs the previous threshold).
 */
const FULLY_HIDDEN_TOP_PX = -80;
/** Pixels of sentinel travel for the full -100% → 0% slide — larger = slower / more scroll. */
const ENTRANCE_SCROLL_SPAN_PX = 240;
/** Sentinel `top` at which the banner is fully on-screen (end of the scroll-linked ramp). */
const FULLY_VISIBLE_TOP_PX = FULLY_HIDDEN_TOP_PX - ENTRANCE_SCROLL_SPAN_PX;

const UNIVERSAL_LOGO_URL = "/images/yoon-logo-small.png";

/**
 * Fixed banner at the top of the viewport showing the same animated eyes as `BrandsEyeBanner`.
 * `translateY` is driven 1:1 from the signature sentinel position (no opacity tween, no spring):
 * as you scroll, the bar moves down from off-screen in lockstep with scroll. Sits below
 * `ScrollNav` in stacking order so the TYLER / YOON labels remain on top.
 */
export default function TopEyeBanner() {
  const lenis = useLenis();
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const y = useMotionValue("-100%");
  /** 0 = banner off-screen, 1 = fully visible — drives eye open/close in `AnimatedEyes`. */
  const bannerRevealRef = useRef(0);
  const [ariaHidden, setAriaHidden] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuPanelId = useId();
  const menuWrapRef = useRef<HTMLDivElement>(null);
  /** Signature sentinel: looked up once, re-queried only if it is missing or has left the DOM. */
  const sentinelRef = useRef<HTMLElement | null>(null);
  const menuOpenVisible = !ariaHidden && menuOpen;

  useEffect(() => {
    let rafId = 0;
    /** Skip redundant work when the sentinel barely moves (same frame / sub-pixel jitter). */
    let lastSentinelTopPx: number | null = null;

    const sample = () => {
      rafId = 0;
      let sentinel = sentinelRef.current;
      if (!sentinel || !sentinel.isConnected) {
        const found = document.querySelector("[data-signature-sentinel]");
        sentinel = found instanceof HTMLElement ? found : null;
        sentinelRef.current = sentinel;
      }
      if (!sentinel) return;
      const top = sentinel.getBoundingClientRect().top;

      if (
        lastSentinelTopPx != null &&
        Math.abs(top - lastSentinelTopPx) < 0.35
      ) {
        return;
      }
      lastSentinelTopPx = top;

      let nextPercent: number;
      if (prefersReducedMotion) {
        nextPercent = top < FULLY_VISIBLE_TOP_PX ? 0 : -100;
      } else {
        nextPercent =
          (-100 * (top - FULLY_VISIBLE_TOP_PX)) / ENTRANCE_SCROLL_SPAN_PX;
        nextPercent = Math.max(-100, Math.min(0, nextPercent));
      }
      y.set(`${nextPercent}%`);

      bannerRevealRef.current = (nextPercent + 100) / 100;

      const hidden = nextPercent <= -99;
      setAriaHidden((prev) => (prev === hidden ? prev : hidden));
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(sample);
    };

    const onResize = () => {
      lastSentinelTopPx = null;
      schedule();
    };

    schedule();
    window.addEventListener("resize", onResize);
    if (lenis) {
      lenis.on("scroll", schedule);
    } else {
      window.addEventListener("scroll", schedule, { passive: true });
    }
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (lenis) {
        lenis.off("scroll", schedule);
      } else {
        window.removeEventListener("scroll", schedule);
      }
    };
  }, [lenis, prefersReducedMotion, y]);

  useEffect(() => {
    if (!menuOpenVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpenVisible]);

  useEffect(() => {
    if (!menuOpenVisible) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target;
      if (!(el instanceof Node)) return;
      if (menuWrapRef.current?.contains(el)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, [menuOpenVisible]);

  const goHomeOrTop = () => {
    setMenuOpen(false);
    const onHome = pathname === "/";
    if (onHome) {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  };

  const menuMotion = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div
      aria-hidden={ariaHidden}
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex w-full justify-center"
      style={{ y, opacity: 1, willChange: "transform" }}
    >
      <div
        className={cn(
          "relative h-[9.5dvh] w-full overflow-visible",
          ariaHidden ? "pointer-events-none" : "pointer-events-auto",
        )}
      >
        <div
          className="absolute inset-0 flex w-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#000000" }}
        >
          <AnimatedEyes
            ariaLabel="Top-of-page eyes banner"
            className={cn(
              "relative z-0 block w-auto max-w-none shrink-0",
              /* Taller % = larger eyes inside the same `9.5dvh` crop. Slightly smaller in portrait
                 so the SVG does not run into the home + menu hit targets. Landscape scales up. */
              "h-[250%] landscape:h-[328%] md:landscape:h-[352%] lg:landscape:h-[368%]",
            )}
            pointerMotionScale={0.28}
            hoverHitScale={1.22}
            bannerRevealRef={bannerRevealRef}
          />
          {/* Universal site logo. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] flex items-center pl-2 md:pl-4">
            <div className="pointer-events-auto">
              <button
                type="button"
                tabIndex={ariaHidden ? -1 : 0}
                aria-label="Go to top of home page"
                onClick={goHomeOrTop}
                className="flex h-10 w-10 items-center justify-center bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-0"
              >
                <Image
                  src={UNIVERSAL_LOGO_URL}
                  alt=""
                  aria-hidden
                  width={32}
                  height={32}
                  className="pointer-events-none block h-8 w-8 shrink-0 select-none object-contain opacity-90"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Menu only — home control is layered inside the eyes strip for correct blending. */}
        <nav
          aria-label="Site"
          className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-end pr-2 md:pr-4"
        >
          <div ref={menuWrapRef} className="pointer-events-auto relative">
            <button
              type="button"
              tabIndex={ariaHidden ? -1 : 0}
              aria-expanded={menuOpenVisible}
              aria-controls={menuPanelId}
              aria-label={
                menuOpenVisible ? "Close page menu" : "Open page menu"
              }
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-0"
            >
              <span
                aria-hidden
                className={cn(
                  "h-[2px] w-[18px] rounded-full bg-white/85 transition-transform duration-200 ease-out",
                  menuOpenVisible && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "h-[2px] w-[18px] rounded-full bg-white/85 transition-opacity duration-200",
                  menuOpenVisible && "opacity-0",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "h-[2px] w-[18px] rounded-full bg-white/85 transition-transform duration-200 ease-out",
                  menuOpenVisible && "-translate-y-[7px] -rotate-45",
                )}
              />
            </button>

            <AnimatePresence>
              {menuOpenVisible ? (
                <motion.div
                  id={menuPanelId}
                  role="menu"
                  initial={menuMotion.initial}
                  animate={menuMotion.animate}
                  exit={menuMotion.exit}
                  transition={
                    "transition" in menuMotion
                      ? menuMotion.transition
                      : undefined
                  }
                  className="absolute right-0 top-[calc(100%+6px)] z-[90] min-w-[10.5rem] rounded-md border border-white/12 bg-black/90 py-1 shadow-[0_12px_40px_rgb(0_0_0/0.65)] backdrop-blur-sm"
                >
                  <Link
                    href="/portfolio"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      bannerTypeBase,
                      "block px-4 py-2.5 text-left text-xs uppercase tracking-wide text-white/70 transition-colors",
                      "hover:bg-white/5 hover:text-white hover:underline hover:underline-offset-4 decoration-1",
                    )}
                  >
                    PORTFOLIO
                  </Link>
                  <Link
                    href="/contact"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      bannerTypeBase,
                      "block px-4 py-2.5 text-left text-xs uppercase tracking-wide text-white/70 transition-colors",
                      "hover:bg-white/5 hover:text-white hover:underline hover:underline-offset-4 decoration-1",
                    )}
                  >
                    CONTACT
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </motion.div>
  );
}
