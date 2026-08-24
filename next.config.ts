import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Tell Next.js to skip bundling these native modules
  serverExternalPackages: [
    "@duckdb/node-api",
    "@duckdb/node-bindings",
    "duckdb"
  ],
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true, // Displays full fetch URLs in the terminal cache logs
    },
  },
};

export default nextConfig;
