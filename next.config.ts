import type { NextConfig } from 'next';
import { NEXT_IMAGE_CACHE_TTL_SEC } from './lib/media/constants';
import { getR2PublicHostname } from './lib/media/url';

const r2PublicHost = getR2PublicHostname();

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // Homepage auth-sensitive (CTA guest vs login) — jangan biarkan CDN
        // menyimpan HTML lama dengan stale-while-revalidate panjang.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/pg/**/*",
      "./node_modules/@prisma/adapter-pg/**/*",
      "./node_modules/postgres-array/**/*",
      "./node_modules/postgres-bytea/**/*",
      "./node_modules/postgres-date/**/*",
      "./node_modules/postgres-interval/**/*",
      "./node_modules/pg-pool/**/*",
      "./node_modules/pg-connection-string/**/*",
      "./node_modules/pg-protocol/**/*",
      "./node_modules/pg-types/**/*",
      "./node_modules/pgpass/**/*",
      "./node_modules/split2/**/*",
      "./node_modules/xtend/**/*",
    ],
  },

  // ── Source maps for production stack traces (Phase 5.3) ──────────
  productionBrowserSourceMaps: true,

  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2400],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256, 384],
    minimumCacheTTL: NEXT_IMAGE_CACHE_TTL_SEC,
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "assets.jepangku.com" },
      ...(r2PublicHost && r2PublicHost !== "assets.jepangku.com"
        ? [{ protocol: "https" as const, hostname: r2PublicHost }]
        : []),
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.prod-images.emergentagent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Facebook video thumbnails
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      // TikTok video thumbnails
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.tiktokcdn-us.com" },
      // Instagram thumbnails (CDN)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.instagram.com" },
    ],
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "fiscally-encode-stunning.ngrok-free.dev",
  ],
};

export default nextConfig;
