import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  serverExternalPackages: ['@prisma/client'],
  eslint: {
    // Ignore ESLint config detection warning during build
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
