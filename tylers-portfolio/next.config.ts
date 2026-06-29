import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
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
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/images/eye-bounds.png",
          headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
        },
      ];
    }
    // Long cache for fingerprinted static assets under `public/` (repeat visits, less origin egress).
    return [
      {
        source: "/video/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/textures/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
