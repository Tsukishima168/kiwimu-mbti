-- ============================================
-- KIWIMU MBTI Lab - Essential Seed Data
-- ============================================
-- 此檔案包含基本測試資料，讓你能立即測試系統
-- 完整資料請稍後通過 Supabase Dashboard 手動新增或使用匯入功能

BEGIN;

-- 1. 維度說明
INSERT INTO dimension_explanations (dimension_key, label, explanation_text, display_order) VALUES
('E/I', '能量流向 (ENERGY)', '這描述了你如何「充電」與「獲取能量」。外向 (Extraversion) 傾向從外部世界獲取能量，透過社交、行動與外界互動來激發活力；內向 (Introversion) 則傾向從內在世界獲取能量，透過獨處、反思與深入思考來恢復體力。', 1),
('S/N', '感知模式 (INFORMATION)', '這定義了你如何處理外界資訊。實感 (Sensing) 關注當下、事實與具體的五感細節，偏好實用且已證實的資訊；直覺 (Intuition) 則關注未來、可能性與隱藏的模式，偏好抽象理論、象徵意義與大方向的願景。', 2),
('T/F', '判斷準則 (DECISIONS)', '這決定了你如何做決定。思考 (Thinking) 優先考慮邏輯、公正與客觀規律，傾向冷靜地分析利弊；情感 (Feeling) 則優先考慮價值觀、個人情感與群體和諧，傾向溫暖地同理他人的感受與立場。', 3),
('J/P', '生活態度 (LIFESTYLE)', '這反映了你如何組織與安排生活。判斷 (Judging) 偏好計畫、秩序與確定感，喜歡提早決定並結案；感知 (Perceiving) 則偏好彈性、自發與開放性，喜歡保留選項並在最後一刻根據變化做出調整。', 4),
('A/T', '自我認同 (IDENTITY)', '這是大五人格中的關鍵維度，決定了你如何應對壓力。堅定 (A, Assertive) 代表情緒抗壓性強，通常比較自信且不輕易焦慮，對過往決定較少後悔；動盪 (T, Turbulent) 則代表對環境極度敏銳，追求完美且具備極強的進步驅動力，雖然容易感到壓力，但這也是追求卓越的動力來源。', 5);

-- 2. 測試用 MBTI 結果 (僅INTJ 作為範例)
INSERT INTO mbti_results (
  id, title, summary, quote, keywords, bg_color,
  core_analysis, dimension_analysis, 
  strengths, blind_spots,
  career, relationships,
  social_style, growth_advice, soul_questions,
  character_image_url
) VALUES (
  'INTJ',
  '戰略策劃家',
  '極致理性的系統構建者，孤獨但清醒。',
  '「如果這件事沒有邏輯，那它就不應該存在。」',
  ARRAY['遠見', '獨立', '戰略', '完美'],
  '#F3E5F5',
  '你是天生的架構師。世界對你來說不是隨機的混亂，而是一個可以被拆解、優化和重組的巨大棋盤。你極度看重能力與知識，對權威不屑一顧，除非那個權威能證明他比你聰明。你的孤獨來自於你總是在思考大多數人還沒意識到的未來。',
  '{"EI": "內向 (I) 提供深度思考的空間。", "SN": "直覺 (N) 讓你總是看向未來。", "TF": "思考 (T) 是你過濾雜訊的刀。", "JP": "判斷 (J) 讓你執行力如雷。", "AT": "面對變數時的穩定程度。"}',
  ARRAY['長遠的戰略眼光', '極強的邏輯分析能力', '獨立自主', '追求卓越'],
  ARRAY['過於傲慢', '忽視他人情感', '過度分析', '對細節不耐煩'],
  '{"style": "你是優秀的架構師或策略家。需要高度自主權，討厭微觀管理。你喜歡解決複雜的系統性問題。", "advice": "你的才華毋庸置疑，但「人」往往是你計畫中最大的變數。學習花點時間經營職場關係，這不是虛偽，而是潤滑劑。", "suitableJobs": ["系統架構師", "科學家", "策略顧問", "投資經理"]}',
  '{"style": "愛情對你來說也是需要優化的系統。你尋找的是智力相當的夥伴，而非純粹的情感依賴。", "strengths": "你在關係中極度誠實且穩定。", "advice": "愛情不是一場辯論賽，不需要每件事都爭個對錯。"}',
  '極簡社交，只與有深度的人交流。',
  '傲慢是智慧的雜訊，試著承認你也有情感需求，這不是軟弱。',
  ARRAY['你贏了所有的爭論，但你快樂嗎？', '如果效率不是人生唯一的指標，你會如何重新定義成功？', '你推開了所有人以保持獨立，但這是強大還是恐懼？'],
  'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTJ_sitgas.png'
);

