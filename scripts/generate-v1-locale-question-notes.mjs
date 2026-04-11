import fs from 'fs';
import path from 'path';

const repoRoot = '/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com';
const vaultRoot = '/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版';
const constantsPath = path.join(repoRoot, 'constants.ts');
const translationsPath = path.join(repoRoot, 'i18n/questionsTranslations.ts');

const culturalNotes = {
  1: '【中】有無局？【英】Any plans tonight?【日】今から集まらない？【韓】이따가 약속 있어? (日韓語境更強調「相聚」而非抽象的「局」)',
  2: '【英、日、韓】皆將「隨便抓一杯飲料」譯為拿一杯喝的，並強調在角落觀察氣氛的寫實感。',
  8: '【限動】(IG Story) 針對年輕一代的社交媒體使用習慣，【英】post a story、【日】ストーリーに上げたり、【韓】스토리를 올리거나 皆採用各國最道地 Instagram 限時動態說法。',
  13: '【創意料理】(Creative cuisine) 【英】creative cuisine (創新料理)、【日】創作料理 (Sousaku ryouri)、【韓】퓨전 창작 요리 (Fusion creative cuisine)，皆使用在地對於新奇未知餐廳的在地詞彙。',
  17: '【出包】(Messed up) 【英】messed up、【日】仕事に失敗した (工作失敗)、【韓】사고를 쳤습니다 (闖禍了)。英文偏口語，日韓偏嚴重一點的社畜語境。',
  19: '【裁員決策】(Layoff decision) 【日】リストラの決断 (Restructuring，日本常用詞彙)、【韓】구조조정/해고 명단 작성 (結構調整/解僱名單)。反映亞洲企業裁員的委婉說法。',
  23: '【電影橋段戳中眼淚】 【英】tearful reunions、【日】久々の再会 (久別重逢)、【韓】눈물의 재회 (眼淚的再會)。',
  25: '【出國旅行行李】 【英】tick-box list (打勾清單)、【日】チェックリストで再確認 (Checklist 再確認)、【韓】체크리스트로 두 번 이상 확인했다 (用 Checklist 確認兩次以上)。',
  27: '【緊急插隊任務/救火】 【英】fire-fighting (救火)、【日】臨機応変に対応する (臨機應變)、【韓】소방수 역할 (消防水/救火員角色)。',
  35: '【冷掉的梗】(Bad joke) 【英】bad joke、【日】空気を凍らせるような冗談 (讓空氣凍結的玩笑)、【韓】재미없는 농담을 던져 분위기가 싸해졌습니다 (丟了無趣的玩笑讓氣氛變冷)。保留了日韓高度「讀空氣/氣氛」的文化。',
};

const countryConfigs = [
  {
    suffix: 'United_States',
    locale: 'en-US',
    title: '01_測驗題目_2025_United_States',
    countryLabel: 'United States',
    flag: '🇺🇸',
    note: '這份筆記補齊 V1 在 Obsidian 中缺少的美國版題目母本。內容以 [[01_測驗題目_2025]] 為中文基底，並採用 repo 既有的 V1 locale 題目稿作為美國語境版本。',
  },
  {
    suffix: 'Japan',
    locale: 'ja-JP',
    title: '01_測驗題目_2025_Japan',
    countryLabel: 'Japan',
    flag: '🇯🇵',
    note: '這份筆記補齊 V1 在 Obsidian 中缺少的日本版題目母本。內容以 [[01_測驗題目_2025]] 為中文基底，並採用 repo 既有的 V1 locale 題目稿作為日本語境版本。',
  },
  {
    suffix: 'South_Korea',
    locale: 'ko-KR',
    title: '01_測驗題目_2025_South_Korea',
    countryLabel: 'South Korea',
    flag: '🇰🇷',
    note: '這份筆記補齊 V1 在 Obsidian 中缺少的韓國版題目母本。內容以 [[01_測驗題目_2025]] 為中文基底，並採用 repo 既有的 V1 locale 題目稿作為韓國語境版本。',
  },
];

const extractAssignedLiteral = (source, marker) => {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Unable to find marker: ${marker}`);
  }

  const equalsIndex = source.indexOf('=', markerIndex);
  if (equalsIndex === -1) {
    throw new Error(`Unable to find assignment for: ${marker}`);
  }

  let start = equalsIndex + 1;
  while (/\s/.test(source[start])) {
    start += 1;
  }

  const openChar = source[start];
  const closeChar = openChar === '[' ? ']' : '}';
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    const prev = source[i - 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (char === '/' && next === '/') {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        continue;
      }
    }

    if (char === "'" && !inDouble && !inTemplate && prev !== '\\') {
      inSingle = !inSingle;
      continue;
    }

    if (char === '"' && !inSingle && !inTemplate && prev !== '\\') {
      inDouble = !inDouble;
      continue;
    }

    if (char === '`' && !inSingle && !inDouble && prev !== '\\') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingle || inDouble || inTemplate) {
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Unable to extract literal for: ${marker}`);
};

const constantsSource = fs.readFileSync(constantsPath, 'utf8');
const translationsSource = fs.readFileSync(translationsPath, 'utf8');
const questionsLiteral = extractAssignedLiteral(constantsSource, 'export const QUESTIONS');
const translationsLiteral = extractAssignedLiteral(translationsSource, 'export const questionTranslations');
const QUESTIONS = Function(`"use strict"; return (${questionsLiteral});`)();
const questionTranslations = Function(`"use strict"; return (${translationsLiteral});`)();

const escapeCell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();

const buildTable = (config) => {
  const header = [
    '| 題號 | 維度 | 在地題目 | 在地選項 A | 在地選項 B | 中文原題 | 語境備註 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  const lines = QUESTIONS.map((question) => {
    const localeContent = questionTranslations[question.id]?.[config.locale.slice(0, 2)];
    const optionAValue = question.options[0].value;
    const optionBValue = question.options[1].value;

    return [
      question.id,
      question.dimensionPair,
      escapeCell(localeContent?.text ?? ''),
      escapeCell(localeContent?.options?.[optionAValue] ?? ''),
      escapeCell(localeContent?.options?.[optionBValue] ?? ''),
      escapeCell(question.text),
      escapeCell(culturalNotes[question.id] ?? '直譯，無特殊文化背景差異。'),
    ].join(' | ');
  }).map((line) => `| ${line} |`);

  return [...header, ...lines].join('\n');
};

const buildNote = (config) => {
  return `---
title: ${config.title}
created: 2026-04-11
category: dataset
version: 2025_v1
locale: ${config.locale}
tags: [mbti, 2025, v1, questions, deep-i18n, ${config.suffix.toLowerCase()}]
---

# ${config.flag} ${config.title}

> [!NOTE]
> ${config.note}
> 這份檔案的用途是讓 V1 四國版本在 Obsidian SSOT 內部也有完整題目層可審稿，不再只存在 repo。

## 使用規則

- 中文原始母本：[[01_測驗題目_2025]]
- 這份檔案是「國別語境版」題目層，不是新的 scoring source
- 若未來要正式回寫 repo，請以這份筆記和中文母本一起校稿

## ${config.countryLabel} 題目表

${buildTable(config)}
`;
};

for (const config of countryConfigs) {
  const targetPath = path.join(vaultRoot, `${config.title}.md`);
  fs.writeFileSync(targetPath, buildNote(config), 'utf8');
  console.log(`Wrote ${targetPath}`);
}
