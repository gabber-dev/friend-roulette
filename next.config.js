/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    GABBER_API_KEY: process.env.GABBER_API_KEY,
  },
  experimental: {
    serverActions: true, // Enable Server Actions feature
  },
};

module.exports = nextConfig;
