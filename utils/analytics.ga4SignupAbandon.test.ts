import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createQuizAbandonGuard,
  isNewlyCreatedAccount,
  trackUserSignup,
  trackUserSignupIfNew,
} from './analytics';

const NOW = Date.parse('2026-10-04T10:00:00.000Z');
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

describe('isNewlyCreatedAccount', () => {
  it('is true when last sign-in is within 120s of creation', () => {
    expect(isNewlyCreatedAccount(iso(-500), iso(0), NOW)).toBe(true);
    expect(isNewlyCreatedAccount(iso(-120_000), iso(0), NOW)).toBe(true);
  });

  it('is false for a returning user (last sign-in long after creation)', () => {
    expect(isNewlyCreatedAccount(iso(-86_400_000), iso(0), NOW)).toBe(false);
    expect(isNewlyCreatedAccount(iso(-121_000), iso(0), NOW)).toBe(false);
  });

  it('falls back to now when last_sign_in_at is missing or unparseable', () => {
    expect(isNewlyCreatedAccount(iso(-30_000), undefined, NOW)).toBe(true);
    expect(isNewlyCreatedAccount(iso(-30_000), 'not-a-date', NOW)).toBe(true);
    expect(isNewlyCreatedAccount(iso(-3_600_000), null, NOW)).toBe(false);
  });

  it('is false when created_at is missing or unparseable', () => {
    expect(isNewlyCreatedAccount(undefined, iso(0), NOW)).toBe(false);
    expect(isNewlyCreatedAccount(null, iso(0), NOW)).toBe(false);
    expect(isNewlyCreatedAccount('garbage', iso(0), NOW)).toBe(false);
  });
});

describe('sign_up tracking', () => {
  const gtag = vi.fn();
  const store = new Map<string, string>();
  beforeEach(() => {
    gtag.mockClear();
    store.clear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends sign_up with method + source_site and no raw user id', () => {
    trackUserSignup('google');
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][0]).toBe('event');
    expect(gtag.mock.calls[0][1]).toBe('sign_up');
    expect(gtag.mock.calls[0][2]).toEqual({
      site_id: 'mbti_lab',
      method: 'google',
      source_site: 'mbti_lab',
    });
    expect(gtag.mock.calls[0][2]).not.toHaveProperty('user_id');
  });

  it('fires once per brand-new user and not again on reload', () => {
    const user = { id: 'uid-new-1', created_at: iso(-1_000), last_sign_in_at: iso(0) };
    expect(trackUserSignupIfNew(user, 'google', NOW)).toBe(true);
    expect(trackUserSignupIfNew(user, 'google', NOW + 5_000)).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain('uid-new-1');
    expect(store.has('kiwimu_ga_signup_sent:uid-new-1')).toBe(true);
  });

  it('does not resend after a reload when the localStorage key already exists', () => {
    store.set('kiwimu_ga_signup_sent:uid-new-2', '1');
    const user = { id: 'uid-new-2', created_at: iso(-1_000), last_sign_in_at: iso(0) };
    expect(trackUserSignupIfNew(user, 'google', NOW)).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does not fire for returning users or users without an id', () => {
    expect(trackUserSignupIfNew({ id: 'uid-old', created_at: iso(-86_400_000), last_sign_in_at: iso(0) }, 'google', NOW)).toBe(false);
    expect(trackUserSignupIfNew({ created_at: iso(-1_000), last_sign_in_at: iso(0) }, 'google', NOW)).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('still fires once when localStorage throws (in-memory fallback)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    const user = { id: 'uid-new-3', created_at: iso(-1_000), last_sign_in_at: iso(0) };
    expect(trackUserSignupIfNew(user, 'google', NOW)).toBe(true);
    expect(trackUserSignupIfNew(user, 'google', NOW)).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});

describe('createQuizAbandonGuard', () => {
  const gtag = vi.fn();
  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
  });
  afterEach(() => vi.unstubAllGlobals());

  const make = (state: { completed?: boolean; answered?: number } = {}) => {
    const s = { completed: false, answered: 5, ...state };
    const guard = createQuizAbandonGuard({
      isCompleted: () => s.completed,
      getAnsweredCount: () => s.answered,
      getTotalQuestions: () => 20,
      getStartTime: () => 1_000_000,
      now: () => 1_042_000,
    });
    return { s, guard };
  };

  it('fires quiz_abandon once with beacon transport, then ignores repeats', () => {
    const { guard } = make();
    expect(guard.fire()).toBe(true);
    expect(guard.fire()).toBe(false); // e.g. pagehide after visibilitychange
    expect(guard.fire()).toBe(false); // e.g. unmount cleanup
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][1]).toBe('quiz_abandon');
    expect(gtag.mock.calls[0][2]).toMatchObject({
      abandoned_at_question: 5,
      total_questions: 20,
      progress_percentage: 25,
      time_spent_seconds: 42,
      transport_type: 'beacon',
    });
  });

  it('never fires after completion', () => {
    const { guard } = make({ completed: true });
    expect(guard.fire()).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('skips when no answers yet and still allows a later fire once answered', () => {
    const { s, guard } = make({ answered: 0 });
    expect(guard.fire()).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
    s.answered = 3;
    expect(guard.fire()).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});
