import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(new URL('./DiscordLinkGate.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('DiscordLinkGate.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const nodes: ts.Node[] = [];
function visit(node: ts.Node) { nodes.push(node); ts.forEachChild(node, visit); }
visit(ast);
const effect = nodes.filter(ts.isCallExpression).find(node => node.expression.getText(ast) === 'useEffect')!;
const complete = nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(ast) === 'completeLink')!;
const dismiss = nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(ast) === 'dismissLink')!;
const confirmClick = nodes.filter(ts.isJsxAttribute).find(node => node.name.getText(ast) === 'onClick'
  && node.initializer?.getText(ast).includes('completeLink'))!.initializer as ts.JsxExpression;
const compile = (code: string) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const settle = () => new Promise(resolve => setImmediate(resolve));
const session = { data: { session: { access_token: 'mock-session-token', user: { id: 'current-account' } } }, error: null };

function runEffect(overrides: Record<string, unknown> = {}) {
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  const setStatus = vi.fn();
  const setMessage = vi.fn();
  const replaceState = vi.fn();
  const setState = vi.fn();
  const removeItem = vi.fn();
  const getSession = vi.fn().mockResolvedValue(session);
  const context = {
    state: '11111111-1111-4111-8111-111111111111',
    user: { uid: 'current-account', email: 'ignored@example.com', displayName: 'Ignored client profile' },
    getAuthSupabaseClient: () => ({ auth: { getSession } }),
    setStatus, setMessage, setState, fetch, URL, AbortController,
    sessionStorage: { removeItem },
    pendingRequest: { current: null as AbortController | null },
    window: { location: { href: 'https://kiwimu.com/?discord_link_state=fixture' }, history: { replaceState } },
    ...overrides,
  };
  const cleanup = runInNewContext(compile(`(${effect.arguments[0].getText(ast)})()`), context) as (() => void) | undefined;
  const completeLink = runInNewContext(compile(complete.initializer!.getText(ast)), context);
  const cancel = runInNewContext(compile(dismiss.initializer!.getText(ast)), context);
  const confirm = () => runInNewContext(compile(`(${confirmClick.expression!.getText(ast)})()`), { ...context, completeLink });
  return { cleanup, confirm, cancel, fetch, setStatus, setMessage, setState, removeItem, replaceState, getSession };
}

