import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QUESTIONS } from '../constants.js';
import { questionTranslations } from '../i18n/questionsTranslations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to escape CSV fields
const escapeCSV = (str) => {
    if (!str) return '""';
    return '"' + str.replace(/"/g, '""').replace(/\n/g, ' ') + '"';
};

// Add cultural context manually!
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

const headers = ['題號', '維度', '繁體中文', '繁體中文_選項1', '繁體中文_選項2', '英文', '英文_選項1', '英文_選項2', '日文', '日文_選項1', '日文_選項2', '韓文', '韓文_選項1', '韓文_選項2', '文化語境與中文回推差異'];

let csvContent = headers.join(',') + '\n';

QUESTIONS.forEach(q => {
    const id = q.id;
    const zhText = q.text;
    const zhOptA = q.options[0];
    const zhOptB = q.options[1];
    const dim = q.dimensionPair;

    const trans = questionTranslations[id];
    
    // EN
    const enText = trans?.en?.text || '';
    const enOptA = trans?.en?.options[zhOptA.value] || '';
    const enOptB = trans?.en?.options[zhOptB.value] || '';
    
    // JA
    const jaText = trans?.ja?.text || '';
    const jaOptA = trans?.ja?.options[zhOptA.value] || '';
    const jaOptB = trans?.ja?.options[zhOptB.value] || '';
    
    // KO
    const koText = trans?.ko?.text || '';
    const koOptA = trans?.ko?.options[zhOptA.value] || '';
    const koOptB = trans?.ko?.options[zhOptB.value] || '';

    const note = culturalNotes[id] || '直譯，無特殊文化背景差異。';

    const row = [
        id,
        dim,
        escapeCSV(zhText),
        escapeCSV(zhOptA.label),
        escapeCSV(zhOptB.label),
        escapeCSV(enText),
        escapeCSV(enOptA),
        escapeCSV(enOptB),
        escapeCSV(jaText),
        escapeCSV(jaOptA),
        escapeCSV(jaOptB),
        escapeCSV(koText),
        escapeCSV(koOptA),
        escapeCSV(koOptB),
        escapeCSV(note)
    ];

    csvContent += row.join(',') + '\n';
});

fs.writeFileSync(path.join(__dirname, '../kiwimu_translations_context.csv'), csvContent, 'utf-8');
console.log('CSV generated successfully at kiwimu_translations_context.csv');
