# Kiwimu MBTI Lab V5 - 重大更新紀錄與商業藍圖

> [!NOTE] 
> 本文件已整理最新修復紀錄與未來「Penso System」商業漏斗擴張策略，請將此文件或內容直接複製/轉載至您的 Obsidian 知識庫中。

---

## 🔧 第一部分：重大更新紀錄 (2026-02-20)

**狀況背景**：Vite / Vercel 部署持續發生失敗。  
**核心根因**：
1. **框架語法衝突**：專案內殘留了部分 Next.js 頁面環境的生命週期元件（如 `LanguageSwitcher.tsx`、`performance.ts`），導致 Vercel 建置環境誤判為 Next.js 專案而使用錯誤方式編譯。
2. **TypeScript 型別嚴格檢查阻隔**：Vite 環境在打包時預設會啟動嚴格審查，加上 Google Analytics（`gtag`）全域變數宣告因為在多個檔案中使用了不同的可選修飾符號 (Optional Modifiers) 產生了衝突，進而導致編譯中斷。而在 `supabase/client.ts` 查詢資料轉型階段，推斷為 `never` 也引發了型別錯誤。

**修復具體行動**：
- [x] **打理配置**：更新 `tsconfig.json`，匯入 `"vite/client"` 前端相關型別，並將 `docs`, `api` 等封存的舊框架目錄加進 `exclude` 排除檢查，阻絕無效的舊檔案干擾。
- [x] **型別統一宣告**：重構 `types.ts` 型別庫，統一定義 `declare global { interface Window { gtag?: any; } }`，解決所有埋點追蹤檔的錯誤。
- [x] **防禦性型別處理**：針對 `supabase/client.ts` 的 `getResultData` 等查詢函式，加上 `any` 斷言作為緩衝封裝，解決未知資料型態拋出的 `never` 推斷問題，確保部署順利放行。
- [x] **清除地雷元件**：隱藏與 Vite 衝突的未使用元件（修改檔名結尾為 `.bak` 封存）。

---

## 🚀 第二部分：Kiwimu IP 未來商業藍圖 (Funnel Strategy & Ecosystem)

根據「AI 魔術師 (AI Magician)」定位及「Penso System」的漏斗模型架構（KNOW-BUILD-TEAM-CREATE-PLAY-SHARE），這座 MBTI 甜點測驗實驗室是「**低門檻／免費吸客 (Top of Funnel)**」的重要支點，未來的擴張與打通策略規劃如下：

### 1. 國際化與病毒式行銷擴散 (Viral Marketing Strategy)
- **視覺社交貨幣化**：目前的多語系架構（英、日、韓）已經齊備。為引爆國際平台（Instagram Reels, TikTok, YouTube Shorts），最後輸出的「測驗結果卡（Result Card）」必須無比精美滿版，讓用戶「覺得貼在自己限動上極具品味」，打造這款測驗的稀缺性與高級感。
- **微短影音鉤子 (Hooks)**：製作「如果你的 MBTI 是一道甜點...」短影音（不到 15 秒），開頭下猛藥展現極致精美的動畫或插圖，留言區引導或 Bio 放連結：「🔗點擊預約進入大宇宙實驗室」。
- **心理共鳴的迷因 (Meme)**：針對每種 MBTI 的痛點與「神經質」，用 Kiwimu（奇威鳥）IP 製作插畫迷因梗圖放進不同的國際社群中，吸引用戶認同並主動轉發。

### 2. 會員無縫留存：Firebase 導入與個人紀錄 (Lead Generation)
目前測驗全為面費單次遊玩，但它應該成為你搜集「第一方數據（1st Party Data）」的最佳管道。透過「誘因」來讓登入成為升級體驗，而非門檻：
- **引導登入誘因**：
  1. 「建立機密檔案卡，解鎖歷年或每個階段的性格變化曲線」。
  2. 「解鎖隱藏版性格解構與深度測驗主題」。
  3. 「取得專屬配對碼，測試你與伴侶/朋友的心電感應默契（需雙方登入比對）」。
- **技術實作藍圖**：
  - 接入 **Firebase Auth** 實現極低摩擦的登入（Google 一鍵登入、LINE 登入）。
  - 利用 **Firestore** 建立 `users` 與 `test_results` 集合，綁定用戶的 UID。
  - **轉換機制**：累積的這批用戶資料，可以透過 N8N 與 Resend（Email）等工具，精準推送你的進階產品、$499 Starter Kit 課程或線下甜點店活動。

### 3. IP 認知強化：隱形主理人「Kiwimu」的故事彩蛋 (Easter Eggs)
這不只是個測驗網站，這是「AI 魔術師」展示魔法的伸展台。延續我們在 Moon&Moon Dessert Passport 專案中備受好評的彩蛋模式，將真實故事巧妙植入：
- **觸發機制設計**：
  - 測驗首頁背景某顆不會動的怪異星星，或連續點擊最底部的「Kiwimu 標誌」 5 次。
  - 或在測驗問題某一題選項，選了一個極度極端的答案時，突然進入「奇威鳥的精神時光屋」。
- **彩蛋內容呈現**：
  - 網頁燈光變暗，跳出精緻的「密封信件 (Sealed Envelope)」動畫。
  - 拆開信件後，以輕柔深刻的文字與插畫，帶出你的「真實起源」：從原本的廣播主持、動畫設計、行銷總監、開甜點店，到最後化身為帶給人們希望的「AI 魔術師 Kiwimu」。
  - 傳遞核心啟示：「MBTI 不該是用來限制自己的標籤，而是一次找回自我光芒的旅程。Kiwimu 也是在迷失後才找到魔法的。」
- **私域轉換呼籲 (CTA)**：
  - 在這封隱藏信件的結尾，附上一個直通 Telegram 秘密頻道或你私人 Instagram 粉絲團的獨家「鑰匙連結」。這樣透過彩蛋篩選出來的流量，絕對是具備最高共鳴、最高黏著度的潛在鐵粉 (Super Fans)。
