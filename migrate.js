const fs = require('fs');
const path = require('path');

const markdownDir = path.join(process.env.HOME, 'Library/Mobile Documents/iCloud~md~obsidian/Documents/Penso-OS/08_專案工坊/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版');
const constantsPath = path.join(__dirname, 'constants.ts');
const i18nPath = path.join(__dirname, 'i18n/mbtiReportTranslations.ts');

function parseMarkdownTable(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let inTable = false;
    const data = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('| MBTI Code |')) {
            inTable = true;
            i++; // skip separator
            continue;
        }
        if (inTable && !line.startsWith('|')) {
            // Sometimes there are non-table lines, or table ends
            inTable = false;
            continue;
        }
        if (inTable) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length > 15) {
                const mbti = parts[1]; // e.g. INTJ
                const variantIndicator = parts[2]; // e.g. A (Assertive)
                const variant = variantIndicator.includes('A') ? 'A' : 'T';

                // Clean out br & memos from standard text where appropriate
                const cleanMemo = (text) => text.replace(/<br>\*\(Memo:.*?\)\*/g, '').replace(/<br>\\*\(Memo:.*?\\*\)/g, '').trim();

                const title = cleanMemo(parts[4]);
                const quoteStr = cleanMemo(parts[6]);
                const quote = quoteStr.replace(/^"/, '').replace(/"$/, '').trim();
                const coreAnalysis = cleanMemo(parts[7]);
                const keywords = parts[8].split(';').map(s => s.trim());
                const strengths = cleanMemo(parts[9]).split(';').map(s => s.trim());
                const blindSpots = cleanMemo(parts[10]).split(';').map(s => s.trim());
                const careerStyle = cleanMemo(parts[11]);
                const careerAdvice = cleanMemo(parts[12]);
                const romance = cleanMemo(parts[13]);
                const romanceAdvice = cleanMemo(parts[14]);
                const soulQuestions = cleanMemo(parts[15]);

                if (!data[mbti]) data[mbti] = {};
                data[mbti][variant] = {
                    title, quote, coreAnalysis, keywords, strengths, blindSpots,
                    careerStyle, careerAdvice, romance, romanceAdvice, soulQuestions
                };
            }
        }
    }
    return data;
}

const enData = parseMarkdownTable(path.join(markdownDir, '03_64人格報告內容_2025_US_EN.md'));
const jaData = parseMarkdownTable(path.join(markdownDir, '03_64人格報告內容_2025_JP.md'));
const koData = parseMarkdownTable(path.join(markdownDir, '03_64人格報告內容_2025_KR.md'));

console.log("Parsed EN types:", Object.keys(enData).length);
console.log("Parsed JP types:", Object.keys(jaData).length);
console.log("Parsed KR types:", Object.keys(koData).length);

// Extract ZH data from constants.ts is tricky with regex, maybe I can just run it using ts-node or evaluate it safely, or since constants.ts exports things, compile it.
// Actually, it's easier to use a simple TS compilation or regex. Let's write a simple script that compiles constants.ts momentarily or reads it.
