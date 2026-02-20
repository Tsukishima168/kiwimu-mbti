# IG Story 預覽（僅限本地）

此資料夾的預覽頁面 **不會被部署** 到正式環境，僅供本地開發使用。

## 檔案

- **一頁看全部（推薦）**
  - `index.html` - 同一個頁面用下拉選單切換 32 款，直接在這裡看
- **單一／切換預覽**
  - `ig-story-preview.html` - INTJ 單一範例
  - `ig-story-preview-all.html` - 全部 16 種人格（下拉切換）

- **全部獨立 Story 檔（32 個）**
  - `ig-story-INTJ-A.html`、`ig-story-INTJ-T.html` … 每種人格各 A / T 一檔
  - 檔名格式：`ig-story-{類型}-{A|T}.html`

- **產生腳本**
  - `generate-all-stories.cjs` - 重新產生上述 32 個 HTML（IG Story 用）
  - 執行：`node dev-previews/generate-all-stories.cjs`
  - 左上角品牌：在腳本裡改 `BRAND_LABEL`，例如 `'2K7'` 或 `'KIWIMU-MBTI-LAB'`，再執行即可產出對應版本

## 使用方式

1. **直接開啟**：在 Finder 中雙擊任一 HTML，或用瀏覽器開啟
   - 例：`file:///path/to/project/dev-previews/ig-story-INFP-A.html`

2. **用本地 server 開整個資料夾**：
   ```bash
   npx serve dev-previews
   ```
   然後訪問 http://localhost:3000/ 可選任一檔案

**產出 IG 用圖**  
- **方式一**：執行 `node dev-previews/export-story-images.cjs`，會把 32 張 PNG 存到 **`dev-previews/output/`**（需先 `npm install -D puppeteer`）。  
- **方式二**：用瀏覽器開 `index.html` 或任一 `ig-story-*.html`，對 Story 區塊截圖（360×640）上傳。
