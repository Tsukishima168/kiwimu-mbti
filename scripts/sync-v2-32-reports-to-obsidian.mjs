import fs from 'node:fs';
import path from 'node:path';

import { getCelebrityArchetypes } from '../data/celebrityData.ts';
import { getRarityData, getRarityLabel, getRarityMessage } from '../data/rarityData.ts';
import { V2_TW_DRAFT_SOURCE, V2_TW_REPORTS } from '../data/v2TaiwanDrafts.generated.ts';

const DEFAULT_OBSIDIAN_VAULT_ROOT =
  process.env.PENSO_OBSIDIAN_ROOT || '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';

const OUTPUT_ROOT =
  process.env.V2_TW_VARIANT_DIR ||
  path.join(
    DEFAULT_OBSIDIAN_VAULT_ROOT,
    '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_32變體草案庫',
  );

const FAMILY_DIRS = {
  analysts: '01_分析家類_Analysts',
  diplomats: '02_外交家類_Diplomats',
  sentinels: '03_守護者類_Sentinels',
  explorers: '04_探險家類_Explorers',
};

const VARIANTS = ['A', 'T'];

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function formatLabeledBullets(items, indent = '') {
  return items
    .map((item) => `${indent}- **${item.label}**：${item.body}`)
    .join('\n');
}

function getSubtype(report, variant) {
  return report.professional.subtypes[variant];
}

function getVariantDessertPairings(report, variant) {
  const variantSpecific = report.dessert.pairings.filter((item) =>
    item.label.includes(`${variant} 型`) ||
    item.label.includes(`${variant}型`) ||
    item.label.startsWith(`${variant} (`),
  );

  return variantSpecific.length > 0 ? variantSpecific : report.dessert.pairings;
}

function getVariantDimensionBullets(report, variant) {
  const subtype = getSubtype(report, variant);

  return report.dimension.bullets.map((item) => {
    if (!item.label.startsWith('A / T')) {
      return item;
    }

    return {
      label: `${variant} (${subtype.tone})`,
      body: subtype.items
        .map((entry) => `${entry.label}：${entry.body}`)
        .join(' '),
    };
  });
}

function buildRarityBlock(type) {
  const rarity = getRarityData(type);
  if (!rarity) {
    return ['> _目前本地資料沒有對應的稀有度數據。_'];
  }

  return [
    `> - **總體比例**：${rarity.totalPopulation}%`,
    `> - **稀有度**：${getRarityLabel(rarity.rank)}`,
    `> - **男性比例**：${rarity.male}%`,
    `> - **女性比例**：${rarity.female}%`,
    `> - **Kiwimu 提示語**：${getRarityMessage(rarity.rank)}`,
  ];
}

function buildArchetypeBlock(type) {
  const archetypes = getCelebrityArchetypes(type).slice(0, 2);
  if (archetypes.length === 0) {
    return ['> _目前本地資料沒有對應的共鳴原型。_'];
  }

  return archetypes.flatMap((archetype) => [
    `### ${archetype.name} / ${archetype.nameEn}`,
    `- **領域**：${archetype.profession}`,
    `- **共鳴特質**：${archetype.resonanceTraits.join(' / ')}`,
    `- **甜點對照**：${archetype.dessertPairing}`,
    `- **對照理由**：${archetype.pairingReason}`,
    '',
  ]);
}

function buildFrontmatter(report, variant) {
  const fullCode = `${report.type}-${variant}`;

  return [
    '---',
    `title: V2 深度報告草案 - ${fullCode} ${report.title}`,
    `created: ${new Date().toISOString().slice(0, 10)}`,
    'category: report_draft',
    'version: 2026_H2_V2_VARIANTS',
    `type: ${report.type}`,
    `variant: ${variant}`,
    `fullCode: ${fullCode}`,
    `source_base_draft: ${report.sourcePath}`,
    'source_layer: generated_variant_pack',
    `tags: [mbti, v2, draft, ${report.type.toLowerCase()}, ${fullCode.toLowerCase()}, taiwan, variant]`,
    '---',
    '',
  ].join('\n');
}

