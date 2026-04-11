import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_OBSIDIAN_VAULT_ROOT = process.env.PENSO_OBSIDIAN_ROOT || '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';
const SOURCE_DIR = process.env.V2_TW_DRAFT_DIR || path.join(DEFAULT_OBSIDIAN_VAULT_ROOT, '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_草案庫');
const OUTPUT_FILE = path.resolve(process.cwd(), 'data/v2TaiwanDrafts.generated.ts');

const FAMILY_META = {
  '01_分析家類_Analysts': { key: 'analysts', label: '分析家類 Analysts' },
  '02_外交家類_Diplomats': { key: 'diplomats', label: '外交家類 Diplomats' },
  '03_守護者類_Sentinels': { key: 'sentinels', label: '守護者類 Sentinels' },
  '04_探險家類_Explorers': { key: 'explorers', label: '探險家類 Explorers' },
};

const MARKERS = {
  design: /##\s+.*設計初衷與變動世代觀點.*$/mu,
  professional: /##\s+.*專業深度分析.*$/mu,
  dimension: /##\s+.*維度進化論.*$/mu,
  culture: /##\s+.*生存策略與文化邏輯.*$/mu,
  dessert: /##\s+.*靈魂甜點與心錨.*$/mu,
  abyssal: /##\s+.*靈魂拷問.*$/mu,
  closing: />\s*\[!IMPORTANT\]/mu,
};

function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function listDraftFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listDraftFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('深度報告草案.md')) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function findIndex(content, matcher, fromIndex = 0) {
  if (typeof matcher === 'string') {
    return content.indexOf(matcher, fromIndex);
  }

  const match = content.slice(fromIndex).match(matcher);
  return match && typeof match.index === 'number' ? fromIndex + match.index : -1;
}

function sliceBetween(content, startMatcher, endMatcher) {
  const startIndex = findIndex(content, startMatcher);
  assert(startIndex >= 0, `Missing section start: ${String(startMatcher)}`);

  const endIndex = findIndex(content, endMatcher, startIndex + 1);
  assert(endIndex >= 0, `Missing section end after: ${String(startMatcher)}`);

  return content.slice(startIndex, endIndex).trim();
}

function normalizeBlock(text) {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function collapseInline(text) {
  return normalizeBlock(text).replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function stripQuotePrefix(line) {
  return line.replace(/^>\s?/, '').trim();
}

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n*/u);
  if (!match) {
    return { frontmatter: '', body: markdown };
  }

  return {
    frontmatter: match[1],
    body: markdown.slice(match[0].length),
  };
}

function parseFrontmatter(frontmatter) {
  const data = {};
  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/u);
    if (!match) {
      continue;
    }
    data[match[1]] = match[2].trim();
  }
  return data;
}

function extractCalloutLines(section, tag) {
  const lines = section.split('\n');
  const startIndex = lines.findIndex((line) => line.includes(tag));
  if (startIndex === -1) {
    return [];
  }

  const collected = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      if (collected.length > 0) {
        break;
      }
      continue;
    }

    if (!line.trim().startsWith('>')) {
      break;
    }

    collected.push(stripQuotePrefix(line));
  }

  return collected;
}

function parseSingleCalloutLine(line, labelPattern = /^\*\*(.+?)\*\*[：:]\s*(.+)$/u) {
  const match = line.match(labelPattern);
  if (!match) {
    return { label: '', body: collapseInline(line) };
  }

  return {
    label: collapseInline(match[1]),
    body: collapseInline(match[2]),
  };
}

function parseBoldBullets(block, quoted = false) {
  return block
    .split('\n')
    .map((line) => (quoted ? stripQuotePrefix(line) : line.trim()))
    .filter((line) => line.startsWith('- '))
    .map((line) => {
      const match = line.match(/^-\s+\*\*(.+?)\*\*[：:]\s*(.+)$/u);
      if (!match) {
        return null;
      }

      return {
        label: collapseInline(match[1]),
        body: collapseInline(match[2]),
      };
    })
    .filter(Boolean);
}

