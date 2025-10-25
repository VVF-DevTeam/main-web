import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'drive.google.com',
      'lh3.googleusercontent.com',          // Google avatars/images
      'avatars.githubusercontent.com',      // GitHub avatars
      'platform-lookaside.fbsbx.com',       // Facebook avatars
      'www.facebook.com',
      'www.instagram.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',           // Facebook CDN (posts, stories, etc.)
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',    // Instagram CDN (posts, reels, etc.)
      },
    ],
  },
}

export default nextConfig
