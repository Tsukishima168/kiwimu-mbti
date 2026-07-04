
import { Question, MbtiResultData } from './types';

export const QUESTIONS: Question[] = [
  // --- E vs I ---
  {
    id: 1,
    text: "一週忙到爆，週五晚上你好不容易關上店門／下班回到家。此刻你最想做的是：",
    imageUrl: "https://picsum.photos/seed/friday_night_vibe/800/400",
    dimensionPair: 'EI',
    weight: 2,
    options: [
      { label: "打開手機看朋友在哪裡，想問一句：「等等有沒有局？」", value: 'E' },
      { label: "把手機丟遠一點，泡個熱飲，誰傳訊息都先放著，想安靜一個人待著。", value: 'I' }
    ]
  },
  {
    id: 2,
    text: "你被朋友臨時拉去一場幾乎全是陌生人的聚會／商務酒會，前 10 分鐘你的狀態通常是：",
    imageUrl: "https://picsum.photos/seed/cocktail_party_blur/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "先隨便抓一杯飲料，開始在場內繞一圈，找人搭話、認識新朋友。", value: 'E' },
      { label: "找到角落、牆邊或吧台的位置，先觀察氣氛，看看有沒有看起來聊得來的人。", value: 'I' }
    ]
  },
  {
    id: 3,
    text: "當你腦中有一個還不成熟的想法時，你比較習慣：",
    imageUrl: "https://picsum.photos/seed/lightbulb_sketch/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "先說出來跟別人討論，在講的過程中慢慢長出完整的想法。", value: 'E' },
      { label: "先自己在腦中演練好幾輪，覺得差不多了才找人分享。", value: 'I' }
    ]
  },
  {
    id: 4,
    text: "手機突然響起，是一通未知來電，你的第一反應是：",
    imageUrl: "https://picsum.photos/seed/phone_ringing_dark/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "有點好奇是什麼事，反正接起來再說。", value: 'E' },
      { label: "先皺一下眉，會猶豫要不要接，甚至讓它響完再回撥。", value: 'I' }
    ]
  },
  {
    id: 5,
    text: "在一場團隊腦力激盪會議中，主持人說：「有想法就直接講！」你會：",
    imageUrl: "https://picsum.photos/seed/meeting_room_abstract/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "先丟幾個點子出來，不怕還不成熟，覺得先有東西再調整就好。", value: 'E' },
      { label: "先聽大家的想法，等自己腦中整理成一個比較完整的說法再開口。", value: 'I' }
    ]
  },
  {
    id: 6,
    text: "對你來說，「朋友」比較像是：",
    imageUrl: "https://picsum.photos/seed/friends_laughing/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "很多不同圈子的人，平常隨時都有人可以約、可以聊天。", value: 'E' },
      { label: "少數幾個非常熟的人，真正會說心事的其實只有那幾位。", value: 'I' }
    ]
  },
  {
    id: 7,
    text: "假設今天你整天都被關在家裡，沒有行程、也不能出門，你覺得：",
    imageUrl: "https://picsum.photos/seed/window_rain/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "有點快被悶壞了，會想主動開視訊、語音，找人講話。", value: 'E' },
      { label: "反而覺得難得清靜，終於可以專心做自己的事情，不被打擾。", value: 'I' }
    ]
  },
  {
    id: 8,
    text: "當你發生一件很值得開心的事（升遷、投標中、作品得獎、暗戀的人回訊息）時，你會：",
    imageUrl: "https://picsum.photos/seed/sparkles_joy/800/400",
    dimensionPair: 'EI',
    options: [
      { label: "立刻截圖、發限動或打給朋友，想跟一堆人分享這個好消息。", value: 'E' },
      { label: "先在心裡偷笑，可能只會跟一兩個最親近的人說。", value: 'I' }
    ]
  },

  // --- S vs N ---
  {
    id: 9,
    text: "你站在窗邊，看著一片安靜的樹林／山景照片，你腦中首先浮現的是：",
    imageUrl: "https://picsum.photos/seed/forest_mist/800/400",
    dimensionPair: 'SN',
    weight: 2,
    options: [
      { label: "風有多冷、樹葉什麼顏色、空氣大概聞起來是潮濕還是乾燥。", value: 'S' },
      { label: "這裡像一個故事的開頭，讓我聯想到「如果我走進去，會發生什麼事」。", value: 'N' }
    ]
  },
  {
    id: 10,
    text: "別人跟你描述一件事情時，你會更自然地追問：",
    imageUrl: "https://picsum.photos/seed/conversation_cafe/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "「所以是幾點？在哪裡？後來具體發生什麼？」", value: 'S' },
      { label: "「為什麼會這樣？你覺得這背後代表什麼？之後可能會怎麼發展？」", value: 'N' }
    ]
  },
  {
    id: 11,
    text: "學一個全新的工具或軟體時，你通常的流程是：",
    imageUrl: "https://picsum.photos/seed/laptop_hands/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "先看教學或操作說明，一步步照做，確認功能再延伸。", value: 'S' },
      { label: "直接打開開始亂點，邊玩邊猜它的邏輯是什麼。", value: 'N' }
    ]
  },
  {
    id: 12,
    text: "如果我問你：「你對 5 年後的自己有畫面嗎？」你比較會說：",
    imageUrl: "https://picsum.photos/seed/foggy_road/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "先把眼前的事做好再說，未來是現在累積出來的。", value: 'S' },
      { label: "有一堆版本在腦中上演，會想像不同城市、不同工作、不同生活方式。", value: 'N' }
    ]
  },
  {
    id: 13,
    text: "和朋友去一間主打「創意料理」的新餐廳，菜單上全是沒見過的菜，你會：",
    imageUrl: "https://picsum.photos/seed/weird_food/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "保守地選看起來最安全、最接近熟悉味道的那幾道。", value: 'S' },
      { label: "想點名字最怪或最特別的菜，就算踩雷也覺得是一次好玩的經驗。", value: 'N' }
    ]
  },
  {
    id: 14,
    text: "如果要你寫一篇文章，你會比較有把握的是：",
    imageUrl: "https://picsum.photos/seed/typewriter_vintage/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "記錄一段真實發生的事情，用細節把畫面講清楚。", value: 'S' },
      { label: "虛構一個世界，寫一個帶有隱喻、象徵或奇幻元素的故事。", value: 'N' }
    ]
  },
  {
    id: 15,
    text: "當你在做選擇時，你比較會相信：",
    imageUrl: "https://picsum.photos/seed/crossroads/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "已經看得見的事實、數字、過去的經驗。", value: 'S' },
      { label: "一種「說不出來但就是覺得對／不對」的直覺。", value: 'N' }
    ]
  },
  {
    id: 16,
    text: "對你來說，「發呆／做白日夢」的頻率比較像：",
    imageUrl: "https://picsum.photos/seed/clouds_sky/800/400",
    dimensionPair: 'SN',
    options: [
      { label: "很少，我腦中大部分時間都在轉待辦事項、現實問題。", value: 'S' },
      { label: "很常，腦中會自己演小劇場、幻想不同的可能發展。", value: 'N' }
    ]
  },

  // --- T vs F ---
  {
    id: 17,
    text: "朋友因為自己的失誤導致工作出包，約你出來喝東西，一坐下就開始哭，你第一個反應會放在哪裡？",
    imageUrl: "https://picsum.photos/seed/crying_shoulder/800/400",
    dimensionPair: 'TF',
    weight: 2,
    options: [
      { label: "先聽完細節，開始一起分析問題在哪，下次可以怎麼調整。", value: 'T' },
      { label: "先陪他把情緒穩住，跟他說「你一定難受吧」，讓他覺得被理解。", value: 'F' }
    ]
  },
  {
    id: 18,
    text: "在做重要決策時，你心裡的優先排序比較是：",
    imageUrl: "https://picsum.photos/seed/justice_scales/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "這樣做合不合理？對事情本身是不是最公平、最有效率？", value: 'T' },
      { label: "這樣做會不會傷到誰？大家感受怎麼樣、關係會不會變尷尬？", value: 'F' }
    ]
  },
  {
    id: 19,
    text: "如果你被迫要參與一場「裁員決策」，你更傾向：",
    imageUrl: "https://picsum.photos/seed/empty_office_chair/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "以客觀績效、貢獻度、未來發展性來排序。", value: 'T' },
      { label: "儘量保護家庭壓力大、年資久或對公司特別有情感連結的人。", value: 'F' }
    ]
  },
  {
    id: 20,
    text: "你更希望別人私下形容你是：",
    imageUrl: "https://picsum.photos/seed/handshake_respect/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "「這個人很有判斷力，做事很專業、很有能力。」", value: 'T' },
      { label: "「這個人很好相處，跟他在一起很安心、很溫暖。」", value: 'F' }
    ]
  },
  {
    id: 21,
    text: "和人爭論一件事情，雙方都各有立場時，你心裡更放不下的是：",
    imageUrl: "https://picsum.photos/seed/argument_silhouette/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "明明我的論點比較有邏輯，卻被情緒帶著走，很不舒服。", value: 'T' },
      { label: "即使我有道理，也不想撕破臉，如果硬講贏了會覺得心裡不舒服。", value: 'F' }
    ]
  },
  {
    id: 22,
    text: "對你來說，「有用的批評」應該長什麼樣：",
    imageUrl: "https://picsum.photos/seed/red_pen_correction/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "直接點出問題、給出具體改進方向，不用太顧慮我的感受。", value: 'T' },
      { label: "先肯定優點，再提出建議，讓我覺得是在幫我、不是否定我。", value: 'F' }
    ]
  },
  {
    id: 23,
    text: "在電影或影集裡，最容易戳中你眼淚的橋段是：",
    imageUrl: "https://picsum.photos/seed/movie_theater_dark/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "角色在極端困境下做出一個很有力量的選擇或犧牲，整個設計很有邏輯。", value: 'T' },
      { label: "家人擁抱、久別重逢、有人為了愛或友情做出溫柔的舉動。", value: 'F' }
    ]
  },
  {
    id: 24,
    text: "遇到一個完全不講理的人，你的內在自動模式比較是：",
    imageUrl: "https://picsum.photos/seed/angry_storm/800/400",
    dimensionPair: 'TF',
    options: [
      { label: "想用冷靜的邏輯拆解對方矛盾的地方，讓他無話可說。", value: 'T' },
      { label: "會先情緒上受傷或生氣，很難在當下冷靜地說出漂亮的反擊。", value: 'F' }
    ]
  },

  // --- J vs P ---
  {
    id: 25,
    text: "出國旅行前一晚，你的行李通常長什麼樣？",
    imageUrl: "https://picsum.photos/seed/suitcase_open/800/400",
    dimensionPair: 'JP',
    weight: 2,
    options: [
      { label: "幾天前就差不多收好了，還有打勾清單確認一遍。", value: 'J' },
      { label: "地上還攤著半開的行李箱，邊想邊塞，有些東西到出門前一刻才丟進去。", value: 'P' }
    ]
  },
  {
    id: 26,
    text: "對於週末，你比較喜歡：",
    imageUrl: "https://picsum.photos/seed/calendar_planner/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "提前排好行程：幾點起床、去哪裡、要吃什麼，大致有個計畫。", value: 'J' },
      { label: "當天早上再看心情，覺得想出門就出門，想賴床就賴床。", value: 'P' }
    ]
  },
  {
    id: 27,
    text: "工作時突然被丟進一個「緊急插隊任務」，你多半會：",
    imageUrl: "https://picsum.photos/seed/fire_alarm_concept/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "覺得被打亂節奏，有壓力但會硬把它插進原本的排程。", value: 'J' },
      { label: "有點被刺激到，反而覺得這種臨時救火比照表做事更有感。", value: 'P' }
    ]
  },
  {
    id: 28,
    text: "你的電腦桌面或雲端資料夾大概是：",
    imageUrl: "https://picsum.photos/seed/organized_chaos_desk/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "依專案、日期 or 類型清楚分類，好一陣子才會亂。", value: 'J' },
      { label: "一堆檔案、截圖散在桌面上，但你大致知道自己常用的東西在哪。", value: 'P' }
    ]
  },
  {
    id: 29,
    text: "面對一個還沒決定的選項，你的感受比較像：",
    imageUrl: "https://picsum.photos/seed/pendulum_swing/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "懸著不決會讓我焦慮，寧願快點拍板結果再調整。", value: 'J' },
      { label: "能多留幾個選項就多留幾個，不到最後一刻不想把話說死。", value: 'P' }
    ]
  },
  {
    id: 30,
    text: "談到「規則」，你心裡比較貼近哪一句：",
    imageUrl: "https://picsum.photos/seed/traffic_lights/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "有一定的規則和流程，大家比較知道怎麼配合，效率才會出來。", value: 'J' },
      { label: "規則可以當參考，但遇到特殊情況時，彈性跟創意比較重要。", value: 'P' }
    ]
  },
  {
    id: 31,
    text: "完成一個專案後，如果只能選一個讓你最有感的瞬間：",
    imageUrl: "https://picsum.photos/seed/check_mark_done/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "把最後一格打勾、把檔案存檔結案，那一刻的清爽感。", value: 'J' },
      { label: "在過程中突然想到一個新做法或靈感，覺得自己又多解鎖了一點。", value: 'P' }
    ]
  },
  {
    id: 32,
    text: "你的手機電量習慣：",
    imageUrl: "https://picsum.photos/seed/low_battery/800/400",
    dimensionPair: 'JP',
    options: [
      { label: "看到剩 40–50% 就會找機會充，不喜歡它變紅。", value: 'J' },
      { label: "經常一路用到剩個位數才發現，然後才開始找充電線。", value: 'P' }
    ]
  },

  // --- A vs T ---
  {
    id: 33,
    text: "事情突然不照你的計畫走，發生了一個大反轉，你內心的第一層反應是：",
    imageUrl: "https://picsum.photos/seed/rollercoaster_drop/800/400",
    dimensionPair: 'AT',
    weight: 2,
    options: [
      { label: "先深呼吸一下，想：「好，那接下來我可以怎麼做？」", value: 'A' },
      { label: "會先一陣焦慮，腦中開始重播是不是自己哪裡沒做好。", value: 'Turbulent' }
    ]
  },
  {
    id: 34,
    text: "對於自己的能力，你心裡比較常出現的是：",
    imageUrl: "https://picsum.photos/seed/mirror_reflection/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "「大致上我相信自己，就算遇到新的東西也能慢慢學起來。」", value: 'A' },
      { label: "「我好像還不夠好，需要再拿出成績或被肯定才比較放心。」", value: 'Turbulent' }
    ]
  },
  {
    id: 35,
    text: "在社交場合說錯話／講了一個冷掉的梗，過後你會：",
    imageUrl: "https://picsum.photos/seed/awkward_silence/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "當場笑一笑帶過，之後也不會特別放在心上。", value: 'A' },
      { label: "回家後會反覆回想那一幕，覺得尷尬好一陣子。", value: 'Turbulent' }
    ]
  },
  {
    id: 36,
    text: "面對一個時間快到了的大專案，你被壓力推著跑時：",
    imageUrl: "https://picsum.photos/seed/clock_ticking_fast/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "反而會進入高專注模式，知道自己在壓力下跑得比較快。", value: 'A' },
      { label: "容易睡不好、心裡慌，會很怕自己出錯或來不及。", value: 'Turbulent' }
    ]
  },
  {
    id: 37,
    text: "別人的情緒，對你而言的影響力是：",
    imageUrl: "https://picsum.photos/seed/stormy_sea/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "我大致能分清楚「那是他的情緒，不是我的」，比較不容易被拖走。", value: 'A' },
      { label: "很容易被現場氣氛影響，別人一低氣壓，我心情也會跟著掉下去。", value: 'Turbulent' }
    ]
  },
  {
    id: 38,
    text: "面對未來可能發生的風險，你通常：",
    imageUrl: "https://picsum.photos/seed/foggy_mountain_path/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "傾向先樂觀看待：「真的發生再說，到時候再處理。」", value: 'A' },
      { label: "會先在腦中演一輪最糟的劇本，預想各種備案。", value: 'Turbulent' }
    ]
  },
  {
    id: 39,
    text: "談到你現在的人生狀態，你比較接近哪一種感覺：",
    imageUrl: "https://picsum.photos/seed/peaceful_lake/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "雖然還有很多想做的，但大致上我能欣賞目前的自己與生活。", value: 'A' },
      { label: "總覺得哪裡還不夠好，常常在心裡對自己說「再撐一下、再更好一點」。", value: 'Turbulent' }
    ]
  },
  {
    id: 40,
    text: "當有人評論你的作品、說：「我覺得這裡可以再調整」時，你比較像是：",
    imageUrl: "https://picsum.photos/seed/critique_art/800/400",
    dimensionPair: 'AT',
    options: [
      { label: "自動把這句話拆成具體建議，當作修正的參考資料。", value: 'A' },
      { label: "先感受到一點被否定，會需要時間把這件事從「在說我不好」轉成「在說作品可以變好」。", value: 'Turbulent' }
    ]
  }
];

