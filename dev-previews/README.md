# IG Story 預覽（僅限本地）

此資料夾的預覽頁面 **不會被部署** 到正式環境，僅供本地開發使用。

## 檔案

- **單一／切換預覽**
  - `ig-story-preview.html` - INTJ 單一範例
  - `ig-story-preview-all.html` - 全部 16 種人格（下拉切換）

- **全部獨立 Story 檔（32 個）**
  - `ig-story-INTJ-A.html`、`ig-story-INTJ-T.html` … 每種人格各 A / T 一檔
  - 檔名格式：`ig-story-{類型}-{A|T}.html`

- **產生腳本**
  - `generate-all-stories.cjs` - 重新產生上述 32 個 HTML
  - 執行：`node dev-previews/generate-all-stories.cjs`

## 使用方式

1. **直接開啟**：在 Finder 中雙擊任一 HTML，或用瀏覽器開啟
   - 例：`file:///path/to/project/dev-previews/ig-story-INFP-A.html`

2. **用本地 server 開整個資料夾**：
   ```bash
   npx serve dev-previews
   ```
   然後訪問 http://localhost:3000/ 可選任一檔案
