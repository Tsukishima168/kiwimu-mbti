#!/bin/bash

# 🚀 一鍵安全部署腳本
# 使用方式：./deploy.sh

set -e  # 有錯誤就停止

# 顏色定義（讓輸出更清楚）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   🚀 Kiwimu MBTI 一鍵安全部署${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================
# 步驟 1：安全檢查（檢查是否有敏感文件）
# =============================================
echo -e "${YELLOW}[步驟 1/5]${NC} 🔒 安全檢查..."

# 檢查是否有未 commit 的敏感文件
if git status | grep -E "\.env|firebase.*key|secret" > /dev/null; then
    echo -e "${RED}❌ 錯誤：發現未提交的敏感文件${NC}"
    echo "請先用以下命令清理："
    echo "  git restore ."
    exit 1
fi

if [ -f ".env" ] || [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  檢測到本地 .env 文件（不會被提交，這是正確的）${NC}"
fi

echo -e "${GREEN}✅ 安全檢查通過${NC}"
echo ""

# =============================================
# 步驟 2：更新代碼
# =============================================
echo -e "${YELLOW}[步驟 2/5]${NC} 📥 更新代碼..."
git pull origin main
echo -e "${GREEN}✅ 代碼已更新${NC}"
echo ""

# =============================================
# 步驟 3：添加改動並 Commit
# =============================================
echo -e "${YELLOW}[步驟 3/5]${NC} 📝 提交改動..."

# 檢查是否有改動
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}ℹ️  無新改動需要提交${NC}"
else
    echo "🔄 發現 $(git status --porcelain | wc -l) 個改動"
    git add -A
    
    # 自動生成 commit 消息
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    git commit -m "🚀 自動部署 - $TIMESTAMP"
    echo -e "${GREEN}✅ 改動已提交${NC}"
fi
echo ""

# =============================================
# 步驟 4：推送到 GitHub
# =============================================
echo -e "${YELLOW}[步驟 4/5]${NC} ⬆️  推送到 GitHub..."
git push origin main
echo -e "${GREEN}✅ 已推送到 GitHub${NC}"
echo ""

# =============================================
# 步驟 5：本地驗證構建（可選）
# =============================================
echo -e "${YELLOW}[步驟 5/5]${NC} 🔨 驗證構建..."
npm run build > /dev/null 2>&1 && BUILD_OK=true || BUILD_OK=false

if [ "$BUILD_OK" = true ]; then
    echo -e "${GREEN}✅ 構建成功${NC}"
    # 檢查是否有洩露密鑰
    if grep -r "FIREBASE_API_KEY\|SUPABASE_ANON_KEY\|SECRET" dist/ 2>/dev/null > /dev/null; then
        echo -e "${RED}⚠️  警告：可能在 dist 中洩露了敏感信息${NC}"
    else
        echo -e "${GREEN}✅ 無敏感信息洩露${NC}"
    fi
else
    echo -e "${RED}⚠️  構建失敗，但代碼已推送${NC}"
    echo "請檢查錯誤信息"
fi
echo ""

# =============================================
# 完成
# =============================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📌 接下來會發生什麼：${NC}"
echo "   Vercel 會自動檢測到你的 Git push"
echo "   開始自動構建和部署（約 1-3 分鐘）"
echo ""
echo -e "${BLUE}📊 查看部署狀態：${NC}"
echo "   訪問: https://vercel.com/dashboard"
echo ""
echo -e "${BLUE}🌐 訪問你的網站：${NC}"
echo "   https://your-domain.vercel.app"
echo ""
