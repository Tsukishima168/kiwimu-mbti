# 🚀 技能：Git 安全部署流程

**建立日期：** 2026-03-01  
**狀態：** ✅ 已掌握  
**難度：** ⭐⭐☆☆☆ (入門-中級)

---

## 📌 概述

一鍵安全部署系統，適用於所有 Node.js 項目。包含 Git 推送、安全檢查、環境驗證等完整流程。

---

## 🎯 核心技能

### 1. **安全檢查**
- ✅ 掃描敏感文件（.env、密鑰等）
- ✅ 驗證 Git 歷史無洩露信息
- ✅ 檢查 .gitignore 配置
- ✅ 驗證構建輸出無敏感信息

### 2. **Git 工作流**
- ✅ `git pull` - 更新遠端代碼
- ✅ `git add -A` - 提交所有改動
- ✅ `git commit -m` - 帶時間戳的自動提交
- ✅ `git push origin [branch]` - 推送到遠端

### 3. **環境變數管理**
- ✅ 本地 `.env.local` 文件（不被 commit）
- ✅ Vercel/Firebase 環境變數配置
- ✅ 構建時環境變數注入

### 4. **構建驗證**
- ✅ npm install 依賴安裝
- ✅ npm run build 本地構建測試
- ✅ 掃描構建輸出安全性

---

## 📚 使用方式

### 基礎部署命令

```bash
# 進到任何項目
cd /Users/pensoair/Desktop/網路開發專案/[project-name]

# 執行一鍵安全部署
./deploy.sh
```

### 分步驟手動部署

```bash
# 1️⃣ 查看改動
git status

# 2️⃣ 添加改動
git add -A

# 3️⃣ 提交改動
git commit -m "🚀 修復 UI 問題"

# 4️⃣ 推送到 GitHub
git push origin main
```

### 一行命令部署

```bash
git pull origin main && git add -A && git commit -m "🚀 $(date '+%Y-%m-%d %H:%M:%S')" && git push origin main
```

---

## 🔐 安全防護檢查表

部署前必檢查：

- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 無未追蹤的密鑰文件
- [ ] Git 歷史中無敏感信息
- [ ] `package.json` 無個人信息
- [ ] 本地構建成功（`npm run build`）
- [ ] 構建輸出無密鑰洩露

---

## 🛠️ 進階技巧

### 查看詳細改動
```bash
git diff
```

### 查看 Commit 歷史
```bash
git log --oneline -10
```

### 取消最後一次提交
```bash
git reset HEAD~1
```

### 撤回推送（謹慎使用）
```bash
git push origin --force-with-lease HEAD~1
```

### 清理本地改動
```bash
git restore .
```

---

## 📊 部署平台

- **Vercel**：React/Next.js 主要部署平台
  - 自動檢測 Git push 觸發構建
  - 支持預覽分支
  - 自定義環境變數

- **Firebase**：Firestore/Hosting
  - 支持 Firestore 規則同步
  - 實時數據庫支持

---

## 🔗 相關項目

已安裝部署腳本的項目：

| 項目 | 框架 | 部署平台 |
|------|------|--------|
| color-of-kiwimu-mbti-lab-v5 | Vite + React | Vercel |
| Dessert-Booking | Next.js | Vercel |
| moonmoon-dessert-passport | Vite + React | Vercel |
| moonmoon-gacha | Vite + React | Vercel |
| patisserie-signage | Next.js | Vercel |
| penso-good-blog | Next.js | Vercel |
| moon_map_original | React | Vercel |
| PsycheWorld-Integration-Hub | React | Vercel |

---

## ⚠️ 常見問題

### Q: 為什麼要用 deploy.sh？
A: 自動進行安全檢查，確保沒有誤推敏感信息。

### Q: 如何檢查部署進度？
A: 訪問 [Vercel Dashboard](https://vercel.com/dashboard)

### Q: 部署失敗怎麼辦？
A: 
1. 檢查本地構建：`npm run build`
2. 檢查環境變數是否設置
3. 查看 Vercel 部署日誌

### Q: 能否撤回已推送的代碼？
A: 可以，但謹慎使用：
```bash
git push origin --force-with-lease HEAD~1
```

### Q: .env 文件應該怎麼管理？
A: 
- 本地保存 `.env.local`（不提交）
- 在 Vercel/Firebase 中設置環境變數
- 只提交 `.env.example` 作為模板

---

## 📖 相關命令速查

```bash
# Git 基礎
git status              # 查看當前狀態
git add -A              # 添加所有改動
git commit -m "msg"     # 提交改動
git push origin main    # 推送到遠端

# Git 查看
git log --oneline       # 查看提交歷史
git diff                # 查看詳細改動
git show [commit]       # 查看特定提交

# 部署
./deploy.sh             # 一鍵安全部署
npm run build           # 本地構建
npm run preview         # 預覽構建結果

# 安全
git restore .           # 放棄本地改動
git clean -fd           # 刪除未追蹤文件
```

---

## 🎓 學習資源

- [[Git 工作流程]]
- [[環境變數管理]]
- [[部署最佳實踐]]
- [[安全防護檢查表]]

---

## 📝 筆記

- 每次部署前都會進行安全掃描
- Vercel 自動檢測到 Git push 後自動部署
- 部署通常需要 1-3 分鐘
- 可在 Vercel Dashboard 查看部署日誌

---

**最後更新：** 2026-03-01
**版本：** v2.0 (完整安全版)
