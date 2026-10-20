import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPromoIntent,
  readPromoIntent,
  runPromoClaim,
  savePromoIntent,
  trackPromoLoginComplete,
  trackPromoLoginStart,
} from './promoUnlock';

const gtag = vi.fn();
const store = new Map<string, string>();
const session = { access_token: 'token-a', user: { id: 'account-a' } };
const settle = () => new Promise(resolve => setImmediate(resolve));

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

function claimInput(fetchImpl: ReturnType<typeof vi.fn>, overrides: Partial<Parameters<typeof runPromoClaim>[0]> = {}) {
  return {
    fullType: 'ESTJ-A', source: 'quiz', ownerId: 'account-a',
    getSession: async () => session, fetchImpl: fetchImpl as unknown as typeof fetch,
    isCurrent: () => true, onGranted: vi.fn(), onEnded: vi.fn(), onMessage: vi.fn(),
    ...overrides,
  };
}

const eventNames = () => gtag.mock.calls.map(call => call[1] as string);

beforeEach(() => {
  gtag.mockClear();
  store.clear();
  vi.stubGlobal('window', { gtag });
  vi.stubGlobal('gtag', gtag);
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('promo unlock GA4 events', () => {
  it('the whole logged-out promo path sends login and unlock events, never begin_checkout or purchase', async () => {
    trackPromoLoginStart('ESTJ-A', '/read/ESTJ-A');
    trackPromoLoginComplete('ESTJ-A', '/read/ESTJ-A');
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, data: { access: 'promo', created: true } }));
    const input = claimInput(fetchImpl);
    await runPromoClaim(input);

    expect(eventNames()).toEqual(['login_gate_opened', 'login_success', 'v2_report_unlocked']);
    expect(eventNames()).not.toContain('begin_checkout');
    expect(eventNames()).not.toContain('purchase');
    for (const call of gtag.mock.calls) {
      expect(call[2]).not.toHaveProperty('value');
      expect(call[2]).not.toHaveProperty('transaction_id');
    }
    expect(gtag.mock.calls[0][2]).toMatchObject({ trigger: 'click', from_stage: 'v2_promo_unlock', mbti_type: 'ESTJ-A', promo_id: 'v2_free_202611' });
    expect(gtag.mock.calls[1][2]).toMatchObject({ from_stage: 'v2_promo_unlock', provider: 'google', mbti_type: 'ESTJ-A' });
    expect(gtag.mock.calls[2][2]).toMatchObject({ mbti_type: 'ESTJ-A', unlock_type: 'promo_free', source: 'quiz', promo_id: 'v2_free_202611' });
    expect(input.onGranted).toHaveBeenCalledOnce();
  });

  it('calls only the promo API with the session token and never sends a user id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, data: { access: 'promo', created: true } }));
    await runPromoClaim(claimInput(fetchImpl));
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v2/promo-claim');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-a');
    expect(JSON.parse(init.body as string)).toEqual({ mbtiType: 'ESTJ-A', source: 'quiz' });
  });

  it.each([
    { label: 'a repeated claim', data: { access: 'promo', created: false } },
    { label: 'an already-paid account', data: { access: 'paid', created: false } },
  ])('does not count $label as a new unlock but still loads the report', async ({ data }) => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, data }));
    const input = claimInput(fetchImpl);
    await runPromoClaim(input);
    expect(eventNames()).toEqual([]);
    expect(input.onGranted).toHaveBeenCalledOnce();
  });

  it('switches to the paid offer when the server reports the promo ended', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(403, { ok: false, code: 'PROMO_ENDED' }));
    const input = claimInput(fetchImpl);
    await expect(runPromoClaim(input)).resolves.toEqual({ ok: false, code: 'PROMO_ENDED' });
    expect(input.onEnded).toHaveBeenCalledOnce();
    expect(input.onGranted).not.toHaveBeenCalled();
    expect(input.onMessage).toHaveBeenCalledWith('限時免費已於 2026/11/30 23:59 結束，完整報告恢復 NT$99。');
    expect(eventNames()).toEqual([]);
  });

  it('does not call the API when the session belongs to a different account', async () => {
    const fetchImpl = vi.fn();
    const input = claimInput(fetchImpl, { getSession: async () => ({ access_token: 'token-b', user: { id: 'account-b' } }) });
    await expect(runPromoClaim(input)).resolves.toEqual({ ok: false, code: 'AUTH_REQUIRED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('ignores a delayed response after the account or report changed', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, data: { access: 'promo', created: true } }));
    const input = claimInput(fetchImpl, { isCurrent: () => false });
    await runPromoClaim(input);
    expect(input.onGranted).not.toHaveBeenCalled();
    expect(eventNames()).toEqual([]);
  });
});

