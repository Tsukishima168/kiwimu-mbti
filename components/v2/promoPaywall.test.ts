import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { V2_REPORT_PRICE_TWD } from '../../shared/v2Product';
import { v2PaywallOffer, V2_PROMO_PAYWALL_COPY } from '../../utils/v2PromoCopy';

// Render the production paywall JSX from V2App.tsx (not a copy of it) into a plain tree.
// The offer is computed by the component's own `paywallOffer` / `showPromoOffer` declarations
// with a fixed clock, so this exercises: time → offer → which CTA is rendered.
const source = readFileSync(new URL('./V2App.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('V2App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const nodes: ts.Node[] = [];
const visit = (node: ts.Node) => { nodes.push(node); ts.forEachChild(node, visit); };
visit(ast);

const declaration = (name: string) => nodes.filter(ts.isVariableDeclaration)
  .find(node => node.name.getText(ast) === name)!.initializer!.getText(ast);
const paywallJsx = nodes.filter(ts.isJsxElement).find(node =>
  node.openingElement.attributes.getText(ast).includes('className="ad-paywall-box ad-reveal"'))!;

const compileExpression = (code: string) => ts.transpileModule(`(${code});`, {
  fileName: 'paywall.tsx',
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
}).outputText;

type Tree = { type: unknown; props: Record<string, unknown>; children: Array<Tree | string> };
const createElement = (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): Tree => ({
  type,
  props: props || {},
  children: (children.flat(Infinity) as unknown[])
    .filter(child => child !== null && child !== undefined && child !== false && child !== true)
    .map(child => (typeof child === 'object' ? child as Tree : String(child))),
});
const textOf = (node: Tree | string): string => (typeof node === 'string' ? node : node.children.map(textOf).join(''));
const findAll = (node: Tree | string, match: (tree: Tree) => boolean, found: Tree[] = []): Tree[] => {
  if (typeof node === 'string') return found;
  if (match(node)) found.push(node);
  node.children.forEach(child => findAll(child, match, found));
  return found;
};

function renderPaywall(instant: string, options: { loggedIn: boolean; promoEnded?: boolean }) {
  const handlers = {
    handlePromoUnlock: vi.fn(), handleCheckout: vi.fn(), handleCheckPaymentStatus: vi.fn(), handleResetPreview: vi.fn(),
    setReportMessage: vi.fn(), setReportRefresh: vi.fn(), loginWithGoogle: vi.fn(),
  };
  const context: Record<string, unknown> = {
    React: { createElement, Fragment: 'Fragment' },
    Date: { now: () => Date.parse(instant) },
    v2PaywallOffer, V2_PROMO_PAYWALL_COPY, V2_REPORT_PRICE_TWD,
    promoEnded: options.promoEnded ?? false,
    // A signed-in or signed-out reader without entitlement, after the report check settled.
    isReportLoading: false,
    currentAccess: { status: 'denied', ownerId: options.loggedIn ? 'account-a' : null, fullType: 'ESTJ-A', message: 'denied' },
    auth: { isLoggedIn: options.loggedIn, isLoading: false, userId: options.loggedIn ? 'account-a' : null },
    IS_CHECKOUT_ENABLED: true, IS_DEV: false, isLocalPreview: false,
    checkoutPaymentUrl: '', checkoutStatus: 'idle', promoStatus: 'idle', reportMessage: '',
    unlockPrimaryLabel: `NT$${V2_REPORT_PRICE_TWD} 解鎖這份完整報告`,
    ...handlers,
  };
  context.paywallOffer = runInNewContext(compileExpression(declaration('paywallOffer')), context);
  context.showPromoOffer = runInNewContext(compileExpression(declaration('showPromoOffer')), context);
  const tree = runInNewContext(compileExpression(paywallJsx.getText(ast)), context) as Tree;
  const buttons = findAll(tree, node => node.type === 'button');
  return {
    text: textOf(tree),
    freeCta: buttons.filter(button => button.props.onClick === handlers.handlePromoUnlock),
    paidCta: buttons.filter(button => button.props.onClick === handlers.handleCheckout),
    termsLinks: findAll(tree, node => node.type === 'a' && node.props.href === '/terms.html'),
  };
}

const LAST_OPEN = '2026-11-30T23:59:59.999+08:00';
const FIRST_CLOSED = '2026-12-01T00:00:00.000+08:00';

describe('V2 paywall CTA across the promo boundary (rendered from V2App.tsx)', () => {
  it.each([
    { loggedIn: true, label: V2_PROMO_PAYWALL_COPY.ctaLoggedIn },
    { loggedIn: false, label: V2_PROMO_PAYWALL_COPY.ctaLoggedOut },
  ])('during the window (loggedIn=$loggedIn): free CTA only, no LINE Pay checkout', ({ loggedIn, label }) => {
    const view = renderPaywall(LAST_OPEN, { loggedIn });
    expect(view.freeCta).toHaveLength(1);
    expect(textOf(view.freeCta[0])).toBe(label);
    expect(view.paidCta).toHaveLength(0);
    expect(view.text).toContain(V2_PROMO_PAYWALL_COPY.priceNote);
    expect(view.text).not.toContain(`NT$${V2_REPORT_PRICE_TWD} · 單次解鎖`);
    expect(view.text).not.toContain('登入購買時的帳號');
  });

  it.each([true, false])('after the window (loggedIn=%s): LINE Pay checkout only, no free CTA', (loggedIn) => {
    const view = renderPaywall(FIRST_CLOSED, { loggedIn });
    expect(view.freeCta).toHaveLength(0);
    expect(view.paidCta).toHaveLength(1);
    expect(textOf(view.paidCta[0])).toBe(`NT$${V2_REPORT_PRICE_TWD} 解鎖這份完整報告`);
    expect(view.text).toContain(`NT$${V2_REPORT_PRICE_TWD} · 單次解鎖`);
    expect(view.text).not.toContain(V2_PROMO_PAYWALL_COPY.priceNote);
  });

  it.each([true, false])('shows the digital-content / refund consent line with a terms link next to the paid checkout (loggedIn=%s)', (loggedIn) => {
    const view = renderPaywall(FIRST_CLOSED, { loggedIn });
    expect(view.text).toContain('不適用七日猶豫期');
    expect(view.text).toContain('全額退款');
    expect(view.termsLinks).toHaveLength(1);
    expect(view.termsLinks[0].props.target).toBe('_blank');
    expect(view.termsLinks[0].props.rel).toBe('noopener noreferrer');
  });

  it('does not show the payment consent line during the free window (nothing is charged)', () => {
    const view = renderPaywall(LAST_OPEN, { loggedIn: true });
    expect(view.text).not.toContain('不適用七日猶豫期');
    expect(view.termsLinks).toHaveLength(0);
  });

  it('switches to the paid checkout once the server reports the promo ended, even before the client clock does', () => {
    const view = renderPaywall(LAST_OPEN, { loggedIn: true, promoEnded: true });
    expect(view.freeCta).toHaveLength(0);
    expect(view.paidCta).toHaveLength(1);
  });
});
