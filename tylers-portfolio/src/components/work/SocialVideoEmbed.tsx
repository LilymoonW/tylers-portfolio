import Link from "next/link";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { bannerTypeChip } from "@/config/scrollBanner";

const ASPECT: Record<Project["aspectRatio"], string> = {
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "1:1": "aspect-square",
};

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";

type SocialVideoEmbedProps = {
  project: Project;
  embedSrc: string;
  platform: "instagram" | "tiktok";
};

export default function SocialVideoEmbed({
  project,
  embedSrc,
  platform,
}: SocialVideoEmbedProps) {
  const outHref = project.cardHref?.trim() ?? project.embedUrl;
  const outLabel =
    platform === "instagram" ? "View on Instagram" : "View on TikTok";
  const aspect = ASPECT[project.aspectRatio] ?? "aspect-[9/16]";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]",
          "max-w-[min(100%,min(680px,80vh))]",
          aspect,
        )}
      >
        <iframe
          title={project.title}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          allow={IFRAME_ALLOW}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {outHref ? (
        <Link
          href={outHref}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            bannerTypeChip,
            "text-black/50 transition hover:text-black hover:underline underline-offset-4 decoration-1",
          )}
        >
          {outLabel}
        </Link>
      ) : null}
    </div>
  );
}
