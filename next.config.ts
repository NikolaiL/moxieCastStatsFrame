import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '**/*',
      },
      {
        protocol: 'https',
        hostname: 'warpcast.com',
        pathname: '**/*',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '**/*',
      },
    ],
  },
};

export default nextConfig;
