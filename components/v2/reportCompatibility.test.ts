import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { matchingRecordedResult } from './reportReading';

const source = readFileSync(new URL('./V2App.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('V2App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function collectNodes<T extends ts.Node>(predicate: (node: ts.Node) => node is T, sourceAst = ast): T[] {
  const matches: T[] = [];
  function visit(node: ts.Node) {
    if (predicate(node)) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(sourceAst);
  return matches;
}

// These selectors were observed in the user's Safari content-blocker stylesheet.
// Check the real JSX against that external rule, rather than our own CSS naming.
const cosmeticBlockerClasses = new Set(['ad-hero', 'ad-section', 'ad-footer', 'ad-feedback']);

describe('V2 report browser compatibility', () => {
  it('returns to the atlas entry instead of reopening a saved V1 report', () => {
    const recorded = collectNodes(ts.isVariableDeclaration).find(node => node.name.getText(ast) === 'recordedBundle')!;
    const initializer = recorded.initializer as ts.CallExpression;
    const code = ts.transpileModule(`(${initializer.arguments[0].getText(ast)})()`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const fixture = {
      source: 'direct', routeTarget: null,
      getLastV1Result: () => ({ resultData: { id: 'ESTJ' }, scores: { A: 8, Turbulent: 0 } }),
      getLastV2PrototypeResult: () => null, matchingRecordedResult,
    };
    expect(runInNewContext(code, fixture)).toBeNull();
    const explicitReport = runInNewContext(code, { ...fixture, routeTarget: { fullType: 'ESTJ-A' } });
    expect(explicitReport.resultData.id).toBe('ESTJ');
    expect(runInNewContext(code, { ...fixture, routeTarget: { fullType: 'INFP-T' } })).toBeNull();
  });

  it('gives the quiz entry account bar its V2 layout and touch-target scope', () => {
    const quizSource = readFileSync(new URL('./V2QuizFlow.tsx', import.meta.url), 'utf8');
    const quizAst = ts.createSourceFile('V2QuizFlow.tsx', quizSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const entry = collectNodes(ts.isIfStatement, quizAst).find(node => node.expression.getText(quizAst) === '!started')!;
    const code = ts.transpileModule(`(() => { ${entry.getText(quizAst)} })()`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
    }).outputText;
    const welcome = () => null;
    const result = runInNewContext(code, { React, started: false, V2Welcome: welcome, handleStart: vi.fn() });
    expect((result.props.className || '').split(/\s+/)).toContain('v2-app');
    expect(result.props.children.type).toBe(welcome);
  });

  it('keeps the previous type as an entry hint without entering the report', () => {
    const entry = collectNodes(ts.isIfStatement).find(node => node.expression.getText(ast) === '!resultBundle || !fullType')!;
    const code = ts.transpileModule(`(() => { ${entry.getText(ast)} })()`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
    }).outputText;
    const welcome = () => null;
    const result = runInNewContext(code, { React, resultBundle: null, fullType: null, knownType: 'ESTJ-A', V2Welcome: welcome });
    expect(result.type).toBe(welcome);
    expect(result.props.knownType).toBe('ESTJ-A');
  });

  it('stops the visible state-name pulse when the reader requests reduced motion', () => {
    const css = readFileSync(new URL('./v2-dark.css', import.meta.url), 'utf8');
    const media = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    const firstAnimationRule = media.slice(0, media.indexOf('}') + 1);
    expect(firstAnimationRule).toContain('.ad-hero-statename-dot');
    expect(firstAnimationRule).toMatch(/animation:\s*none\s*!important/);
  });

  it('keeps report content out of confirmed cosmetic ad-block selectors', () => {
    const classes = collectNodes(ts.isJsxAttribute)
      .filter((attribute) => attribute.name.getText(ast) === 'className')
      .flatMap((attribute) => attribute.initializer && ts.isStringLiteral(attribute.initializer)
        ? attribute.initializer.text.split(/\s+/)
        : []);

    expect(classes.filter((name) => cosmeticBlockerClasses.has(name))).toEqual([]);
  });

  it('tracks paid chapters in production while public checkout is closed', () => {
    // Run the actual effect callback with browser geometry/event fixtures. This
    // exercises production gate behavior without a synthetic copy of the algorithm.
    const effect = collectNodes(ts.isCallExpression).find((node) =>
      node.expression.getText(ast) === 'useEffect'
      && node.arguments[0]?.getText(ast).includes("window.addEventListener('scroll', updateActiveChapter"),
    );
    expect(effect).toBeDefined();

    const chapterIds = Array.from({ length: 8 }, (_, index) => `ch-0${index + 1}`);
    let scrollY = 0;
    const nodes = chapterIds.map((id, index) => ({
      id,
      getBoundingClientRect: () => ({ top: index * 1000 - scrollY }),
    }));
    const handlers = new Map<string, () => void>();
    const setActiveChapter = vi.fn();
    const setReportMessage = vi.fn();
    const removeEventListener = vi.fn((event: string, handler: () => void) => {
      if (handlers.get(event) === handler) handlers.delete(event);
    });
    const code = ts.transpileModule(`(${effect!.arguments[0].getText(ast)})()`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const cleanup = runInNewContext(code, {
      fullType: 'ESTJ-A', IS_DEV: false, IS_CHECKOUT_ENABLED: false,
      canReadReport: true, auth: { userId: null }, setResumeChapter: vi.fn(), readBookmark: vi.fn(), saveBookmark: vi.fn(),
      REPORT_CHAPTERS: chapterIds.map((id) => ({ id })),
      document: { getElementById: (id: string) => nodes.find((node) => node.id === id) },
      window: {
        innerHeight: 800,
        addEventListener: (event: string, handler: () => void) => handlers.set(event, handler),
        removeEventListener,
      },
      setActiveChapter, setReportMessage,
    }) as () => void;

    expect(handlers.has('scroll')).toBe(true);
    expect(setActiveChapter).toHaveBeenLastCalledWith('ch-01');
    expect(setReportMessage).not.toHaveBeenCalled();

    scrollY = 1800;
    handlers.get('scroll')!();
    expect(setActiveChapter).toHaveBeenLastCalledWith('ch-03');
    scrollY = 7000;
    handlers.get('scroll')!();
    expect(setActiveChapter).toHaveBeenLastCalledWith('ch-08');
    scrollY = 0;
    handlers.get('scroll')!();
    expect(setActiveChapter).toHaveBeenLastCalledWith('ch-01');

    cleanup();
    expect(handlers.has('scroll')).toBe(false);
    expect(removeEventListener).toHaveBeenCalled();
  });
});
