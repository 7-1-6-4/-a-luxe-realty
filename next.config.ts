import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iegtdzymftlrrsblwyyn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80, 90, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  // ✅ FIXED: Remove eslint and swcMinify, keep typescript
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Add these instead of swcMinify
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
}

export default nextConfig