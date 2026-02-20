import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import App from '@/App';
import '@/index.css';

const locales = ['en', 'ja', 'ko'];

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// 靜態生成所有支持的語言
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 元數據生成
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });

  const title = t('appName');
  const description = t('tagline');

  const alternates: any = {
    canonical: `https://example.com/${locale === 'en' ? '' : locale}`,
    languages: {
      'en': 'https://example.com',
      'ja': 'https://example.com/ja',
      'ko': 'https://example.com/ko',
    },
  };

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: 'https://example.com/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // 驗證 locale
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          httpEquiv="Cache-Control"
          content="public, max-age=3600, stale-while-revalidate=86400"
        />
        {/* 預連接到 Firebase 和其他關鍵資源 */}
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="preconnect" href="https://firebaseapp.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone={locale === 'ja' ? 'Asia/Tokyo' : locale === 'ko' ? 'Asia/Seoul' : 'America/New_York'}>
          <App />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
