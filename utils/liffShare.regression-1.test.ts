import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('optional LINE SDK loading', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_LINE_LIFF_ID', 'test-liff-id');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.doUnmock('@line/liff');
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('does not evaluate the SDK when importing the site helper', async () => {
    const evaluate = vi.fn(() => { throw new Error('storage getter denied'); });
    vi.doMock('@line/liff', evaluate);
    const helper = await import('./liffShare');
    expect(evaluate).not.toHaveBeenCalled();
    await expect(helper.initLiff()).resolves.toBe(false);
    expect(evaluate).toHaveBeenCalledOnce();
  });

  it('skips SDK loading when there is no configured LIFF ID', async () => {
    vi.stubEnv('VITE_LINE_LIFF_ID', '');
    const evaluate = vi.fn(() => { throw new Error('should not evaluate'); });
    vi.doMock('@line/liff', evaluate);
    const { initLiff } = await import('./liffShare');
    await expect(initLiff()).resolves.toBe(false);
    expect(evaluate).not.toHaveBeenCalled();
  });

  it('returns a fallback when SDK evaluation rejects during a share', async () => {
    vi.doMock('@line/liff', () => { throw new Error('storage getter denied'); });
    const { shareResultToLine } = await import('./liffShare');
    await expect(shareResultToLine('ESTJ-A', '測試甜點')).resolves.toBe(false);
  });

  it('catches capability failures before invoking a share', async () => {
    const share = vi.fn();
    vi.doMock('@line/liff', () => ({ default: {
      isLoggedIn: () => true,
      isApiAvailable: () => { throw new Error('restricted browser'); },
      shareTargetPicker: share,
    } }));
    const { shareResultToLine } = await import('./liffShare');
    await expect(shareResultToLine('ESTJ-A', '測試甜點')).resolves.toBe(false);
    expect(share).not.toHaveBeenCalled();
  });

  it('preserves the real site destination and returns success only after sharing', async () => {
    const share = vi.fn().mockResolvedValue({ status: 'success' });
    const init = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@line/liff', () => ({ default: {
      init,
      isLoggedIn: () => true,
      isApiAvailable: () => true,
      shareTargetPicker: share,
    } }));
    const { initLiff, shareResultToLine } = await import('./liffShare');
    await expect(initLiff()).resolves.toBe(true);
    expect(init).toHaveBeenCalledWith({ liffId: 'test-liff-id' });
    await expect(shareResultToLine('ESTJ-A', '測試甜點')).resolves.toBe(true);
    expect(share).toHaveBeenCalledOnce();
    const [message] = share.mock.calls[0][0];
    expect(message.contents.hero.action.uri).toBe('https://kiwimu.com/?from=mbti_line_share');
    expect(message.contents.footer.contents[0].action.uri).toBe(message.contents.hero.action.uri);
    expect(message.contents.body.contents[1].text).toBe('測試甜點');
    share.mockResolvedValue(undefined);
    await expect(shareResultToLine('ESTJ-A', '測試甜點')).resolves.toBe(false);
  });
});
