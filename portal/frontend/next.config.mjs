/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production' ? false : true,
  },

  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lms.itforyouthghana.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cdn.itforyouthghana.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // Performance optimizations
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Build optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
  },

  // Redirects and rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },

  // Use webpack instead of Turbopack for production stability
  // Turbopack is still experimental and webpack provides more predictable builds
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      // Ensure vendor chunks are properly split
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
      };
    }

    // Add bundle analyzer in development (uncomment to analyze bundle size)
    if (dev && !isServer) {
      // const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      // config.plugins.push(
      //   new BundleAnalyzerPlugin({
      //     analyzerMode: 'server',
      //     openAnalyzer: false,
      //   })
      // );
    }

    return config;
  },

  // Turbopack configuration (empty to use defaults when needed)
  turbopack: {},

  // Output configuration for static export if needed
  output: process.env.NEXT_OUTPUT_MODE || 'standalone',

  // CDN configuration
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',

  // PWA configuration (if needed)
  // pwa: {
  //   dest: 'public',
  //   disable: process.env.NODE_ENV === 'development',
  // },
}

export default nextConfig
