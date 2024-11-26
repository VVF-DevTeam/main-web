/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {},
  reactStrictMode: true,
  swcMinify: true,
  experimental: {},
  eslint: {
    dirs: ['app'],
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'static.wixstatic.com',
      pathname: '**',
    }],
    formats: ['image/webp'],
  },
};

module.exports = nextConfig;
