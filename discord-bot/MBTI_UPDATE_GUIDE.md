# MBTI 角色名稱和甜點配對更新

## 更新內容

### 新的MBTI人格名稱

已將所有 16 種 MBTI 類型從簡單名稱更新為詩意名稱：

- INTJ：戰略策劃家
- INTP：邏輯解構者
- ENTJ：天生指揮官
- ENTP：智力辯論家
- INFJ：深淵凝視者
- INFP：治癒系詩人
- ENFJ：光輝導師
- ENFP：熱血追夢人
- ISTJ：守序捍衛者
- ISFJ：溫柔守護者
- ESTJ：鐵血執行長
- ESFJ：熱心供給者
- ISTP：冷靜工匠
- ISFP：自由藝術家
- ESTP：極限挑戰者
- ESFP：閃耀巨星

### 專屬甜點配對

每種類型都有專屬推薦甜點：

- INTJ → 北海道經典巴斯克
- INTP → 檸檬柚子千層蛋糕
- ENTJ → 奶酒提拉米蘇
- ENTP → 柚子蘋果提拉米蘇
- INFJ → 茶香巴斯克
- INFP → 北海道十勝戚風蛋糕
- ENFJ → 檸檬蘋果戚風蛋糕
- ENFP → 草莓莓果千層蛋糕
- ISTJ → 經典十勝原味千層
- ISFJ → 經典烤布丁
- ESTJ → 鹹蛋黃巴斯克
- ESFJ → 莓果戚風蛋糕
- ISTP → 經典提拉米蘇
- ISFP → 抹茶提拉米蘇
- ESTP → 巧克力布朗尼千層
- ESFP → 綜合水果戚風蛋糕

## 如何手動更新

由於文件衝突，需要手動更新 `discord-bot/index.js`：

### Step 1：更新 MBTI_ROLE_MAPPING (第 24-58 行)

將以下內容替換：

```javascript
// MBTI 類型對應的身份組名稱
const MBTI_ROLE_MAPPING = {
    'INTJ-A': '🎯 INTJ 戰略策劃家',
    'INTJ-T': '🎯 INTJ 戰略策劃家',
    'INTP-A': '🔬 INTP 邏輯解構者',
    'INTP-T': '🔬 INTP 邏輯解構者',
    'ENTJ-A': '👑 ENTJ 天生指揮官',
    'ENTJ-T': '👑 ENTJ 天生指揮官',
    'ENTP-A': '💡 ENTP 智力辯論家',
    'ENTP-T': '💡 ENTP 智力辯論家',
    'INFJ-A': '🦉 INFJ 深淵凝視者',
    'INFJ-T': '🦉 INFJ 深淵凝視者',
    'INFP-A': '🌈 INFP 治癒系詩人',
    'INFP-T': '🌈 INFP 治癒系詩人',
    'ENFJ-A': '🌟 ENFJ 光輝導師',
    'ENFJ-T': '🌟 ENFJ 光輝導師',
    'ENFP-A': '✨ ENFP 熱血追夢人',
    'ENFP-T': '✨ ENFP 熱血追夢人',
    'ISTJ-A': '📋 ISTJ 守序捍衛者',
    'ISTJ-T': '📋 ISTJ 守序捍衛者',
    'ISFJ-A': '🤗 ISFJ 溫柔守護者',
    'ISFJ-T': '🤗 ISFJ 溫柔守護者',
    'ESTJ-A': '⚖️ ESTJ 鐵血執行長',
    'ESTJ-T': '⚖️ ESTJ 鐵血執行長',
    'ESFJ-A': '💝 ESFJ 熱心供給者',
    'ESFJ-T': '💝 ESFJ 熱心供給者',
    'ISTP-A': '🔧 ISTP 冷靜工匠',
    'ISTP-T': '🔧 ISTP 冷靜工匠',
    'ISFP-A': '🎨 ISFP 自由藝術家',
    'ISFP-T': '🎨 ISFP 自由藝術家',
    'ESTP-A': '⚡ ESTP 極限挑戰者',
    'ESTP-T': '⚡ ESTP 極限挑戰者',
    'ESFP-A': '🎭 ESFP 閃耀巨星',
    'ESFP-T': '🎭 ESFP 閃耀巨星'
};

// MBTI 類型專屬甜點配對
const DESSERT_PAIRING = {
    'INTJ': '北海道經典巴斯克',
    'INTP': '檸檬柚子千層蛋糕',
    'ENTJ': '奶酒提拉米蘇',
    'ENTP': '柚子蘋果提拉米蘇',
    'INFJ': '茶香巴斯克',
    'INFP': '北海道十勝戚風蛋糕',
    'ENFJ': '檸檬蘋果戚風蛋糕',
    'ENFP': '草莓莓果千層蛋糕',
    'ISTJ': '經典十勝原味千層',
    'ISFJ': '經典烤布丁',
    'ESTJ': '鹹蛋黃巴斯克',
    'ESFJ': '莓果戚風蛋糕',
    'ISTP': '經典提拉米蘇',
    'ISFP': '抹茶提拉米蘇',
    'ESTP': '巧克力布朗尼千層',
    'ESFP': '綜合水果戚風蛋糕'
};

// 取得甜點推薦
function getDessertPairing(mbtiType) {
    const baseType = mbtiType.replace('-A', '').replace('-T', '');
    return DESSERT_PAIRING[baseType] || '經典甜點';
}
```

### Step 2：更新 /verify 成功訊息 (約第 232-243 行)

在成功訊息中加入甜點推薦：

```javascript
// 成功訊息
const dessert = getDessertPairing(mbtiType);

await interaction.editReply({
    content:
        `✅ **驗證成功！歡迎登船，航行者！**\n\n` +
        `⛵ **你的性格類型：** ${result.mbtiType}\n` +
        `🎨 **已獲得身分組：** ${result.role}\n` +
        `🍰 **專屬甜點推薦：** ${dessert}\n\n` +
        `**現在你可以：**\n` +
        `• 存取你的專屬族群頻道\n` +
        `• 使用 \`/state\` 分享你的航行狀態\n` +
        `• 使用 \`/checkin\` 每日簽到賺積分\n` +
        `• 到月島甜點店品嚐你的專屬甜點\n\n` +
        `開始你的自由航行吧！🚀`
});
```

## 完成後

1. 儲存文件
2. 重啟 Bot：
   ```bash
   pkill -f "node index.js"
   npm start
   ```
3. 測試 `/verify` 指令，應該會顯示新的角色名稱和甜點推薦

## Discord 伺服器角色

**重要：** Discord 伺服器中的實際角色名稱也需要更新！

1. 進入伺服器設定 → 身份組
2. 逐一重新命名 16 個 MBTI 身份組
3. 或者重新執行 `setup-server.js`（會重新創建所有角色）

**注意：** 如果重新執行 setup-server.js，已有成員的角色會消失！
建議手動重新命名現有角色。