function parseSubtypeSection(section) {
  const lines = section.split('\n');
  const subtypes = {};
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    const subtypeMatch = trimmed.trim().match(/^-\s+\*\*([AT])\s+\((.+?)\)\s+-\s+(.+?)\*\*[：:]\s*$/u);
    if (subtypeMatch) {
      currentKey = subtypeMatch[1];
      subtypes[currentKey] = {
        code: subtypeMatch[1],
        tone: collapseInline(subtypeMatch[2]),
        title: collapseInline(subtypeMatch[3]),
        items: [],
      };
      continue;
    }

    if (!currentKey) {
      continue;
    }

    const itemMatch = trimmed.match(/^\s+-\s+\*\*(.+?)\*\*[：:]\s*(.+)$/u);
    if (itemMatch) {
      subtypes[currentKey].items.push({
        label: collapseInline(itemMatch[1]),
        body: collapseInline(itemMatch[2]),
      });
    }
  }

  assert(subtypes.A, 'Missing A subtype');
  assert(subtypes.T, 'Missing T subtype');
  return subtypes;
}

function parseQuestions(section) {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\./u.test(line))
    .map((line) => {
      const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*[：:]\s*(.+)$/u);
      if (!match) {
        return { title: collapseInline(line.replace(/^\d+\.\s+/u, '')), body: '' };
      }

      return {
        title: collapseInline(match[1]),
        body: collapseInline(match[2]),
      };
    });
}

