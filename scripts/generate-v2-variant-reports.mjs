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

function parseCurrentState(content) {
  const raw = section(content, '🎯 當前狀態命名');
  const label = firstMatch(raw, /\*\*([^*]+)\*\*/);
  return {
    label: cleanInline(label).replace(/^「/, '').replace(/」$/, '').trim(),
    body: cleanText(raw),
  };
}

function parseStateTruth(content) {
  const heading = /^## 💭 狀態真相[：:]?\s*(.*)$/mu.exec(content);
  const subtitle = cleanInline(heading?.[1] || '');
  const raw = section(content, '💭 狀態真相');
  return {
    subtitle,
    body: cleanText(raw),
  };
}

function parseResonanceArchetype(content) {
  const raw = section(content, '🎭 共鳴原型');
  const items = [];
  const re = /^-\s+\*{0,2}([^*\n]+?)\*{0,2}\s+—\s+([\s\S]*?)(?=\n-\s|\n---|$)/gm;
  let match;
  while ((match = re.exec(raw)) !== null) {
    items.push({
      name: cleanInline(match[1]),
      body: cleanInline(match[2]),
    });
  }
  return items;
}

function parseImportant(content) {
  const match = /> \[!IMPORTANT\]\n> ([\s\S]*?)(?=\n\n---|\n## |$)/m.exec(content);
  return cleanInline(match?.[1] || '');
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
    suppressedSide: cleanText(section(content, '🪞 被壓住的另一面')),
    currentState: parseCurrentState(content),
    stateTruth: parseStateTruth(content),
    career: culture.career,
    relationship: culture.relationship,
    dessert: parseDessert(content),
    abyssal: parseAbyssal(content),
    resonanceArchetype: parseResonanceArchetype(content),
    carry: parseCarry(content),
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
  suppressedSide: string;
  currentState: { label: string; body: string };
  stateTruth: { subtitle: string; body: string };
  career: { title: string; bullets: Array<{ label: string; body: string }> };
  relationship: { title: string; bullets: Array<{ label: string; body: string }> };
  dessert: { name: string; visualLogic: string; pairings: Array<{ label: string; body: string }> };
  abyssal: Array<{ title: string; body: string }>;
  resonanceArchetype: Array<{ name: string; body: string }>;
  carry: string;
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
