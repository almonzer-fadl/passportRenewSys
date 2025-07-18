/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Next.js 14 + Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
