/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer'],
  async redirects() {
    return [
      { source: '/apply', destination: '/draft', permanent: true },
      { source: '/match', destination: '/draft', permanent: true },
    ];
  },
};

module.exports = nextConfig;