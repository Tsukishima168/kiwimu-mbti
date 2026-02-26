import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['kiwimu_favicon.png', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'Kiwimu MBTI 人格測驗',
          short_name: 'Kiwimu MBTI',
          description: '透過 MBTI 測驗深刻了解自己。Kiwimu 16 型人格化身，每型對應獨特的甜點風味與情緒主題。',
          theme_color: '#121212',
          background_color: '#FAFAFA',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'zh-TW',
          categories: ['lifestyle', 'entertainment'],
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // 離線快取策略（排除大型 vendor chunk 避免 service worker 超限）
          globPatterns: ['**/*.{js,css,html}'],
          globIgnores: ['**/vendor-*.js'],
          runtimeCaching: [
            {
              // Cloudinary 圖片 — 快取優先（讓結果頁離線可看）
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudinary-images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Google Fonts
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
