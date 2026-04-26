/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer'],
  async redirects() {
    return [
      { source: '/apply', destination: '/chat', permanent: true },
      { source: '/match', destination: '/chat', permanent: true },
    ];
  },
};

module.exports = nextConfig;