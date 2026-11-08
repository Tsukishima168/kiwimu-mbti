import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefetchResultWhenIdle, resetPrefetchResultForTests, shouldPrefetchResult } from './prefetchResult';

const stubBrowser = (connection: unknown, idle = vi.fn()) => {
  vi.stubGlobal('navigator', { connection });
  vi.stubGlobal('window', { requestIdleCallback: idle, setTimeout: vi.fn() });
  return idle;
};

describe('prefetchResult', () => {
  afterEach(() => {
    resetPrefetchResultForTests();
    vi.unstubAllGlobals();
  });

  it('skips when Save-Data is on or the link is 2g', () => {
    stubBrowser({ saveData: true });
    expect(shouldPrefetchResult()).toBe(false);
    stubBrowser({ effectiveType: '2g' });
    expect(shouldPrefetchResult()).toBe(false);
    stubBrowser({ effectiveType: '4g' });
    expect(shouldPrefetchResult()).toBe(true);
  });

  it('schedules once through requestIdleCallback', () => {
    const idle = stubBrowser(undefined);
    prefetchResultWhenIdle();
    prefetchResultWhenIdle();
    expect(idle).toHaveBeenCalledTimes(1);
  });

  it('does not schedule under Save-Data', () => {
    const idle = stubBrowser({ saveData: true });
    prefetchResultWhenIdle();
    expect(idle).not.toHaveBeenCalled();
  });
});
