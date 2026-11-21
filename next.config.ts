import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Hero and feature media come from the Sanity asset CDN; allow next/image to
  // optimize them.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Sanity Studio (embedded at /studio) renders with styled-components; this keeps
  // its SSR class names stable so the Studio hydrates without a mismatch.
  compiler: { styledComponents: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
