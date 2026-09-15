"use client";

import Link from "next/link";
import {
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { bannerTypeChip } from "@/config/scrollBanner";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "yddeul@gmail.com";
const INSTAGRAM_LABEL = "instagram";
const INSTAGRAM_URL = "https://www.instagram.com/tylerdyn/";
const TYPE_DURATION_MS = 1500;

const SEP = " | ";
const CONTACT_LINE = `${CONTACT_EMAIL}${SEP}${INSTAGRAM_LABEL}`;
const EMAIL_LEN = CONTACT_EMAIL.length;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Server and first client render agree (no hydration mismatch); the live value lands right after.
function getReducedMotionServerSnapshot() {
  return false;
}

function contactLineParts(visible: number) {
  const v = Math.max(0, Math.min(visible, CONTACT_LINE.length));
  if (v === 0) return { email: "", sep: "", insta: "" };
  if (v <= EMAIL_LEN)
    return { email: CONTACT_LINE.slice(0, v), sep: "", insta: "" };
  if (v <= EMAIL_LEN + SEP.length) {
    return {
      email: CONTACT_EMAIL,
      sep: CONTACT_LINE.slice(EMAIL_LEN, v),
      insta: "",
    };
  }
  return {
    email: CONTACT_EMAIL,
    sep: SEP,
    insta: CONTACT_LINE.slice(EMAIL_LEN + SEP.length, v),
  };
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export default function ContactPageClient() {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [lineChars, setLineChars] = useState(0);
  const { email, sep, insta } = contactLineParts(
    prefersReducedMotion ? CONTACT_LINE.length : lineChars,
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= TYPE_DURATION_MS) {
        setLineChars(CONTACT_LINE.length);
        return;
      }
      setLineChars(
        Math.floor((elapsed / TYPE_DURATION_MS) * CONTACT_LINE.length),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  return (
    <main id="main" className="relative isolate min-h-screen overflow-visible bg-white text-black">
      <section className="relative z-[2] mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-3 pt-10 pb-24 min-[420px]:px-5 sm:px-6 md:pt-14">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/portfolio"
            className={cn(
              bannerTypeChip,
              "uppercase text-black/70 transition hover:text-black hover:underline underline-offset-4 decoration-1",
            )}
          >
            PORTFOLIO
          </Link>
          <Link
            href="/"
            className={cn(
              bannerTypeChip,
              "uppercase text-black/70 transition hover:text-black hover:underline underline-offset-4 decoration-1",
            )}
          >
            HOME
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-body text-sm leading-relaxed text-ink/80 md:text-base">
            <button
              type="button"
              onClick={copyEmail}
              className="group inline-flex max-w-full cursor-pointer items-center gap-0 rounded-sm border-0 bg-transparent p-0 text-left font-inherit text-inherit focus-visible:outline focus-visible:ring-2 focus-visible:ring-bright-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white,#ebe6de)]"
              aria-label={`Copy ${CONTACT_EMAIL} to clipboard`}
            >
              <span className="min-w-0 break-all">{email}</span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center overflow-hidden transition-[max-width,margin,opacity] duration-200 ease-out",
                  copied
                    ? "ml-1.5 max-w-[5rem] opacity-100"
                    : "ml-0 max-w-0 opacity-0 group-hover:ml-1.5 group-hover:max-w-4 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-4 group-focus-visible:opacity-100",
                )}
              >
                {copied ? (
                  <span className="whitespace-nowrap text-xs text-bright-blue">
                    Copied
                  </span>
                ) : (
                  <CopyIcon className="h-4 w-4 shrink-0 text-ink/50" />
                )}
              </span>
            </button>
            <span className="text-ink/50" aria-hidden>
              {sep}
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex max-w-full shrink-0 items-center text-inherit transition"
              tabIndex={insta.length < INSTAGRAM_LABEL.length ? -1 : undefined}
            >
              <span
                className="inline-flex max-w-0 shrink-0 items-center justify-center overflow-hidden opacity-0 transition-[max-width,margin,opacity] duration-200 ease-out group-hover:mr-1.5 group-hover:max-w-4 group-hover:opacity-100 group-focus-visible:mr-1.5 group-focus-visible:max-w-4 group-focus-visible:opacity-100"
                aria-hidden
              >
                <ExternalLinkIcon className="h-4 w-4 shrink-0 text-ink/50" />
              </span>
              <span className="shrink-0 transition group-hover:underline group-focus-visible:underline underline-offset-4 decoration-1">
                {insta}
              </span>
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
