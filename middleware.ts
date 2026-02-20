import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'ja', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // 只在非英文時添加前綴
  localeCookie: false,
});

export function middleware(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    // 匹配所有路徑除了 api、_next 和靜態文件
    '/((?!api|_next|.*\\..*|favicon\\.ico).*)',
  ],
};
