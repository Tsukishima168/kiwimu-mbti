import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SOUL_ANCHOR_MAP } from '../constants';

// ResultLegacyDump.tsx（凍結區、行號被 v2PromoCopy.test.ts 釘住）內仍有一份本地的
// SOUL_ANCHOR_MAP。它只用文字讀取，不 import，所以靠這個測試確保兩份不會再各自過期。
const legacySource = readFileSync(new URL('../components/ResultLegacyDump.tsx', import.meta.url), 'utf8');

function legacyMap(): Record<string, Record<string, unknown>> {
  const start = legacySource.indexOf('const SOUL_ANCHOR_MAP');
  const open = legacySource.indexOf('= {', start);
  const end = legacySource.indexOf('\n};', open);
  return new Function(`return ${legacySource.slice(open + 2, end + 2)}`)();
}

// 已確認不在現行菜單上的舊品名（2026-10-28 對照 /api/mbti-dessert 與 map /api/menu）
const RETIRED_NAMES = ['茶香巴斯克', '草莓莓果千層'];

describe('soul dessert anchors', () => {
  const legacy = legacyMap();

  it('covers the same 16 types in both copies', () => {
    expect(Object.keys(legacy).sort()).toEqual(Object.keys(SOUL_ANCHOR_MAP).sort());
    expect(Object.keys(legacy)).toHaveLength(16);
  });

  it.each(Object.keys(SOUL_ANCHOR_MAP))('%s: the zh result page copy matches constants.ts', (type) => {
    for (const field of ['name', 'series', 'quad', 'alt', 'drinkA', 'drinkT', 'hook']) {
      expect(legacy[type][field], `${type}.${field}`).toEqual(SOUL_ANCHOR_MAP[type][field]);
    }
  });

  it('no retired dessert name is left in either copy or in the full-menu list', () => {
    const constantsText = JSON.stringify(SOUL_ANCHOR_MAP);
    for (const name of RETIRED_NAMES) {
      expect(constantsText).not.toContain(name);
      expect(legacySource).not.toContain(name);
    }
  });
});
