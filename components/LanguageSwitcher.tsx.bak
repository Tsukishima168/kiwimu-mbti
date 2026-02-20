'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');

  const locales = ['en', 'ja', 'ko'];
  const localeNames: Record<string, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
  };

  const getLocalizedPath = (newLocale: string) => {
    // 移除當前 locale 前綴
    let path = pathname.replace(`/${locale}`, '') || '/';
    
    // 添加新的 locale 前綴（英文除外）
    if (newLocale === 'en') {
      return path;
    }
    return `/${newLocale}${path}`;
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      {locales.map((loc) => (
        <Link
          key={loc}
          href={getLocalizedPath(loc)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: locale === loc ? '#007bff' : '#f0f0f0',
            color: locale === loc ? '#fff' : '#000',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: locale === loc ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {localeNames[loc]}
        </Link>
      ))}
    </div>
  );
}
