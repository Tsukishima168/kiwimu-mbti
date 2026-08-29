import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPassportLoginUrl } from './authStorage';
import {
  getPendingEconomyClaimId,
  rememberPendingEconomyClaim,
  withPendingEconomyClaim,
} from './economyClaims';

const CLAIM_ID = '11111111-1111-4111-8111-111111111111';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('pending Economy claim bridge', () => {
  beforeEach(() => {
    const eventTarget = new EventTarget();
    vi.stubGlobal('sessionStorage', new MemoryStorage());
    vi.stubGlobal('window', {
      location: { origin: 'https://kiwimu.com', href: 'https://kiwimu.com/quiz/result' },
      dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('stores only a valid unexpired UUID and appends it only to Passport', () => {
    expect(rememberPendingEconomyClaim(CLAIM_ID, '2099-01-01T00:00:00.000Z')).toBe(true);
    expect(getPendingEconomyClaimId()).toBe(CLAIM_ID);

    const passportUrl = new URL(withPendingEconomyClaim('https://passport.kiwimu.com/?from=result'));
    expect(passportUrl.searchParams.get('economy_claim')).toBe(CLAIM_ID);
    expect(passportUrl.searchParams.get('source_site')).toBe('kiwimu');
    expect(withPendingEconomyClaim('https://example.com/')).toBe('https://example.com/');
  });

  it('passes the claim through the Passport SSO login URL', () => {
    rememberPendingEconomyClaim(CLAIM_ID, '2099-01-01T00:00:00.000Z');
    const loginUrl = new URL(buildPassportLoginUrl('https://kiwimu.com/quiz/result'));
    expect(loginUrl.searchParams.get('economy_claim')).toBe(CLAIM_ID);
    expect(loginUrl.searchParams.get('redirect_to')).toBe('https://kiwimu.com/quiz/result');
    const forgedUrl = new URL(buildPassportLoginUrl('https://kiwimu.com/', {
      economyClaimId: 'not-a-uuid',
    }));
    expect(forgedUrl.searchParams.has('economy_claim')).toBe(false);
  });

  it('rejects expired and malformed claims', () => {
    expect(rememberPendingEconomyClaim('not-a-uuid', '2099-01-01T00:00:00.000Z')).toBe(false);
    expect(rememberPendingEconomyClaim(CLAIM_ID, '2020-01-01T00:00:00.000Z')).toBe(false);
    expect(getPendingEconomyClaimId()).toBeNull();
  });
});
