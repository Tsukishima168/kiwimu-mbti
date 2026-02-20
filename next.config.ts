import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 國際化配置
  i18n: {
    locales: ['en', 'ja', 'ko'],
    defaultLocale: 'en',
    localeDetection: false,
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
  optimizeFonts: false,

  // 環境變數
  env: {
    NEXT_PUBLIC_LOCALE: 'en',
  },
};

export default withNextIntl(nextConfig);
