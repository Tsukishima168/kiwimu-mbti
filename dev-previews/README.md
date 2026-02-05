# IG Story 預覽（僅限本地）

此資料夾的預覽頁面 **不會被部署** 到正式環境，僅供本地開發使用。

## 檔案

- `ig-story-preview.html` - INTJ 單一範例預覽
- `ig-story-preview-all.html` - 全部 16 種人格類型預覽（可切換）

## 使用方式

1. **直接開啟**：在 Finder 中雙擊 HTML 檔案，或用瀏覽器開啟
   - `file:///path/to/project/dev-previews/ig-story-preview-all.html`

2. **透過 npm 指令**（可選）：
   ```bash
   npx serve dev-previews
   ```
   然後訪問 http://localhost:3000/ig-story-preview-all.html
