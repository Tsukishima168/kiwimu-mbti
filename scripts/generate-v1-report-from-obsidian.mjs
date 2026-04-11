import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const DEFAULT_OBSIDIAN_VAULT_ROOT =
  process.env.PENSO_OBSIDIAN_ROOT || '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';

const SOURCE_FILES = {
  zh: [
    path.join(
      DEFAULT_OBSIDIAN_VAULT_ROOT,
      '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025.md',
    ),
  ],
  en: [
    path.join(
      DEFAULT_OBSIDIAN_VAULT_ROOT,
      '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_US_EN.md',
    ),
  ],
  ja: [
    path.join(
      DEFAULT_OBSIDIAN_VAULT_ROOT,
      '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_JP.md',
    ),
    path.join(
      DEFAULT_OBSIDIAN_VAULT_ROOT,
      '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/jp_part1.md',
    ),
  ],
  ko: [
    path.join(
      DEFAULT_OBSIDIAN_VAULT_ROOT,
      '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_KR.md',
    ),
  ],
};

const OUTPUT_FILE = path.resolve(process.cwd(), 'i18n/v1Report.generated.ts');
const LEGACY_REPORT_CSV = path.resolve(process.cwd(), 'kiwimu_report_i18n.csv');
const LEGACY_DETAILS_TS = path.resolve(process.cwd(), 'i18n/detailsTranslations.ts');
const EXPECTED_ROW_COUNT = 32;
const EXPECTED_CELL_COUNT = 15;

function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function cleanCell(value) {
  return value
    .replace(/\r/g, '')
    .replace(/\*\(Memo:[\s\S]*?\)\*/gu, '')
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function splitList(value) {
  return cleanCell(value)
    .split(/\s*[;；]\s*/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function csvToObjects(csvText) {
  const [header, ...rows] = parseCSV(csvText);
  return rows.map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] || ''])),
  );
}

function loadLegacyFallbacks() {
  const legacyReportRows = csvToObjects(fs.readFileSync(LEGACY_REPORT_CSV, 'utf8'));
  const legacyReports = {};

  for (const row of legacyReportRows) {
    if (!legacyReports[row.MBTI_ID]) {
      legacyReports[row.MBTI_ID] = {};
    }

    if (!legacyReports[row.MBTI_ID].zh) {
      legacyReports[row.MBTI_ID].zh = {};
    }
    if (!legacyReports[row.MBTI_ID].en) {
      legacyReports[row.MBTI_ID].en = {};
    }
    if (!legacyReports[row.MBTI_ID].ja) {
      legacyReports[row.MBTI_ID].ja = {};
    }
    if (!legacyReports[row.MBTI_ID].ko) {
      legacyReports[row.MBTI_ID].ko = {};
    }

    const fieldKey = row.Field;
    legacyReports[row.MBTI_ID].zh[fieldKey] = row.Chinese;
    legacyReports[row.MBTI_ID].en[fieldKey] = row.English;
    legacyReports[row.MBTI_ID].ja[fieldKey] = row.Japanese;
    legacyReports[row.MBTI_ID].ko[fieldKey] = row.Korean;
  }

  const legacyDetailsSource = fs.readFileSync(LEGACY_DETAILS_TS, 'utf8');
  const executable = `${legacyDetailsSource
    .replace(/export type[\s\S]*?\};\n\n/u, '')
    .replace(/export const detailsTranslations[^=]*=\s*/u, 'const detailsTranslations = ')}
module.exports = { detailsTranslations };`;
  const sandbox = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(executable, sandbox);

  return {
    legacyReports,
    legacyDetails: sandbox.module.exports.detailsTranslations,
  };
}

function parseMarkdownRow(line, sourceFile) {
  const cells = line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());

  assert(
    cells.length === EXPECTED_CELL_COUNT,
    `Unexpected table shape (${cells.length}) in ${sourceFile}: ${line}`,
  );

  return {
    mbtiType: cleanCell(cells[0]),
    identity: cleanCell(cells[1]),
    fullCode: cleanCell(cells[2]),
    title: cleanCell(cells[3]),
    summary: cleanCell(cells[4]),
    quote: cleanCell(cells[5]),
    coreAnalysis: cleanCell(cells[6]),
    keywords: splitList(cells[7]),
    strengths: splitList(cells[8]),
    blindSpots: splitList(cells[9]),
    career: {
      style: cleanCell(cells[10]),
      advice: cleanCell(cells[11]),
    },
    relationships: {
      style: cleanCell(cells[12]),
      advice: cleanCell(cells[13]),
    },
    soulQuestions: splitList(cells[14]),
  };
}

function parseLocaleFile(locale, sourceFiles) {
  const rowsByFullCode = {};

  for (const sourceFile of sourceFiles) {
    const markdown = fs.readFileSync(sourceFile, 'utf8');
    const rows = markdown
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^\|\s*[A-Z]{4}\s*\|/u.test(line))
      .map((line) => parseMarkdownRow(line, sourceFile));

    for (const row of rows) {
      assert(
        /^[A-Z]{4}-[AT]$/u.test(row.fullCode),
        `Unexpected full code in ${sourceFile}: ${row.fullCode}`,
      );

      rowsByFullCode[row.fullCode] = { locale, ...row };
    }
  }

  assert(
    Object.keys(rowsByFullCode).length > 0,
    `No report rows found in ${sourceFiles.join(', ')}`,
  );

  return rowsByFullCode;
}