describe('Discord link caller account session', () => {
  it('does not automatically link a logged-in visitor who opens somebody else’s state URL', async () => {
    const fixture = runEffect();
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.getSession).not.toHaveBeenCalled();
    expect(fixture.setStatus).toHaveBeenLastCalledWith('idle');
    fixture.cleanup?.();
  });

  it('cancels without any POST, clears both state sources and closes the overlay', async () => {
    const fixture = runEffect();
    fixture.cancel();
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.getSession).not.toHaveBeenCalled();
    expect(fixture.removeItem).toHaveBeenCalledWith('discord_link_state');
    expect(fixture.replaceState.mock.calls[0][2]).toBe('https://kiwimu.com/');
    expect(fixture.setState).toHaveBeenCalledWith(null);
    fixture.cleanup?.();
  });

  it('cancels while session lookup is pending without ever posting', async () => {
    let resolve!: (value: typeof session) => void;
    const pending = new Promise<typeof session>(done => { resolve = done; });
    const fixture = runEffect({ getAuthSupabaseClient: () => ({ auth: { getSession: () => pending } }) });
    fixture.confirm();
    fixture.cancel();
    resolve(session);
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.setState).toHaveBeenCalledWith(null);
    expect(fixture.setStatus).not.toHaveBeenCalledWith('linked');
  });

  it('ignores a late server response after cancel closes the overlay', async () => {
    let resolve!: (value: { ok: boolean }) => void;
    const pending = new Promise<{ ok: boolean }>(done => { resolve = done; });
    const fetch = vi.fn().mockReturnValue(pending);
    const fixture = runEffect({ fetch });
    fixture.confirm();
    await settle();
    fixture.cancel();
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    resolve({ ok: true });
    await settle();
    expect(fixture.setState).toHaveBeenCalledWith(null);
    expect(fixture.setStatus).not.toHaveBeenCalledWith('linked');
    expect(fixture.setStatus).not.toHaveBeenCalledWith('error');
    expect(fixture.replaceState).toHaveBeenCalledTimes(1);
  });
  it('sends only the state with the matching account bearer', async () => {
    const fixture = runEffect();
    fixture.confirm();
    await settle();
    expect(fixture.fetch).toHaveBeenCalledOnce();
    const [url, options] = fixture.fetch.mock.calls[0];
    expect(url).toBe('/api/discord/link/complete');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer mock-session-token' });
    expect(JSON.parse(options.body)).toEqual({ state: '11111111-1111-4111-8111-111111111111' });
    expect(fixture.setStatus).toHaveBeenLastCalledWith('linked');
    expect(fixture.replaceState.mock.calls[0][2]).toBe('https://kiwimu.com/');
    fixture.cleanup?.();
  });

  it.each([null, { uid: 'anonymous', isAnonymous: true }])('keeps login guidance for %j without any link request', async user => {
    const fixture = runEffect({ user });
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.getSession).not.toHaveBeenCalled();
    expect(fixture.setStatus).toHaveBeenLastCalledWith('idle');
    fixture.cleanup?.();
  });

  it.each([
    { data: { session: null }, error: null },
    { data: { session: { access_token: 'other-token', user: { id: 'other-account' } } }, error: null },
    { data: { session: { access_token: 'anonymous-token', user: { id: 'current-account', is_anonymous: true } } }, error: null },
    { ...session, error: new Error('session expired') },
  ])('does not link a mismatched, expired or anonymous session (%#)', async invalid => {
    const fixture = runEffect({ getAuthSupabaseClient: () => ({ auth: { getSession: async () => invalid } }) });
    fixture.confirm();
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.setStatus).toHaveBeenLastCalledWith('error');
    fixture.cleanup?.();
  });

  it.each([
    ['a missing auth client', { getAuthSupabaseClient: () => null }],
    ['a mismatched session', { getAuthSupabaseClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'other-token', user: { id: 'other-account' } } }, error: null }) } }) }],
  ])('tells the user to sign in again for %s without leaking an internal marker', async (_name, overrides) => {
    const fixture = runEffect(overrides);
    fixture.confirm();
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.setStatus).toHaveBeenLastCalledWith('error');
    expect(fixture.setMessage).toHaveBeenLastCalledWith('請重新登入後再試。');
    fixture.cleanup?.();
  });

  it('shows generic copy, not the server error text, when the link request fails', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'Invalid state' }) });
    const fixture = runEffect({ fetch });
    fixture.confirm();
    await settle();
    expect(fixture.setStatus).toHaveBeenLastCalledWith('error');
    expect(fixture.setMessage).toHaveBeenLastCalledWith('暫時無法完成 Discord 綁定，請稍後再試。');
    fixture.cleanup?.();
  });

  it('does not post a delayed session after the current account changes', async () => {
    let resolve!: (value: typeof session) => void;
    const pending = new Promise<typeof session>(done => { resolve = done; });
    const fixture = runEffect({ getAuthSupabaseClient: () => ({ auth: { getSession: () => pending } }) });
    fixture.confirm();
    fixture.cleanup?.();
    resolve(session);
    await settle();
    expect(fixture.fetch).not.toHaveBeenCalled();
    expect(fixture.setStatus).toHaveBeenCalledTimes(2);
  });

  it('aborts a pending request and ignores its completion after unmount or account change', async () => {
    let resolve!: (value: { ok: boolean }) => void;
    const pending = new Promise<{ ok: boolean }>(done => { resolve = done; });
    const fetch = vi.fn().mockReturnValue(pending);
    const fixture = runEffect({ fetch });
    fixture.confirm();
    await settle();
    fixture.cleanup?.();
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    resolve({ ok: true });
    await settle();
    expect(fixture.setStatus).toHaveBeenCalledTimes(2);
    expect(fixture.replaceState).not.toHaveBeenCalled();
  });
});
