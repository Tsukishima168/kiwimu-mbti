import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { paymentReceiptMessage } from './paymentReceiptStatus';

function parse(name: string) {
  const source = readFileSync(new URL(name, import.meta.url), 'utf8');
  const ast = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const nodes: ts.Node[] = [];
  function visit(node: ts.Node) { nodes.push(node); ts.forEachChild(node, visit); }
  visit(ast);
  return { ast, nodes };
}
const library = parse('./V2ReportLibrary.tsx');
const compile = (code: string) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const effect = library.nodes.filter(ts.isCallExpression).find(node => node.expression.getText(library.ast) === 'useEffect'
  && node.arguments[0]?.getText(library.ast).includes("accountRequest('my-reports'"))!;
const receipt = library.nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(library.ast) === 'handleReceipt')!;
const claim = library.nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(library.ast) === 'handleClaim')!;
const actionError = library.nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(library.ast) === 'handleActionError')!;
const accountClass = library.nodes.filter(ts.isClassDeclaration).find(node => node.name?.text === 'AccountRequestError')!;
const accountFunction = library.nodes.filter(ts.isFunctionDeclaration).find(node => node.name?.text === 'accountRequest')!;
const report = { mbtiType: 'ESTJ-A', receiptStatus: 'pending', reference: 'KW-FIXTURE' };
const settle = () => new Promise(resolve => setImmediate(resolve));

afterEach(() => vi.useRealTimers());

describe('account reading states', () => {
  it.each([401, 403])('clears protected library data when an action receives %i', status => {
    class FixtureError extends Error { constructor(public status: number) { super('AUTH_REQUIRED'); } }
    const setData = vi.fn();
    const setLoadError = vi.fn();
    const setMessage = vi.fn();
    const run = runInNewContext(compile(`(${actionError.initializer!.getText(library.ast)})`), {
      ownerRef: { current: 'account-a' }, AccountRequestError: FixtureError,
      setData, setLoadError, setMessage, requestMessage: () => '請重新登入',
    }) as (error: unknown, ownerId: string) => void;
    run(new FixtureError(status), 'account-a');
    expect(setData).toHaveBeenCalledWith(null);
    expect(setLoadError).toHaveBeenCalledWith({ ownerId: 'account-a', text: '請重新登入' });
    expect(setMessage).not.toHaveBeenCalled();
  });

  it('removes the failed load message after a successful library retry', async () => {
    let error: unknown = null;
    let data: any = null;
    const request = vi.fn().mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ reports: [report], claimableReport: null });
    const context = {
      auth: { userId: 'account-a' }, accountRequest: request, AccountRequestError: class extends Error {},
      setData: (value: any) => { data = typeof value === 'function' ? value(data) : value; },
      setLoadError: (value: unknown) => { error = value; }, setLoading: vi.fn(), setReceiptClock: vi.fn(), setReceiptRetryAt: vi.fn(),
      requestMessage: () => '暫時無法完成',
    };
    const run = () => runInNewContext(compile(`(${effect.arguments[0].getText(library.ast)})()`), context);
    run();
    await settle();
    expect(error).toMatchObject({ ownerId: 'account-a', text: '暫時無法完成' });
    run();
    await settle();
    expect(error).toBeNull();
    expect(data.reports).toEqual([report]);
  });

  it('does not send a claim or receipt request using an account that changed while session lookup was pending', async () => {
    const fetchMock = vi.fn();
    const methods = runInNewContext(compile(`${accountClass.getText(library.ast)}\n${accountFunction.getText(library.ast)}\n({accountRequest, AccountRequestError});`), {
      getAuthSupabaseClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'fixture', user: { id: 'account-b' } } } }) } }),
      fetch: fetchMock, Error,
    }) as { accountRequest: (operation: string, body: object, ownerId: string) => Promise<unknown> };
    await expect(methods.accountRequest('claim-report', {}, 'account-a')).rejects.toThrow('AUTH_REQUIRED');
    await expect(methods.accountRequest('receipt', { reference: report.reference }, 'account-a')).rejects.toThrow('AUTH_REQUIRED');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not publish a save result into a different account after a delayed response', async () => {
    let resolve!: (value: unknown) => void;
    const request = new Promise(done => { resolve = done; });
    const ownerRef = { current: 'account-a' as string | null };
    const setMessage = vi.fn();
    const setRefresh = vi.fn();
    const run = runInNewContext(compile(`(${claim.initializer!.getText(library.ast)})`), {
      auth: { userId: 'account-a' }, busy: '', ownerRef, accountRequest: () => request,
      setMessage, setRefresh, setBusy: vi.fn(), requestMessage: () => 'error',
    }) as () => Promise<void>;
    const result = run();
    ownerRef.current = 'account-b';
    resolve({});
    await result;
    expect(setMessage).toHaveBeenCalledTimes(1);
    expect(setMessage).toHaveBeenCalledWith('');
    expect(setRefresh).not.toHaveBeenCalled();
  });

  it('enforces the five-minute receipt cooldown before using the receipt endpoint again', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-02T12:00:00Z'));
    const request = vi.fn().mockResolvedValue({ receiptStatus: 'sent' });
    const setMessage = vi.fn();
    const run = runInNewContext(compile(`(${receipt.initializer!.getText(library.ast)})`), {
      auth: { userId: 'account-a' }, busy: '', ownerRef: { current: 'account-a' },
      receiptRetryAt: { [report.reference]: Date.now() + 5 * 60 * 1000 }, Date,
      accountRequest: request, paymentReceiptMessage, setMessage,
      setRefresh: vi.fn(), setBusy: vi.fn(), setData: vi.fn(), setReceiptRetryAt: vi.fn(), requestMessage: () => 'error',
    }) as (reference: string) => Promise<void>;
    await run(report.reference);
    expect(request).not.toHaveBeenCalled();
    vi.setSystemTime(new Date('2026-10-02T12:05:00Z'));
    await run(report.reference);
    expect(request).toHaveBeenCalledWith('receipt', { reference: report.reference }, 'account-a');
    expect(setMessage).toHaveBeenLastCalledWith(paymentReceiptMessage('sent'));
  });

  it.each([
    ['pending', '尚未寄出'], ['sending', '可能已送出'], ['failed', '尚未確認'], ['review', '需要人工確認'], ['sent', '已送出'],
  ] as const)('communicates the %s receipt state without changing payment truth', (status, detail) => {
    expect(paymentReceiptMessage(status)).toContain(detail);
    expect(paymentReceiptMessage(status)).toContain('閱讀');
  });

  it('propagates a resolved SDK signout error instead of reporting success', async () => {
    const bridge = parse('../../utils/supabaseAuthBridge.ts');
    const signOut = bridge.nodes.filter(ts.isFunctionDeclaration).find(node => node.name?.text === 'signOutSupabase')!;
    const sdkError = new Error('fixture signout failure');
    const run = runInNewContext(compile(`${signOut.getText(bridge.ast).replace('export ', '')}\nsignOutSupabase;`), {
      getAuthSupabaseClient: () => ({ auth: { signOut: async () => ({ error: sdkError }) } }),
    }) as () => Promise<void>;
    await expect(run()).rejects.toBe(sdkError);
  });
});
