/**
 * generate-v2-variant-reports.mjs
 *
 * Reads the 32 hand-edited Obsidian V2 variant drafts and emits:
 *   data/v2VariantReports.generated.ts
 *
 * Run: node scripts/generate-v2-variant-reports.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const OBSIDIAN_ROOT =
  process.env.PENSO_OBSIDIAN_ROOT ||
  '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';

const VARIANT_DIR = path.join(
  OBSIDIAN_ROOT,
  '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫',
  '2026_V2_報告_32變體草案庫',
);

const FAMILY_DIRS = {
  analysts: '01_分析家類_Analysts',
  diplomats: '02_外交家類_Diplomats',
  sentinels: '03_守護者類_Sentinels',
  explorers: '04_探險家類_Explorers',
};

const OUTPUT_FILE = path.resolve(process.cwd(), 'data/v2VariantReports.generated.ts');

function cleanText(value = '') {
  return value
    .replace(/\r/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/([\u4e00-\u9fff])\./g, '$1。')
    .replace(/^[>\s]+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanInline(value = '') {
  return cleanText(value).replace(/\n+/g, ' ').trim();
}

function section(content, heading) {
  const lines = content.replace(/\r/g, '').split('\n');
  const startIndex = lines.findIndex((line) => line.startsWith('## ') && line.includes(heading));
  if (startIndex === -1) return '';

  const endIndex = lines.findIndex((line, index) => index > startIndex && line.startsWith('## '));
  return lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex).join('\n').trim();
}

function firstMatch(content, re) {
  return re.exec(content)?.[1]?.trim() || '';
}

function parseFrontmatter(content) {
  const raw = /^---\n([\s\S]*?)\n---/m.exec(content)?.[1] || '';
  const read = (key) => firstMatch(raw, new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return {
    type: read('type'),
    variant: read('variant'),
    fullCode: read('fullCode'),
  };
}

function parseAbstract(content) {
  const raw = firstMatch(content, /> \*\*([^*]+)\*\*：([\s\S]*?)(?=\n\n---|\n## )/m);
  const body = /> \*\*[^*]+\*\*：([\s\S]*?)(?=\n\n---|\n## )/m.exec(content)?.[1] || '';
  return {
    label: cleanInline(raw),
    body: cleanInline(body),
  };
}

function parseSoulQuote(content) {
  return cleanText(section(content, '✨ 靈魂金句').split('\n---')[0] || '')
    .replace(/^「/, '')
    .replace(/」$/, '')
    .trim();
}

function parseLabeledBullets(raw) {
  const items = [];
  const re = /^[->]?\s*-?\s*\*\*([^*]+)\*\*：([\s\S]*?)(?=\n[->]?\s*-?\s*\*\*|$)/gm;
  let match;
  while ((match = re.exec(raw)) !== null) {
    items.push({
      label: cleanInline(match[1]),
      body: cleanInline(match[2]),
    });
  }
  return items;
}

function parsePlainBullets(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
    .map((line) => {
      const match = /^\*\*([^*]+)\*\*(?:\s*\(([^)]+)\))?/.exec(line);
      return {
        label: cleanInline(match?.[1] || line),
        body: cleanInline(line),
      };
    });
}

function parseProfessional(content) {
  const raw = section(content, '🧠 專業深度分析');
  const coreTitle = firstMatch(raw, /### \*\*身份核心：([^*]+)\*\*/);
  const coreBody = firstMatch(raw, /### \*\*身份核心：[^*]+\*\*\n+([\s\S]*?)(?=\n### )/);
  const subtypeHeading = /### \*\*((?:A|T) 變體深描[^：]*|(?:A|T) 版[^：]*)：([^*]+)\*\*/.exec(raw);
  const subtypeItemsRaw = subtypeHeading ? raw.slice(subtypeHeading.index + subtypeHeading[0].length) : '';

  return {
    coreTitle: cleanInline(coreTitle),
    coreBody: cleanInline(coreBody),
    subtypeTitle: cleanInline(subtypeHeading?.[2] || ''),
    subtypeLabel: cleanInline(subtypeHeading?.[1] || ''),
    subtypeItems: parseLabeledBullets(subtypeItemsRaw),
  };
}

