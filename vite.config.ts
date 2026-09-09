import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      tailwindcss(),
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
          // App shell 的 HTML 與所有必要 JS/CSS 一起預快取；index.html 會
          // 直接載入 vendor chunk，漏掉它會讓已安裝 PWA 在離線時白屏。
          globPatterns: ['**/*.{js,css,html}'],
          runtimeCaching: [
            {
              // MBTI 32 圖鑑牆用的小圖（avatar / portrait）。圖鑑牆一次 eager 載
              // 32 張 avatar，和報告大圖共用一個 48 格的快取會互相擠掉：逛過三、
              // 四個型別就把整面牆的圖清光，回圖鑑牆又要重抓。拆成兩條，牆的小圖
              // 不會被報告大圖驅逐。32 avatar + 32 portrait = 64，留一點餘裕。
              urlPattern: /\/assets\/mbti32\/(?:avatar|portrait)\/[^/]+\.(?:webp|jpg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'kiwimu-mbti32-portraits-v2',
                expiration: {
                  maxEntries: 70,
                  maxAgeSeconds: 60 * 60 * 24 * 60, // 60 天
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // 報告頁主圖（scene / scene-sm）。舊圖在 Cloudinary 才被涵蓋，新圖
              // 改為 /public 靜態檔後不在 precache 也不在 runtimeCaching，離線時
              // 報告頁主圖會開天窗。這條補上。og / og-jpg 只給社群爬蟲抓，瀏覽器
              // 不會請求，所以不需要額外配額。32 scene + 32 scene-sm = 64。
              urlPattern: /\/assets\/mbti32\/scene(?:-sm)?\/[^/]+\.(?:webp|jpg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'kiwimu-mbti32-scenes-v2',
                expiration: {
                  maxEntries: 70,
                  maxAgeSeconds: 60 * 60 * 24 * 60, // 60 天
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
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
        '@': path.resolve(import.meta.dirname, '.'),
      }
    }
  };
});
