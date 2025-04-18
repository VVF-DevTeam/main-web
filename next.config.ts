import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'drive.google.com',
      'lh3.googleusercontent.com',          // for google avatars and images
      'avatars.githubusercontent.com',      // for github avatars
      'platform-lookaside.fbsbx.com',       // for facebook avatars
      'scontent-sea1-1.xx.fbcdn.net',       // faceboook region-specific CDN for posts image
      'scontent-sea1-1.cdninstagram.com'    // instagram region-specific CDN for posts image
    ],
  },
}

export default nextConfig
