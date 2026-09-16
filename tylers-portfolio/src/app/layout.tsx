import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { projects } from "@/data/projects";
import { fontClassNames } from "@/lib/fonts";

const siteTitle = "Tyler Yoon";
const siteDescription =
  "Portfolio of Tyler Yoon — VFX editor specializing in visual effects, motion graphics, and creative video editing.";

/** Absolute origin for share URLs: explicit env, else the Vercel production domain, else local dev. */
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/** Share image: the first featured project's thumbnail. */
const shareImage = projects.find((p) => p.featured)?.thumbnail;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    type: "website",
    images: shareImage ? [{ url: shareImage }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-sm focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
