import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/supabase-user.service', () => ({ saveUserBehaviorToSupabase: vi.fn().mockResolvedValue(undefined), upsertUserStats: vi.fn().mockResolvedValue(undefined) }));
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('window', { location: { search: '' }, addEventListener: vi.fn() });
  vi.stubGlobal('document', { referrer: '' });
  vi.stubGlobal('navigator', { userAgent: 'Mock mobile test' });
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('optional behavior tracking storage', () => {
  it('allows initialization and answering when storage methods throw', async () => {
    const fail = () => { throw new Error('blocked'); };
    vi.stubGlobal('localStorage', { getItem: fail, setItem: fail });
    const tracker = await import('./userDataCollector');
    expect(() => tracker.initSession()).not.toThrow();
    expect(() => tracker.trackAction('answer', { choice: 0 })).not.toThrow();
    expect(tracker.exportUserData().actions).toHaveLength(1);
    expect(() => tracker.endSession()).not.toThrow();
  });
  it('does not lose in-memory actions after a quota failure with readable stale data', async () => {
    vi.stubGlobal('localStorage', { getItem: () => '{"actions":[]}', setItem: () => { throw new Error('quota'); } });
    const tracker = await import('./userDataCollector');
    tracker.initSession(); tracker.trackAction('first'); tracker.trackAction('second');
    expect(tracker.exportUserData().session.actions.map((entry: { action: string }) => entry.action)).toEqual(['first', 'second']);
  });
  it('recovers corrupt and primitive session data before recording a V2 action', async () => {
    for (const raw of ['{', 'null', 'false', '[]']) {
      vi.resetModules(); vi.stubGlobal('localStorage', { getItem: () => raw, setItem: vi.fn() });
      const tracker = await import('./userDataCollector');
      expect(() => tracker.trackAction('start')).not.toThrow();
      expect(tracker.exportUserData().session.actions).toHaveLength(1);
    }
  });
});
