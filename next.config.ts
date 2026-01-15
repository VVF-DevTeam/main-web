import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/utilFunctions/gdrive-loader.ts',
    deviceSizes: [480, 768, 1024, 1600],
    imageSizes: [32, 64, 128], // for icons/thumbnails
    formats: ['image/webp'], // choose webp to cut transformations, can use avif
    domains: [
      'images.unsplash.com',
      'drive.google.com',
      'lh3.googleusercontent.com', // Google avatars/images
      'avatars.githubusercontent.com', // GitHub avatars
      'platform-lookaside.fbsbx.com', // Facebook avatars
      'www.facebook.com',
      'www.instagram.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fbcdn.net', // Facebook CDN (posts, stories, etc.)
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com', // Instagram CDN (posts, reels, etc.)
      },
    ],
  },
}

// Check if we're building on AWS Amplify
const isAmplify = process.env.AWS_APP_ID !== undefined || process.env.AWS_EXECUTION_ENV !== undefined;

// Only enable Sentry if NOT on AWS Amplify
const exportConfig = isAmplify ? nextConfig : withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "viet-vibe-foundation",

  project: "vvf-monitor",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});

export default exportConfig;