export const DIMENSION_EXPLANATIONS = [
  {
    key: "E/I",
    label: "能量流向 (ENERGY)",
    text: "這描述了你如何「充電」與「獲取能量」。外向 (Extraversion) 傾向從外部世界獲取能量，透過社交、行動與外界互動來激發活力；內向 (Introversion) 則傾向從內在世界獲取能量，透過獨處、反思與深入思考來恢復體力。"
  },
  {
    key: "S/N",
    label: "感知模式 (INFORMATION)",
    text: "這定義了你如何處理外界資訊。實感 (Sensing) 關注當下、事實與具體的五感細節，偏好實用且已證實的資訊；直覺 (Intuition) 則關注未來、可能性與隱藏的模式，偏好抽象理論、象徵意義與大方向的願景。"
  },
  {
    key: "T/F",
    label: "判斷準則 (DECISIONS)",
    text: "這決定了你如何做決定。思考 (Thinking) 優先考慮邏輯、公正與客觀規律，傾向冷靜地分析利弊；情感 (Feeling) 則優先考慮價值觀、個人情感與群體和諧，傾向溫暖地同理他人的感受與立場。"
  },
  {
    key: "J/P",
    label: "生活態度 (LIFESTYLE)",
    text: "這反映了你如何組織與安排生活。判斷 (Judging) 偏好計畫、秩序與確定感，喜歡提早決定並結案；感知 (Perceiving) 則偏好彈性、自發與開放性，喜歡保留選項並在最後一刻根據變化做出調整。"
  },
  {
    key: "A/T",
    label: "自我認同 (IDENTITY)",
    text: "這是大五人格中的關鍵維度，決定了你如何應對壓力。堅定 (A, Assertive) 代表情緒抗壓性強，通常比較自信且不輕易焦慮，對過往決定較少後悔；動盪 (T, Turbulent) 則代表對環境極度敏銳，追求完美且具備極強的進步驅動力，雖然容易感到壓力，但這也是追求卓越的動力來源。"
  }
];

const MBTI_IMAGE_MAP: Record<string, string> = {
  INTJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTJ_sitgas.png",
  INTP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTP_n89sv2.png",
  ENTJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTJ_jrtdic.png",
  ENTP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTP_iikzmh.png",
  INFJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438024/mbti_INFJ_fvjxy5.png",
  INFP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_INFP_j2qekb.png",
  ENFJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_ENFJ_fdpmlb.png",
  ENFP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ENFP_dcbmdx.png",
  ISTJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ISTJ_m3uc4m.png",
  ISFJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ISFJ_zjjqq6.png",
  ESTJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESTJ_r8crof.png",
  ESFJ: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESFJ_jzjd3v.png",
  ISTP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISTP_ajlimj.png",
  ISFP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISFP_xdgb6x.png",
  ESTP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESTP_rfs53m.png",
  ESFP: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESFP_hsuas1.png",
};

/** 角色插畫背後色塊：依網路上最常見的四象限分類（NT / NF / SJ / SP） */
export const MBTI_BG_COLORS: Record<string, string> = {
  INTJ: "#F3E5F5", INTP: "#F3E5F5", ENTJ: "#F3E5F5", ENTP: "#F3E5F5",
  INFJ: "#E8F5E9", INFP: "#E8F5E9", ENFJ: "#E8F5E9", ENFP: "#E8F5E9",
  ISTJ: "#E3F2FD", ISFJ: "#E3F2FD", ESTJ: "#E3F2FD", ESFJ: "#E3F2FD",
  ISTP: "#FFF3E0", ISFP: "#FFF3E0", ESTP: "#FFF3E0", ESFP: "#FFF3E0",
};

