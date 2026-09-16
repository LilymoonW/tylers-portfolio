"use client";

import { useEffect, useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoModal } from "./VideoModalProvider";
import { tools as allTools } from "@/data/tools";
import { formatNumber, cn } from "@/lib/utils";
import { getSocialEmbedSrc } from "@/lib/socialEmbed";
import {
  bannerTypeBase,
  bannerTypeChip,
  bannerTypeModalAccent,
  bannerTypeModalMeta,
  bannerTypeModalTitle,
} from "@/config/scrollBanner";

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, video[controls], [tabindex]:not([tabindex="-1"])';

const PLATFORM_LABEL = { instagram: "Instagram", tiktok: "TikTok" } as const;

/** `/video/foo.mp4` → `/video/posters/foo.jpg` (a poster exists for every local clip). */
function localVideoPoster(src: string) {
  const file = src.slice(src.lastIndexOf("/") + 1);
  return `/video/posters/${file.replace(/\.[^.]+$/, "")}.jpg`;
}

export default function VideoModal() {
  const { activeProject, closeModal } = useVideoModal();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const socialEmbed = activeProject?.embedUrl
    ? getSocialEmbedSrc(activeProject.embedUrl)
    : null;
  const modalEmbedSrc = socialEmbed?.src ?? activeProject?.embedUrl ?? "";
  const isLocalVideo = modalEmbedSrc.startsWith("/video/");
  const externalHref = activeProject?.cardHref?.trim() || null;
  const externalLabel = socialEmbed
    ? `Open on ${PLATFORM_LABEL[socialEmbed.platform]}`
    : "Open original post";

  // Focus the close button on open; hand focus back to the opener on close/unmount.
  useEffect(() => {
    if (!activeProject) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      opener?.focus({ preventScroll: true });
    };
  }, [activeProject]);

  // Escape closes; Tab / Shift+Tab cycle inside the dialog.
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      const root = rootRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      const inside = current instanceof Node && root.contains(current);
      if (e.shiftKey) {
        if (!inside || current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProject, closeModal]);

  return (
    <AnimatePresence>
      {activeProject && (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-lenis-prevent
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85"
            onClick={closeModal}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-lg bg-surface rounded-2xl overflow-hidden border border-white/10"
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white transition-colors"
            >
              <svg
                aria-hidden
                focusable="false"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Video - vertical 9:16 */}
            <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
              {isLocalVideo ? (
                <video
                  key={modalEmbedSrc}
                  controls
                  playsInline
                  preload="metadata"
                  poster={localVideoPoster(modalEmbedSrc)}
                  aria-label={activeProject.title}
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                >
                  <source src={modalEmbedSrc} type="video/mp4" />
                </video>
              ) : (
                <iframe
                  title={activeProject.title}
                  src={modalEmbedSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  allow={IFRAME_ALLOW}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 id={titleId} className={bannerTypeModalTitle}>
                    {activeProject.title}
                  </h3>
                  <p className={bannerTypeModalMeta}>
                    {activeProject.brand} &middot; {activeProject.role} &middot;{" "}
                    {activeProject.year}
                  </p>
                  {externalHref && (
                    <a
                      href={externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        bannerTypeChip,
                        "mt-2 inline-flex items-center gap-1 text-bright-blue underline-offset-4 transition-colors hover:underline",
                      )}
                    >
                      {externalLabel}
                      <span aria-hidden>&#8599;</span>
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className={bannerTypeModalAccent}>
                    {formatNumber(activeProject.viewCount, "abbreviated")} views
                  </p>
                  <p
                    className={cn(
                      bannerTypeBase,
                      "text-xs leading-none text-muted",
                    )}
                  >
                    {activeProject.duration}
                  </p>
                </div>
              </div>

              {/* Tools used */}
              <div className="flex flex-wrap gap-2">
                {activeProject.toolsUsed.map((toolId) => {
                  const tool = allTools.find((t) => t.id === toolId);
                  return tool ? (
                    <span
                      key={toolId}
                      className={cn(
                        bannerTypeChip,
                        "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-muted",
                      )}
                    >
                      {tool.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