function parseContemporary(content) {
  const raw = section(content, '🧭 當代位置');
  const quote = firstMatch(raw, /> \[!QUOTE\][^\n]*\n([\s\S]*?)(?=\n###|\n---|$)/);
  const behaviorRaw = firstMatch(raw, /### \*\*世代影響下的行為邏輯\*\*\n([\s\S]*)/);

  return {
    quote: cleanInline(quote),
    behaviorLogic: parseLabeledBullets(behaviorRaw),
  };
}

function parseDimension(content) {
  const raw = section(content, '🌐 維度進化論');
  const tip = firstMatch(raw, /> \[!TIP\] \*\*([^*]+)\*\*/);
  const beforeSpectrum = raw.split(/### 📊/)[0] || raw;

  return {
    tip: cleanInline(tip),
    bullets: parseLabeledBullets(beforeSpectrum),
  };
}

function parseCulture(content) {
  const raw = section(content, '⚡️ 生存策略與文化邏輯');
  const careerTitle = firstMatch(raw, /### 💼 職涯策略：([^\n]+)/);
  const careerRaw = firstMatch(raw, /### 💼 職涯策略：[^\n]+\n([\s\S]*?)(?=\n### 💖|$)/);
  const relationshipTitle = firstMatch(raw, /### 💖 感情觀：([^\n]+)/);
  const relationshipRaw = firstMatch(raw, /### 💖 感情觀：[^\n]+\n([\s\S]*)/);

  return {
    career: {
      title: cleanInline(careerTitle),
      bullets: parseLabeledBullets(careerRaw),
    },
    relationship: {
      title: cleanInline(relationshipTitle),
      bullets: parseLabeledBullets(relationshipRaw),
    },
  };
}

function parseDessert(content) {
  const raw = section(content, '🍰 靈魂甜點');
  const name = firstMatch(raw, /> \[!NODE\] \*\*([^*]+)\*\*/);
  const visualLogic = firstMatch(raw, /> \*\*視覺邏輯\*\*：([\s\S]*?)(?=\n>|$)/);

  return {
    name: cleanInline(name),
    visualLogic: cleanInline(visualLogic),
    pairings: parseLabeledBullets(raw).filter((item) => item.label !== '視覺邏輯'),
  };
}

function parseAbyssal(content) {
  const raw = section(content, '🕯️ 靈魂拷問');
  const items = [];
  const re = /^\d+\.\s+\*\*([^*]+)\*\*：([\s\S]*?)(?=\n\d+\.|\n---|$)/gm;
  let match;
  while ((match = re.exec(raw)) !== null) {
    items.push({
      title: cleanInline(match[1]),
      body: cleanInline(match[2]),
    });
  }
  return items;
}

function parseCarry(content) {
  return cleanText((section(content, '帶走這個').split('\n---')[0] || '').replace(/\[!IMPORTANT\][\s\S]*$/u, ''));
}

function parseImportant(content) {
  const match = /> \[!IMPORTANT\]\n> ([\s\S]*?)(?=\n\n---|\n## |$)/m.exec(content);
  return cleanInline(match?.[1] || '');
}


/**
 * 「當前狀態命名」＋「狀態真相」——V2 的狀態層。
 *
 * 依 SSOT `00_V2_狀態導向升級補充_2026-04.md`：V2 不是更長的 MBTI 報告，
 * 而是一份狀態報告；MBTI 降成入口座標，主標不該停在「你是 INTJ」。
 * 這兩節 32 篇草案都寫好了，先前沒被撈進來，前台因此退回兩句寫死的字串。
 *
 * 狀態名的格式是「主狀態 / 型別化說法」，例如「低頻穩定期 / 過度控制期」。
 * 主狀態可跨型別聚類（九宮格用），後半是該型別的表現方式。
 */
function parseState(content) {
  const naming = section(content, '當前狀態命名');
  const truth = section(content, '狀態真相');
  if (!naming && !truth) return null;

  // 草案有兩種寫法：整段引用，或「引用一行 + 純段落說明」
  const stripQuote = (text) =>
    text
      .split('\n')
      .map((line) => line.replace(/^>\s?/, ''))
      .join('\n');

  const body = stripQuote(naming);
  const bold = /\*\*[「『]?([^*」』]+)[」』]?\*\*/.exec(body)?.[1]?.trim() || '';
  // 草案半形／全形斜線都有人用
  const [primary, secondary] = bold.split(/\s*[\/／]\s*/).map((part) => part.trim());

  // 名稱那一行之後的內容 = 定調段（「這不是你永遠的樣子……」）
  const lines = body.split('\n');
  const nameLineIndex = lines.findIndex((line) => line.includes(bold) && bold);
  const framing = cleanText(
    lines
      .slice(nameLineIndex === -1 ? 0 : nameLineIndex + 1)
      .join('\n')
      .replace(/^---$/gm, ''),
  );

  return {
    name: bold,
    primary: primary || bold,
    secondary: secondary || '',
    framing,
    truth: cleanText(stripQuote(truth).replace(/^---$/gm, '')),
  };
}

function parseVariantFile(filePath, familyKey) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const h1 = firstMatch(content, /^# .+?：([A-Z]{4}-[AT]) \(([^)]+)\)/m);
  const h1Title = /^# .+?：[A-Z]{4}-[AT] \(([^)]+)\)/m.exec(content)?.[1] || '';
  const contemporary = parseContemporary(content);
  const professional = parseProfessional(content);
  const culture = parseCulture(content);

  return {
    ...frontmatter,
    familyKey,
    title: cleanInline(h1Title || h1),
    sourcePath: filePath.replace(`${VARIANT_DIR}/`, ''),
    abstract: parseAbstract(content),
    soulQuote: parseSoulQuote(content),
    design: contemporary,
    professional,
    tags: parsePlainBullets(section(content, '🏷️ 關鍵標籤牆')),
    dimension: parseDimension(content),
    state: parseState(content),
    suppressedSide: cleanText(section(content, '🪞 被壓住的另一面')),
    career: culture.career,
    relationship: culture.relationship,
    dessert: parseDessert(content),
    abyssal: parseAbyssal(content),
    carry: parseCarry(content),
    practices: parseLabeledBullets(section(content, '可以試的小練習')),
    important: parseImportant(content),
  };
}

function main() {
  const results = {};

  for (const [familyKey, familyDir] of Object.entries(FAMILY_DIRS)) {
    const dirPath = path.join(VARIANT_DIR, familyDir);
    const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.md')).sort();

    for (const file of files) {
      const parsed = parseVariantFile(path.join(dirPath, file), familyKey);
      if (!parsed.fullCode) {
        console.warn(`Missing fullCode in ${file}`);
        continue;
      }
      results[parsed.fullCode] = parsed;
    }
  }

  const entries = Object.entries(results)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, data]) => `  ${JSON.stringify(code)}: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}`)
    .join(',\n\n');

  const output = `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${VARIANT_DIR}
// Generated at: ${new Date().toISOString()}
// Run: node scripts/generate-v2-variant-reports.mjs

export type V2VariantReport = {
  type: string;
  variant: 'A' | 'T';
  fullCode: string;
  familyKey: string;
  title: string;
  sourcePath: string;
  abstract: { label: string; body: string };
  soulQuote: string;
  design: { quote: string; behaviorLogic: Array<{ label: string; body: string }> };
  professional: {
    coreTitle: string;
    coreBody: string;
    subtypeTitle: string;
    subtypeLabel: string;
    subtypeItems: Array<{ label: string; body: string }>;
  };
  tags: Array<{ label: string; body: string }>;
  dimension: { tip: string; bullets: Array<{ label: string; body: string }> };
  /** 狀態層：來自草案的「當前狀態命名」與「狀態真相」 */
  state: {
    /** 完整狀態名，例如「低頻穩定期 / 過度控制期」 */
    name: string;
    /** 主狀態（可跨型別聚類） */
    primary: string;
    /** 該型別的表現方式 */
    secondary: string;
    /** 定調段：這不是你永遠的樣子 */
    framing: string;
    /** 你現在主要靠什麼活著 */
    truth: string;
  } | null;
  suppressedSide: string;
  career: { title: string; bullets: Array<{ label: string; body: string }> };
  relationship: { title: string; bullets: Array<{ label: string; body: string }> };
  dessert: { name: string; visualLogic: string; pairings: Array<{ label: string; body: string }> };
  abyssal: Array<{ title: string; body: string }>;
  carry: string;
  practices: Array<{ label: string; body: string }>;
  important: string;
};

export const V2_VARIANT_REPORTS: Record<string, V2VariantReport> = {
${entries}
};

export function getV2VariantReport(fullCode: string): V2VariantReport | null {
  return V2_VARIANT_REPORTS[fullCode] ?? null;
}
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✅ Generated ${Object.keys(results).length} variant reports -> ${OUTPUT_FILE}`);
}

main();