function parseDraft(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = extractFrontmatter(markdown);
  const meta = parseFrontmatter(frontmatter);

  const headerMatch = body.match(/^#\s+(\S+)\s+MBTI V2 深度報告：([A-Z]{4})\s+\((.+)\)$/mu);
  assert(headerMatch, `Missing title header in ${filePath}`);

  const type = headerMatch[2];
  const familyFolder = path.basename(path.dirname(filePath));
  const family = assert(FAMILY_META[familyFolder], `Unknown family folder: ${familyFolder}`);

  const designSection = sliceBetween(body, MARKERS.design, MARKERS.professional);
  const professionalSection = sliceBetween(body, MARKERS.professional, MARKERS.dimension);
  const dimensionSection = sliceBetween(body, MARKERS.dimension, MARKERS.culture);
  const cultureSection = sliceBetween(body, MARKERS.culture, MARKERS.dessert);
  const dessertSection = sliceBetween(body, MARKERS.dessert, MARKERS.abyssal);
  const abyssalSection = sliceBetween(body, MARKERS.abyssal, MARKERS.closing);
  const closingSection = body.slice(findIndex(body, MARKERS.closing)).trim();
  const preamble = body.slice(headerMatch.index, findIndex(body, MARKERS.design)).trim();

  const abstractLine = extractCalloutLines(preamble, '[!ABSTRACT]')[0] || '';
  const designQuote = extractCalloutLines(designSection, '[!QUOTE]').join(' ');
  const dimensionCalloutLines = extractCalloutLines(dimensionSection, '[!TIP]');
  const closingLines = extractCalloutLines(closingSection, '[!IMPORTANT]');
  const dimensionTipMatch = dimensionSection.match(/\[!TIP\]\s+\*\*(.+?)\*\*/u);

  const professionalCoreMatch = professionalSection.match(/###\s+\*\*身份核心[：:]\s*(.+?)\*\*\n([\s\S]*?)\n\n###\s+\*\*A\s*\/\s*T\s+亞型深度對照/um);
  assert(professionalCoreMatch, `Missing professional core in ${filePath}`);

  const careerSplitIndex = findIndex(cultureSection, /###\s+💖\s+感情觀[：:]/u);
  assert(careerSplitIndex >= 0, `Missing relationship section in ${filePath}`);
  const careerSection = cultureSection.slice(0, careerSplitIndex).trim();
  const relationshipSection = cultureSection.slice(careerSplitIndex).trim();

  const dessertNameMatch = dessertSection.match(/\[!NODE\]\s+\*\*(.+?)\*\*/u);
  assert(dessertNameMatch, `Missing dessert node in ${filePath}`);
  const visualLogicLine = extractCalloutLines(dessertSection, '[!NODE]').find((line) => line.includes('視覺邏輯')) || '';

  const report = {
    type,
    familyKey: family.key,
    familyLabel: family.label,
    emoji: headerMatch[1],
    title: collapseInline(headerMatch[3]),
    sourcePath: path.relative(SOURCE_DIR, filePath),
    meta: {
      title: meta.title || '',
      created: meta.created || '',
      category: meta.category || '',
      version: meta.version || '',
    },
    abstract: parseSingleCalloutLine(abstractLine),
    soulQuote: '',
    design: {
      quote: collapseInline(designQuote),
      behaviorLogic: parseBoldBullets(
        designSection.slice(findIndex(designSection, /###\s+\*\*世代影響下的行為邏輯\*\*/u))
      ),
    },
    professional: {
      coreTitle: collapseInline(professionalCoreMatch[1]),
      coreBody: collapseInline(professionalCoreMatch[2]),
      subtypes: parseSubtypeSection(professionalSection),
    },
    dimension: {
      tip: collapseInline(dimensionTipMatch ? dimensionTipMatch[1] : ''),
      bullets: parseBoldBullets(dimensionCalloutLines.join('\n')),
    },
    career: {
      title: collapseInline(assert(careerSection.match(/###\s+💼\s+職涯策略[：:]\s*(.+)$/mu), `Missing career title in ${filePath}`)[1]),
      bullets: parseBoldBullets(careerSection),
    },
    relationship: {
      title: collapseInline(assert(relationshipSection.match(/###\s+💖\s+感情觀[：:]\s*(.+)$/mu), `Missing relationship title in ${filePath}`)[1]),
      bullets: parseBoldBullets(relationshipSection),
    },
    dessert: {
      name: collapseInline(dessertNameMatch[1]),
      visualLogic: parseSingleCalloutLine(stripQuotePrefix(visualLogicLine)).body,
      pairings: parseBoldBullets(extractCalloutLines(dessertSection, '[!NODE]').join('\n')),
    },
    abyssal: parseQuestions(abyssalSection),
    closing: collapseInline(closingLines.join(' ')),
  };

  return report;
}

function buildOutput(reports) {
  const header = [
    '/* eslint-disable */',
    '// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.',
    `// Source: ${SOURCE_DIR}`,
    `// Generated at: ${new Date().toISOString()}`,
    '',
    `export const V2_TW_DRAFT_SOURCE = ${JSON.stringify(SOURCE_DIR)};`,
    '',
    `export const V2_TW_REPORTS = ${JSON.stringify(reports, null, 2)} as const;`,
    '',
    'export type V2TaiwanReportKey = keyof typeof V2_TW_REPORTS;',
    'export type V2TaiwanDraftReport = (typeof V2_TW_REPORTS)[V2TaiwanReportKey];',
    '',
    'export function getV2TaiwanDraft(type: string): V2TaiwanDraftReport | null {',
    '  return type in V2_TW_REPORTS ? V2_TW_REPORTS[type as V2TaiwanReportKey] : null;',
    '}',
    '',
  ];

  return `${header.join('\n')}\n`;
}

function main() {
  assert(fs.existsSync(SOURCE_DIR), `Source directory does not exist: ${SOURCE_DIR}`);
  const draftFiles = listDraftFiles(SOURCE_DIR);
  assert(draftFiles.length === 16, `Expected 16 draft files, received ${draftFiles.length}`);

  const reports = {};
  for (const filePath of draftFiles) {
    const report = parseDraft(filePath);
    reports[report.type] = report;
  }

  fs.writeFileSync(OUTPUT_FILE, buildOutput(reports), 'utf8');
  console.log(`Generated ${Object.keys(reports).length} Taiwan V2 drafts -> ${OUTPUT_FILE}`);
}

main();