// 請將以下的 Placeholder URL 替換成您實際的圖片網址
const DESSERT_IMAGES: Record<string, string> = {
  BASQUE_CLASSIC: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866456/BASQUE_CLASSIC_c6fb92.webp",
  MILLE_CREPE_LEMON: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866456/MILLE_CREPE_LEMON_dcxrgr.webp",
  TIRAMISU_BAILEYS: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866456/TIRAMISU_BAILEYS_vkzkxr.webp",
  TIRAMISU_YUZU: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866456/TIRAMISU_YUZU_pu1r82.webp",
  BASQUE_TEA: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866455/BASQUE_TEA_izkwws.webp",
  CHIFFON_HOKKAIDO: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866455/CHIFFON_HOKKAIDO_kff8rv.webp",
  CHIFFON_LEMON: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866455/CHIFFON_LEMON_ppn6t3.webp",
  MILLE_CREPE_STRAWBERRY: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866455/MILLE_CREPE_STRAWBERRY_s6bf22.webp",
  MILLE_CREPE_CLASSIC: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866454/MILLE_CREPE_CLASSIC_ofjcvq.webp",
  PUDDING_CLASSIC: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866453/PUDDING_CLASSIC_fm8hng.webp",
  BASQUE_SALTED_EGG: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866453/BASQUE_SALTED_EGG_cwc3ah.webp",
  CHIFFON_BERRY: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866454/CHIFFON_BERRY_wlmqgd.webp",
  TIRAMISU_CLASSIC: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866454/TIRAMISU_CLASSIC_puzwyg.webp",
  TIRAMISU_MATCHA: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866453/TIRAMISU_MATCHA_wz4qxo.webp",
  MILLE_CREPE_CHOCO: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866454/MILLE_CREPE_CHOCO_dtlgov.webp",
  CHIFFON_FRUIT: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866453/CHIFFON_FRUIT_fswhqh.webp",
};

// A/T Variant Map to create 32 distinct personalities
const VARIANT_NUANCES: Record<string, { A: string; T: string }> = {
  "INTJ": {
    A: "作為堅定型，你的決策帶有一種不可動搖的自信，較少受到外界雜訊干擾。你專注於長期目標的實現，對挫折的耐受度極高。",
    T: "作為動盪型，你對完美的追求近乎苛刻，這份焦慮正是你不斷優化的動力。你比常人更敏銳地察覺潛在風險，但也更容易感到疲憊。"
  },
  "INTP": {
    A: "作為堅定型，你對自己的邏輯體系充滿信心，不太在乎社會的眼光。你能在混亂中保持冷靜，是純粹的理性思考者。",
    T: "作為動盪型，你經常反覆檢視自己的理論是否完美，這種自我質疑讓你不斷挖掘更深層的真理，但也容易陷入分析癱瘓。"
  },
  "ENTJ": {
    A: "作為堅定型，你是無畏的指揮官。壓力對你來說只是燃料，你享受高強度的挑戰，並能迅速從失敗中反彈。",
    T: "作為動盪型，你雖然強勢，但內心深處渴望得到認可。你對效率的極致追求，往往源於對失控的深層恐懼。"
  },
  "ENTP": {
    A: "作為堅定型，你大膽而無畏，享受與人辯論的快感而不往心裡去。你是天生的冒險家，失敗對你來說只是有趣的實驗數據。",
    T: "作為動盪型，你的思維雖然活躍，但更在意他人的評價。你在創新的同時，也會擔心這些點子是否足夠完美。"
  },
  "INFJ": {
    A: "作為堅定型，你清楚自己的界線，不會為了拯救他人而耗盡自己。你的理想主義帶有一種務實的堅韌。",
    T: "作為動盪型，你的共情能力極強，常將他人的痛苦視為己任。你的內心世界波濤洶湧，但也因此擁有最細膩的療癒力量。"
  },
  "INFP": {
    A: "作為堅定型，你雖然溫柔，但內核極其穩定。你接納自己的獨特，不因與世界格格不入而焦慮，活得自在而真實。",
    T: "作為動盪型，你對自我價值充滿懷疑，但也正因如此，你的創作與情感表達具有一種令人心碎的深刻美感。"
  },
  "ENFJ": {
    A: "作為堅定型，你是自信的領袖，相信自己的直覺與判斷。你能穩定地輸出能量，而不容易被他人的負面情緒吞噬。",
    T: "作為動盪型，你極度在意群體對你的看法，害怕辜負他人的期待。這種壓力讓你比任何人都更努力去照顧每一個靈魂。"
  },
  "ENFP": {
    A: "作為堅定型，你是永遠的樂觀主義者。你相信一切都會好轉，這份自信讓你敢於追逐最瘋狂的夢想。",
    T: "作為動盪型，你的情緒起伏較大，對人際關係的微小變化非常敏感。這份敏感讓你成為最能同理他人的傾聽者。"
  },
  "ISTJ": {
    A: "作為堅定型，你是最可靠的磐石。你對自己的職責與能力有絕對的信心，不受外界干擾，專注於維護秩序。",
    T: "作為動盪型，你對細節的執著源於對犯錯的焦慮。你檢查再檢查，確保萬無一失，是完美的守門員。"
  },
  "ISFJ": {
    A: "作為堅定型，你默默付出但不委屈自己。你知道自己的價值，能在照顧他人的同時，也守護好自己的內心平靜。",
    T: "作為動盪型，你總是擔心自己做得不夠好，害怕讓自己在乎的人失望。你的付出帶有一種神聖的犧牲感。"
  },
  "ESTJ": {
    A: "作為堅定型，你的領導風格果斷而直接。你相信規則與結構，並且毫無猶豫地執行，是高效率的化身。",
    T: "作為動盪型，你雖然強勢，但會擔心團隊是否真的服氣。你通過加倍的努力與以身作則來證明自己的領導正當性。"
  },
  "ESFJ": {
    A: "作為堅定型，你在社交場合游刃有餘，自信且受歡迎。你享受被人需要的感覺，但不會因此患得患失。",
    T: "作為動盪型，你對人際氛圍極度敏感，一點點冷場都會讓你焦慮。你用盡全力去維護和諧，是團體中最貼心的守護者。"
  },
  "ISTP": {
    A: "作為堅定型，你冷靜自信，對危機處理有著天生的直覺。你活在當下，不為過去後悔，也不為未來焦慮。",
    T: "作為動盪型，你雖然技術高超，但對自己的能力時常存疑。這種懷疑驅使你不斷精進技藝，追求極致的完美。"
  },
  "ISFP": {
    A: "作為堅定型，你自在地活在自己的節奏裡。你創作是為了取悅自己，而非他人。你擁有最純粹的藝術靈魂。",
    T: "作為動盪型，你的情緒如畫布般豐富多變。你對批評非常敏感，但這份脆弱也是你藝術創作中最動人的部分。"
  },
  "ESTP": {
    A: "作為堅定型，你是天生的冒險王。你相信船到橋頭自然直，敢於承擔高風險，享受腎上腺素的快感。",
    T: "作為動盪型，你的衝動背後隱藏著對平庸的恐懼。你不斷尋求新的刺激，是為了證明自己依然鮮活地存在著。"
  },
  "ESFP": {
    A: "作為堅定型，你是舞台上的王者，享受矚目且毫不怯場。你的快樂具有強大的感染力，是純粹的正能量發射器。",
    T: "作為動盪型，你雖然外表光鮮，但內心害怕孤獨與被遺忘。你用熱鬧填滿生活，渴望與人建立深刻的連結。"
  }
};