describe('promo login intent', () => {
  it('remembers the report type across login for 30 minutes, once', () => {
    const now = Date.parse('2026-11-01T12:00:00+08:00');
    savePromoIntent('ESTJ-A', now);
    expect(readPromoIntent('ESTJ-A', now + 29 * 60_000)).toBe(true);
    expect(readPromoIntent('INFP-T', now)).toBe(false);
    expect(readPromoIntent('ESTJ-A', now + 31 * 60_000)).toBe(false);
    clearPromoIntent();
    expect(readPromoIntent('ESTJ-A', now)).toBe(false);
  });

  it('keeps working when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    expect(() => savePromoIntent('ESTJ-A')).not.toThrow();
    expect(readPromoIntent('ESTJ-A')).toBe(false);
    expect(() => clearPromoIntent()).not.toThrow();
  });
});

describe('V2App promo wiring', () => {
  const sourceText = readFileSync(new URL('./V2App.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('V2App.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations: ts.VariableDeclaration[] = [];
  const visit = (node: ts.Node) => { if (ts.isVariableDeclaration(node)) declarations.push(node); ts.forEachChild(node, visit); };
  visit(ast);
  const declaration = (name: string) => declarations.find(node => node.name.getText(ast) === name)!;
  const compile = (code: string) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;

  function promoFixture(loggedIn: boolean) {
    const context = {
      fullType: 'ESTJ-A', canonicalPath: '/read/ESTJ-A',
      auth: { isLoggedIn: loggedIn, userId: loggedIn ? 'account-a' : null },
      savePromoIntent: vi.fn(), trackPromoLoginStart: vi.fn(), loginWithGoogle: vi.fn(),
      setReportMessage: vi.fn(), startPromoClaim: vi.fn(), fetch: vi.fn(),
      trackV2CheckoutStart: vi.fn(), handleCheckout: vi.fn(),
      V2_PROMO_PAYWALL_COPY: { loginPending: 'pending' },
    };
    const run = runInNewContext(compile(`(${declaration('handlePromoUnlock').initializer!.getText(ast)})`), context) as () => void;
    return { context, run };
  }

  it('logged out: remembers the intent, tracks the login gate and opens Google login without any API call', () => {
    const { context, run } = promoFixture(false);
    run();
    expect(context.savePromoIntent).toHaveBeenCalledWith('ESTJ-A');
    expect(context.trackPromoLoginStart).toHaveBeenCalledWith('ESTJ-A', '/read/ESTJ-A');
    expect(context.loginWithGoogle).toHaveBeenCalledOnce();
    expect(context.startPromoClaim).not.toHaveBeenCalled();
    expect(context.fetch).not.toHaveBeenCalled();
    expect(context.trackV2CheckoutStart).not.toHaveBeenCalled();
  });

  it('logged in: claims through the promo API flow, not the LINE Pay checkout', () => {
    const { context, run } = promoFixture(true);
    run();
    expect(context.startPromoClaim).toHaveBeenCalledWith('account-a');
    expect(context.loginWithGoogle).not.toHaveBeenCalled();
    expect(context.handleCheckout).not.toHaveBeenCalled();
    expect(context.trackV2CheckoutStart).not.toHaveBeenCalled();
  });

  it('the promo handlers never reference checkout, payment events or the LINE Pay API', () => {
    for (const name of ['handlePromoUnlock', 'startPromoClaim']) {
      const text = declaration(name).getText(ast);
      for (const forbidden of ['trackV2CheckoutStart', 'begin_checkout', 'purchase', '/api/linepay', 'handleCheckout']) {
        expect(text).not.toContain(forbidden);
      }
    }
    expect(declaration('startPromoClaim').getText(ast)).toContain('runPromoClaim');
  });
});
