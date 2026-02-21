const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'kiwimu_report_i18n.csv');
const outPath = path.join(__dirname, 'i18n', 'mbtiReportTranslations.ts');

const csvData = fs.readFileSync(csvPath, 'utf8');

// A simple CSV parser (handle quotes)
function parseCSV(text) {
    let ret = [''], i = 0, p = '', s = true;
    for (let l in text) {
        l = text[l];
        if ('"' === l) {
            s = !s;
            if ('"' === p) {
                ret[i] += '"';
                l = '-';
            } else if (p === '') {
                l = '-';
            }
        } else if (s && ',' === l) l = ret[++i] = '';
        else if (s && '\n' === l) {
            if (ret[i].endsWith('\r')) ret[i] = ret[i].slice(0, -1);
            ret[++i] = '';
        }
        else ret[i] += l;
        p = l;
    }
    return ret;
}

const parsed = parseCSV(csvData);
const rows = [];
let currentRow = [];
for (let i = 0; i < parsed.length; i++) {
    currentRow.push(parsed[i]);
    if (currentRow.length === 7) {
        if (currentRow[0].trim() !== '') {
            rows.push(currentRow);
        }
        currentRow = [];
    }
}

// Convert to TS object
const tsData = {};

let headers = rows[0];

for (let r = 1; r < rows.length; r++) {
    const [mbti, field, zh, en, ja, ko] = rows[r];
    if (!tsData[mbti]) {
        tsData[mbti] = { zh: {}, en: {}, ja: {}, ko: {} };
    }

    const f = field.charAt(0).toLowerCase() + field.slice(1);
    tsData[mbti].zh[f] = zh;
    tsData[mbti].en[f] = en;
    tsData[mbti].ja[f] = ja;
    tsData[mbti].ko[f] = ko;
}

let tsContent = `// Auto-generated from kiwimu_report_i18n.csv\n\n`;
tsContent += `export type MBTIReportTranslation = {\n`;
tsContent += `  title: string;\n`;
tsContent += `  quote: string;\n`;
tsContent += `  coreAnalysis: string;\n`;
tsContent += `  soulQuestions: string;\n`;
tsContent += `};\n\n`;

tsContent += `export const mbtiReportTranslations: Record<string, Record<'zh' | 'en' | 'ja' | 'ko', MBTIReportTranslation>> = {\n`;

for (const mbti in tsData) {
    tsContent += `  ${mbti}: {\n`;
    for (const lang of ['zh', 'en', 'ja', 'ko']) {
        tsContent += `    ${lang}: {\n`;
        for (const field of ['title', 'quote', 'coreAnalysis', 'soulQuestions']) {
            const val = tsData[mbti][lang][field];
            if (val) {
                tsContent += `      ${field}: ${JSON.stringify(val)},\n`;
            }
        }
        tsContent += `    },\n`;
    }
    tsContent += `  },\n`;
}

tsContent += `};\n`;

fs.writeFileSync(outPath, tsContent);
console.log('Generated mbtiReportTranslations.ts successfully!');
