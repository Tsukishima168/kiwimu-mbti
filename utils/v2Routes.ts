export type V2VariantCode = 'A' | 'T';

export type V2RouteTarget = {
  fullType: string;
  type: string;
  variant: V2VariantCode;
};

const FULL_TYPE_PATTERN = /^([A-Z]{4})-([AT])$/;

export const parseV2FullType = (value?: string | null): V2RouteTarget | null => {
  if (!value) return null;
  const match = value.trim().toUpperCase().match(FULL_TYPE_PATTERN);
  if (!match) return null;

  const [, type, variant] = match;
  return {
    fullType: `${type}-${variant}`,
    type,
    variant: variant as V2VariantCode,
  };
};

export const normalizeV2Pathname = (pathname: string): string =>
  pathname.replace(/^\/v2(?=\/|$)/, '/read');

export const isV2Pathname = (pathname: string): boolean =>
  pathname.startsWith('/read') || pathname.startsWith('/v2');

export const buildV2ReportPath = (fullType: string): string => `/read/${fullType}`;

export const buildV2QuizPath = (): string => '/read/quiz';

export const parseV2RouteTarget = (
  pathname: string,
  searchParams?: URLSearchParams,
): V2RouteTarget | null => {
  const normalizedPath = normalizeV2Pathname(pathname);
  const pathMatch = normalizedPath.match(/^\/read\/([A-Z]{4}-[AT])\/?$/);
  if (pathMatch) {
    return parseV2FullType(pathMatch[1]);
  }

  return parseV2FullType(searchParams?.get('mbti'));
};
