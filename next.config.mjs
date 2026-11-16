/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Metadados (title, description, canonical, OG) sempre no <head> do HTML inicial, para qualquer agente.
  htmlLimitedBots: /.*/,
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['sharp', 'nodemailer'],
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/media/**' }, { pathname: '/acervo/**' }, { pathname: '/brand/**' }],
    deviceSizes: [360, 640, 768, 1024, 1280, 1440, 1920],
    minimumCacheTTL: 2592000,
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  async headers() {
    return [
      { source: '/acervo/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/video/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ];
  },
};
export default nextConfig;
