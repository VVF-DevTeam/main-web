import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'drive.google.com',
      'lh3.googleusercontent.com', // for google avatars and images
      'avatars.githubusercontent.com', // for github avatars
      'platform-lookaside.fbsbx.com', // for facebook avatars
    ],
  },
}

export default nextConfig
