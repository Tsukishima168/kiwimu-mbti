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
const reportApp = parse('./V2App.tsx');
const checkout = reportApp.nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(reportApp.ast) === 'handleCheckout')!;
const checkPayment = reportApp.nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(reportApp.ast) === 'handleCheckPaymentStatus')!;
const report = { mbtiType: 'ESTJ-A', receiptStatus: 'pending', reference: 'KW-FIXTURE' };
const settle = () => new Promise(resolve => setImmediate(resolve));

function checkoutFixture(name: 'checkout' | 'status' = 'checkout') {
  const context = {
    IS_DEV: false, isLocalPreview: false, auth: { isLoggedIn: true, userId: 'account-a' },
    fullType: 'ESTJ-A', source: 'fixture',
    checkoutContextRef: { current: { ownerId: 'account-a' as string | null, fullType: 'ESTJ-A' } },
    checkoutRequestRef: { current: 0 },
    getAuthSupabaseClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'fixture-a', user: { id: 'account-a' } } } }) } }),
    fetch: vi.fn(), trackAction: vi.fn(), trackV2CheckoutStart: vi.fn(), loginWithGoogle: vi.fn(),
    setCheckoutStatus: vi.fn(), setCheckoutPaymentUrl: vi.fn(), setReportMessage: vi.fn(),
    window: { open: vi.fn(), location: { assign: vi.fn() } }, console,
  };
  const declaration = name === 'checkout' ? checkout : checkPayment;
  const run = runInNewContext(compile(`(${declaration.initializer!.getText(reportApp.ast)})`), context) as () => void;
  return { context, run };
}

afterEach(() => vi.useRealTimers());

describe('account reading states', () => {
  it('keeps the payment link for a successful checkout by the current owner', async () => {
    const { context, run } = checkoutFixture();
    context.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true, paymentUrl: 'https://fixture.invalid/current-owner-order' }) });
    run();
    await settle();
    expect(context.fetch).toHaveBeenCalledWith('/api/linepay/request', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer fixture-a' }),
    }));
    expect(context.setCheckoutPaymentUrl).toHaveBeenLastCalledWith('https://fixture.invalid/current-owner-order');
    expect(context.setCheckoutStatus).toHaveBeenLastCalledWith('pending');
    expect(context.window.open).toHaveBeenCalledOnce();
  });

  it('redirects a confirmed payment for the current owner', async () => {
    const { context, run } = checkoutFixture('status');
    context.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true, data: { mbtiType: 'ESTJ-A', redirectUrl: '/read/ESTJ-A?unlock=success' } }) });
    run();
    await settle();
    expect(context.fetch).toHaveBeenCalledWith('/api/linepay/status', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer fixture-a' }),
    }));
    expect(context.window.location.assign).toHaveBeenCalledWith('/read/ESTJ-A?unlock=success');
  });

  it('does not create a payment when the session owner changed during lookup', async () => {
    const { context, run } = checkoutFixture();
    context.getAuthSupabaseClient = () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'fixture-b', user: { id: 'account-b' } } } }) } });
    run();
    await settle();
    expect(context.fetch).not.toHaveBeenCalled();
    expect(context.window.open).not.toHaveBeenCalled();
  });

  it('ignores a delayed checkout response after the account changes', async () => {
    const { context, run } = checkoutFixture();
    let complete!: (value: unknown) => void;
    context.fetch.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    run();
    await settle();
    expect(context.fetch).toHaveBeenCalledOnce();
    context.checkoutContextRef.current.ownerId = 'account-b';
    context.setCheckoutPaymentUrl.mockClear();
    context.setCheckoutStatus.mockClear();
    context.setReportMessage.mockClear();
    complete({ ok: true, json: async () => ({ ok: true, paymentUrl: 'https://fixture.invalid/account-a-order' }) });
    await settle();
    expect(context.setCheckoutPaymentUrl).not.toHaveBeenCalled();
    expect(context.setCheckoutStatus).not.toHaveBeenCalled();
    expect(context.setReportMessage).not.toHaveBeenCalled();
    expect(context.window.open).not.toHaveBeenCalled();
  });

  it('does not redirect a new account from a delayed payment status response', async () => {
    const { context, run } = checkoutFixture('status');
    let complete!: (value: unknown) => void;
    context.fetch.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    run();
    await settle();
    context.checkoutContextRef.current.ownerId = 'account-b';
    context.setReportMessage.mockClear();
    complete({ ok: true, json: async () => ({ ok: true, data: { mbtiType: 'ESTJ-A', redirectUrl: '/read/ESTJ-A?unlock=success' } }) });
    await settle();
    expect(context.window.location.assign).not.toHaveBeenCalled();
    expect(context.setReportMessage).not.toHaveBeenCalled();
  });

  it('ignores a delayed checkout error after logout', async () => {
    const { context, run } = checkoutFixture();
    let reject!: (error: Error) => void;
    context.fetch.mockReturnValue(new Promise((_resolve, fail) => { reject = fail; }));
    run();
    await settle();
    context.checkoutContextRef.current.ownerId = null;
    context.setCheckoutStatus.mockClear();
    context.setReportMessage.mockClear();
    reject(new Error('fixture offline'));
    await settle();
    expect(context.setCheckoutStatus).not.toHaveBeenCalled();
    expect(context.setReportMessage).not.toHaveBeenCalled();
  });

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
