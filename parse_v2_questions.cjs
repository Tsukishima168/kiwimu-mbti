const fs = require('fs');
const path = require('path');

const mdFilePath = path.join(__dirname, '../MBTI_trilingual_zhTW.md');
const tsOutputPath = path.join(__dirname, 'i18n/questionsV2Translations.ts');

const markdown = fs.readFileSync(mdFilePath, 'utf8');

// Parse the simple markdown structure
const questions = [];
let currentIndex = -1;
let currentCategory = '';

const lines = markdown.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## ')) {
        currentCategory = line.substring(3).trim();
    } else if (line.match(/^\d+\./)) {
        currentIndex++;
        questions[currentIndex] = {
            id: currentIndex + 1,
            category: currentCategory,
            us_en: { q: '', a: '', b: '' },
            zh_us: { q: '', a: '', b: '' },
            jp: { q: '', a: '', b: '' },
            zh_jp: { q: '', a: '', b: '' },
            kr: { q: '', a: '', b: '' },
            zh_kr: { q: '', a: '', b: '' }
        };
    } else if (line.startsWith('- US EN:')) {
        const text = line.substring(8).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].us_en = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    } else if (line.startsWith('- 繁中（美式語境）:')) {
        const text = line.substring(11).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].zh_us = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    } else if (line.startsWith('- JP:')) {
        const text = line.substring(5).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].jp = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    } else if (line.startsWith('- 繁中（日本語境）:')) {
        const text = line.substring(11).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].zh_jp = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    } else if (line.startsWith('- KR:')) {
        const text = line.substring(5).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].kr = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    } else if (line.startsWith('- 繁中（韓語境）:')) {
        const text = line.substring(11).trim();
        const aIndex = text.indexOf('A.');
        const bIndex = text.indexOf('B.');
        if (aIndex !== -1 && bIndex !== -1) {
            questions[currentIndex].zh_kr = {
                q: text.substring(0, aIndex).trim(),
                a: text.substring(aIndex + 2, bIndex).trim(),
                b: text.substring(bIndex + 2).trim()
            };
        }
    }
}

// Generate TS output
let tsOutput = `// Auto-generated V2 Questions (Cultural Specific)
import { TranslatableString } from '../types';

export interface QuestionV2 {
  id: number;
  text: TranslatableString;
  options: [
    { text: TranslatableString; value: string },
    { text: TranslatableString; value: string }
  ];
  category: string;
}

export const questionsV2Translations: Record<number, { text: Record<string, string>, options: [Record<string, string>, Record<string, string>] }> = {
`;

questions.forEach((q, i) => {
    if (!q) return;

    // mapping dimension (assuming sequence like EI, SN, TF, JP - needs specific logic based on actual ordering if different)
    // we use category from headers
    const dimMapping = {
        "EI": { a: "E", b: "I" },
        "SN": { a: "S", b: "N" },
        "TF": { a: "T", b: "F" },
        "PJ": { a: "P", b: "J" } // assuming typically P vs J, not J vs P, adjust if needed
    };

    // Default fallback values if category not found
    const valA = dimMapping[q.category]?.a || "A";
    const valB = dimMapping[q.category]?.b || "B";

    tsOutput += `  ${q.id}: {
    text: {
      en: ${JSON.stringify(q.us_en.q)},
      ja: ${JSON.stringify(q.jp.q)},
      ko: ${JSON.stringify(q.kr.q)},
      zh: ${JSON.stringify(q.zh_us.q)}, // default zh to us context or create multiple zh toggles
      zh_us: ${JSON.stringify(q.zh_us.q)},
      zh_jp: ${JSON.stringify(q.zh_jp.q)},
      zh_kr: ${JSON.stringify(q.zh_kr.q)}
    },
    options: [
      {
        en: ${JSON.stringify(q.us_en.a)},
        ja: ${JSON.stringify(q.jp.a)},
        ko: ${JSON.stringify(q.kr.a)},
        zh: ${JSON.stringify(q.zh_us.a)},
        zh_us: ${JSON.stringify(q.zh_us.a)},
        zh_jp: ${JSON.stringify(q.zh_jp.a)},
        zh_kr: ${JSON.stringify(q.zh_kr.a)}
      },
      {
        en: ${JSON.stringify(q.us_en.b)},
        ja: ${JSON.stringify(q.jp.b)},
        ko: ${JSON.stringify(q.kr.b)},
        zh: ${JSON.stringify(q.zh_us.b)},
        zh_us: ${JSON.stringify(q.zh_us.b)},
        zh_jp: ${JSON.stringify(q.zh_jp.b)},
        zh_kr: ${JSON.stringify(q.zh_kr.b)}
      }
    ]
  },\n`;
});

tsOutput += `};
`;

fs.writeFileSync(tsOutputPath, tsOutput);
console.log('Successfully generated questionsV2Translations.ts');
