# 🗄️ Supabase 整合計劃

## 📊 需要整合的資料庫機制

### 1. 會員資料收集 (User Management)

#### 表結構：`users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Firebase 同步
  firebase_uid TEXT UNIQUE NOT NULL,
  
  -- 基本資料
  email TEXT UNIQUE,
  display_name TEXT,
  photo_url TEXT,
  
  -- 登入提供者
  auth_provider TEXT, -- 'google', 'line', 'discord', 'anonymous'
  provider_id TEXT, -- LINE ID, Discord ID 等
  
  -- MBTI 資料
  latest_mbti_type TEXT, -- 'INTJ', 'ENFP' 等
  latest_identity TEXT,  -- 'A' 或 'T'
  mbti_history JSONB DEFAULT '[]'::jsonb, -- 歷史測驗記錄
  
  -- 用戶行為
  test_count INT DEFAULT 0, -- 測驗次數
  last_test_date TIMESTAMPTZ,
  first_test_date TIMESTAMPTZ,
  
  -- 統計資料
  total_visits INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  referred_users INT DEFAULT 0, -- 推薦的用戶數
  
  -- 會員狀態
  is_premium BOOLEAN DEFAULT FALSE,
  membership_level TEXT DEFAULT 'free', -- 'free', 'bronze', 'silver', 'gold'
  total_points INT DEFAULT 0,
  
  -- 時間戳記
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 軟刪除
  deleted_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mbti_type ON users(latest_mbti_type);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

### 2. 測驗結果記錄 (Test Results)

#### 表結構：`test_results`

```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 關聯用戶
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL,
  
  -- 測驗結果
  mbti_type TEXT NOT NULL, -- 'INTJ', 'ENFP' 等
  identity TEXT NOT NULL,  -- 'A' 或 'T'
  full_type TEXT GENERATED ALWAYS AS (mbti_type || '-' || identity) STORED,
  
  -- 詳細分數
  scores JSONB NOT NULL, -- { E: 45, I: 55, S: 40, N: 60, ... }
  percentages JSONB, -- 計算後的百分比
  
  -- 測驗答案
  answers JSONB, -- 完整答案記錄
  
  -- 裝置資訊
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  user_agent TEXT,
  ip_address TEXT,
  
  -- 來源追蹤
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  
  -- 測驗時間
  duration_seconds INT, -- 測驗耗時
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 分享資訊
  shared_count INT DEFAULT 0,
  shared_platforms JSONB DEFAULT '[]'::jsonb, -- ['line', 'ig_story']
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_mbti_type ON test_results(mbti_type);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
```

---

### 3. 內容管理 (MBTI Content)

#### 表結構：`mbti_content`

```sql
CREATE TABLE mbti_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- MBTI 類型
  mbti_type TEXT UNIQUE NOT NULL, -- 'INTJ', 'ENFP' 等
  
  -- 基本資訊
  title TEXT NOT NULL, -- '邏輯建築師'
  subtitle TEXT, -- 英文副標
  
  -- 核心內容
  core_analysis TEXT NOT NULL, -- 核心本質
  description TEXT, -- 簡短描述
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['好奇', '邏輯', '解構']
  
  -- Identity A/T 變體
  identity_a_name TEXT, -- '穩定型'
  identity_a_description TEXT,
  identity_t_name TEXT, -- '敏感型'
  identity_t_description TEXT,
  
  -- 職涯與關係
  career JSONB, -- { style: '...', advice: '...' }
  relationships JSONB, -- { style: '...', advice: '...', strengths: '...' }
  
  -- 視覺資源
  character_image_url TEXT, -- Cloudinary URL
  bg_color TEXT DEFAULT '#F9F7F5',
  
  -- 甜點配對
  dessert JSONB, -- { name: '...', imageUrl: '...', description: '...' }
  
  -- 稀有度
  rarity_rank INT, -- 1-16
  population_percentage DECIMAL(4,2), -- 2.50
  male_percentage DECIMAL(4,2),
  female_percentage DECIMAL(4,2),
  
  -- 名人原型
  celebrity_archetypes JSONB, -- [{ name: '愛因斯坦', ... }]
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- 版本控制
  version INT DEFAULT 1,
  is_published BOOLEAN DEFAULT TRUE,
  
  -- 時間戳記
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT -- 編輯者 email
);

-- 索引
CREATE INDEX idx_mbti_content_type ON mbti_content(mbti_type);
CREATE INDEX idx_mbti_content_published ON mbti_content(is_published);
```

