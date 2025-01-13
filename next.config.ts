import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.i0.wp.com',
        port: '',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '**.images.travelandleisureasia.com',
        port: '',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '**.plus.unsplash.com',
        port: '',
        search: '',
      },
    ],
  },
}

export default nextConfig
