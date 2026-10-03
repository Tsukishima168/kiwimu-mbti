import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReportAccessError, reportAccessFailure, requestPaidReport } from './reportAccess';

const source = readFileSync(new URL('./V2App.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('V2App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const nodes: ts.Node[] = [];
function visit(node: ts.Node) { nodes.push(node); ts.forEachChild(node, visit); }
visit(ast);
const effect = nodes.filter(ts.isCallExpression).find(node => node.expression.getText(ast) === 'useEffect'
  && node.arguments[0]?.getText(ast).includes('const loadPaidReports = async'))!;
const currentReport = nodes.filter(ts.isVariableDeclaration).find(node => node.name.getText(ast) === 'currentPaidReports')!;
const compile = (code: string) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const bundle = { report: { fullCode: 'ESTJ-A' }, oppositeReport: null };
const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const settle = () => new Promise(resolve => setImmediate(resolve));

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('paid report read recovery', () => {
  it.each([401, 403])('keeps %i responses locked with account guidance', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(status, { ok: false, code: 'ENTITLEMENT_REQUIRED' })));
    const error = await requestPaidReport('ESTJ-A', {}).catch(error => error);
    expect(error).toBeInstanceOf(ReportAccessError);
    expect(reportAccessFailure(error)).toMatchObject({ status: 'denied' });
    expect(reportAccessFailure(error).message).toContain('不需要重付');
  });

  it.each([503, 504])('reports %i as a temporary failure rather than a missing purchase', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(status, { ok: false, code: 'STORE_UNAVAILABLE' })));
    const error = await requestPaidReport('ESTJ-A', {}).catch(error => error);
    expect(reportAccessFailure(error)).toMatchObject({ status: 'error' });
    expect(reportAccessFailure(error).message).toContain('重新載入');
  });

  it('rejects an incomplete or mismatched report without rendering paid content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(200, { ok: true, data: { report: { fullCode: 'INFP-T' } } })));
    const error = await requestPaidReport('ESTJ-A', {}).catch(error => error);
    expect(reportAccessFailure(error).status).toBe('error');
  });

  it('recovers after a network failure using only the existing report endpoint', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(respond(200, { ok: true, data: bundle }));
    vi.stubGlobal('fetch', fetchMock);
    const firstError = await requestPaidReport('ESTJ-A', {}).catch(error => error);
    expect(reportAccessFailure(firstError).status).toBe('error');
    await expect(requestPaidReport('ESTJ-A', { Authorization: 'Bearer fixture' })).resolves.toEqual(bundle);
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(['/api/v2/report', '/api/v2/report']);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ credentials: 'same-origin', body: JSON.stringify({ mbtiType: 'ESTJ-A' }) });
  });

  it('ends a stalled read after 15 seconds so the reader can retry', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    })));
    const outcome = requestPaidReport('ESTJ-A', {}).catch(error => reportAccessFailure(error));
    await vi.advanceTimersByTimeAsync(15_000);
    await expect(outcome).resolves.toMatchObject({ status: 'error' });
    expect(vi.getTimerCount()).toBe(0);
  });

  function runEffect(request = requestPaidReport) {
    const setPaidReports = vi.fn();
    const setReportAccess = vi.fn();
    const clearV2Entitlement = vi.fn();
    const setEntitlementState = vi.fn();
    const cleanup = runInNewContext(compile(`(${effect.arguments[0].getText(ast)})()`), {
      fullType: 'ESTJ-A', IS_DEV: false, isLocalPreview: false, auth: { userId: 'account-a', isLoading: false },
      entitlement: { status: 'unlocked', sourceOrderId: 'server-verified' },
      getAuthSupabaseClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'fixture' } } }) } }),
      requestPaidReport: request, reportAccessFailure, readLegacyV2OrderId: () => '',
      setPaidReports, setReportAccess, clearV2Entitlement, setEntitlementState,
      unlockV2Purchase: () => ({ status: 'unlocked' }), clearLegacyV2OrderId: vi.fn(), setReportMessage: vi.fn(),
    }) as () => void;
    return { cleanup, setPaidReports, setReportAccess, clearV2Entitlement, setEntitlementState };
  }

  it('the production effect preserves the purchase cache on technical failure and grants only on a successful retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(respond(200, { ok: true, data: bundle })));
    const first = runEffect();
    await settle();
    expect(first.setReportAccess).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'error', ownerId: 'account-a' }));
    expect(first.clearV2Entitlement).not.toHaveBeenCalled();
    expect(first.setEntitlementState).not.toHaveBeenCalled();
    first.cleanup();
    const retry = runEffect();
    await settle();
    expect(retry.setPaidReports).toHaveBeenLastCalledWith({ ...bundle, ownerId: 'account-a' });
    expect(retry.setReportAccess).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'granted', message: '' }));
  });

  it('does not apply a delayed response after the owner changes', async () => {
    let resolve!: (value: typeof bundle) => void;
    const pending = new Promise<typeof bundle>(done => { resolve = done; });
    const fixture = runEffect(() => pending as ReturnType<typeof requestPaidReport>);
    await settle();
    fixture.cleanup();
    resolve(bundle);
    await settle();
    expect(fixture.setPaidReports).toHaveBeenCalledTimes(1);
    expect(fixture.setPaidReports).toHaveBeenCalledWith(null);
    expect(fixture.setReportAccess).toHaveBeenCalledTimes(1);
  });

  it.each(['account-b', null])('hides the previous owner report immediately for %s before effects run', userId => {
    const value = runInNewContext(compile(currentReport.initializer!.getText(ast)), {
      paidReports: { ...bundle, ownerId: 'account-a' }, auth: { userId }, fullType: 'ESTJ-A',
    });
    expect(value).toBeNull();
  });
});
