export const DESSERT_LINKAGE_TYPES = ['exact', 'theme_match', 'seasonal'] as const;
export type DessertLinkageType = (typeof DESSERT_LINKAGE_TYPES)[number];

export interface UnifiedDessertContract {
  mbti_type: string;
  linkage_type: DessertLinkageType;
  soul_dessert_name: string;
  display_name: string;
  canonical_name: string | null;
  is_available?: boolean;
  resolved?: boolean;
  description?: string | null;
  image_url?: string | null;
  cta_url?: string;
}

const MBTI_TYPES = new Set([
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]);

function cleanRequiredString(value: unknown, maxLength = 200): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean && clean.length <= maxLength ? clean : null;
}

function cleanOptionalString(value: unknown, maxLength: number): string | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return cleanRequiredString(value, maxLength);
}

function cleanHttpsUrl(value: unknown, kind: 'image' | 'cta'): string | null | undefined {
  if (value === null || value === undefined || value === '') return value === null ? null : undefined;
  if (typeof value !== 'string' || value.length > 2_048) return undefined;

  try {
    const url = new URL(value);
    const isKiwimuHost = url.hostname === 'kiwimu.com' || url.hostname.endsWith('.kiwimu.com');
    const allowedHost = kind === 'image'
      ? isKiwimuHost || url.hostname === 'res.cloudinary.com'
      : isKiwimuHost;
    if (
      url.protocol !== 'https:'
      || !allowedHost
      || url.username
      || url.password
      || (url.port && url.port !== '443')
    ) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function parseUnifiedDessertContract(
  value: unknown,
  expectedType?: string,
): UnifiedDessertContract | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const mbtiType = typeof input.mbti_type === 'string' ? input.mbti_type.trim().toUpperCase() : '';
  const normalizedExpected = expectedType?.trim().toUpperCase();
  if (!MBTI_TYPES.has(mbtiType) || (normalizedExpected && mbtiType !== normalizedExpected)) return null;

  const linkageType = input.linkage_type;
  if (!DESSERT_LINKAGE_TYPES.includes(linkageType as DessertLinkageType)) return null;

  const soulDessertName = cleanRequiredString(input.soul_dessert_name);
  const displayName = cleanRequiredString(input.display_name);
  const canonicalName = cleanOptionalString(input.canonical_name, 200);
  const description = cleanOptionalString(input.description, 2_000);
  const imageUrl = cleanHttpsUrl(input.image_url, 'image');
  const ctaUrl = cleanHttpsUrl(input.cta_url, 'cta');
  if (
    !soulDessertName
    || !displayName
    || canonicalName === undefined
    || (input.description !== undefined && description === undefined)
    || (input.image_url !== undefined && imageUrl === undefined)
    || (input.cta_url !== undefined && ctaUrl === undefined)
    || (input.is_available !== undefined && typeof input.is_available !== 'boolean')
    || (input.resolved !== undefined && typeof input.resolved !== 'boolean')
  ) return null;

  return {
    mbti_type: mbtiType,
    linkage_type: linkageType as DessertLinkageType,
    soul_dessert_name: soulDessertName,
    display_name: displayName,
    canonical_name: canonicalName,
    ...(input.is_available === undefined ? {} : { is_available: input.is_available as boolean }),
    ...(input.resolved === undefined ? {} : { resolved: input.resolved as boolean }),
    ...(description === undefined ? {} : { description }),
    ...(imageUrl === undefined ? {} : { image_url: imageUrl }),
    ...(typeof ctaUrl === 'string' ? { cta_url: ctaUrl } : {}),
  };
}
