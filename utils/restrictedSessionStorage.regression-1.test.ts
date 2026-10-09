import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPendingEconomyClaimId, rememberPendingEconomyClaim, withPendingEconomyClaim } from './economyClaims';
import { clearLegacyV2OrderId, hasV2UnlockQuery, readLegacyV2OrderId } from './v2Access';

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');

function denyStorageGetter() {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    get() { throw new Error('Storage access denied'); },
  });
}

afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, 'sessionStorage', descriptor);
  else Reflect.deleteProperty(globalThis, 'sessionStorage');
  vi.unstubAllGlobals();
});

describe('rejected sessionStorage getter', () => {
  it('does not fabricate or append an Economy claim', () => {
    denyStorageGetter();
    expect(getPendingEconomyClaimId()).toBeNull();
    const target = 'https://passport.kiwimu.com/?from=result';
    expect(withPendingEconomyClaim(target)).toBe(target);
  });

  it('reports claim persistence failure without dispatching a saved event', () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    denyStorageGetter();
    expect(rememberPendingEconomyClaim('11111111-1111-4111-8111-111111111111', '2099-01-01T00:00:00.000Z')).toBe(false);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('returns no legacy payment reference and still rejects URL-only unlock', () => {
    denyStorageGetter();
    expect(readLegacyV2OrderId()).toBe('');
    expect(hasV2UnlockQuery(new URLSearchParams('unlock=success'))).toBe(false);
  });

  it('keeps legacy cleanup best effort when the getter itself throws', () => {
    denyStorageGetter();
    expect(() => clearLegacyV2OrderId()).not.toThrow();
  });
});
