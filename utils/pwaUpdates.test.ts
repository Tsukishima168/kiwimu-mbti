import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ options: null as any, update: vi.fn(), register: vi.fn() }));
vi.mock('virtual:pwa-register', () => ({ registerSW: mock.register }));

beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers();
  mock.update.mockReset().mockResolvedValue(undefined);
  mock.register.mockReset().mockImplementation(options => { mock.options = options; return mock.update; });
  vi.stubGlobal('window', { location: { reload: vi.fn() } });
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function worker(state = 'installed') {
  const value = new EventTarget() as EventTarget & { state: string };
  value.state = state;
  return value;
}

describe('PWA update consent', () => {
  it('registers once and never reloads for an available update', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor(); api.startPwaUpdateMonitor();
    mock.options.onNeedRefresh();
    expect(mock.register).toHaveBeenCalledTimes(1);
    expect(api.getPwaUpdateState()).toBe('available');
    expect(window.location.reload).not.toHaveBeenCalled();
  });
  it('an update activated by another tab still requires this tab to accept', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor(); mock.options.onNeedReload();
    expect(api.getPwaUpdateState()).toBe('available');
    expect(window.location.reload).not.toHaveBeenCalled();
  });
  it('waits for activation and suppresses duplicate update clicks', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor();
    const target = worker(); mock.options.onRegisteredSW('/sw.js', { waiting: target }); mock.options.onNeedRefresh();
    const pending = api.acceptPwaUpdate(); await Promise.resolve(); await api.acceptPwaUpdate();
    mock.options.onNeedRefresh(); expect(api.getPwaUpdateState()).toBe('updating');
    expect(mock.update).toHaveBeenCalledTimes(1); expect(window.location.reload).not.toHaveBeenCalled();
    target.state = 'activated'; target.dispatchEvent(new Event('statechange')); await pending;
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
  it('can reload an already activated update only after acceptance', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor(); mock.options.onRegisteredSW('/sw.js', { active: worker('activated') }); mock.options.onNeedReload();
    await api.acceptPwaUpdate(); expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
  it('waits when another tab is still activating the new worker', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor();
    const target = worker('activating'); mock.options.onRegisteredSW('/sw.js', { active: target }); mock.options.onNeedReload();
    const pending = api.acceptPwaUpdate(); await Promise.resolve();
    expect(window.location.reload).not.toHaveBeenCalled();
    target.state = 'activated'; target.dispatchEvent(new Event('statechange')); await pending;
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
  it('requests activation only after an installing update becomes ready', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor();
    const target = worker('installing'); mock.options.onRegisteredSW('/sw.js', { installing: target });
    const pending = api.acceptPwaUpdate(); expect(mock.update).not.toHaveBeenCalled();
    target.state = 'installed'; target.dispatchEvent(new Event('statechange'));
    expect(mock.update).toHaveBeenCalledTimes(1); expect(window.location.reload).not.toHaveBeenCalled();
    target.state = 'activated'; target.dispatchEvent(new Event('statechange')); await pending;
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
  it('offers retry after activation times out and rejects a late unsolicited reload', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor(); mock.options.onRegisteredSW('/sw.js', { waiting: worker() });
    const pending = api.acceptPwaUpdate(); await Promise.resolve(); await vi.advanceTimersByTimeAsync(15_000); await pending;
    expect(api.getPwaUpdateState()).toBe('failed'); mock.options.onNeedReload();
    expect(window.location.reload).not.toHaveBeenCalled();
  });
  it('reports update errors without clearing browser data or reloading', async () => {
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor(); mock.options.onRegisteredSW('/sw.js', { waiting: worker() }); mock.update.mockRejectedValue(new Error('offline'));
    await api.acceptPwaUpdate(); expect(api.getPwaUpdateState()).toBe('failed');
    expect(window.location.reload).not.toHaveBeenCalled();
  });
  it('refuses an update while answering even if the button state is stale', async () => {
    const active = vi.fn().mockReturnValue({});
    vi.stubGlobal('document', { querySelector: active });
    const api = await import('./pwaUpdates'); api.startPwaUpdateMonitor();
    mock.options.onRegisteredSW('/sw.js', { active: worker('activated') }); mock.options.onNeedRefresh();
    await api.acceptPwaUpdate();
    expect(api.getPwaUpdateState()).toBe('available');
    expect(window.location.reload).not.toHaveBeenCalled();
    expect(mock.update).not.toHaveBeenCalled();
    active.mockReturnValue(null);
    await api.acceptPwaUpdate();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
