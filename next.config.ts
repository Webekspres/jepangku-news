import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.prod-images.emergentagent.com" },
    ],
  },
  allowedDevOrigins: [
    "127.0.0.1",
  ],
};

export default nextConfig;
