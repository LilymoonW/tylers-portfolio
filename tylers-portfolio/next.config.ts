import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/portfolio", permanent: true },
      { source: "/work/:projectId", destination: "/portfolio/:projectId", permanent: true },
    ];
  },
  async headers() {
    // Media under `public/` keeps its plain filename when replaced, so it must not be
    // `immutable`. A day at the edge plus a week of stale-while-revalidate keeps repeat
    // visits cheap without pinning a replaced video or thumbnail for a year.
    const media = [
      { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
    ];
    return [
      { source: "/video/:path*", headers: media },
      { source: "/images/:path*", headers: media },
      { source: "/textures/:path*", headers: media },
    ];
  },
};

export default nextConfig;
