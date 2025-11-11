/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Optimize bundle size
  swcMinify: true,
  
  // Environment variables
  env: {
    APP_NAME: 'Dialarme Quote Generator',
    APP_VERSION: '2.0.0',
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/create-devis',
        permanent: true,
      },
    ];
  },
  
  // API routes configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;

