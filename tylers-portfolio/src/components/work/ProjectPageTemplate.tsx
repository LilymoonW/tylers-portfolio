import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/types";
import ProjectVideoPlayer from "@/components/work/ProjectVideoPlayer";
import SocialVideoEmbed from "@/components/work/SocialVideoEmbed";
import { ProjectThumbnailMedia } from "@/components/ProjectThumbnailMedia";
import { bannerTypeChip } from "@/config/scrollBanner";
import { getSocialEmbedSrc } from "@/lib/socialEmbed";
import { cn, formatNumber } from "@/lib/utils";

const justifyLineClass =
  "block w-full text-justify [text-align-last:justify] [text-justify:inter-word]";

function chunkWordsByTwo(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    chunks.push(words.slice(i, i + 2).join(" "));
  }
  return chunks;
}

/** Exactly two lines for narrow / portrait viewports: a balanced word split. */
function titlePortraitTwoLines(titleUpper: string): [string, string] {
  const words = titleUpper.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return [words[0] ?? titleUpper, ""];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** `/video/<name>.mp4` → `/video/posters/<name>.jpg`; anything else keeps `fallback`. */
function posterForVideoSrc(videoSrc: string, fallback: string): string {
  const prefix = "/video/";
  if (!videoSrc.startsWith(prefix)) return fallback;
  const file = videoSrc.slice(prefix.length).split(/[?#]/)[0] ?? "";
  const basename = file.replace(/\.[^./]+$/, "");
  if (!basename || basename.includes("/")) return fallback;
  return `${prefix}posters/${basename}.jpg`;
}

function TemplateSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 md:p-7">
      <p className={cn(bannerTypeChip, "mb-4 uppercase text-black/60")}>
        {label}
      </p>
      {children}
    </section>
  );
}

export default function ProjectPageTemplate({ project }: { project: Project }) {
  const titleUpper = project.title.toUpperCase();
  const explicitLines = project.titleLines
    ?.map((line) => line.trim().toUpperCase())
    .filter((line) => line.length > 0);

  /** Landscape rows: explicit `titleLines` (each row its own spaced group) or two words per row. */
  const titleLineGroups: string[][] =
    explicitLines && explicitLines.length > 0
      ? explicitLines.map((line) => [line])
      : [chunkWordsByTwo(titleUpper)];

  const [portraitLine1, portraitLine2]: [string, string] =
    explicitLines && explicitLines.length === 2
      ? [explicitLines[0], explicitLines[1]]
      : explicitLines && explicitLines.length === 1
        ? [explicitLines[0], ""]
        : titlePortraitTwoLines(titleUpper);

  const socialEmbed =
    !project.videoSrc && project.embedUrl
      ? getSocialEmbedSrc(project.embedUrl)
      : null;
  const mobileExternalFallback = project.id === "PCA All Star Game";

  return (
    <main id="main" className="project-page-uppercase relative isolate mx-auto min-h-screen w-full max-w-[1400px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <div className="mb-6 flex justify-center">
          <Link
            href="/portfolio"
            className={cn(
              bannerTypeChip,
              "uppercase text-black/65 transition hover:text-black hover:underline underline-offset-4 decoration-1",
            )}
          >
            Back
          </Link>
        </div>
        <h1
          className={cn(
            "flex w-full flex-col gap-0 font-display font-bold italic uppercase leading-[1.05] tracking-[-0.03em] text-black",
            "portrait:text-[clamp(1rem,5.2vmin,1.72rem)] portrait:leading-[1.06]",
            "landscape:text-4xl landscape:md:text-6xl landscape:md:leading-[1.05]",
          )}
        >
          <span className="contents portrait:hidden">
            {titleLineGroups.flatMap((group, gi) =>
              group.map((line, li) => (
                <span
                  key={`landscape-${gi}-${li}`}
                  className={cn(
                    justifyLineClass,
                    gi > 0 && li === 0 && "mt-[0.35em]",
                  )}
                >
                  {line}
                </span>
              )),
            )}
          </span>
          <span className="hidden portrait:contents">
            <span className={justifyLineClass}>{portraitLine1}</span>
            {portraitLine2.trim().length > 0 ? (
              <span className={cn(justifyLineClass, "mt-[0.28em]")}>
                {portraitLine2}
              </span>
            ) : null}
          </span>
        </h1>
      </header>

      <div className="space-y-5 md:space-y-6">
        <TemplateSection label="Media">
          <div className="flex w-full justify-center">
            {project.videoSrc ? (
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]",
                  "aspect-square max-w-[680px]",
                )}
              >
                <ProjectVideoPlayer
                  src={project.videoSrc}
                  title={project.title}
                  poster={posterForVideoSrc(project.videoSrc, project.thumbnail)}
                />
              </div>
            ) : socialEmbed ? (
              mobileExternalFallback ? (
                <>
                  <div className="hidden w-full justify-center md:flex">
                    <SocialVideoEmbed
                      project={project}
                      embedSrc={socialEmbed.src}
                      platform={socialEmbed.platform}
                    />
                  </div>
                  <div
                    className={cn(
                      "relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04] md:hidden",
                      "aspect-square max-w-[680px]",
                    )}
                  >
                    <Link
                      href={project.cardHref ?? project.embedUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group block h-full w-full"
                      aria-label={
                        project.mediaExternalAffordance
                          ? `Open ${project.title} in a new tab`
                          : `Open ${project.title} video`
                      }
                    >
                      <ProjectThumbnailMedia src={project.thumbnail} />
                      <div
                        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 to-transparent"
                        aria-hidden
                      />
                      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                          {project.mediaExternalAffordance ? (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden
                            >
                              <polygon points="7,5 19,12 7,19" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </>
              ) : (
                <SocialVideoEmbed
                  project={project}
                  embedSrc={socialEmbed.src}
                  platform={socialEmbed.platform}
                />
              )
            ) : project.embedUrl ? (
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]",
                  "aspect-square max-w-[680px]",
                )}
              >
                <Link
                  href={project.cardHref ?? project.embedUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group block h-full w-full"
                  aria-label={
                    project.mediaExternalAffordance
                      ? `Open ${project.title} in a new tab`
                      : `Open ${project.title} video`
                  }
                >
                  <ProjectThumbnailMedia src={project.thumbnail} />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 to-transparent"
                    aria-hidden
                  />
                  <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                      {project.mediaExternalAffordance ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden
                        >
                          <polygon points="7,5 19,12 7,19" />
                        </svg>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div
                className={cn(
                  "relative flex w-full max-w-[680px] items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04] aspect-square",
                )}
              >
                <p className="text-center text-xs text-black/60 md:text-sm">
                  VIDEO GOES HERE
                </p>
              </div>
            )}
          </div>
        </TemplateSection>

        <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 md:p-7">
          <p className="project-page-bio whitespace-pre-line font-display text-sm font-bold italic leading-[1.2] tracking-[-0.01em] text-black/75 md:text-base">
            {project.bio ?? "Add your project bio here."}
          </p>
        </section>

        <TemplateSection label="Project Info">
          <div
            className={cn(
              "grid grid-cols-1 gap-3 sm:grid-cols-2",
              project.hideProjectViews ? "lg:grid-cols-3" : "lg:grid-cols-4",
            )}
          >
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, "uppercase text-black/60")}>
                Brand
              </p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">
                {project.brand}
              </p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, "uppercase text-black/60")}>
                Year
              </p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">
                {project.year}
              </p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/65 p-3">
              <p className={cn(bannerTypeChip, "uppercase text-black/60")}>
                Role
              </p>
              <p className="mt-1 text-sm uppercase text-black md:text-base">
                {project.role}
              </p>
            </div>
            {!project.hideProjectViews ? (
              <div className="rounded-xl border border-black/10 bg-white/65 p-3">
                <p className={cn(bannerTypeChip, "uppercase text-black/60")}>
                  Views
                </p>
                <p className="mt-1 text-sm uppercase text-black md:text-base">
                  {formatNumber(project.viewCount, "abbreviated")}
                </p>
              </div>
            ) : null}
          </div>
        </TemplateSection>

        {project.videographers && project.videographers.length > 0 ? (
          <TemplateSection label="Videographers">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {project.videographers.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="rounded-xl border border-black/10 bg-white/65 p-3"
                >
                  <p className="mt-1 text-sm uppercase text-black/55 md:text-base">
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </TemplateSection>
        ) : null}
      </div>
    </main>
  );
}
