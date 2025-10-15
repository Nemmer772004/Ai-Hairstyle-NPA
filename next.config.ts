import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Lưu ý: Nên set false trong production
  },
  eslint: {
    ignoreDuringBuilds: true, // Lưu ý: Nên set false trong production
  },
  images: {
    // Cấu hình cho Next.js 13.4+ (remotePatterns)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**', // Giới hạn chỉ cho phép đường dẫn photos
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Cấu hình bổ sung cho hình ảnh
    unoptimized: false, // Đảm bảo tối ưu hóa hình ảnh được bật
    minimumCacheTTL: 60, // Cache hình ảnh tối thiểu 60 giây
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Cấu hình bổ sung cho performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lodash-es', 'date-fns'],
  },
  // Cấu hình cho webpack để xử lý hình ảnh tốt hơn
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;