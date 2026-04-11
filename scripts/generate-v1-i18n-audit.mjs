import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const obsidianRoot = process.env.KIWIMU_OBSIDIAN_ROOT || '/Users/pensoair/Obsidian-Vaults/Penso-SSOT';
const obsidianPaths = {
  us: path.join(obsidianRoot, '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_US_EN.md'),
  jp: path.join(obsidianRoot, '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_JP.md'),
  jpPart1: path.join(obsidianRoot, '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/jp_part1.md'),
  kr: path.join(obsidianRoot, '07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_KR.md'),
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
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
        i += 1;
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
    Object.fromEntries(header.map((key, index) => [key, row[index] || '']))
  );
}

function cleanMarkdownCell(value) {
  return value
    .replace(/<br>/g, ' / ')
    .replace(/\*\(Memo:[^)]+\)\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\s*\/\s*$/, '')
    .trim();
}

function extractNoteRow(notePath, mbtiCode) {
  const text = fs.readFileSync(notePath, 'utf8');
  const line = text
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`| ${mbtiCode} `) && candidate.includes('| A (Assertive) |'));

  if (!line) {
    return null;
  }

  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());

  return {
    title: cleanMarkdownCell(cells[3] || ''),
    quote: cleanMarkdownCell(cells[5] || ''),
    soulQuestionCount: (cells[14] || '').split(';').map((item) => item.trim()).filter(Boolean).length,
  };
}

