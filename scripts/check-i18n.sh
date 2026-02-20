#!/bin/bash

# i18n 遷移自動檢查腳本
# 在部署前運行此腳本，確保所有配置都正確

echo "=== Next.js i18n 遷移檢查 ==="
echo ""

ERRORS=0

# 1. 檢查必要的文件
echo "✓ 檢查必要的文件..."
FILES=(
  "package.json"
  "next.config.ts"
  "i18n.ts"
  "middleware.ts"
  "app/[locale]/layout.tsx"
  "app/page.tsx"
  "messages/en.json"
  "messages/ja.json"
  "messages/ko.json"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ✗ 缺少文件: $file"
    ((ERRORS++))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "  ✓ 所有必要文件都存在"
fi

# 2. 檢查翻譯文件
echo ""
echo "✓ 檢查翻譯文件..."

LOCALES=("en" "ja" "ko")
for locale in "${LOCALES[@]}"; do
  file="messages/${locale}.json"
  
  # 檢查文件是否有效 JSON
  if ! jq . "$file" > /dev/null 2>&1; then
    echo "  ✗ 無效的 JSON 文件: $file"
    ((ERRORS++))
  fi
  
  # 檢查是否有嵌套結構
  key_count=$(jq 'keys | length' "$file")
  if [ "$key_count" -lt 5 ]; then
    echo "  ⚠ 警告: $file 中翻譯鍵數少於 5 個"
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "  ✓ 所有翻譯文件格式正確"
fi

# 3. 檢查 package.json 依賴
echo ""
echo "✓ 檢查依賴..."

REQUIRED_DEPS=("next" "next-intl" "react" "react-dom")
for dep in "${REQUIRED_DEPS[@]}"; do
  if ! grep -q "\"$dep\"" package.json; then
    echo "  ✗ 缺少依賴: $dep"
    ((ERRORS++))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "  ✓ 所有必要依賴都已安裝"
fi

# 4. 檢查 next.config.ts
echo ""
echo "✓ 檢查 Next.js 配置..."

if ! grep -q "locales.*en.*ja.*ko" next.config.ts; then
  echo "  ✗ next.config.ts 中缺少語言配置"
  ((ERRORS++))
fi

# 5. 檢查 middleware.ts
echo ""
echo "✓ 檢查 middleware..."

if ! grep -q "middleware" middleware.ts; then
  echo "  ✗ middleware.ts 配置不完整"
  ((ERRORS++))
fi

# 6. 檢查構建
echo ""
echo "✓ 嘗試構建項目..."
if ! npm run build > /tmp/build.log 2>&1; then
  echo "  ✗ 構建失敗"
  tail -20 /tmp/build.log
  ((ERRORS++))
else
  echo "  ✓ 構建成功"
fi

# 7. 檢查靜態生成
echo ""
echo "✓ 檢查靜態頁面生成..."

if [ -d ".next/server/app" ]; then
  en_pages=$(find .next -name "*en*" -type f | wc -l)
  ja_pages=$(find .next -name "*ja*" -type f | wc -l)
  ko_pages=$(find .next -name "*ko*" -type f | wc -l)
  
  echo "  ✓ 英文頁面: $en_pages"
  echo "  ✓ 日文頁面: $ja_pages"
  echo "  ✓ 韓文頁面: $ko_pages"
  
  if [ $en_pages -eq 0 ] || [ $ja_pages -eq 0 ] || [ $ko_pages -eq 0 ]; then
    echo "  ⚠ 警告: 某些語言的頁面可能未生成"
  fi
else
  echo "  ⚠ 警告: 無法找到構建輸出"
fi

# 最終報告
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ 所有檢查通過！可以部署到 Vercel"
else
  echo "❌ 發現 $ERRORS 個錯誤。請在部署前修復"
  exit 1
fi
