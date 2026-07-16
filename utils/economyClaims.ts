import { UUID_PATTERN } from '../shared/economy';

const PENDING_CLAIM_STORAGE_KEY = 'kiwimu_economy_pending_claim_v1';
const PASSPORT_HOSTNAME = 'passport.kiwimu.com';
export const PENDING_ECONOMY_CLAIM_EVENT = 'kiwimu:economy-claim-ready';

interface StoredPendingClaim {
  claimId: string;
  expiresAt: string;
}

function readPendingClaim(): StoredPendingClaim | null {
  if (typeof sessionStorage === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(PENDING_CLAIM_STORAGE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<StoredPendingClaim>;
    if (
      typeof value.claimId !== 'string' ||
      !UUID_PATTERN.test(value.claimId) ||
      typeof value.expiresAt !== 'string' ||
      !Number.isFinite(Date.parse(value.expiresAt)) ||
      Date.parse(value.expiresAt) <= Date.now()
    ) {
      try {
        sessionStorage.removeItem(PENDING_CLAIM_STORAGE_KEY);
      } catch {
        // Storage can be disabled by privacy settings.
      }
      return null;
    }

    return { claimId: value.claimId, expiresAt: value.expiresAt };
  } catch {
    try {
      sessionStorage.removeItem(PENDING_CLAIM_STORAGE_KEY);
    } catch {
      // Storage can be disabled by privacy settings.
    }
    return null;
  }
}

export function rememberPendingEconomyClaim(claimId: string, expiresAt: string): boolean {
  if (
    typeof sessionStorage === 'undefined' ||
    !UUID_PATTERN.test(claimId) ||
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now()
  ) {
    return false;
  }

  try {
    sessionStorage.setItem(
      PENDING_CLAIM_STORAGE_KEY,
      JSON.stringify({ claimId, expiresAt } satisfies StoredPendingClaim),
    );
    window.dispatchEvent(new Event(PENDING_ECONOMY_CLAIM_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function getPendingEconomyClaimId(): string | null {
  return readPendingClaim()?.claimId ?? null;
}

export function withPendingEconomyClaim(url: string): string {
  const claimId = getPendingEconomyClaimId();
  if (!claimId) return url;

  try {
    const parsed = new URL(url, typeof window === 'undefined' ? 'https://kiwimu.com' : window.location.origin);
    if (parsed.hostname !== PASSPORT_HOSTNAME) return url;
    parsed.searchParams.set('economy_claim', claimId);
    parsed.searchParams.set('source_site', 'kiwimu');
    return parsed.toString();
  } catch {
    return url;
  }
}