function buildMarkdown(report, variant) {
  const subtype = getSubtype(report, variant);
  const fullCode = `${report.type}-${variant}`;
  const dimensionBullets = getVariantDimensionBullets(report, variant);
  const dessertPairings = getVariantDessertPairings(report, variant);

  return [
    buildFrontmatter(report, variant),
    `# ${report.emoji} MBTI V2 深度報告：${fullCode} (${report.title})`,
    '',
    '> [!ABSTRACT] 2026 變動世代的定位',
    `> **${report.abstract.label}**：${report.abstract.body}`,
    '',
    '---',
    '',
    '## 🧭 設計初衷與變動世代觀點 (Design Philosophy)',
    '',
    '> [!QUOTE] 自我了解的初衷',
    `> ${report.design.quote}`,
    '',
    '### **世代影響下的行為邏輯**',
    formatLabeledBullets(report.design.behaviorLogic),
    '',
    '---',
    '',
    '## 🧠 專業深度分析 (Professional Insights)',
    '',
    `### **身份核心：${report.professional.coreTitle}**`,
    report.professional.coreBody,
    '',
    `### **${variant} 變體深描 (${subtype.tone})：${subtype.title}**`,
    formatLabeledBullets(subtype.items),
    '',
    '---',
    '',
    '## 🌐 維度進化論 (Dimension Evolution)',
    '',
    `> [!TIP] **${report.dimension.tip}**`,
    ...dimensionBullets.map((item) => `> - **${item.label}**：${item.body}`),
    '',
    '---',
    '',
    '## ⚡️ 生存策略與文化邏輯 (Cultural Context)',
    '',
    `### 💼 職涯策略：${report.career.title}`,
    formatLabeledBullets(report.career.bullets),
    '',
    `### 💖 感情觀：${report.relationship.title}`,
    formatLabeledBullets(report.relationship.bullets),
    '',
    '---',
    '',
    '## 📊 稀有度與共鳴原型 (Frequency & Archetypes)',
    '',
    '> [!INFO] 稀有度',
    ...buildRarityBlock(report.type),
    '',
    ...buildArchetypeBlock(report.type),
    '---',
    '',
    '## 🍰 靈魂甜點與心錨 (Soul Reflection)',
    '',
    `> [!NODE] **${report.dessert.name}**`,
    `> **視覺邏輯**：${report.dessert.visualLogic}`,
    '>',
    ...dessertPairings.map((item) => `> - **${item.label}**：${item.body}`),
    '',
    '---',
    '',
    '## 🕯️ 靈魂拷問 (Abyssal Questions)',
    '',
    ...report.abyssal.map(
      (question, index) =>
        `${index + 1}. **${question.title}**：${question.body}`,
    ),
    '',
    '---',
    '',
    '> [!IMPORTANT]',
    `> ${report.closing}`,
    '',
    '---',
    '',
    '## 編輯備註',
    '',
    `- 這份檔案由 \`scripts/sync-v2-32-reports-to-obsidian.mjs\` 生成`,
    `- 主骨架來源：\`${V2_TW_DRAFT_SOURCE}\` 中的 \`${report.sourcePath}\``,
    '- 這是 variant-specific 母本，可直接在 Obsidian 內細修 A/T 語氣',
    '',
  ].join('\n');
}

function writeReport(report, variant) {
  const familyDir = FAMILY_DIRS[report.familyKey];
  const fullCode = `${report.type}-${variant}`;
  const dir = path.join(OUTPUT_ROOT, familyDir);
  const filePath = path.join(dir, `${fullCode}_深度報告草案.md`);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, buildMarkdown(report, variant), 'utf8');
  return filePath;
}

function main() {
  cleanDir(OUTPUT_ROOT);

  const writtenFiles = [];
  for (const report of Object.values(V2_TW_REPORTS)) {
    for (const variant of VARIANTS) {
      writtenFiles.push(writeReport(report, variant));
    }
  }

  console.log(
    `Synced ${writtenFiles.length} V2 variant drafts -> ${OUTPUT_ROOT}`,
  );
}

main();