function formatValue(value, indent = 0) {
  const prefix = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    const items = value.map((item) => `${' '.repeat(indent + 2)}${formatValue(item, indent + 2)}`);
    return `[\n${items.join(',\n')}\n${prefix}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(
      ([key, nested]) => `${' '.repeat(indent + 2)}${key}: ${formatValue(nested, indent + 2)}`,
    );

    return `{\n${entries.join(',\n')}\n${prefix}}`;
  }

  return JSON.stringify(value);
}

function main() {
  const { legacyReports, legacyDetails } = loadLegacyFallbacks();
  const merged = {};
  const allFullCodes = Object.keys(parseLocaleFile('zh', SOURCE_FILES.zh)).sort((left, right) =>
    left.localeCompare(right),
  );

  for (const [locale, sourceFile] of Object.entries(SOURCE_FILES)) {
    const localeRows = parseLocaleFile(locale, sourceFile);

    for (const fullCode of allFullCodes) {
      if (localeRows[fullCode]) {
        continue;
      }

      const mbtiType = fullCode.split('-')[0];
      const variant = fullCode.split('-')[1];
      const legacyReport = legacyReports[mbtiType]?.[locale];
      const legacyDetail = legacyDetails[mbtiType]?.[locale];

      if (!legacyReport || !legacyDetail) {
        continue;
      }

      localeRows[fullCode] = {
        locale,
        mbtiType,
        identity: variant,
        fullCode,
        title: cleanCell(legacyReport.Title || ''),
        summary: '',
        quote: cleanCell(legacyReport.Quote || ''),
        coreAnalysis: cleanCell(legacyReport.CoreAnalysis || ''),
        keywords: Array.isArray(legacyDetail.keywords) ? legacyDetail.keywords : [],
        strengths: Array.isArray(legacyDetail.strengths) ? legacyDetail.strengths : [],
        blindSpots: Array.isArray(legacyDetail.blindSpots) ? legacyDetail.blindSpots : [],
        career: {
          style: cleanCell(legacyDetail.career?.style || ''),
          advice: cleanCell(legacyDetail.career?.advice || ''),
        },
        relationships: {
          style: cleanCell(legacyDetail.relationships?.style || ''),
          advice: cleanCell(legacyDetail.relationships?.advice || ''),
        },
        soulQuestions: splitList(legacyReport.SoulQuestions || ''),
      };

      console.warn(
        `[fallback] ${locale.toUpperCase()} ${fullCode} filled from legacy repo copy because Obsidian mother source is incomplete.`,
      );
    }

    for (const [fullCode, row] of Object.entries(localeRows)) {
      if (!merged[fullCode]) {
        merged[fullCode] = {};
      }

      merged[fullCode][locale] = {
        mbtiType: row.mbtiType,
        variant: row.fullCode.split('-')[1],
        title: row.title,
        summary: row.summary,
        quote: row.quote,
        coreAnalysis: row.coreAnalysis,
        keywords: row.keywords,
        strengths: row.strengths,
        blindSpots: row.blindSpots,
        career: row.career,
        relationships: row.relationships,
        soulQuestions: row.soulQuestions,
      };
    }
  }

  assert(
    Object.keys(merged).length === EXPECTED_ROW_COUNT,
    `Expected ${EXPECTED_ROW_COUNT} full report codes, received ${Object.keys(merged).length}`,
  );

  const sortedFullCodes = Object.keys(merged).sort((left, right) => left.localeCompare(right));

  const output = `/* eslint-disable */
// Auto-generated by scripts/generate-v1-report-from-obsidian.mjs

export type V1ReportLocale = 'zh' | 'en' | 'ja' | 'ko';
export type V1ReportVariant = 'A' | 'T';

export interface V1GeneratedReportCopy {
  mbtiType: string;
  variant: V1ReportVariant;
  title: string;
  summary: string;
  quote: string;
  coreAnalysis: string;
  keywords: string[];
  strengths: string[];
  blindSpots: string[];
  career: {
    style: string;
    advice: string;
  };
  relationships: {
    style: string;
    advice: string;
  };
  soulQuestions: string[];
}

export const V1_REPORT_SOURCE_FILES = ${formatValue(SOURCE_FILES, 0)} as const;

export const v1ReportCopy: Record<string, Partial<Record<V1ReportLocale, V1GeneratedReportCopy>>> = {
${sortedFullCodes
  .map((fullCode) => {
    const locales = merged[fullCode];
    const formattedLocales = Object.keys(SOURCE_FILES)
      .map((locale) => {
        const reportCopy = locales[locale];
        assert(reportCopy, `Missing ${locale} copy for ${fullCode}`);
        return `    ${locale}: ${formatValue(reportCopy, 4)}`;
      })
      .join(',\n');

    return `  ${JSON.stringify(fullCode)}: {\n${formattedLocales}\n  }`;
  })
  .join(',\n')}
};
`;

  fs.writeFileSync(OUTPUT_FILE, `${output.trimEnd()}\n`, 'utf8');
  console.log(`Generated ${sortedFullCodes.length} V1 report variants -> ${OUTPUT_FILE}`);
}

main();
