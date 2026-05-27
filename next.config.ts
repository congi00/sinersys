import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/(.*)\\.(mp4|webm|glb|woff2|woff)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/(.*)\\.webp",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
};

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');
export default withNextIntl(nextConfig);

