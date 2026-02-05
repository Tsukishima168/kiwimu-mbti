#!/usr/bin/env node
/**
 * 產生 16 種人格 × A/T 的獨立 IG Story 預覽 HTML（共 32 檔）
 * 執行: node dev-previews/generate-all-stories.cjs
 */

const fs = require('fs');
const path = require('path');

const BG_COLORS = { INTJ:'#F3E5F5',INTP:'#F3E5F5',ENTJ:'#F3E5F5',ENTP:'#F3E5F5', INFJ:'#E8F5E9',INFP:'#E8F5E9',ENFJ:'#E8F5E9',ENFP:'#E8F5E9', ISTJ:'#E3F2FD',ISFJ:'#E3F2FD',ESTJ:'#E3F2FD',ESFJ:'#E3F2FD', ISTP:'#FFF3E0',ISFP:'#FFF3E0',ESTP:'#FFF3E0',ESFP:'#FFF3E0' };
const IMAGE_MAP = {
  INTJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTJ_sitgas.png",
  INTP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTP_n89sv2.png",
  ENTJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTJ_jrtdic.png",
  ENTP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTP_iikzmh.png",
  INFJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438024/mbti_INFJ_fvjxy5.png",
  INFP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_INFP_j2qekb.png",
  ENFJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_ENFJ_fdpmlb.png",
  ENFP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ENFP_dcbmdx.png",
  ISTJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ISTJ_m3uc4m.png",
  ISFJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ISFJ_zjjqq6.png",
  ESTJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESTJ_r8crof.png",
  ESFJ:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESFJ_jzjd3v.png",
  ISTP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISTP_ajlimj.png",
  ISFP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISFP_xdgb6x.png",
  ESTP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESTP_rfs53m.png",
  ESFP:"https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESFP_hsuas1.png"
};
const DATA = {
  INTJ:{title:"戰略策劃家",core:"你是天生的架構師。世界對你來說不是隨機的混亂，而是一個可以被拆解、優化和重組的巨大棋盤。你極度看重能力與知識，對權威不屑一顧，除非那個權威能證明他比你聰明。你的孤獨來自於你總是在思考大多數人還沒意識到的未來。",dessert:"北海道經典巴斯克"},
  INTP:{title:"邏輯解構者",core:"你是思想的遊牧民族。你的大腦24小時都在運作，試圖找出萬物背後的原理。你不在乎世俗的成功標準，只在乎思維是否足夠清晰、邏輯是否足夠優美。你常被認為活在自己的世界裡，但那是因為你的世界比現實更有趣。",dessert:"檸檬柚子千層"},
  ENTJ:{title:"天生指揮官",core:"你是天生的領袖。在大腦中，一切事物都被轉化為實現目標的資源。你對低效與混亂有著天然的厭惡，總是渴望在充滿挑戰的環境中建立秩序。你不僅看見森林，你還規劃了整座森林的採伐與重生路徑。",dessert:"奶酒提拉米蘇"},
  ENTP:{title:"智力辯論家",core:"你是思想的魔術師。你熱愛在辯論中尋找真理（或者只是為了好玩）。傳統和規則對你來說只是挑戰的起點。你思維敏捷，能瞬間連結看似無關的事物。你的魅力在於你的不可預測性與無窮的精力。",dessert:"柚子蘋果提拉米蘇"},
  INFJ:{title:"深淵凝視者",core:"你是人類靈魂的解讀者。你擁有一種近乎通靈的直覺，能輕易看穿他人的偽裝與潛在動機。你雖然安靜，但內心燃燒著改變世界的理想之火。你追求深度的連結與意義，對於膚淺的事物感到疲憊。",dessert:"茶香巴斯克"},
  INFP:{title:"治癒系詩人",core:"你是詩人與夢想家。你的內心世界比現實世界更真實、更豐富。你對真實（Authenticity）有著極致的追求，無法忍受虛偽。雖然外表看似柔弱隨和，但一旦觸及你的核心價值觀，你會展現出驚人的頑強。",dessert:"北海道十勝戚風"},
  ENFJ:{title:"光輝導師",core:"你是人群中的恆星。你天生就能感受到他人的情緒需求，並知道如何激勵他們成為更好的自己。你充滿魅力、熱情且富有責任感。你常常為了群體的和諧而忽略了自己的需求，你的快樂來自於看到他人的成長。",dessert:"檸檬蘋果戚風"},
  ENFP:{title:"熱血追夢人",core:"你是自由的靈魂。你對世界充滿了孩子般的好奇心，總能從平凡中發現神奇。你熱愛人、熱愛故事、熱愛一切未知的可能性。你是天生的連結者，能瞬間拉近人與人的距離。你的能量具有傳染性，讓周圍的人都跟著燃燒。",dessert:"草莓莓果千層"},
  ISTJ:{title:"守序捍衛者",core:"你是社會的基石。你誠實、直接、盡忠職守。你相信事實、數據與經過驗證的方法，而不是空泛的理論。你做事井井有條，對細節有著驚人的記憶力。你不喜歡變動，因為那代表著不可控的風險。",dessert:"經典十勝原味千層"},
  ISFJ:{title:"溫柔守護者",core:"你是最溫暖的港灣。你安靜、友善且極具責任感。你總是把別人的需求放在自己之前，默默地記住每個人的喜好與細節。你維護著家庭與團體的和諧，是那種在背後默默支撐一切的力量。",dessert:"經典烤布丁"},
  ESTJ:{title:"鐵血執行長",core:"你是天生的管理者。你重視傳統、秩序與規則，並且擅長組織人事物去達成目標。你講究效率，無法容忍懶散與混亂。你直言不諱，因為你認為誠實比圓滑更重要。你是社會運作的引擎。",dessert:"鹹蛋黃巴斯克"},
  ESFJ:{title:"熱心供給者",core:"你是社交圈的核心。你真心喜歡人，並致力於讓周圍的人感到快樂與被接納。你重視傳統與禮節，是團體中的黏合劑。你對他人的評價很敏感，渴望得到認可與感謝。你的超能力是創造歸屬感。",dessert:"莓果戚風蛋糕"},
  ISTP:{title:"冷靜工匠",core:"你是天生的工程師。你熱愛拆解世界的規律，不論是物理的還是邏輯的。你擁有一種極致的「省力原則」，總能找到最簡潔的路徑去達成目標。你重視效率與實務，對於虛無縹緲的情感喧囂往往保持距離。",dessert:"經典提拉米蘇"},
  ISFP:{title:"自由藝術家",core:"你擁有一種獨特的動態平衡感。既能適應規則，又能看見規則之外的可能性。你的多面性是你最強大的武器。你對自我的認知在不斷流動，拒絕被單一的標籤定義。這讓你具備了極強的心理韌性。",dessert:"抹茶提拉米蘇"},
  ESTP:{title:"極限挑戰者",core:"你是活在當下的實踐者。你討厭抽象理論，喜歡捲起袖子直接幹。你擁有驚人的觀察力，能瞬間讀懂空氣並做出反應。你是天生的冒險家，喜歡遊走在邊緣，並在危機中找到快感與機會。",dessert:"巧克力布朗尼千層"},
  ESFP:{title:"閃耀巨星",core:"你是世界的聚光燈。你熱愛生活、熱愛物質、熱愛與人互動。你有一種讓沈悶氣氛瞬間活躍的魔力。你極度關注美感與感官體驗，認為人生苦短，必須及時行樂。你是最慷慨的朋友，總是樂於分享快樂。",dessert:"綜合水果戚風"}
};

