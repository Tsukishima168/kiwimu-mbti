import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ja', 'ko'];

export default getRequestConfig(async ({ locale }) => {
  // 驗證 locale 是否有效
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: locale === 'ja' ? 'Asia/Tokyo' : locale === 'ko' ? 'Asia/Seoul' : 'America/New_York',
    now: new Date(),
  };
});
