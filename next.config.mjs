/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fg5si9hh45.ufs.sh',
        pathname: '/**',
      },
    ],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  experimental: {},
};

export default nextConfig;