function template(type, variant = 'A') {
  const d = DATA[type];
  const identity = variant === 'A' ? '堅定型' : '動盪型';
  const bg = BG_COLORS[type] || '#F5F5F5';
  const img = IMAGE_MAP[type];
  const firstSentence = d.core.indexOf('。') >= 0 ? d.core.substring(0, d.core.indexOf('。') + 1) : d.core.substring(0, 80) + '…';
  const p1 = d.core.substring(0, Math.min(160, d.core.length)) + (d.core.length > 160 ? '…' : '');
  const p2 = d.core.length > 160 ? d.core.substring(160, Math.min(320, d.core.length)) + (d.core.length > 320 ? '…' : '') : '';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IG Story 預覽 - ${type}-${variant}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700;900&family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a1a; padding: 40px; font-family: 'Noto Serif TC', 'Noto Sans TC', serif; }
    .preview-wrapper { box-shadow: 0 0 0 4px rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; }
    .story-container { width: 360px; height: 640px; background: #FFF; background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.04) 19px, rgba(0,0,0,0.04) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,0,0,0.04) 19px, rgba(0,0,0,0.04) 20px); display: flex; flex-direction: column; overflow: hidden; }
  </style>
</head>
<body>
  <div class="preview-wrapper">
    <div class="story-container">
      <div style="padding: 19px 23px 13px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <p style="font-size: 4px; letter-spacing: 0.5em; font-family: monospace; font-weight: bold; color: #1A1A1A; margin: 0 0 3px 0;">SOUL STORY</p>
          <p style="font-size: 18px; font-weight: 900; font-family: serif; color: #121212; margin: 0; line-height: 0.9; letter-spacing: -0.02em;">KIWIMU-MBTI-LAB</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <span style="font-size: 16px; color: #121212; margin-bottom: 5px;">←</span>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 4px;">
            <div style="width: 9px; height: 9px; background: #121212;"></div>
            <div style="width: 9px; height: 9px; background: #121212;"></div>
            <div style="width: 9px; height: 9px; background: ${bg};"></div>
            <div style="width: 9px; height: 9px; background: ${bg};"></div>
          </div>
          <p style="font-size: 3px; letter-spacing: 0.4em; font-family: monospace; font-weight: bold; color: #757575; margin: 0;">PERSONALITY</p>
        </div>
      </div>
      <div style="width: 100%; height: 193px; display: flex; align-items: center; justify-content: center; background: ${bg}; padding: 13px;">
        <img src="${img}" alt="${type}" style="width: 167px; height: 167px; object-fit: contain;">
      </div>
      <div style="padding: 10px 23px 13px; text-align: center; border-top: 1px solid rgba(0,0,0,0.06);">
        <p style="font-size: 53px; font-weight: 900; font-family: serif; color: #121212; margin: 0; line-height: 0.9; letter-spacing: -0.03em;">${type}-${variant}</p>
        <p style="font-size: 9px; font-family: serif; font-weight: 600; color: #757575; margin: 4px 0 0 0; letter-spacing: 0.2em;">${identity} · ${d.title}</p>
      </div>
      <div style="flex: 1; display: flex; padding: 15px 23px 18px; gap: 23px; min-height: 140px;">
        <div style="flex: 0 0 147px;">
          <p style="font-size: 23px; font-weight: 900; font-family: serif; color: #121212; line-height: 1.2; margin: 0 0 11px 0;">${firstSentence}</p>
          <div style="display: inline-block; padding: 6px 12px; background: #121212; color: #FFF; font-size: 9px; font-family: serif; font-weight: bold; margin-bottom: 8px;">${d.dessert}</div>
          <p style="font-size: 6px; color: #757575; font-family: monospace; letter-spacing: 0.12em; margin: 0;">lab · kiwimu-mbti.vercel.app</p>
        </div>
        <div style="flex: 1; position: relative;">
          <p style="font-size: 5px; letter-spacing: 0.4em; font-family: monospace; color: #757575; margin-bottom: 7px; font-weight: bold;">CORE ESSENCE / 核心本質</p>
          <p style="font-size: 9px; font-family: serif; color: #1A1A1A; line-height: 1.8; margin: 0 0 9px 0;">${p1}</p>
          <p style="font-size: 8px; font-family: serif; color: #757575; line-height: 1.75; margin: 0;">${p2}</p>
          <p style="position: absolute; bottom: 0; right: 0; font-size: 5px; color: #999; font-family: monospace; letter-spacing: 0.12em; margin: 0;">archive by KIWIMU</p>
          <p style="position: absolute; top: 50%; right: 7px; transform: translateY(-50%); font-size: 40px; font-weight: 900; color: rgba(0,0,0,0.03); font-family: serif; margin: 0;">${type}-${variant}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

const TYPES = Object.keys(DATA);
const dir = __dirname;

['A', 'T'].forEach(variant => {
  TYPES.forEach(type => {
    const filename = `ig-story-${type}-${variant}.html`;
    fs.writeFileSync(path.join(dir, filename), template(type, variant), 'utf8');
    console.log('Written:', filename);
  });
});

console.log('\nDone. Total:', TYPES.length * 2, 'files.');
