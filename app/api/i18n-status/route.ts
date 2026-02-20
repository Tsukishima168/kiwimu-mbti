import { NextRequest, NextResponse } from 'next/server';

/**
 * i18n 狀態 API
 * 返回當前 i18n 配置和支持的語言
 */
export async function GET(request: NextRequest) {
  const locale = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

  return NextResponse.json({
    supportedLocales: ['en', 'ja', 'ko'],
    defaultLocale: 'en',
    currentLocale: locale,
    timestamp: new Date().toISOString(),
  });
}
