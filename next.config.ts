import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static prerendering for dynamic pages with real-time data
  staticPageGenerationTimeout: 120,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dnznrvs05pmza.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'runway-task-artifacts.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
      {
        pathname: '/api/social/proxy-image',
      }
    ]
  },
  // Tell Next.js to skip bundling these native modules
  serverExternalPackages: [
    "@duckdb/node-api",
    "@duckdb/node-bindings",
    "duckdb"
  ],
  //logging
  logging: {
    fetches: {
      fullUrl: true, // Displays full fetch URLs in the terminal cache logs
    },
  },
};

export default nextConfig;