-- 3. INTJ 的 A/T 變體
INSERT INTO mbti_variant_nuances (mbti_type, variant, nuance_text) VALUES
('INTJ', 'A', '作為堅定型，你的決策帶有一種不可動搖的自信，較少受到外界雜訊干擾。你專注於長期目標的實現，對挫折的耐受度極高。'),
('INTJ', 'T', '作為動盪型，你對完美的追求近乎苛刻，這份焦慮正是你不斷優化的動力。你比常人更敏銳地察覺潛在風險，但也更容易感到疲憊。');

-- 4. INTJ 角色圖片
INSERT INTO mbti_character_images (mbti_type, image_url, image_alt, is_active) VALUES
('INTJ', 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTJ_sitgas.png', 'INTJ 戰略策劃家', true);

-- 5. INTJ 甜點配對
INSERT INTO mbti_dessert_mappings (
  mbti_type, dessert_name, dessert_description, dessert_image_url, dessert_cta_link,
  dessert_series, dessert_quad, drink_a, drink_t, alternative_desserts
) VALUES (
  'INTJ',
  '北海道經典巴斯克',
  '極致的濃度直達靈魂核心，理智與感官的完美角力。',
  'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767866456/BASQUE_CLASSIC_c6fb92.webp',
  'https://linktr.ee/moon_moon_dessert',
  '巴斯克',
  '經典',
  '美式咖啡',
  '冰滴咖啡',
  ARRAY[' 檸檬柚子千層', '茶香巴斯克']
);

-- 6. 測試用問題 (前 5 題)
INSERT INTO mbti_questions (question_id, text, image_url, dimension_pair, weight, option_a_label, option_a_value, option_b_label, option_b_value, display_order) VALUES
(1, '一週忙到爆，週五晚上你好不容易關上店門／下班回到家。此刻你最想做的是：', 'https://picsum.photos/seed/friday_night_vibe/800/400', 'EI', 2, '打開手機看朋友在哪裡，想問一句：「等等有沒有局？」', 'E', '把手機丟遠一點，泡個熱飲，誰傳訊息都先放著，想安靜一個人待著。', 'I', 1),
(2, '你被朋友臨時拉去一場幾乎全是陌生人的聚會／商務酒會，前 10 分鐘你的狀態通常是：', 'https://picsum.photos/seed/cocktail_party_blur/800/400', 'EI', 1, '先隨便抓一杯飲料，開始在場內繞一圈，找人搭話、認識新朋友。', 'E', '找到角落、牆邊或吧台的位置，先觀察氣氛，看看有沒有看起來聊得來的人。', 'I', 2),
(3, '當你腦中有一個還不成熟的想法時，你比較習慣：', 'https://picsum.photos/seed/lightbulb_sketch/800/400', 'EI', 1, '先說出來跟別人討論，在講的過程中慢慢長出完整的想法。', 'E', '先自己在腦中演練好幾輪，覺得差不多了才找人分享。', 'I', 3),
(4, '手機突然響起，是一通未知來電，你的第一反應是：', 'https://picsum.photos/seed/phone_ringing_dark/800/400', 'EI', 1, '有點好奇是什麼事，反正接起來再說。', 'E', '先皺一下眉，會猶豫要不要接，甚至讓它響完再回撥。', 'I', 4),
(5, '在一場團隊腦力激盪會議中，主持人說：「有想法就直接講！」你會：', 'https://picsum.photos/seed/meeting_room_abstract/800/400', 'EI', 1, '先丟幾個點子出來，不怕還不成熟，覺得先有東西再調整就好。', 'E', '先聽大家的想法，等自己腦中整理成一個比較完整的說法再開口。', 'I', 5);

COMMIT;

-- ============================================
-- 完成！基本測試資料已就緒
-- ============================================
-- 下一步：
-- 1. 在 Supabase SQL Editor 執行此檔案
-- 2. 回到 Table Editor 確認資料
-- 3. 使用 Supabase Dashboard 繼續新增其他 15 種 MBTI 類型
-- 4. 新增剩餘的 35 題測驗問題
