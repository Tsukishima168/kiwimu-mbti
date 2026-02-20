/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 國際化配置
  i18n: {
    locales: ['en', 'ja', 'ko'],
    defaultLocale: 'en',
    localeDetection: false, // 不自動偵測
  },

  // 圖片優化
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // 構建優化
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // 性能優化：禁用 optimizeFonts（手動處理）
  optimizeFonts: false,

  // Webpack 優化
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            filename: 'chunks/vendor.js',
            test: /node_modules/,
            priority: 10,
            reuseExistingChunk: true,
          },
          // i18n 相關模組
          intl: {
            filename: 'chunks/intl.js',
            test: /[\\/]node_modules[\\/](next-intl)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
    };
    return config;
  },

  // 環境變數
  env: {
    NEXT_PUBLIC_LOCALE: 'en',
  },
};

export default config;
