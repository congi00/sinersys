import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react', 'three'],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
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
    { source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
      { key: 'Content-Security-Policy', value: [
        "default-src 'self'",
        "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self'",
        "img-src 'self' data: blob: https: https://www.google-analytics.com https://www.googletagmanager.com",
        "media-src 'self' blob:",
        "connect-src 'self' "
          + "https://www.google-analytics.com "
          + "https://region1.google-analytics.com "
          + "https://analytics.google.com "
          + "https://stats.g.doubleclick.net "
          + "https://www.googletagmanager.com",
        "font-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ') }
    ]}
  ],
};


const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(withNextIntl(nextConfig));

