import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, symlink, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { cleanText, parseAbstract, parseLabeledBullets, parseNarrative } from '../generate-v2-variant-reports.mjs';

test('quoted markdown keeps paragraph boundaries, strips only quote/indent markers', () => {
  assert.equal(cleanText('> 第一段。\r\n>\r\n> 第二段。\r\n\r\n  第三段。'), '第一段。\n\n第二段。\n\n第三段。');
});

test('labeled bullets include all continuation paragraphs up to the next label', () => {
  const text = '- **情境**：會議沒有結論。\n\n  你把下一步寫下來。\n\n  可以試試：先問誰願意負責。\n- **回看**：留意實際的回應。';
  assert.deepEqual(parseLabeledBullets(text), [
    { label: '情境', body: '會議沒有結論。\n\n你把下一步寫下來。\n\n可以試試：先問誰願意負責。' },
    { label: '回看', body: '留意實際的回應。' },
  ]);
  assert.deepEqual(parseLabeledBullets('> - **第一項**：甲。\n>\n> 乙。\n> - **第二項**：丙。'), [
    { label: '第一項', body: '甲。\n\n乙。' }, { label: '第二項', body: '丙。' },
  ]);
});

test('both public abstract and paid narrative retain their authored second paragraph', () => {
  const draft = '> **閱讀入口**：先看一個情境。\n>\n> 再留意自己的反應。\n\n---\n\n## 📖 前台敘事版\n\n- **核心說明**：觀察。\n\n  差異。\n- **狀態現場**：會議卡住。\n\n  可以試試：問清楚。\n- **辨識留白**：可以不同意。\n\n## 下一節\n\n不屬於敘事。';
  assert.deepEqual(parseAbstract(draft), { label: '閱讀入口', body: '先看一個情境。\n\n再留意自己的反應。' });
  assert.deepEqual(parseNarrative(draft), {
    overview: '觀察。\n\n差異。',
    scenes: [{ kind: 'state', label: '狀態現場', body: '會議卡住。\n\n可以試試：問清楚。' }],
    counterpoint: '可以不同意。',
  });
});

test('absolute symlink CLI invocation generates all 32 reports, not a silent success', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'v2-generator-check-'));
  try {
    const source = path.join(directory, 'vault', '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_32變體草案庫');
    const families = { '01_分析家類_Analysts': ['INTJ','INTP','ENTJ','ENTP'], '02_外交家類_Diplomats': ['INFJ','INFP','ENFJ','ENFP'], '03_守護者類_Sentinels': ['ISTJ','ISFJ','ESTJ','ESFJ'], '04_探險家類_Explorers': ['ISTP','ISFP','ESTP','ESFP'] };
    for (const [family, types] of Object.entries(families)) {
      await mkdir(path.join(source, family), { recursive: true });
      for (const type of types) for (const variant of ['A','T']) await writeFile(path.join(source, family, `${type}-${variant}.md`),
        `---\ntype: ${type}\nvariant: ${variant}\nfullCode: ${type}-${variant}\n---\n\n# 報告：${type}-${variant} (閱讀名)\n\n> **引言**：第一段。\n>\n> 第二段。\n\n---\n\n## 🧭 當代位置\n\n### 世代影響下的行為邏輯\n- **觀察**：情境。\n\n## 🎯 當前狀態命名\n\n> **「觀察 / 校準」**\n\n提示。\n\n## 🌐 維度進化論\n- **E (外向)**：說明。\n\n## 📖 前台敘事版\n- **核心說明**：核心。\n\n  差異。\n${['狀態','日常','工作','關係'].map(kind => `- **${kind}現場**：場景。\n\n  可以試試：小事。`).join('\n')}\n- **辨識留白**：可以不同意。\n\n## 可以試的小練習\n- **覺察問題**：提問。\n`);
    }
    await mkdir(path.join(directory, 'data'));
    const entry = path.join(directory, 'generator.mjs');
    await symlink(fileURLToPath(new URL('../generate-v2-variant-reports.mjs', import.meta.url)), entry);
    const stdout = execFileSync(process.execPath, [entry], { cwd: directory, env: { ...process.env, PENSO_OBSIDIAN_ROOT: path.join(directory, 'vault') }, encoding: 'utf8' });
    assert.match(stdout, /Generated 32 variant reports/);
    const output = await readFile(path.join(directory, 'data/v2VariantReports.generated.ts'), 'utf8');
    assert.ok(output.includes('核心。\\n\\n差異。'));
    assert.equal((output.match(/"fullCode":/g) || []).length, 32);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
