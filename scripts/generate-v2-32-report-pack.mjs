import fs from 'node:fs';
import path from 'node:path';

import { getCelebrityArchetypes } from '../data/celebrityData.ts';
import { getRarityData, getRarityLabel, getRarityMessage } from '../data/rarityData.ts';
import { V2_TW_DRAFT_SOURCE, V2_TW_REPORTS } from '../data/v2TaiwanDrafts.generated.ts';

const VARIANT_ORDER = ['A', 'T'];
const FAMILY_ORDER = ['analysts', 'diplomats', 'sentinels', 'explorers'];

const OUTPUT_DIR = path.resolve(process.cwd(), 'docs/v2-variant-reports');
const COMBINED_OUTPUT_FILE = path.resolve(process.cwd(), 'docs/V2_32_VARIANT_REPORT_PACK.md');

function byFamilyThenType(left, right) {
  const familyGap =
    FAMILY_ORDER.indexOf(left.familyKey) - FAMILY_ORDER.indexOf(right.familyKey);

  if (familyGap !== 0) {
    return familyGap;
  }

  return left.type.localeCompare(right.type, 'en');
}

function formatLabeledBullets(items) {
  return items.map((item) => `- **${item.label}**：${item.body}`).join('\n');
}

function getSubtype(report, variant) {
  return report.professional.subtypes[variant];
}

function buildVariantSpecificDimensionBullets(report, variant) {
  const subtype = getSubtype(report, variant);

  return report.dimension.bullets
    .map((item) => {
      if (!item.label.startsWith('A / T')) {
        return item;
      }

      return {
        label: `${variant} / ${subtype.tone} · ${subtype.title}`,
        body: subtype.items
          .map((entry) => `${entry.label}：${entry.body}`)
          .join(' '),
      };
    })
    .map((item) => `- **${item.label}**：${item.body}`)
    .join('\n');
}

function pickDessertPairings(report, variant) {
  const specific = report.dessert.pairings.filter((item) =>
    item.label.includes(`${variant} 型`) ||
    item.label.includes(`${variant}型`) ||
    item.label.startsWith(`${variant} (`),
  );

  return specific.length > 0 ? specific : report.dessert.pairings;
}

function buildRarityBlock(type) {
  const rarity = getRarityData(type);
  if (!rarity) {
    return '_目前本地資料沒有對應的稀有度數據。_';
  }

  return [
    `- **總體比例**：${rarity.totalPopulation}%`,
    `- **稀有度**：${getRarityLabel(rarity.rank)}`,
    `- **男性比例**：${rarity.male}%`,
    `- **女性比例**：${rarity.female}%`,
    `- **Kiwimu 提示語**：${getRarityMessage(rarity.rank)}`,
  ].join('\n');
}

function buildArchetypeBlock(type) {
  const archetypes = getCelebrityArchetypes(type).slice(0, 2);
  if (archetypes.length === 0) {
    return '_目前本地資料沒有對應的共鳴原型。_';
  }

  return archetypes
    .map(
      (archetype) => [
        `### ${archetype.name} / ${archetype.nameEn}`,
        `- **領域**：${archetype.profession}`,
        `- **共鳴特質**：${archetype.resonanceTraits.join(' / ')}`,
        `- **甜點對照**：${archetype.dessertPairing}`,
        `- **對照理由**：${archetype.pairingReason}`,
      ].join('\n'),
    )
    .join('\n\n');
}

function buildReportMarkdown(report, variant) {
  const fullCode = `${report.type}-${variant}`;
  const subtype = getSubtype(report, variant);
  const dessertPairings = pickDessertPairings(report, variant);

  return [
    `# ${fullCode} ${report.title}`,
    '',
    `- **家族**：${report.familyLabel}`,
    `- **變體定位**：${variant} / ${subtype.tone} / ${subtype.title}`,
    `- **來源草案**：${report.sourcePath}`,
    `- **母本目錄**：${V2_TW_DRAFT_SOURCE}`,
    '',
    '## 01. 變動世代定位',
    `**${report.abstract.label}**：${report.abstract.body}`,
    '',
    '## 02. 設計初衷與變動世代觀點',
    report.design.quote,
    '',
    '### 世代影響下的行為邏輯',
    formatLabeledBullets(report.design.behaviorLogic),
    '',
    `## 03. 專業深度分析：${report.professional.coreTitle}`,
    report.professional.coreBody,
    '',
    `### ${variant} 變體主敘事：${subtype.title}`,
    formatLabeledBullets(subtype.items),
    '',
    `## 04. 維度進化論：${report.dimension.tip}`,
    buildVariantSpecificDimensionBullets(report, variant),
    '',
    `## 05. 職涯策略：${report.career.title}`,
    formatLabeledBullets(report.career.bullets),
    '',
    `## 06. 感情觀：${report.relationship.title}`,
    formatLabeledBullets(report.relationship.bullets),
    '',
    '## 07. 稀有度與共鳴原型',
    '### 稀有度',
    buildRarityBlock(report.type),
    '',
    '### 共鳴原型',
    buildArchetypeBlock(report.type),
    '',
    `## 08. 靈魂甜點：${report.dessert.name}`,
    report.dessert.visualLogic,
    '',
    '### 配飲 / 延伸搭配',
    formatLabeledBullets(dessertPairings),
    '',
    '## 09. 靈魂拷問',
    report.abyssal
      .map(
        (question, index) =>
          `${index + 1}. **${question.title}**：${question.body}`,
      )
      .join('\n'),
    '',
    '## 10. 收尾',
    report.closing,
    '',
  ].join('\n');
}

function buildCombinedOutput(entries) {
  const indexLines = entries.map(
    (entry) =>
      `- ${entry.fullCode} · ${entry.title} · ${entry.familyLabel} · ${entry.variantTitle}`,
  );

  return [
    '# Kiwimu V2 32 變體完整報告包',
    '',
    '這份報告包直接依據目前 repo 內的 16 份台灣版 V2 草案展開成 32 份可讀文本。',
    '展開規則是：16 個主類型骨架固定，A/T 變體改寫「身份主敘事、維度中的 Identity 段、以及甜點搭配呈現」。',
    '',
    '> 註：此處的 A/T 為現有 Kiwimu 產品沿用的變體層，實作上對齊 16Personalities-style Identity 語言，不是 Myers-Briggs 官方四維中的第五維。',
    '',
    '## 目錄',
    ...indexLines,
    '',
    '---',
    '',
    ...entries.map((entry) => entry.content.trim()),
    '',
  ].join('\n');
}

function ensureOutputDir() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function main() {
  ensureOutputDir();

  const reports = Object.values(V2_TW_REPORTS).sort(byFamilyThenType);
  const entries = [];

  for (const report of reports) {
    for (const variant of VARIANT_ORDER) {
      const fullCode = `${report.type}-${variant}`;
      const content = buildReportMarkdown(report, variant);
      const subtype = getSubtype(report, variant);

      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${fullCode}.md`),
        content,
        'utf8',
      );

      entries.push({
        fullCode,
        title: report.title,
        familyLabel: report.familyLabel,
        variantTitle: subtype.title,
        content,
      });
    }
  }

  fs.writeFileSync(COMBINED_OUTPUT_FILE, buildCombinedOutput(entries), 'utf8');
  console.log(
    `Generated ${entries.length} V2 variant reports -> ${OUTPUT_DIR} and ${COMBINED_OUTPUT_FILE}`,
  );
}

main();