function countSoulQuestions(value) {
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function writeFile(relativePath, content) {
  const targetPath = path.join(repoRoot, relativePath);
  fs.writeFileSync(targetPath, `${content.trimEnd()}\n`, 'utf8');
}

const questionRows = csvToObjects(
  fs.readFileSync(path.join(repoRoot, 'kiwimu_translations_context.csv'), 'utf8')
);
const reportRows = csvToObjects(
  fs.readFileSync(path.join(repoRoot, 'kiwimu_report_i18n.csv'), 'utf8')
);

const reportByMbti = new Map();
for (const row of reportRows) {
  if (!reportByMbti.has(row.MBTI_ID)) {
    reportByMbti.set(row.MBTI_ID, {});
  }
  reportByMbti.get(row.MBTI_ID)[row.Field] = row;
}

const intjRepo = reportByMbti.get('INTJ');
const intjUs = extractNoteRow(obsidianPaths.us, 'INTJ');
const intjJp = extractNoteRow(obsidianPaths.jp, 'INTJ') || extractNoteRow(obsidianPaths.jpPart1, 'INTJ');
const intjKr = extractNoteRow(obsidianPaths.kr, 'INTJ');
const today = new Date().toISOString().slice(0, 10);

const truthAudit = `
# V1 I18N Truth Audit

Generated on ${today} by \`scripts/generate-v1-i18n-audit.mjs\`.

## 結論先講

- 目前線上的 **中文 V1 真實內容**，是 \`constants.ts\` + \`components/ResultLegacyDump.tsx\` 這套 legacy V1。
- 目前線上的 **外語題目**，是 \`i18n/questionsTranslations.ts\`，內容方向大致成立，而且已有文化備註可回查。
- 目前線上的 **外語報告**，不是直接吃 Obsidian 的 2025 V1 原稿，而是走：
  - \`kiwimu_report_i18n.csv\` -> \`i18n/mbtiReportTranslations.ts\`
  - \`i18n/detailsTranslations.ts\`
- 如果你的產品原則是「**不要直譯，要做真正的語境翻譯**」，那現在 repo 的方向本身不算錯，但它已經不是和 Obsidian V1 多語原稿完全同步的單一母本。

## 哪一邊才是 V1 真實母本

### 1. 產品實作上的真實來源

- 中文結果頁：\`constants.ts\` / \`components/ResultLegacyDump.tsx\`
- 外語結果頁：\`i18n/mbtiReportTranslations.ts\` + \`i18n/detailsTranslations.ts\`
- 題目翻譯：\`i18n/questionsTranslations.ts\`

### 2. 內容編輯上的真實來源

- Obsidian 2025 V1 多語原稿才應該被視為編輯母本：
  - \`${obsidianPaths.us}\`
  - \`${obsidianPaths.jp}\`
  - \`${obsidianPaths.jpPart1}\`
  - \`${obsidianPaths.kr}\`

## 真相確認：為什麼現在會覺得「兩邊都像真的」

因為 repo 現在把外語 V1 報告拆成了兩層衍生資料：

1. \`kiwimu_report_i18n.csv\` 只保留 \`title / quote / coreAnalysis / soulQuestions\`
2. \`i18n/detailsTranslations.ts\` 再另外補 \`keywords / strengths / blindSpots / career / relationships\`

Obsidian 原稿則是一整張完整資料表，A/T 變體、摘要、關鍵字、優勢、盲點、職涯、關係、靈魂拷問都在同一份內容母本裡。

## 代表性落差

### INTJ 標題差異

- Obsidian US INTJ-A：\`${intjUs?.title || 'N/A'}\`
- Repo EN INTJ：\`${intjRepo?.Title?.English || 'N/A'}\`
- Obsidian JP INTJ-A：\`${intjJp?.title || 'N/A'}\`
- Repo JA INTJ：\`${intjRepo?.Title?.Japanese || 'N/A'}\`
- Obsidian KR INTJ-A：\`${intjKr?.title || 'N/A'}\`
- Repo KO INTJ：\`${intjRepo?.Title?.Korean || 'N/A'}\`

### INTJ 靈魂拷問數量差異

- Obsidian US INTJ-A：${intjUs?.soulQuestionCount || 0} 題
- Repo EN INTJ：${countSoulQuestions(intjRepo?.SoulQuestions?.English || '')} 題
- Obsidian JP INTJ-A：${intjJp?.soulQuestionCount || 0} 題
- Repo JA INTJ：${countSoulQuestions(intjRepo?.SoulQuestions?.Japanese || '')} 題
- Obsidian KR INTJ-A：${intjKr?.soulQuestionCount || 0} 題
- Repo KO INTJ：${countSoulQuestions(intjRepo?.SoulQuestions?.Korean || '')} 題

這代表目前 repo 外語報告不是單純「翻譯不同」，而是已經出現 **內容濃度與結構層級不同** 的情況。

## V1 題目翻譯狀態

- 目前題目共有 ${questionRows.length} 題。
- 四語都有內容，且 \`kiwimu_translations_context.csv\` 已保留不少「文化語境與中文回推差異」備註。
- 這表示 V1 題目層其實比報告層健康，因為至少已經有一份可供人工審稿的 side-by-side context。

## 建議的 source-of-truth 政策

如果之後要把 V1 四語真的收斂乾淨，建議直接定政策：

1. Obsidian 2025 V1 多語筆記 = 唯一編輯母本
2. repo 的 CSV / TS 檔只做編譯產物，不再手改
3. \`mbtiReportTranslations.ts\` 與 \`detailsTranslations.ts\` 應由同一份母本生成，避免再次漂移
4. V1 中文與外語結果頁至少要共用同一套欄位定義，否則只要改一次文案就會再次分叉

## 本輪輸出

- \`docs/V1_QUESTION_I18N_REVIEW.md\`：40 題四語並排審稿版
- \`docs/V1_REPORT_I18N_REVIEW.md\`：16 型報告標題 / 引言 / 語境邏輯審稿版
`;

const questionReview = `
# V1 Question I18N Review

Generated on ${today} from \`kiwimu_translations_context.csv\`.

> 用途：給中文母語編輯直接檢查 V1 題目四語版本，不需要先懂英文、日文或韓文。

${questionRows
  .map(
    (row) => `
## Q${row.題號} · ${row.維度}

- 中文原句：${row.繁體中文}
- 中文選項 A：${row.繁體中文_選項1}
- 中文選項 B：${row.繁體中文_選項2}
- 英文題目：${row.英文}
- 英文選項 A：${row.英文_選項1}
- 英文選項 B：${row.英文_選項2}
- 日文題目：${row.日文}
- 日文選項 A：${row.日文_選項1}
- 日文選項 B：${row.日文_選項2}
- 韓文題目：${row.韓文}
- 韓文選項 A：${row.韓文_選項1}
- 韓文選項 B：${row.韓文_選項2}
- 語境備註：${row.文化語境與中文回推差異}
`
  )
  .join('\n')}
`;

const reportReview = `
# V1 Report I18N Review

Generated on ${today} from \`kiwimu_report_i18n.csv\`.

> 用途：讓中文母語編輯快速對照各 MBTI 的四語稱號、引言與文化轉譯邏輯。

${[...reportByMbti.entries()]
  .map(([mbti, fields]) => {
    const title = fields.Title || {};
    const quote = fields.Quote || {};
    const soul = fields.SoulQuestions || {};
    const core = fields.CoreAnalysis || {};
    const logic =
      core.Cultural_Context_Translation_Logic ||
      soul.Cultural_Context_Translation_Logic ||
      title.Cultural_Context_Translation_Logic ||
      '未附文化備註';

    return `
## ${mbti}

- 中文標題：${title.Chinese || ''}
- 英文標題：${title.English || ''}
- 日文標題：${title.Japanese || ''}
- 韓文標題：${title.Korean || ''}
- 中文引言：${quote.Chinese || ''}
- 英文引言：${quote.English || ''}
- 日文引言：${quote.Japanese || ''}
- 韓文引言：${quote.Korean || ''}
- 中文靈魂拷問數：${countSoulQuestions(soul.Chinese || '')}
- 英文靈魂拷問數：${countSoulQuestions(soul.English || '')}
- 日文靈魂拷問數：${countSoulQuestions(soul.Japanese || '')}
- 韓文靈魂拷問數：${countSoulQuestions(soul.Korean || '')}
- 語境翻譯邏輯：${logic}
`;
  })
  .join('\n')}
`;

writeFile('docs/V1_I18N_TRUTH_AUDIT.md', truthAudit);
writeFile('docs/V1_QUESTION_I18N_REVIEW.md', questionReview);
writeFile('docs/V1_REPORT_I18N_REVIEW.md', reportReview);

console.log('Generated docs/V1_I18N_TRUTH_AUDIT.md');
console.log('Generated docs/V1_QUESTION_I18N_REVIEW.md');
console.log('Generated docs/V1_REPORT_I18N_REVIEW.md');
