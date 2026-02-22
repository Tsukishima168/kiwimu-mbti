import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'i18n', 'resultTranslations.ts');
let content = fs.readFileSync(file, 'utf8');

const newKeys = {
    zh: `
        // Card UI added keys
        gate_title: '你的 Kiwimu 還有一些話，<br />只想對你說。',
        gate_desc: '登入後解鎖你的完整靈魂檔案，並將這次測驗永久保存。',
        gate_login: '登入 / 註冊解鎖',
        gate_continue: '繼續觀看分析',
        gate_skip: '暫時跳過，繼續觀看',
        dessert_series: '系列：',
        dessert_quad: '象限：',
        drink_recommend: '你的狀態加成飲品推薦',
        drink_a_best: 'A（穩定型）最佳推薦',
        drink_t_best: 'T（敏感型）最佳推薦',
        book_dessert: '預訂專屬靈魂甜點',
        continue_deep: '繼續觀看深度分析',
        deep_analysis_unlock: '解鎖深度分析檔案',
        radar_capability: '能力',
        share_alert: '已複製連結',
        share_title: '我是 {id}-{suffix}，{title}｜Kiwimu MBTI',
        share_text: '我的靈魂甜點是 {dessert}！來看看你的 Kiwimu 檔案吧✨',
`,
    en: `
        // Card UI added keys
        gate_title: 'Kiwimu has a few more words,<br />just for you.',
        gate_desc: 'Log in to unlock your full soul profile and save your result forever.',
        gate_login: 'LOGIN / REGISTER TO UNLOCK',
        gate_continue: 'CONTINUE READING',
        gate_skip: 'SKIP FOR NOW, CONTINUE READING',
        dessert_series: 'Series:',
        dessert_quad: 'Quadrant:',
        drink_recommend: 'Your State-Boosted Drink Recommendation',
        drink_a_best: 'Best for A (Assertive)',
        drink_t_best: 'Best for T (Turbulent)',
        book_dessert: 'BOOK YOUR SOUL DESSERT',
        continue_deep: 'CONTINUE TO DEEP ANALYSIS',
        deep_analysis_unlock: 'Unlock Deep Analysis Profile',
        radar_capability: 'Capability',
        share_alert: 'Link copied to clipboard',
        share_title: 'I am {id}-{suffix}, {title} | Kiwimu MBTI',
        share_text: 'My soul dessert is {dessert}! Check out my Kiwimu profile✨',
`,
    ja: `
        // Card UI added keys
        gate_title: 'Kiwimu からあなたへ、<br />もう少しだけ伝えたいことがあります。',
        gate_desc: 'ログインして完全なソウルプロファイルのロックを解除し、結果を永久に保存しましょう。',
        gate_login: 'ログイン / 登録してロック解除',
        gate_continue: '分析を続ける',
        gate_skip: '今はスキップして分析を見る',
        dessert_series: 'シリーズ：',
        dessert_quad: '象限：',
        drink_recommend: 'あなたの状態に合わせたおすすめドリンク',
        drink_a_best: 'A（自己主張型）に最適',
        drink_t_best: 'T（慎重型）に最適',
        book_dessert: 'ソウルデザートを予約',
        continue_deep: 'ディープ分析を続ける',
        deep_analysis_unlock: 'ディープ分析プロファイルのロック解除',
        radar_capability: '能力',
        share_alert: 'リンクをコピーしました',
        share_title: '私は {id}-{suffix}、{title} です｜Kiwimu MBTI',
        share_text: '私のソウルデザートは {dessert} です！私の Kiwimu プロファイルを見てね✨',
`,
    ko: `
        // Card UI added keys
        gate_title: 'Kiwimu가 당신에게<br />해주고 싶은 말이 조금 더 있어요.',
        gate_desc: '로그인하여 완전한 소울 프로필을 잠금 해제하고 테스트 결과를 영구적으로 저장하세요.',
        gate_login: '로그인 / 가입하여 잠금 해제',
        gate_continue: '분석 계속 보기',
        gate_skip: '일단 건너뛰고 계속 보기',
        dessert_series: '시리즈:',
        dessert_quad: '사분면:',
        drink_recommend: '상태 부스트 음료 추천',
        drink_a_best: 'A(자기주장형)를 위한 베스트',
        drink_t_best: 'T(신중형)를 위한 베스트',
        book_dessert: '소울 디저트 예약하기',
        continue_deep: '심층 분석 계속하기',
        deep_analysis_unlock: '심층 분석 프로필 잠금 해제',
        radar_capability: '능력',
        share_alert: '링크가 복사되었습니다',
        share_title: '나는 {id}-{suffix}, {title} 입니다｜Kiwimu MBTI',
        share_text: '나의 소울 디저트는 {dessert} 입니다! 나의 Kiwimu 프로필을 확인해보세요✨',
`
};

for (const lang of ['zh', 'en', 'ja', 'ko']) {
    // find the end of the block for that language.
    // e.g., "en: {"
    const regex = new RegExp("(" + lang + ": \\{[\\\\s\\\\S]*?)(^    \\},)", "m");
    content = content.replace(regex, "$1" + newKeys[lang] + "$2");
}

fs.writeFileSync(file, content, 'utf8');
console.log('Keys injected successfully.');
