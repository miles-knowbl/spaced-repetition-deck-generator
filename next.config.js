/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for better-sqlite3
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = nextConfig;