---

### 4. 積分系統 (Points System)

#### 已在 `ARCHITECTURE_RECOMMENDATIONS.md` 中詳細說明

請參考該文件的積分系統設計。

---

### 5. 推薦系統 (Referrals)

#### 表結構：`referrals`

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 推薦人
  referrer_firebase_uid TEXT NOT NULL,
  referrer_mbti_type TEXT,
  
  -- 被推薦人
  referred_firebase_uid TEXT NOT NULL,
  referred_mbti_type TEXT,
  
  -- 推薦方式
  referral_code TEXT, -- 短碼
  share_method TEXT, -- 'link', 'line', 'ig_story'
  
  -- 轉換狀態
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  completed_at TIMESTAMPTZ, -- 完成測驗時間
  rewarded_at TIMESTAMPTZ, -- 給予獎勵時間
  reward_points INT DEFAULT 0, -- 獎勵積分
  
  -- 來源追蹤
  utm_source TEXT,
  utm_campaign TEXT,
  landing_page TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_referrals_referrer ON referrals(referrer_firebase_uid);
CREATE INDEX idx_referrals_referred ON referrals(referred_firebase_uid);
CREATE INDEX idx_referrals_status ON referrals(status);
```

---

### 6. 用戶行為追蹤 (User Actions)

#### 表結構：`user_actions`

```sql
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用戶
  firebase_uid TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  
  -- 行為類型
  action_type TEXT NOT NULL, -- 'page_view', 'share', 'download', 'click_cta'
  action_target TEXT, -- 'ig_story', 'dessert_order', 'line_oa'
  
  -- 行為詳情
  action_data JSONB, -- 額外資料
  
  -- 上下文
  page_path TEXT,
  referrer TEXT,
  
  -- 裝置
  device_type TEXT,
  user_agent TEXT,
  
  -- 時間戳記
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_actions_uid ON user_actions(firebase_uid);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at);

-- 時間序列分區（可選，數據量大時）
-- CREATE INDEX idx_user_actions_created_at_brin ON user_actions USING BRIN (created_at);
```

---

### 7. 訂單資料 (Orders) - 未來整合

#### 表結構：`orders`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用戶
  user_id UUID REFERENCES users(id),
  firebase_uid TEXT NOT NULL,
  
  -- 訂單資訊
  order_number TEXT UNIQUE NOT NULL, -- 'ORD-20260128-001'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  
  -- 商品
  items JSONB NOT NULL, -- [{ dessert_name: '...', quantity: 1, price: 150 }]
  total_amount DECIMAL(10,2) NOT NULL,
  points_used INT DEFAULT 0, -- 使用的積分
  points_earned INT DEFAULT 0, -- 獲得的積分
  
  -- 取貨資訊
  pickup_date DATE,
  pickup_time TEXT, -- '14:00-15:00'
  pickup_location TEXT DEFAULT 'Moon Moon Dessert',
  
  -- 聯絡資訊
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- 備註
  notes TEXT,
  special_requests TEXT,
  
  -- MBTI 相關
  ordered_mbti_dessert TEXT, -- 是否訂購了 MBTI 推薦的甜點
  mbti_type_at_order TEXT, -- 訂購時的 MBTI 類型
  
  -- 來源追蹤
  utm_source TEXT,
  utm_campaign TEXT,
  referral_code TEXT,
  
  -- 時間戳記
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

---

## 🔄 Firebase → Supabase 同步機制

### 方案 1：雙向同步（推薦）

```typescript
// utils/supabaseSync.ts

import { createClient } from '@supabase/supabase-js';
import { User } from 'firebase/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 同步 Firebase 用戶到 Supabase
 */
export async function syncUserToSupabase(firebaseUser: User) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        auth_provider: firebaseUser.providerData[0]?.providerId || 'unknown',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'firebase_uid'
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ User synced to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to sync user to Supabase:', error);
    throw error;
  }
}

/**
 * 儲存測驗結果到 Supabase
 */
