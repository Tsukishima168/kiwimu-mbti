import { createClient } from '@supabase/supabase-js';
import { buildPassportClaimLink } from './utmTracking';

const SUPABASE_URL =
  (import.meta.env.VITE_MOON_ISLAND_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

const STORAGE_PREFIX = 'mbti_claim_code_v1';

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function storageKey(mbtiType: string, variant: string) {
  return `${STORAGE_PREFIX}_${mbtiType}_${variant}`;
}

function generateClaimCode() {
  try {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12)
      .toUpperCase();
  } catch {
    return Math.random().toString(36).slice(2, 12).toUpperCase();
  }
}

async function createMbtiClaim(mbtiType: string, variant: string) {
  if (!supabase) {
    return null;
  }

  const code = generateClaimCode();
  const { error } = await supabase.from('mbti_claims').insert({
    code,
    mbti_type: mbtiType,
    variant,
    source: 'mbti_lab'
  });

  if (error) {
    console.error('Failed to create MBTI claim:', error.message);
    return null;
  }

  return code;
}

export async function getOrCreatePassportClaimUrl(
  mbtiType: string,
  variant: string
) {
  if (typeof window === 'undefined') {
    return null;
  }

  const key = storageKey(mbtiType, variant);
  const existing = localStorage.getItem(key);
  if (existing) {
    return buildPassportClaimLink(existing);
  }

  const code = await createMbtiClaim(mbtiType, variant);
  if (!code) {
    return null;
  }

  localStorage.setItem(key, code);
  return buildPassportClaimLink(code);
}