export const getResultData = (type: string, variant: 'A' | 'T' = 'A'): MbtiResultData => {
  const characterImageUrl = MBTI_IMAGE_MAP[type] || `https://picsum.photos/seed/mbti_${type}/800/1000`;

  const getBgColor = (t: string) => {
    if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(t)) return '#F3E5F5';
    if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(t)) return '#E8F5E9';
    if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(t)) return '#E3F2FD';
    if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(t)) return '#FFF3E0';
    return '#FFFFFF';
  };

  const baseDb: Record<string, MbtiResultData> = {
    // --- 分析師 (Analysts) ---
    "INTJ": {
      id: "INTJ", title: "戰略策劃家", summary: "極致理性的系統構建者，孤獨但清醒。", quote: "「如果這件事沒有邏輯，那它就不應該存在。」", keywords: ["遠見", "獨立", "戰略", "完美"], bgColor: getBgColor("INTJ"),
      coreAnalysis: "你是天生的架構師。世界對你來說不是隨機的混亂，而是一個可以被拆解、優化和重組的巨大棋盤。你極度看重能力與知識，對權威不屑一顧，除非那個權威能證明他比你聰明。你的孤獨來自於你總是在思考大多數人還沒意識到的未來。",
      dimensionAnalysis: { EI: "內向 (I) 提供深度思考的空間。", SN: "直覺 (N) 讓你總是看向未來。", TF: "思考 (T) 是你過濾雜訊的刀。", JP: "判斷 (J) 讓你執行力如雷。", AT: "面對變數時的穩定程度。" },
      strengths: ["長遠的戰略眼光", "極強的邏輯分析能力", "獨立自主", "追求卓越"],
      blindSpots: ["過於傲慢", "忽視他人情感", "過度分析", "對細節不耐煩"],
      career: {
        style: "你是優秀的架構師或策略家。需要高度自主權，討厭微觀管理。你喜歡解決複雜的系統性問題。",
        advice: "你的才華毋庸置疑，但「人」往往是你計畫中最大的變數。學習花點時間經營職場關係，這不是虛偽，而是潤滑劑。試著用更溫和的方式推銷你的想法，別讓人覺得你在展現智商優越感，否則你會發現自己在單打獨鬥。",
        suitableJobs: ["系統架構師", "科學家", "策略顧問", "投資經理"]
      },
      relationships: {
        style: "愛情對你來說也是需要優化的系統。你尋找的是智力相當的夥伴，而非純粹的情感依賴。",
        strengths: "你在關係中極度誠實且穩定。你會幫助伴侶解決問題，規劃未來，是能在風雨中依靠的堅實後盾。",
        advice: "愛情不是一場辯論賽，不需要每件事都爭個對錯。有時候伴侶需要的只是一個擁抱，而不是一個解決方案。"
      },
      socialStyle: "極簡社交，只與有深度的人交流。", growthAdvice: "傲慢是智慧的雜訊，試著承認你也有情感需求，這不是軟弱。",
      soulQuestions: ["你贏了所有的爭論，但你快樂嗎？", "如果效率不是人生唯一的指標，你會如何重新定義成功？", "你推開了所有人以保持獨立，但這是強大還是恐懼？"],
      characterImage: characterImageUrl, dessert: { name: "北海道經典巴斯克", description: "極致的濃度直達靈魂核心，理智與感官的完美角力。", imageUrl: DESSERT_IMAGES.BASQUE_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "INTP": {
      id: "INTP", title: "邏輯解構者", summary: "沉迷於宇宙奧秘的思考者，腦洞無邊無際。", quote: "「比起答案，我更喜歡那些無解的問題。」", keywords: ["好奇", "邏輯", "解構", "真理"], bgColor: getBgColor("INTP"),
      coreAnalysis: "你是思想的遊牧民族。你的大腦24小時都在運作，試圖找出萬物背後的原理。你不在乎世俗的成功標準，只在乎思維是否足夠清晰、邏輯是否足夠優美。你常被認為活在自己的世界裡，但那是因為你的世界比現實更有趣。",
      dimensionAnalysis: { EI: "內向 (I) 讓你專注於內在邏輯。", SN: "直覺 (N) 讓你看到抽象關聯。", TF: "思考 (T) 是你唯一的準則。", JP: "感知 (P) 讓你保持開放與靈活。", AT: "對自我懷疑的處理機制。" },
      strengths: ["分析能力", "創新思維", "客觀公正", "學習力強"],
      blindSpots: ["生活低能", "情感遲鈍", "拖延症", "紙上談兵"],
      career: {
        style: "適合需要高度智力投入、獨立作業且能解決複雜問題的工作。討厭繁文縟節與重複性勞動。",
        advice: "你擅長解決難題，但常栽在「溝通」與「截止日期」上。在職場中，試著將你的天才想法翻譯成凡人能聽懂的語言。另外，不要為了追求完美的解決方案而無限期拖延，先求有再求好，完成任務也是一種能力。",
        suitableJobs: ["程式設計師", "哲學家", "數學家", "分析師"]
      },
      relationships: {
        style: "理性的浪漫。喜歡能和你進行智力辯論的伴侶，對於過度情緒化的關係感到棘手。",
        strengths: "你很真實，不玩心理遊戲。在關係中你給予伴侶極大的自由空間，並總是能提供獨特的觀點。",
        advice: "你的沉默常被誤解為冷漠。試著用語言表達你的感受，即使這對你來說很彆扭。情感邏輯和數學邏輯是不一樣的。"
      },
      socialStyle: "在感興趣的話題上滔滔不絕，其他時間隱形。", growthAdvice: "試著與現實世界建立一點連結，哪怕只是從整理房間開始。",
      soulQuestions: ["你是否用「邏輯」作為擋箭牌，來逃避處理混亂的情感？", "如果真理會傷害到你愛的人，你還會堅持說出來嗎？", "你活在腦中很久了，要不要出來曬曬太陽？"],
      characterImage: characterImageUrl, dessert: { name: "檸檬柚子千層", description: "結構細膩且層次分明，在深度思考中尋求一絲清亮。", imageUrl: DESSERT_IMAGES.MILLE_CREPE_LEMON, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ENTJ": {
      id: "ENTJ", title: "天生指揮官", summary: "你是天生的統帥。擁有宏大的願景與鐵一般的意志。", quote: "「不可能這個詞，只存在於愚人的字典裡。」", keywords: ["野心", "戰略", "果斷", "權力"], bgColor: getBgColor("ENTJ"),
      coreAnalysis: "你是天生的領袖。在大腦中，一切事物都被轉化為實現目標的資源。你對低效與混亂有著天然的厭惡，總是渴望在充滿挑戰的環境中建立秩序。你不僅看見森林，你還規劃了整座森林的採伐與重生路徑。",
      dimensionAnalysis: { EI: "外向 (E) 賦予你奪取主導權的衝動。", SN: "直覺 (N) 是你的長遠戰略指南。", TF: "思考 (T) 是你最強大的武器。", JP: "判斷 (J) 讓你的決策果斷如雷。", AT: "身分維度影響你對壓力的耐受度。" },
      strengths: ["決策力", "戰略", "自信", "效率"],
      blindSpots: ["冷酷", "傲慢", "缺乏耐心", "忽視情感"],
      career: {
        style: "適合掌舵、開拓市場、重組組織。你需要權力與掌控感，無法屈居人下。",
        advice: "你的速度太快，常把團隊遠遠拋在腦後。學習「等待」的藝術，並非每個人都擁有你的意志力。對於那些跟不上的人，試著用教練引導代替責罵。展現你人性化的一面，會讓你獲得真正的忠誠，而不僅僅是畏懼。",
        suitableJobs: ["CEO", "創業家", "管理顧問", "法官"]
      },
      relationships: {
        style: "強強聯手。尋找能並肩作戰、能力相當的伴侶。關係也是一場投資。",
        strengths: "你對關係有明確的規劃，願意投入資源讓彼此的生活更好。你是伴侶最堅強的靠山，沒有什麼難題是你無法解決的。",
        advice: "不要把伴侶當成下屬。在工作上你需要贏，但在感情中你需要愛。試著展現你的脆弱，這不會削弱你的力量，反而會增加你的魅力。"
      },
      socialStyle: "強勢且直接。討厭浪費時間的閒聊。", growthAdvice: "學會聆聽沉默的聲音，那裡藏著你忽略的情感細節。",
      soulQuestions: ["你征服了世界，然後呢？", "如果愛意味著必須示弱，你還敢愛嗎？", "你是否把「效率」看得比「人性」更重要？"],
      characterImage: characterImageUrl, dessert: { name: "奶酒提拉米蘇", description: "微醺的權力展演，苦甜之間盡是掌控局勢的餘韻。", imageUrl: DESSERT_IMAGES.TIRAMISU_BAILEYS, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ENTP": {
      id: "ENTP", title: "智力辯論家", summary: "打破規則的創新者，喜歡思想的火花。", quote: "「為什麼不試試看反過來做？」", keywords: ["機智", "挑戰", "創新", "多變"], bgColor: getBgColor("ENTP"),
      coreAnalysis: "你是思想的魔術師。你熱愛在辯論中尋找真理（或者只是為了好玩）。傳統和規則對你來說只是挑戰的起點。你思維敏捷，能瞬間連結看似無關的事物。你的魅力在於你的不可預測性與無窮的精力。",
      dimensionAnalysis: { EI: "外向 (E) 讓你從思想碰撞中充電。", SN: "直覺 (N) 讓你看到無限可能。", TF: "思考 (T) 讓你理性分析局勢。", JP: "感知 (P) 讓你隨時準備轉向。", AT: "自信與自我懷疑的拉鋸。" },
      strengths: ["聰明", "創新", "適應力", "戰略思維"],
      blindSpots: ["好辯", "缺乏執行力", "忽視情感", "容易厭倦"],
      career: {
        style: "適合創業、解決難題、戰略規劃等需要高智商與創新的工作。無法忍受笨蛋與例行公事。",
        advice: "聰明是你最大的資產，也是最大的詛咒。你容易因為覺得工作太簡單而失去興趣，甚至因此得罪上司。學習「完成」那些無聊的行政工作，是通往高層的必經之路。試著將你的破壞力轉化為建設性的改革，而不僅僅是為了反對而反對。",
        suitableJobs: ["創業家", "創意總監", "律師", "政客"]
      },
      relationships: {
        style: "喜歡聰明獨立的伴侶。需要智力刺激，無法忍受無趣或過於依賴的人。",
        strengths: "你願意為了伴侶的成長挑戰他們，帶領他們看見更廣闊的世界。你總能想出新奇的點子來讓關係保鮮。",
        advice: "你的玩笑有時候會刺傷人，雖然你無意如此。學會在爭論中「讓步」，這不是認輸，而是因為你珍惜這段關係勝過你的自尊。"
      },
      socialStyle: "聚會中的焦點，幽默且犀利。", growthAdvice: "學會收斂光芒，有時候傾聽比說話更有力量。",
      soulQuestions: ["你總是反駁別人，是因為你真的不認同，還是只是想證明自己比較聰明？", "如果有一天你不再是最聰明的那個人，你還有價值嗎？", "你的創新點子，有多少真正落地實現了？"],
      characterImage: characterImageUrl, dessert: { name: "柚子蘋果提拉米蘇", description: "打破常規的驚喜風味，在每一次味覺挑戰中看見邊界。", imageUrl: DESSERT_IMAGES.TIRAMISU_YUZU, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    // --- 外交官 (Diplomats) ---
    "INFJ": {
      id: "INFJ", title: "深淵凝視者", summary: "稀有且深邃的導師，看透人心的直覺力。", quote: "「最安靜的人，往往擁有最喧囂的思想。」", keywords: ["洞察", "理想", "神祕", "利他"], bgColor: getBgColor("INFJ"),
      coreAnalysis: "你是人類靈魂的解讀者。你擁有一種近乎通靈的直覺，能輕易看穿他人的偽裝與潛在動機。你雖然安靜，但內心燃燒著改變世界的理想之火。你追求深度的連結與意義，對於膚淺的事物感到疲憊。",
      dimensionAnalysis: { EI: "內向 (I) 讓你保留神祕感。", SN: "直覺 (N) 讓你預見未來趨勢。", TF: "情感 (F) 讓你對人充滿關懷。", JP: "判斷 (J) 讓你堅定地執行理想。", AT: "面對完美主義時的壓力。" },
      strengths: ["穿透人心的直覺力", "強大的共情與療癒能力", "對信念的堅持與執行力", "善於看見事物的本質"],
      blindSpots: ["容易過度承擔他人情緒而內耗", "追求完美導致遲遲無法行動", "對批評過於敏感", "忽視身體與現實的需求"],
      career: {
        style: "你需要工作的意義感。單純為了賺錢而重複機械勞動會讓你靈魂枯竭。你需要一個能讓價值觀落地的平台，以及相對獨立的創作空間。",
        advice: "別讓完美主義癱瘓你的行動。你常因為覺得「還沒準備好」或「不夠完美」而遲遲不肯發布作品。記住，完成比完美更重要。另外，職場中要學會適度抽離，不要將同事的情緒垃圾照單全收，這會嚴重耗損你的職業壽命。",
        suitableJobs: ["心理諮商師", "作家", "非營利組織領袖", "教師"]
      },
      relationships: {
        style: "你追求靈魂伴侶。外在條件對你來說是次要的，你渴望的是深度的精神共鳴。一旦愛上，你會極度忠誠且深情。",
        strengths: "你擁有一種看穿靈魂的本領，能敏銳察覺伴侶未說出口的需求。你的忠誠度極高，一旦認定一個人，就會全心全意地守護這段關係，願意為了對方的成長付出一切。",
        advice: "不要過度理想化你的伴侶。沒有人是完美的，包括你自己。當現實與你的高標準衝突時，試著練習「接受」而非「改造」。學會表達自己的需求，而不是期待對方能像你讀心一樣讀懂你。"
      },
      socialStyle: "溫和但有距離感，只對少數人敞開。", growthAdvice: "接受這世界的不完美，包括你自己在內，完美主義是你的牢籠。",
      soulQuestions: ["你總是在照顧別人的情緒，但上一次你真正被「接住」是什麼時候？", "你的孤獨感，是因為沒人懂你，還是因為你關上了門不讓人進來？", "如果這世界不需要被拯救，你的人生目標會變成什麼？"],
      characterImage: characterImageUrl, dessert: { name: "蜜香紅茶千層", description: "茶香在每一層奶霜之間靜靜流淌。你不是那種喧嘩的人——你是讓人回家後才想起來的那道餘韻。", imageUrl: DESSERT_IMAGES.MILLE_CREPE_LEMON, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "INFP": {
      id: "INFP", title: "治癒系詩人", summary: "溫柔的理想主義者，內心藏著整座宇宙。", quote: "「即使在陰溝裡，我也在仰望星空。」", keywords: ["夢幻", "真誠", "共情", "自由"], bgColor: getBgColor("INFP"),
      coreAnalysis: "你是詩人與夢想家。你的內心世界比現實世界更真實、更豐富。你對真實（Authenticity）有著極致的追求，無法忍受虛偽。雖然外表看似柔弱隨和，但一旦觸及你的核心價值觀，你會展現出驚人的頑強。",
      dimensionAnalysis: { EI: "內向 (I) 是你的能量源泉。", SN: "直覺 (N) 讓你充滿想像。", TF: "情感 (F) 是你的決策核心。", JP: "感知 (P) 讓你隨性生活。", AT: "情緒波動的穩定度。" },
      strengths: ["豐富的想像力", "真誠", "同理心", "開放的心態"],
      blindSpots: ["不切實際", "容易受傷", "缺乏執行力", "逃避衝突"],
      career: {
        style: "你需要創意與自由，無法忍受官僚與僵化的體制。工作必須符合你的個人價值觀。",
        advice: "你的熱情來得快去得也快，容易陷入「想得太多，做得太少」的循環。試著建立微小的日常紀律，讓靈感能夠落地。不要因為職場的現實面而感到幻滅，學習在不完美的環境中守護你的初心，而不是逃避。",
        suitableJobs: ["作家", "藝術家", "心理學家", "編輯"]
      },
      relationships: {
        style: "渴望童話般的愛情，全心全意的奉獻。尋求靈魂深處的連結。",
        strengths: "你擁有令人驚嘆的包容力與溫柔，能看見伴侶最美好的一面，即使連他們自己都沒發現。",
        advice: "不要把伴侶當作你小說中的主角。當他們展現出平凡或醜陋的一面時，不要急著失望。學會處理衝突，而不是逃回你的殼裡。"
      },
      socialStyle: "安靜的觀察者，熟了之後是瘋子。", growthAdvice: "不要等到感覺對了才行動，行動會帶來感覺。",
      soulQuestions: ["你愛的是這個人，還是你想像中愛情的樣子？", "如果不逃避衝突，最壞的結果真的是世界末日嗎？", "你的善良是否有底線？"],
      characterImage: characterImageUrl, dessert: { name: "焦糖烤布丁戚風", description: "輕盈的蛋糕體裡藏著一顆焦糖的溫熱核心。你溫柔得像雲，卻比所有人都更真實地活著。", imageUrl: DESSERT_IMAGES.CHIFFON_BERRY, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ENFJ": {
      id: "ENFJ", title: "光輝導師", summary: "天生的導師與激勵者，散發溫暖的光芒。", quote: "「你的潛力，是我最想守護的寶藏。」", keywords: ["熱情", "領導", "利他", "影響"], bgColor: getBgColor("ENFJ"),
      coreAnalysis: "你是人群中的恆星。你天生就能感受到他人的情緒需求，並知道如何激勵他們成為更好的自己。你充滿魅力、熱情且富有責任感。你常常為了群體的和諧而忽略了自己的需求，你的快樂來自於看到他人的成長。",
      dimensionAnalysis: { EI: "外向 (E) 讓你從幫助他人中獲能。", SN: "直覺 (N) 讓你看到他人的潛力。", TF: "情感 (F) 讓你極重人情。", JP: "判斷 (J) 讓你做事有條理。", AT: "面對批評時的反應。" },
      strengths: ["說服力", "同理心", "領導力", "熱情"],
      blindSpots: ["過度理想化", "容易受傷", "控制欲", "忽略現實"],
      career: {
        style: "適合引領變革、教育群眾或促進溝通的工作。需要高度的使命感。",
        advice: "你容易過度投入，將工作的成敗與個人價值綁定。學習適度「冷血」，不要試圖拯救每一個表現不佳的同事。在做決策時，試著依賴數據而非直覺或人情。記得，要先照顧好自己，你發出的光芒才不會熄滅。",
        suitableJobs: ["企業培訓師", "非營利組織領導", "心理學家", "政治家/發言人", "人資長"]
      },
      relationships: {
        style: "熱烈而深情。致力於伴侶的成長，希望能與伴侶一起達成共同的理想。",
        strengths: "你極擅長溝通，能引導伴侶說出心裡話。你會為了共同的未來而努力，並幫助伴侶成為更好的自己。",
        advice: "不要過度干涉伴侶的人生課題。即使你是為了對方好，也要尊重他們成長的節奏。有時候，閉上嘴巴的陪伴比建議更有力量。"
      },
      socialStyle: "社交場合的黏合劑，照顧到每一個人。", growthAdvice: "花點時間獨處，問問自己：如果沒有觀眾，你還是誰？",
      soulQuestions: ["你總是拯救別人，但誰來拯救你？", "當你脫下這層光鮮亮麗的外衣，你喜歡裡面的自己嗎？", "你是否在用「幫助別人」來逃避面對自己的空虛？"],
      characterImage: characterImageUrl, dessert: { name: "摩卡焦糖提拉米蘇", description: "Tiramisu 在義大利文是「帶我向上」。你天生就是那個讓人感到被托舉的存在。摩卡的深沉，是你給予的溫度。", imageUrl: DESSERT_IMAGES.TIRAMISU_BAILEYS, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ENFP": {
      id: "ENFP", title: "熱血追夢人", summary: "充滿熱情的可能性探險家，永遠在追逐新奇。", quote: "「生活要麼是一場大膽的冒險，要麼什麼都不是。」", keywords: ["活力", "創意", "連結", "自由"], bgColor: getBgColor("ENFP"),
      coreAnalysis: "你是自由的靈魂。你對世界充滿了孩子般的好奇心，總能從平凡中發現神奇。你熱愛人、熱愛故事、熱愛一切未知的可能性。你是天生的連結者，能瞬間拉近人與人的距離。你的能量具有傳染性，讓周圍的人都跟著燃燒。",
      dimensionAnalysis: { EI: "外向 (E) 讓你愛上人群。", SN: "直覺 (N) 讓你腦洞大開。", TF: "情感 (F) 讓你真誠待人。", JP: "感知 (P) 讓你隨性生活。", AT: "樂觀與焦慮的並存。" },
      strengths: ["創新", "溝通", "熱忱", "洞察力"],
      blindSpots: ["三分鐘熱度", "情緒化", "過度思考", "缺乏紀律"],
      career: {
        style: "需要創意、多樣性與能夠發揮影響力的工作。適合當點子的發想者。",
        advice: "你是開始的高手，卻是結束的生手。你的履歷表可能充滿了各種有趣的經歷，但缺乏深度。在職場上，試著練習「收斂」，專注於將一個專案完美落地，而不僅僅是提出好點子。注意細節，別讓粗心掩蓋了你的才華。",
        suitableJobs: ["活動企劃", "記者", "創業者", "行銷專員"]
      },
      relationships: {
        style: "追求靈魂共鳴與激情。喜歡驚喜，需要一個能陪你瘋也能陪你深聊的伴侶。",
        strengths: "你總能給予伴侶無條件的支持與鼓勵。你讓關係充滿了驚喜與深度的對話，和你在一起永遠不會無聊。",
        advice: "不要過度解讀伴侶的一舉一動。有時候「沒表情」就只是「累了」，而不是「不愛了」。給予彼此一些安靜的空間，也是一種愛。"
      },
      socialStyle: "派對的靈魂人物，人來瘋。", growthAdvice: "學會拒絕，你的能量是有限的；學會停留，深度需要時間累積。",
      soulQuestions: ["你換了這麼多方向，究竟是在追尋夢想，還是在逃避困難？", "如果熱情退去，你還願意承諾堅持到底嗎？", "你總是激勵別人，但誰來激勵你？"],
      characterImage: characterImageUrl, dessert: { name: "草莓莓果千層", description: "層次繽紛且富有生命力，裝滿奇奇怪怪且閃亮的靈感碎片。", imageUrl: DESSERT_IMAGES.MILLE_CREPE_STRAWBERRY, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    // --- 守護者 (Sentinels) ---
    "ISTJ": {
      id: "ISTJ", title: "守序捍衛者", summary: "可靠現實的基石，維護秩序的沉默守護者。", quote: "「承諾就是契約，事實勝於雄辯。」", keywords: ["責任", "細節", "傳統", "秩序"], bgColor: getBgColor("ISTJ"),
      coreAnalysis: "你是社會的基石。你誠實、直接、盡忠職守。你相信事實、數據與經過驗證的方法，而不是空泛的理論。你做事井井有條，對細節有著驚人的記憶力。你不喜歡變動，因為那代表著不可控的風險。",
      dimensionAnalysis: { EI: "內向 (I) 讓你專注內在標準。", SN: "實感 (S) 讓你腳踏實地。", TF: "思考 (T) 讓你客觀公正。", JP: "判斷 (J) 讓你計畫周全。", AT: "對責任的焦慮感。" },
      strengths: ["誠實", "負責", "細心", "遵守規範"],
      blindSpots: ["固執", "不知變通", "忽視他人感受", "抗拒改變"],
      career: {
        style: "喜歡清晰的結構、明確的目標與穩定的環境。你是天生的執行者與守門員。",
        advice: "你的可靠是你的金字招牌，但不要讓它變成你的牢籠。你傾向拒絕改變，這可能讓你在快速變遷的產業中顯得僵化。試著對新方法保持開放態度，不要急著說「以前都是這樣做的」。學會適度授權，不要因為不放心而事必躬親。",
        suitableJobs: ["會計師", "法務", "公務員", "數據分析師"]
      },
      relationships: {
        style: "傳統而穩定。你不擅長花言巧語，但會透過實際行動（如做家事、理財）表達愛意。",
        strengths: "你是最穩定的伴侶。你記得每一個紀念日，會修好家裡所有壞掉的東西，給予對方極大的安全感。",
        advice: "不要讓「正確」扼殺了「親密」。有時候伴侶想聽的不是你的說教，而是你的理解。試著放下你的標準，接受一些無傷大雅的混亂。"
      },
      socialStyle: "慢熱且拘謹，只在熟人面前放鬆。", growthAdvice: "試著接受「不確定性」，那是生命活力的一部分，不要讓計畫成為你的監獄。",
      soulQuestions: ["你遵守規則，是因為這真的有效，還是因為你害怕失控？", "如果明天所有的計畫都泡湯了，你會崩潰還是隨遇而安？", "你為了責任，犧牲了多少快樂？"],
      characterImage: characterImageUrl, dessert: { name: "經典十勝原味千層", description: "結構的絕對精準與對承諾的執著，最值得信賴的味覺基石。", imageUrl: DESSERT_IMAGES.MILLE_CREPE_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ISFJ": {
      id: "ISFJ", title: "溫柔守護者", summary: "無私的奉獻者，細膩體貼的守護天使。", quote: "「被需要，是我存在的最大價值。」", keywords: ["守護", "奉獻", "細膩", "傳統"], bgColor: getBgColor("ISFJ"),
      coreAnalysis: "你是最溫暖的港灣。你安靜、友善且極具責任感。你總是把別人的需求放在自己之前，默默地記住每個人的喜好與細節。你維護著家庭與團體的和諧，是那種在背後默默支撐一切的力量。",
      dimensionAnalysis: { EI: "內向 (I) 讓你內斂謙虛。", SN: "實感 (S) 讓你關注細節。", TF: "情感 (F) 讓你體貼入微。", JP: "判斷 (J) 讓你盡忠職守。", AT: "過度擔憂的傾向。" },
      strengths: ["體貼", "耐心", "務實", "觀察力強"],
      blindSpots: ["不懂拒絕", "過度犧牲", "墨守成規", "壓抑情緒"],
      career: {
        style: "適合助人、服務性質且環境和諧的工作。你需要感受到自己是被需要的。",
        advice: "你是最完美的員工，但也最容易被剝削。你常常因為不好意思拒絕而承擔了不屬於你的工作。請記住，在職場上「界線」是必要的。為自己的成就爭取功勞，不要總是躲在幕後。如果這份工作讓你感到耗竭，請重新評估它是否值得。",
        suitableJobs: ["護理師", "行政人員", "圖書館員", "社工"]
      },
      relationships: {
        style: "全心全意的付出。渴望建立穩定、溫馨的家庭，是典型的賢妻良母/好爸爸型。",
        strengths: "你極度體貼，總能把家裡打理得井井有條。你是那種會為了伴侶的夢想而默默犧牲自己的人。",
        advice: "你的犧牲有時候會變成對方的壓力。不要期待別人會像你一樣自動察覺需求，試著大聲說出你想要什麼。你的感受也值得被重視。"
      },
      socialStyle: "溫和有禮，喜歡小團體的溫馨聚會。", growthAdvice: "學會自私一點點，這不是罪惡，而是為了走更長遠的路。",
      soulQuestions: ["你對別人的好，是因為你想做，還是因為你怕被討厭？", "如果不為別人而活，你想做什麼？", "你的忍耐是在維護關係，還是在累積怨氣？"],
      characterImage: characterImageUrl, dessert: { name: "經典烤布丁", description: "安全感的終極錨點，最純粹、最直接的溫柔安撫與回歸。", imageUrl: DESSERT_IMAGES.PUDDING_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ESTJ": {
      id: "ESTJ", title: "鐵血執行長", summary: "講究效率的管理者，維護傳統與秩序。", quote: "「效率是通往成功的唯一路徑。」", keywords: ["秩序", "管理", "效率", "現實"], bgColor: getBgColor("ESTJ"),
      coreAnalysis: "你是天生的管理者。你重視傳統、秩序與規則，並且擅長組織人事物去達成目標。你講究效率，無法容忍懶散與混亂。你直言不諱，因為你認為誠實比圓滑更重要。你是社會運作的引擎。",
      dimensionAnalysis: { EI: "外向 (E) 讓你主動掌控。", SN: "實感 (S) 讓你依據事實。", TF: "思考 (T) 讓你邏輯分明。", JP: "判斷 (J) 讓你果斷決策。", AT: "對失控的焦慮。" },
      strengths: ["領導力", "負責", "效率", "堅毅"],
      blindSpots: ["專斷", "缺乏同理心", "固執", "工作狂"],
      career: {
        style: "適合管理、組織、執法等需要決策力與秩序的工作。你是天生的領導者。",
        advice: "你的執行力無懈可擊，但有時候會過於專斷。試著傾聽那些你不認同的意見，或許會有意外的收穫。在團隊中，多給予一些讚美與鼓勵，而不僅僅是指令與糾正。建立情感連結，會讓你的團隊更願意為你賣命，而不僅僅是服從。",
        suitableJobs: ["高階主管", "軍官", "專案經理", "法官"]
      },
      relationships: {
        style: "負責而傳統。透過提供物質保障與穩定的生活來表達愛。",
        strengths: "你非常可靠，說到做到。你會為家庭建立穩固的經濟基礎與秩序，讓伴侶無後顧之憂。",
        advice: "不要把家當成公司來管理。家人需要的是你的傾聽與擁抱，而不是你的指令與考核。試著放下身段，展現你柔軟的一面。"
      },
      socialStyle: "喜歡組織聚會，維持傳統禮節。", growthAdvice: "試著理解那些「不合邏輯」的情感，那是人性的光輝，也是你最缺乏的柔軟。",
      soulQuestions: ["你拼命追求地位與成就，是因為渴望被愛，還是渴望被服從？", "如果有一天你失去了一切頭銜，你還是你嗎？", "你是否忘了如何「休息」而不感到罪惡？"],
      characterImage: characterImageUrl, dessert: { name: "鹹蛋黃巴斯克", description: "鋼鐵意志與濃郁核心的結合，穩健中帶有不容忽視的力量。", imageUrl: DESSERT_IMAGES.BASQUE_SALTED_EGG, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ESFJ": {
      id: "ESFJ", title: "熱心供給者", summary: "受歡迎的照顧者，團體中的社交核心。", quote: "「大家好，我們才好。」", keywords: ["熱情", "和諧", "社交", "責任"], bgColor: getBgColor("ESFJ"),
      coreAnalysis: "你是社交圈的核心。你真心喜歡人，並致力於讓周圍的人感到快樂與被接納。你重視傳統與禮節，是團體中的黏合劑。你對他人的評價很敏感，渴望得到認可與感謝。你的超能力是創造歸屬感。",
      dimensionAnalysis: { EI: "外向 (E) 讓你熱愛人群。", SN: "實感 (S) 讓你關注當下需求。", TF: "情感 (F) 讓你以和為貴。", JP: "判斷 (J) 讓你喜歡計畫聚會。", AT: "對人際衝突的焦慮。" },
      strengths: ["忠誠", "熱心", "實務", "團隊精神"],
      blindSpots: ["缺乏主見", "情緒勒索", "過度犧牲", "無法獨處"],
      career: {
        style: "適合協作、服務、教育等以人為本的工作。工作環境的和諧對你很重要。",
        advice: "你常常成為辦公室裡的「便利貼女孩/男孩」，承擔了過多的情緒勞動與雜事。學會區分「幫忙」與「本分」。在爭取升遷時，試著用數據與業績說話，而不是只強調人際關係。不要害怕良性的衝突，有時候衝突才能帶來進步。",
        suitableJobs: ["公關", "銷售經理", "活動主辦人", "教育工作者"]
      },
      relationships: {
        style: "全心投入。渴望被肯定與回饋，重視紀念日與儀式感。",
        strengths: "你總是把伴侶的需求放在第一位，樂於創造溫馨的家庭氛圍。你是最棒的支持者，永遠為愛人喝采。",
        advice: "小心不要變成「控制狂式的照顧」。不要透過付出來索取回報或情感勒索。給予伴侶一些獨立的空間，他們會更感激你。"
      },
      socialStyle: "熱情的主人，總是確保每個人都有飲料。", growthAdvice: "學會獨處，你的價值不需要別人來定義；試著討好你自己。",
      soulQuestions: ["如果沒人需要你，你還覺得自己有價值嗎？", "你究竟是真的很喜歡大家，還是害怕被排擠？", "你上次發自內心為自己做一件事，是什麼時候？"],
      characterImage: characterImageUrl, dessert: { name: "莓果戚風蛋糕", description: "溫和友善的包覆感，與摯愛分享這份純粹快樂的本質。", imageUrl: DESSERT_IMAGES.CHIFFON_BERRY, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    // --- 探險家 (Explorers) ---
    "ISTP": {
      id: "ISTP", title: "冷靜工匠", summary: "冷靜的觀察者，靈巧的執行者。", quote: "「與其談論如何運作，不如直接拆開來看。」", keywords: ["理性", "冷靜", "冒險", "技術"], bgColor: getBgColor("ISTP"),
      coreAnalysis: "你是天生的工程師。你熱愛拆解世界的規律，不論是物理的還是邏輯的。你擁有一種極致的「省力原則」，總能找到最簡潔的路徑去達成目標。你重視效率與實務，對於虛無縹緲的情感喧囂往往保持距離。",
      dimensionAnalysis: { EI: "內向 (I) 提供思考深度。", SN: "實感 (S) 確保精準。", TF: "思考 (T) 主導決策。", JP: "感知 (P) 提供彈性。", AT: "自我認同度決定穩定性。" },
      strengths: ["危機處理", "實作能力", "客觀", "適應力"],
      blindSpots: ["冷漠", "冒險傾向", "難以預測", "承諾恐懼"],
      career: {
        style: "喜歡動手操作、解決具體問題、有一定風險或挑戰性的工作。討厭辦公室政治。",
        advice: "你擁有卓越的技術能力，但容易因為「無聊」而頻繁換工作。試著尋找那些能提供持續挑戰與學習曲線的領域。此外，職場上的社交雖然麻煩，但它能保護你的技術成果不被忽視。不需要變成長袖善舞的人，但至少保持基本的連結。",
        suitableJobs: ["工程師", "機師", "取證專家", "急診醫生"]
      },
      relationships: {
        style: "需要大量空間。不喜歡黏膩與過多的情感交流，喜歡一起並肩作戰或體驗活動。",
        strengths: "你不黏人，尊重伴侶的隱私，並且總能在危機時刻挺身而出解決問題。你的愛表現在行動上，而非言語。",
        advice: "不要把「需要空間」當作逃避溝通的藉口。伴侶無法讀懂你的沉默，偶爾的主動關心能避免讓對方感到被冷落。"
      },
      socialStyle: "極簡社交，廢話耐受度低。", growthAdvice: "試著敞開心扉，情感的交會能帶來驚喜；不要用「理性」來逃避感受。",
      soulQuestions: ["你總是修得好東西，但你修得好關係嗎？", "你追求的自由，是真正的自由，還是只是不想承擔責任？", "如果這一次不能重來，你會更謹慎還是更瘋狂？"],
      characterImage: characterImageUrl, dessert: { name: "經典提拉米蘇", description: "冷靜大膽的口感平衡，無需多言的硬派實力展現。", imageUrl: DESSERT_IMAGES.TIRAMISU_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ISFP": {
      id: "ISFP", title: "自由藝術家", summary: "在黑白之間探索無限可能的藝術家。", quote: "「生活是一張畫布，我負責塗抹真實的色彩。」", keywords: ["藝術", "自由", "敏感", "當下"], bgColor: getBgColor("ISFP"),
      coreAnalysis: "你擁有一種獨特的動態平衡感。既能適應規則，又能看見規則之外的可能性。你的多面性是你最強大的武器。你對自我的認知在不斷流動，拒絕被單一的標籤定義。這讓你具備了極強的心理韌性。",
      dimensionAnalysis: { EI: "內向 (I) 讓你保留能量。", SN: "實感 (S) 捕捉當下。", TF: "情感 (F) 是靈魂濾鏡。", JP: "感知 (P) 讓你隨遇而安。", AT: "情緒穩定性的影響。" },
      strengths: ["藝術天賦", "包容力", "熱情", "觀察力"],
      blindSpots: ["缺乏計畫", "過於敏感", "容易放棄", "不善理財"],
      career: {
        style: "需要美感、自由與個人空間。不適合高壓、競爭激烈或死板的環境。",
        advice: "你往往低估了自己的才華，容易因為害怕被批評而不敢爭取機會。在職場中，找一個欣賞你美感與細膩度的導師非常重要。學習將你的創意轉化為商業價值，而不僅僅是自我表達，這能讓你獲得更多自由。",
        suitableJobs: ["插畫師", "花藝設計師", "心理輔導員", "創作者"]
      },
      relationships: {
        style: "浪漫而細膩。重視相處的氛圍與美感，需要被理解與呵護。",
        strengths: "你擅長創造浪漫與美好的氛圍，並且非常尊重伴侶的獨特性。你不會試圖控制對方，而是陪伴對方一起體驗生活。",
        advice: "當衝突發生時，不要只想著逃跑或退縮。壓抑的感覺不會消失，只會累積。學會溫和但堅定地表達你的不滿。"
      },
      socialStyle: "隨緣社交，小團體中話多。", growthAdvice: "堅守邊界，包容不應成為被索取的工具；衝突是關係的過濾器，別為了和諧而犧牲真實。",
      soulQuestions: ["你害怕被定義，但如果不被定義，別人該如何認識你？", "你的隨性是因為灑脫，還是因為害怕面對未來的責任？", "如果沒有人欣賞，你還會繼續創作嗎？"],
      characterImage: characterImageUrl, dessert: { name: "抹茶提拉米蘇", description: "細膩美感的微苦回甘，用最溫柔的方式對抗世界的喧囂。", imageUrl: DESSERT_IMAGES.TIRAMISU_MATCHA, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ESTP": {
      id: "ESTP", title: "極限挑戰者", summary: "活在當下的行動派，追求刺激與解決問題。", quote: "「與其後悔做過，不如後悔沒做。」", keywords: ["大膽", "行動", "現實", "速度"], bgColor: getBgColor("ESTP"),
      coreAnalysis: "你是活在當下的實踐者。你討厭抽象理論，喜歡捲起袖子直接幹。你擁有驚人的觀察力，能瞬間讀懂空氣並做出反應。你是天生的冒險家，喜歡遊走在邊緣，並在危機中找到快感與機會。",
      dimensionAnalysis: { EI: "外向 (E) 讓你主動出擊。", SN: "實感 (S) 讓你專注現實。", TF: "思考 (T) 讓你理性計算風險。", JP: "感知 (P) 讓你靈活應變。", AT: "自信與衝動的平衡。" },
      strengths: ["行動力", "社交手腕", "適應力", "觀察力"],
      blindSpots: ["衝動", "缺乏耐心", "忽視後果", "不守規矩"],
      career: {
        style: "喜歡快節奏、高回報、與人互動且富挑戰性的工作。無法忍受枯燥的辦公室。",
        advice: "你的行動力無人能及，但缺乏長期規劃是你最大的致命傷。你習慣憑直覺救火，卻忽略了防火。試著靜下心來思考三年後的目標。在職場上，遵守一些基本規則並不是認輸，而是為了讓你在大機構中能存活得更久。",
        suitableJobs: ["創業家", "股票經紀人", "消防員", "談判專家"]
      },
      relationships: {
        style: "熱情如火。喜歡追求刺激與新鮮感，喜歡聰明且能玩在一起的伴侶。",
        strengths: "你充滿樂趣，永遠不會讓伴侶感到無聊。你解決問題的能力極強，能帶領伴侶度過各種難關。",
        advice: "承諾不是束縛，而是另一種層次的冒險。試著在關係中練習「耐心」，不要一遇到平淡期就急著尋找下一個刺激。"
      },
      socialStyle: "派對焦點，幽默且風趣。", growthAdvice: "學會慢下來，深度的風景需要靜止才能看見；當速度慢下來時，試著面對自己的內心。",
      soulQuestions: ["你總是在追逐下一件大事，是因為真的想要，還是害怕停下來面對自己？", "你的冒險背後，有多少是因為不想長大？", "如果掌聲消失了，你還知道自己是誰嗎？"],
      characterImage: characterImageUrl, dessert: { name: "巧克力布朗尼千層", description: "極致感官的爆發體驗，追求速度與最直白的生命熱情。", imageUrl: DESSERT_IMAGES.MILLE_CREPE_CHOCO, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "ESFP": {
      id: "ESFP", title: "閃耀巨星", summary: "天生的藝人，讓生活充滿樂趣與色彩。", quote: "「人生就是一場即興演出。」", keywords: ["樂趣", "表演", "熱情", "關注"], bgColor: getBgColor("ESFP"),
      coreAnalysis: "你是世界的聚光燈。你熱愛生活、熱愛物質、熱愛與人互動。你有一種讓沈悶氣氛瞬間活躍的魔力。你極度關注美感與感官體驗，認為人生苦短，必須及時行樂。你是最慷慨的朋友，總是樂於分享快樂。",
      dimensionAnalysis: { EI: "外向 (E) 讓你在舞台上發光。", SN: "實感 (S) 讓你享受感官。", TF: "情感 (F) 讓你真情流露。", JP: "感知 (P) 讓你隨性而至。", AT: "對批評的敏感度。" },
      strengths: ["樂觀", "美感", "人際關係", "創造力"],
      blindSpots: ["膚淺", "缺乏專注", "逃避問題", "揮霍"],
      career: {
        style: "需要與人互動、有趣且能展現個人魅力的工作。適合服務業與娛樂業。",
        advice: "你很容易因為工作變得無聊或遇到困難就想放棄。職場不是遊樂場，學會忍受枯燥的過程是成熟的標記。另外，注意別讓你的情緒過度影響專業判斷，雖然大家喜歡你的熱情，但有時候客觀與冷靜更能贏得尊重。",
        suitableJobs: ["演員", "時尚設計師", "活動主持人", "導遊"]
      },
      relationships: {
        style: "充滿驚喜與樂趣。喜歡被寵愛，也喜歡大方地寵愛伴侶。",
        strengths: "你非常大方且熱情，總是不遺餘力地讓伴侶開心。你是最佳的玩伴，也是最溫暖的安慰者。",
        advice: "不要只聽好聽話，也試著去聽聽伴侶的逆耳忠言。當困難來臨時，不要選擇忽視，一起面對問題會讓關係更緊密。"
      },
      socialStyle: "我在哪裡，哪裡就是派對。", growthAdvice: "表面光鮮亮麗很好，但內在的厚度能讓你走得更遠；深度不代表沉重，而是根基。",
      soulQuestions: ["當派對結束，人群散去，你能面對孤獨嗎？", "你追求物質的享受，是在填補內心的什麼空洞？", "如果這輩子只能專注做一件事，那會是什麼？"],
      characterImage: characterImageUrl, dessert: { name: "檸檬巴斯克", description: "帶著焦糖外殼登場，酸亮得不留退路。你不需要宣告自己來了——整個場域早已感受到你的存在。", imageUrl: DESSERT_IMAGES.BASQUE_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    },
    "DEFAULT": {
      id: type, title: "邊界探索者", summary: "在黑白之間探索無限可能的適應者。", quote: "「在黑白之間，你看見了無限的灰階。」", keywords: ["適應", "多面", "潛力", "流動"], bgColor: getBgColor(type),
      coreAnalysis: `作為 ${type}，你擁有一種獨特的動態平衡感。你既能適應規則，又能看見規則之外的可能性。你的多面性是你最強大的武器，讓你在不同的環境中都能找到生存之道。你對自我的認知在不斷流動，拒絕被單一的標籤定義。這讓你具備了極強的心理韌性與應變能力。`,
      dimensionAnalysis: {
        EI: "在獨處與社交之間尋找平衡。", SN: "既看見了樹木，也看見了森林。", TF: "理智與感性交織運作。", JP: "擁有原則，但也懂得隨遇而安。", AT: "在變動中重塑自我。"
      },
      strengths: ["強大的環境適應力", "快速學習能力", "高度的心理韌性"], blindSpots: ["偶爾陷入身分認同的迷惘"],
      career: { style: "靈活多樣的工作型態。", advice: "找到你的核心錨點，別讓流動變成了漂流。", suitableJobs: ["顧問", "自由職業者", "產品經理"] },
      relationships: { style: "追求動態平衡的伴侶關係。", strengths: "極強的包容力與寬容度。", advice: "學習定義你的「核心底線」。" },
      socialStyle: "視情況調整社交模式。", growthAdvice: "擁抱複雜性，你不需要急著定義自己。",
      soulQuestions: ["你真正想要的生活樣貌是什麼？", "你是在適應環境，還是失去了自己？", "如果沒有限制，你想成為誰？"],
      characterImage: characterImageUrl, dessert: { name: "經典提拉米蘇", description: "苦甜平衡與大人感，收斂但有餘韻。", imageUrl: DESSERT_IMAGES.TIRAMISU_CLASSIC, ctaLink: "https://linktr.ee/moon_moon_dessert" }
    }
  };

  const baseData = baseDb[type] || baseDb["DEFAULT"];

  // Inject A/T Nuance into the content
  const variantNuance = VARIANT_NUANCES[type]?.[variant] || "";

  if (variantNuance) {
    // Append nuance to core analysis for distinct reporting
    return {
      ...baseData,
      coreAnalysis: `${baseData.coreAnalysis}\n\n${variantNuance}`
    };
  }

  return baseData;
};

export const SOUL_ANCHOR_MAP: Record<string, any> = {
  INTJ: { name: "北海道經典巴斯克", series: "巴斯克", quad: "經典", alt: ["檸檬巴斯克", "鹹蛋黃巴斯克"], drinkA: "美式咖啡", drinkT: "經典拿鐵", hook: "極致的濃度直達靈魂核心，是理智與感官的完美角力。", hookEn: "An intense depth that reaches the soul's core — the perfect duel between logic and sensation.", hookJa: "魂の核心に直接届く究極の濃厚さ——理性と感覚の完璧な対峙。", hookKo: "영혼의 핵심을 꿰뚫는 극도의 깊이 — 이성과 감각의 완벽한 대결." },
  INTP: { name: "檸檬柚子千層蛋糕", series: "千層", quad: "亮色", alt: ["蜜香紅茶千層", "草莓莓果千層"], drinkA: "日本柚子美式", drinkT: "薄荷茶", hook: "結構細膩且層次分明，適合在深度思考中尋求一絲清亮。", hookEn: "Delicately structured and luminously layered — a clear note of brightness in deep thought.", hookJa: "繊細な構造と鮮やかな層——深い思索の中にある一筋の清明さ。", hookKo: "섬세한 구조와 선명한 층 — 깊은 사유 속 한 줄기 청명함." },
  ENTJ: { name: "奶酒提拉米蘇", series: "提拉米蘇", quad: "深色", alt: ["經典提拉米蘇", "抹茶提拉米蘇"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "微醺的權力展演，苦甜之間盡是掌控局勢的餘韻。", hookEn: "A mildly intoxicating exercise of power — the lingering aftertaste of commanding the moment.", hookJa: "ほろ酔いの権力のパフォーマンス——苦甘の間に漂う、場を制した余韻。", hookKo: "은근하게 취하는 권력의 연출 — 쓰고 달콤한 사이에 남는 상황을 장악한 여운." },
  ENTP: { name: "柚子蘋果提拉米蘇", series: "提拉米蘇", quad: "亮色", alt: ["奶酒提拉米蘇", "抹茶提拉米蘇"], drinkA: "日本柚子美式", drinkT: "烤布丁拿鐵", hook: "打破常規的驚喜風味，在每一次味覺挑戰中看見邊界。", hookEn: "Rule-breaking flavors that surprise — pushing every boundary with each provocative bite.", hookJa: "常識を覆す驚きの風味——味覚への挑戦ごとに、限界が見えてくる。", hookKo: "규칙을 깨는 놀라운 맛 — 매번의 도전에서 경계를 발견한다." },
  INFJ: { name: "蜜香紅茶千層", series: "千層", quad: "深色", alt: ["檸檬柚子千層", "北海道十勝原味千層"], drinkA: "博士茶", drinkT: "抹茶拿鐵", hook: "茶香靜靜滲入每一層，你是讓人回家後才想起來的那道餘韻。", hookEn: "Tea quietly seeps through every layer — you're the kind of person people only remember on the way home.", hookJa: "茶の香りがそっと各層に染み渡る——あなたは、帰り道でふと思い出されるような存在。", hookKo: "차향이 조용히 모든 층에 스며든다 — 당신은 집에 돌아가는 길에야 비로소 떠오르는 그런 사람." },
  INFP: { name: "焦糖烤布丁戚風", series: "戚風", quad: "暖色", alt: ["莓果戚風", "北海道十勝原味千層"], drinkA: "博士茶", drinkT: "花草茶", hook: "輕盈如詩，焦糖的溫熱藏在柔軟深處，是你內心最真實的那份溫柔。", hookEn: "Light as a poem, with caramel warmth hidden in the soft depth — the truest tenderness at your core.", hookJa: "詩のように軽やかで、柔らかな深みに焦げ糖の温かさが宿る——あなたの内側にある、最も真実の優しさ。", hookKo: "시처럼 가볍고, 부드러운 깊이에 감춰진 캐러멜의 온기 — 당신 마음속 가장 진실한 온도." },
  ENFJ: { name: "摩卡焦糖提拉米蘇", series: "提拉米蘇", quad: "深色", alt: ["奶酒提拉米蘇", "柚子蘋果提拉米蘇"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "提拉米蘇的義文是「帶我向上」——你天生就是讓人感到被托舉的引力核心。", hookEn: "Tiramisu means \"lift me up\" in Italian — you are the gravity that pulls people upward.", hookJa: "ティラミスのイタリア語は「私を持ち上げて」——あなたは生まれながらに、人を上へ引き上げる引力の核心。", hookKo: "티라미수는 이탈리아어로 '나를 끌어올려줘' — 당신은 태어날 때부터 사람들을 위로 끌어올리는 인력의 중심." },
  ENFP: { name: "草莓莓果千層蛋糕", series: "千層", quad: "果香", alt: ["檸檬柚子千層", "蜜香紅茶千層"], drinkA: "日本柚子美式", drinkT: "花草茶", hook: "層次繽紛且富有生命力，裝滿奇奇怪怪且閃亮的靈感碎片。", hookEn: "Layers alive with color and vitality — bursting with strange, shimmering sparks of inspiration.", hookJa: "色彩豊かな層が命を宿し、奇妙で輝くインスピレーションの欠片で満たされている。", hookKo: "색채와 생명력으로 가득 찬 층 — 기묘하고 반짝이는 영감의 파편들로 넘쳐난다." },
  ISTJ: { name: "經典十勝原味千層", series: "千層", quad: "經典", alt: ["巧克力布朗尼千層", "蜜香紅茶千層"], drinkA: "美式咖啡", drinkT: "經典拿鐵", hook: "結構的絕對精準與對承諾的執著，最值得信賴的味覺基石。", hookEn: "Absolute structural precision and an unwavering commitment — the most trustworthy cornerstone of taste.", hookJa: "絶対的な構造の精度と約束への執着——最も信頼できる味覚の礎。", hookKo: "절대적인 구조의 정밀함과 약속에 대한 집착 — 가장 신뢰할 수 있는 미각의 초석." },
  ISFJ: { name: "經典烤布丁", series: "單品", quad: "經典", alt: ["本口味目前為最佳配對"], drinkA: "蕎麥茶", drinkT: "烤布丁拿鐵", hook: "安全感的終極錨點，最純粹、最直接的溫柔安撫與回歸。", hookEn: "The ultimate anchor of comfort — pure, direct, and gently drawing you back to what matters.", hookJa: "安心感の究極のアンカーポイント——最も純粋でシンプルな、やさしい慰めと帰還。", hookKo: "안정감의 궁극적인 닻 — 가장 순수하고 직접적인 따뜻한 위로와 귀환." },
  ESTJ: { name: "鹹蛋黃巴斯克", series: "巴斯克", quad: "深色", alt: ["北海道經典巴斯克", "檸檬巴斯克"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "鋼鐵意志與濃郁核心的結合，穩健中帶有不容忽視的力量。", hookEn: "Iron will fused with a rich core — steady strength that refuses to be overlooked.", hookJa: "鋼鉄の意志と濃厚なコアの融合——無視できない力を内包した、安定感。", hookKo: "강철 의지와 풍부한 핵심의 결합 — 무시할 수 없는 힘을 품은 안정감." },
  ESFJ: { name: "莓果戚風蛋糕", series: "戚風", quad: "果香", alt: ["焦糖烤布丁戚風", "蜜香紅茶千層"], drinkA: "日本柚子美式", drinkT: "經典拿鐵", hook: "溫和友善的包覆感，與摯愛分享這份純粹快樂的本質。", hookEn: "Warm and gently enveloping — sharing pure, simple joy with those who matter most.", hookJa: "温かく友好的な包み込む感覚——大切な人と分かち合う純粋な喜びの本質。", hookKo: "따뜻하고 친근한 포근함 — 소중한 사람과 나누는 순수한 행복의 본질." },
  ISTP: { name: "經典提拉米蘇", series: "提拉米蘇", quad: "經典", alt: ["抹茶提拉米蘇", "柚子蘋果提拉米蘇"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "冷靜大膽的口感平衡，無需多言的硬派實力展現。", hookEn: "A cool, bold balance of flavor — quiet competence that needs no announcement.", hookJa: "冷静で大胆な味わいのバランス——多言を要しない、硬派な実力の表れ。", hookKo: "냉철하고 대담한 맛의 균형 — 굳이 말하지 않아도 드러나는 묵직한 실력." },
  ISFP: { name: "抹茶提拉米蘇", series: "提拉米蘇", quad: "深色", alt: ["經典提拉米蘇", "奶酒提拉米蘇"], drinkA: "日本柚子美式", drinkT: "花草茶", hook: "細膩美感的微苦回甘，用最溫柔的方式對抗世界的喧囂。", hookEn: "A delicately beautiful bittersweet finish — the gentlest resistance to the world's noise.", hookJa: "繊細な美意識が生む微かな苦みと甘みの余韻——最もやさしい方法で、世界の喧騒に抗う。", hookKo: "섬세한 미감의 은은한 쓴맛과 단맛 — 세상의 소음에 가장 부드럽게 맞서는 방식." },
  ESTP: { name: "巧克力布朗尼千層", series: "千層", quad: "深色", alt: ["經典十勝原味千層", "蜜香紅茶千層"], drinkA: "西西里美式", drinkT: "焙茶拿鐵", hook: "極致感官的爆發體驗，追求速度與最直白的生命熱情。", hookEn: "A full-throttle sensory explosion — speed, intensity, and the most unfiltered passion for living.", hookJa: "感覚の極限への爆発的な体験——スピードと、最も率直な生への情熱の追求。", hookKo: "극도의 감각적 폭발 — 속도와 가장 직접적인 삶의 열정을 추구한다." },
  ESFP: { name: "檸檬巴斯克", series: "巴斯克", quad: "亮色", alt: ["北海道經典巴斯克", "鹹蛋黃巴斯克"], drinkA: "日本柚子美式", drinkT: "烤布丁拿鐵", hook: "帶著焦糖外殼登場，酸亮得不留退路——你出現的地方，就是全場最亮的角落。", hookEn: "Entering with a caramelized crust and a bold lemon punch — wherever you show up, that's the brightest spot in the room.", hookJa: "焦げ糖の外殻を纏い、酸っぱく鮮やかに颯爽と登場——あなたがいるところが、会場で最も輝く角。", hookKo: "캐러멜 외피를 두르고 새콤하게 등장하는 당신 — 당신이 있는 곳이 바로 그 공간에서 가장 빛나는 구석." }
};
