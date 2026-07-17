import type { NextConfig } from "next";

// The static build (for GitHub Pages, where there's no Node server to run
// app/api/*) is produced by `npm run build:static`, which sets STATIC_EXPORT=1
// and temporarily removes src/app/api first (Next's static export can't
// contain Route Handlers that read the request body/query dynamically).
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
