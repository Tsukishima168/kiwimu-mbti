import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  maskPassportErrorDetail,
  openPassportLogin,
  PASSPORT_LOGIN_URL,
  PASSPORT_SSO_MESSAGE_TYPE,
  type PassportSsoMessage,
} from './authStorage';

const GENERIC = '暫時無法完成登入，請再試一次。';
const RAW = 'access_denied: Unable to exchange external code (provider raw text)';

type MessageListener = (event: { origin: string; data: unknown }) => void;

function installWindow(options: { popupBlocked?: boolean } = {}) {
  let messageListener: MessageListener | undefined;
  let pollCallback: (() => void) | undefined;
  const popup = { closed: false, close: vi.fn(), focus: vi.fn() };
  const location = { href: 'https://kiwimu.com/quiz/result' };
  vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
  vi.stubGlobal('window', {
    location,
    screenX: 0,
    screenY: 0,
    outerWidth: 1280,
    outerHeight: 800,
    open: vi.fn(() => (options.popupBlocked ? null : popup)),
    addEventListener: vi.fn((type: string, listener: MessageListener) => {
      if (type === 'message') messageListener = listener;
    }),
    removeEventListener: vi.fn(),
    setInterval: vi.fn((callback: () => void) => {
      pollCallback = callback;
      return 1;
    }),
    clearInterval: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  return {
    popup,
    location,
    sendMessage: (data: unknown, origin = PASSPORT_LOGIN_URL) => messageListener?.({ origin, data }),
    closePopup: () => {
      popup.closed = true;
      pollCallback?.();
    },
  };
}

describe('openPassportLogin onError masking', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    warn.mockRestore();
  });

  it('turns a raw broker error into generic copy and keeps the original only in diagnostic', () => {
    const env = installWindow();
    const onError = vi.fn();
    expect(openPassportLogin({ onError })).toBe(true);

    env.sendMessage({ type: PASSPORT_SSO_MESSAGE_TYPE, status: 'error', message: RAW });

    expect(onError).toHaveBeenCalledOnce();
    const detail = onError.mock.calls[0][0] as PassportSsoMessage;
    expect(detail.message).toBe(GENERIC);
    expect(detail.message).not.toContain('provider raw text');
    expect(detail.diagnostic).toBe(RAW);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('does not let a broker-supplied diagnostic field masquerade as the original text', () => {
    const env = installWindow();
    const onError = vi.fn();
    openPassportLogin({ onError });

    env.sendMessage({ type: PASSPORT_SSO_MESSAGE_TYPE, status: 'error', diagnostic: 'spoofed' });

    const detail = onError.mock.calls[0][0] as PassportSsoMessage;
    expect(detail.message).toBe(GENERIC);
    expect(detail.diagnostic).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('passes whitelisted copy through unchanged without a warning', () => {
    const env = installWindow();
    const onError = vi.fn();
    openPassportLogin({ onError });

    env.sendMessage({ type: PASSPORT_SSO_MESSAGE_TYPE, status: 'error', message: '登入逾時，請重新嘗試' });

    const detail = onError.mock.calls[0][0] as PassportSsoMessage;
    expect(detail.message).toBe('登入逾時，請重新嘗試');
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the closed-window copy when the user closes the popup', () => {
    const env = installWindow();
    const onError = vi.fn();
    openPassportLogin({ onError });

    env.closePopup();

    expect(onError).toHaveBeenCalledOnce();
    expect((onError.mock.calls[0][0] as PassportSsoMessage).message).toBe('登入視窗已關閉，請再試一次。');
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the popup-blocked copy and still falls back to a full-page redirect', () => {
    const env = installWindow({ popupBlocked: true });
    const onError = vi.fn();

    expect(openPassportLogin({ onError })).toBe(false);

    const detail = onError.mock.calls[0][0] as PassportSsoMessage;
    expect(detail.message).toBe('登入視窗無法開啟，正在改用整頁登入…');
    expect(detail.redirectTo).toContain('presentation=redirect');
    expect(env.location.href).toBe(detail.redirectTo);
  });

  it('ignores messages from other origins', () => {
    const env = installWindow();
    const onError = vi.fn();
    openPassportLogin({ onError });

    env.sendMessage({ type: PASSPORT_SSO_MESSAGE_TYPE, status: 'error', message: RAW }, 'https://evil.example');

    expect(onError).not.toHaveBeenCalled();
  });
});

describe('maskPassportErrorDetail', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('masks empty and non-string messages to the generic copy', () => {
    const base = { type: PASSPORT_SSO_MESSAGE_TYPE, status: 'error' } as const;
    expect(maskPassportErrorDetail({ ...base }).message).toBe(GENERIC);
    expect(maskPassportErrorDetail({ ...base, message: '' }).message).toBe(GENERIC);
    expect(maskPassportErrorDetail({ ...base, message: { nested: 'x' } as unknown as string }).message).toBe(GENERIC);
  });

  it('preserves redirectTo and does not mutate the input', () => {
    const input: PassportSsoMessage = {
      type: PASSPORT_SSO_MESSAGE_TYPE,
      status: 'error',
      redirectTo: 'https://passport.kiwimu.com/',
      message: RAW,
    };
    const masked = maskPassportErrorDetail(input);
    expect(masked.redirectTo).toBe(input.redirectTo);
    expect(input.message).toBe(RAW);
    expect(input.diagnostic).toBeUndefined();
  });
});
