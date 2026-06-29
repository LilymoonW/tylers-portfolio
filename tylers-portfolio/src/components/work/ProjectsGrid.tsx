"use client";

import Link from "next/link";
import type { Project } from "@/types";
import { ProjectThumbnailMedia } from "@/components/ProjectThumbnailMedia";
import { bannerTypeBase, bannerTypeChip } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";

interface ProjectsGridProps {
  projects: Project[];
  /** Route each tile to this builder (defaults to the detail page under `/portfolio/...`). */
  href?: (project: Project) => string;
  className?: string;
}

const TILE_EASE = "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";

/**
 * Responsive grid of square project tiles (5 columns).
 * Hover/focus uses CSS only — avoids per-character Framer subtrees that were very heavy with ~40+ tiles.
 */
export default function ProjectsGrid({
  projects,
  href,
  className,
}: ProjectsGridProps) {
  const buildHref =
    href ?? ((p: Project) => `/portfolio/${encodeURIComponent(p.id)}`);
  return (
    <ul className={cn("grid list-none grid-cols-5 gap-0 p-0", className)}>
      {projects.map((project) => (
        <li
          key={project.id}
          className="m-0 [content-visibility:auto] [contain-intrinsic-size:180px_180px]"
        >
          <ProjectTile project={project} href={buildHref(project)} />
        </li>
      ))}
    </ul>
  );
}

function ProjectTile({ project, href }: { project: Project; href: string }) {
  const title = project.title;

  return (
    <Link
      href={href}
      aria-label={project.title}
      className={cn(
        "group relative block aspect-square w-full overflow-hidden bg-black",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/35 focus-visible:ring-offset-0",
      )}
    >
      <ProjectThumbnailMedia
        src={project.thumbnail}
        zoom={project.thumbnailZoom}
        objectPosition={project.thumbnailObjectPosition}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] bg-black/0 transition-colors duration-200 motion-reduce:duration-0 group-hover:bg-black/[0.62] group-focus-within:bg-black/[0.62]",
          TILE_EASE,
        )}
      />

      <div className="pointer-events-none absolute inset-0 z-[2] flex items-end p-2 md:p-2.5">
        <h3
          className={cn(
            bannerTypeBase,
            "max-w-full translate-y-1 text-left font-display text-[11px] font-bold italic uppercase leading-[1.05] tracking-[-0.01em] text-white opacity-0 transition-[opacity,transform] duration-200 motion-reduce:duration-0 md:text-xs",
            "group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
            "[word-break:normal] [overflow-wrap:normal] [hyphens:none]",
            TILE_EASE,
          )}
        >
          {title}
        </h3>
      </div>

      <span
        aria-hidden
        className={cn(
          bannerTypeChip,
          "pointer-events-none absolute right-1.5 top-1.5 z-[3] bg-black/55 px-1.5 py-0.5 text-[9px] text-white/80 opacity-0 transition-opacity duration-200 motion-reduce:duration-0 group-hover:opacity-100 group-focus-within:opacity-100",
          TILE_EASE,
        )}
      >
        {project.brand}
      </span>
    </Link>
  );
}
