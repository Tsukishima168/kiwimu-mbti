import { getAuthSupabaseClient } from './supabaseAuthBridge';
import { buildPassportClaimLink } from './utmTracking';
import { trackStampClaim } from './analytics';

const STORAGE_PREFIX = 'mbti_claim_code_v1';

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
  const supabase = getAuthSupabaseClient();
  if (!supabase) {
    trackStampClaim('failed', { reason: 'unconfigured', mbti_type: mbtiType, variant });
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
    trackStampClaim('failed', { reason: 'insert_failed', mbti_type: mbtiType, variant });
    return null;
  }

  trackStampClaim('issued', { mbti_type: mbtiType, variant });
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
    return buildPassportClaimLink(existing, mbtiType, variant);
  }

  const code = await createMbtiClaim(mbtiType, variant);
  if (!code) {
    // fallback: 即使 claim code 建立失敗，也提供直接跳轉連結
    const passportBase = import.meta.env.VITE_PASSPORT_URL || 'https://kiwimu.com/passport';
    return `${passportBase}/?mbti_type=${mbtiType}&variant=${variant}&auto_unlock=true&stamp=mbti_complete&from=mbti`;
  }

  localStorage.setItem(key, code);
  return buildPassportClaimLink(code, mbtiType, variant);
}
