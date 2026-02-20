import type { Metadata } from 'next';
import Script from 'next/script';

// 性能監控和優化
export async function generateMetadata(): Promise<Metadata> {
  return {
    // 禁用 Google 的自動偵測
    other: {
      'google': 'notranslate',
    },
  };
}

// 核心 Web Vitals 監控
export function PerformanceMonitor() {
  return (
    <>
      {/* Web Vitals 監控 */}
      <Script
        id="web-vitals"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            function sendToAnalytics(metric) {
              if (window.gtag) {
                window.gtag.event(metric.name, {
                  event_category: 'Web Vitals',
                  value: Math.round(metric.value),
                  event_label: metric.id,
                  non_interaction: true,
                });
              }
            }

            // LCP 監控
            try {
              new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  sendToAnalytics({
                    name: 'LCP',
                    value: entry.renderTime || entry.loadTime,
                    id: entry.id,
                  });
                }
              }).observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {}

            // FID 監控
            try {
              new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  sendToAnalytics({
                    name: 'FID',
                    value: entry.processingDuration,
                    id: entry.name,
                  });
                }
              }).observe({ entryTypes: ['first-input'] });
            } catch (e) {}

            // CLS 監控
            try {
              let clsValue = 0;
              new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    sendToAnalytics({
                      name: 'CLS',
                      value: clsValue,
                      id: 'cls',
                    });
                  }
                }
              }).observe({ entryTypes: ['layout-shift'] });
            } catch (e) {}
          `,
        }}
      />
    </>
  );
}
