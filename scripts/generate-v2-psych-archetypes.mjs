/**
 * generate-v2-psych-archetypes.mjs
 *
 * Reads the 32 Obsidian variant draft files, extracts the
 * 🧬 心理原型與歷史軌跡 section, and emits:
 *   data/v2PsychArchetypes.generated.ts
 *
 * Run:  node scripts/generate-v2-psych-archetypes.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

// ─── Configuration ────────────────────────────────────────────────────────────

const OBSIDIAN_ROOT =
  process.env.PENSO_OBSIDIAN_ROOT ||
  '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';

const VARIANT_DIR = path.join(
  OBSIDIAN_ROOT,
  '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫',
  '2026_V2_報告_32變體草案庫',
);

const FAMILY_DIRS = {
  analysts:  '01_分析家類_Analysts',
  diplomats: '02_外交家類_Diplomats',
  sentinels: '03_守護者類_Sentinels',
  explorers: '04_探險家類_Explorers',
};

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  'data/v2PsychArchetypes.generated.ts',
);

// ─── Parsing helpers ──────────────────────────────────────────────────────────

/**
 * Extract the raw text of 🧬 section from a variant markdown file.
 * Returns null if section is not found.
 */
function extractArchSection(content) {
  const startRe = /^## 🧬 心理原型與歷史軌跡/m;
  const endRe   = /^## 🎭 共鳴原型/m;

  const startMatch = startRe.exec(content);
  if (!startMatch) return null;

  const endMatch = endRe.exec(content);
  const raw = endMatch
    ? content.slice(startMatch.index, endMatch.index)
    : content.slice(startMatch.index);

  return raw.trim();
}

/**
 * Given the raw 🧬 section text, parse into structured data.
 */
function parseArchSection(raw) {
  const cleanSectionText = (value) =>
    value
      .trim()
      .replace(/\n+---\s*$/u, '')
      .replace(/\n+/g, ' ')
      .trim();

  // ── stateName ──────────────────────────────────────────────────────────────
  const stateNameMatch = /### 這個狀態有個名字\n+([\s\S]+?)(?=\n###|\n---\n|$)/.exec(raw);
  const stateName = stateNameMatch ? cleanSectionText(stateNameMatch[1]) : '';

  // ── figures ────────────────────────────────────────────────────────────────
  const figuresBlockMatch = /### 同類過渡期的歷史原型\n+([\s\S]+?)(?=\n###|\n---\n|$)/.exec(raw);
  const figures = [];

  if (figuresBlockMatch) {
    const figBlock = figuresBlockMatch[1];
    // Each figure: **Name** — body (may span multiple lines until next **…** or end)
    const figRe = /\*\*([^*]+)\*\*\s*[—–-]\s*([\s\S]+?)(?=\n\n\*\*|\n\n###|\n\n---|\s*$)/g;
    let m;
    while ((m = figRe.exec(figBlock)) !== null) {
      figures.push({
        name: m[1].trim(),
        body: cleanSectionText(m[2]),
      });
    }
  }

  // ── rarity ─────────────────────────────────────────────────────────────────
  const rarityMatch = /### 稀缺組合\n+([\s\S]+?)(?=\n###|\n---(?:\n|$)|$)/.exec(raw);
  const rarity = rarityMatch ? cleanSectionText(rarityMatch[1]) : '';

  return { stateName, figures, rarity };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const results = {};
  const missing = [];

  for (const [, familyDir] of Object.entries(FAMILY_DIRS)) {
    const dirPath = path.join(VARIANT_DIR, familyDir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md')).sort();

    for (const file of files) {
      // Extract fullCode from "INTJ-A_深度報告草案.md" → "INTJ-A"
      const fullCode = file.replace(/_深度報告草案\.md$/, '');
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');

      const raw = extractArchSection(content);
      if (!raw) {
        missing.push(fullCode);
        continue;
      }

      const parsed = parseArchSection(raw);
      results[fullCode] = parsed;
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing 🧬 section in: ${missing.join(', ')}`);
  }

  // ── Emit TypeScript ──────────────────────────────────────────────────────
  const entries = Object.entries(results)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, data]) => {
      const figureLines = data.figures
        .map(
          (f) =>
            `      { name: ${JSON.stringify(f.name)}, body: ${JSON.stringify(f.body)} }`,
        )
        .join(',\n');

      return `  ${JSON.stringify(code)}: {
    stateName: ${JSON.stringify(data.stateName)},
    figures: [
${figureLines}
    ],
    rarity: ${JSON.stringify(data.rarity)},
  }`;
    })
    .join(',\n\n');

  const output = `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${VARIANT_DIR}
// Generated at: ${new Date().toISOString()}
// Run:  node scripts/generate-v2-psych-archetypes.mjs

export interface V2PsychFigure {
  /** Display name, e.g. "比爾·蓋茲 Bill Gates" */
  name: string;
  /** One-paragraph description of their transitional state period */
  body: string;
}

export interface V2PsychArchetype {
  /** Psychological state naming paragraph (行為心理學框架句) */
  stateName: string;
  /** 2–3 historical figures in similar transitional states */
  figures: V2PsychFigure[];
  /** Rarity statement for this type+variant combination */
  rarity: string;
}

/** Keyed by full variant code, e.g. "INTJ-A" */
export const V2_PSYCH_ARCHETYPES: Record<string, V2PsychArchetype> = {
${entries}
};

export function getV2PsychArchetype(fullCode: string): V2PsychArchetype | null {
  return V2_PSYCH_ARCHETYPES[fullCode] ?? null;
}
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(
    `✅ Generated ${Object.keys(results).length} entries → ${OUTPUT_FILE}`,
  );
}

main();