export async function saveTestResultToSupabase(
  firebaseUid: string,
  mbtiType: string,
  identity: string,
  scores: any,
  answers: any,
  utmData?: any
) {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        firebase_uid: firebaseUid,
        mbti_type: mbtiType,
        identity: identity,
        scores: scores,
        answers: answers,
        utm_source: utmData?.utm_source,
        utm_medium: utmData?.utm_medium,
        utm_campaign: utmData?.utm_campaign,
        device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      })
      .select()
      .single();

    if (error) throw error;
    
    // 更新用戶統計
    await supabase.rpc('increment_test_count', {
      uid: firebaseUid,
      new_mbti: mbtiType,
      new_identity: identity
    });
    
    console.log('✅ Test result saved to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to save test result:', error);
    throw error;
  }
}

/**
 * 追蹤用戶行為
 */
export async function trackActionToSupabase(
  firebaseUid: string,
  actionType: string,
  actionTarget?: string,
  actionData?: any
) {
  try {
    await supabase
      .from('user_actions')
      .insert({
        firebase_uid: firebaseUid,
        action_type: actionType,
        action_target: actionTarget,
        action_data: actionData,
        page_path: window.location.pathname,
        device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
    
    console.log(`✅ Action tracked: ${actionType}`);
  } catch (error) {
    console.error('❌ Failed to track action:', error);
  }
}
```

### 方案 2：Supabase Edge Functions

```typescript
// supabase/functions/sync-firebase-user/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { firebaseUser, testResult } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // 同步用戶
  await supabase.from('users').upsert({
    firebase_uid: firebaseUser.uid,
    email: firebaseUser.email,
    // ... 其他資料
  });
  
  // 儲存測驗結果
  if (testResult) {
    await supabase.from('test_results').insert(testResult);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 🎯 實作優先順序

### Phase 1：基礎整合（1-2 週）
1. ✅ 建立 Supabase 專案
2. ✅ 建立 `users` 表
3. ✅ 建立 `test_results` 表
4. ✅ 實作 Firebase → Supabase 同步
5. ✅ 測試基本資料流

### Phase 2：內容管理（2-3 週）
6. ✅ 建立 `mbti_content` 表
7. ✅ 將現有 MBTI 內容匯入 Supabase
8. ✅ 建立內容管理後台（Supabase Dashboard 或自建）
9. ✅ 實作內容 API 與前端整合
10. ✅ 建立內容版本控制

### Phase 3：會員系統（3-4 週）
11. ✅ 建立積分系統表
12. ✅ 實作積分計算與獎勵邏輯
13. ✅ 建立推薦系統
14. ✅ 實作會員等級系統
15. ✅ 建立會員中心頁面

### Phase 4：數據分析（1-2 週）
16. ✅ 建立 `user_actions` 表
17. ✅ 實作完整的行為追蹤
18. ✅ 建立數據儀表板（Metabase / Grafana）
19. ✅ 設定定期報表

### Phase 5：訂單整合（2-3 週）
20. ✅ 建立 `orders` 表
21. ✅ 整合訂購流程
22. ✅ 實作訂單管理後台
23. ✅ 測試完整流程

---

## 📖 參考文件

- [Supabase 官方文檔](https://supabase.com/docs)
- [Firebase → Supabase 遷移指南](https://supabase.com/docs/guides/migrations/firebase)
- [Row Level Security (RLS) 最佳實踐](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🚀 立即開始

### 步驟 1：建立 Supabase 專案

```bash
# 1. 前往 https://supabase.com
# 2. 建立新專案
# 3. 複製 Project URL 和 anon key
# 4. 加入 .env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # 後端用
```

### 步驟 2：執行 SQL

```sql
-- 在 Supabase SQL Editor 中執行上面的表結構
-- 或使用 Supabase CLI:
supabase db push
```

### 步驟 3：整合到 App.tsx

```typescript
import { syncUserToSupabase, saveTestResultToSupabase } from './utils/supabaseSync';

// 在用戶登入時同步
useEffect(() => {
  if (currentUser && !currentUser.isAnonymous) {
    syncUserToSupabase(currentUser).catch(console.error);
  }
}, [currentUser]);

// 在完成測驗時儲存
const handleQuizComplete = async (answers: Option[]) => {
  // ... 現有邏輯 ...
  
  if (user && !user.isAnonymous) {
    await saveTestResultToSupabase(
      user.uid,
      mbtiType,
      identitySuffix,
      scores,
      answers,
      getUTMParams()
    );
  }
};
```

---

**Supabase 整合計劃已完成！** 🎉
