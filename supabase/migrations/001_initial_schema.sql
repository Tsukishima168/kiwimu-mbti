-- ============================================
-- KIWIMU MBTI Lab - Supabase Database Schema
-- ============================================
-- 這個 Schema 設計讓你可以透過 Supabase Dashboard 直接管理所有內容
-- 包括題目、結果、圖片、甜點配對等

-- ============================================
-- 1. 測驗題目表 (mbti_questions)
-- ============================================
CREATE TABLE IF NOT EXISTS mbti_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER UNIQUE NOT NULL, -- 對應原本的 id (1-40)
  text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  dimension_pair TEXT NOT NULL CHECK (dimension_pair IN ('EI', 'SN', 'TF', 'JP', 'AT')),
  weight INTEGER DEFAULT 1 CHECK (weight IN (1, 2)),
  option_a_label TEXT NOT NULL,
  option_a_value TEXT NOT NULL CHECK (option_a_value IN ('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P', 'A', 'Turbulent')),
  option_b_label TEXT NOT NULL,
  option_b_value TEXT NOT NULL CHECK (option_b_value IN ('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P', 'A', 'Turbulent')),
  display_order INTEGER NOT NULL, -- 顯示順序
  is_active BOOLEAN DEFAULT true, -- 是否啟用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_questions_dimension ON mbti_questions(dimension_pair);
CREATE INDEX IF NOT EXISTS idx_questions_order ON mbti_questions(display_order);
CREATE INDEX IF NOT EXISTS idx_questions_active ON mbti_questions(is_active);

-- ============================================
-- 2. MBTI 結果資料表 (mbti_results)
-- ============================================
CREATE TABLE IF NOT EXISTS mbti_results (
  id TEXT PRIMARY KEY, -- MBTI 類型，如 'INTJ', 'ENFP'
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  quote TEXT NOT NULL,
  keywords TEXT[] NOT NULL, -- 關鍵字陣列
  bg_color TEXT NOT NULL DEFAULT '#FFFFFF',
  
  -- 核心分析
  core_analysis TEXT NOT NULL,
  
  -- 維度分析 (JSONB 儲存)
  dimension_analysis JSONB NOT NULL DEFAULT '{}',
  
  -- 優勢與盲點
  strengths TEXT[] NOT NULL,
  blind_spots TEXT[] NOT NULL,
  
  -- 職涯建議 (JSONB)
  career JSONB NOT NULL DEFAULT '{}',
  
  -- 關係建議 (JSONB)
  relationships JSONB NOT NULL DEFAULT '{}',
  
  -- 其他
  social_style TEXT NOT NULL,
  growth_advice TEXT NOT NULL,
  soul_questions TEXT[] NOT NULL,
  
  -- 角色圖片
  character_image_url TEXT NOT NULL,
  
  -- 甜點配對 (JSONB)
  dessert JSONB NOT NULL DEFAULT '{}',
  
  -- 版本控制
  version TEXT DEFAULT 'v1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_results_active ON mbti_results(is_active);

-- ============================================
-- 3. A/T 變體差異表 (mbti_variant_nuances)
-- ============================================
CREATE TABLE IF NOT EXISTS mbti_variant_nuances (
  id SERIAL PRIMARY KEY,
  mbti_type TEXT NOT NULL REFERENCES mbti_results(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'T')),
  nuance_text TEXT NOT NULL, -- A/T 變體的差異描述
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mbti_type, variant)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_variant_type ON mbti_variant_nuances(mbti_type);

-- ============================================
-- 4. 角色圖片管理表 (mbti_character_images)
-- ============================================
CREATE TABLE IF NOT EXISTS mbti_character_images (
  id SERIAL PRIMARY KEY,
  mbti_type TEXT NOT NULL REFERENCES mbti_results(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  cloudinary_id TEXT, -- Cloudinary 的 ID，方便管理
  version TEXT, -- 圖片版本號
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_char_images_type ON mbti_character_images(mbti_type);
CREATE INDEX IF NOT EXISTS idx_char_images_active ON mbti_character_images(is_active);

-- 每個類型只能有一個啟用的圖片（partial unique index）
CREATE UNIQUE INDEX IF NOT EXISTS idx_char_images_unique_active 
  ON mbti_character_images(mbti_type) 
  WHERE is_active = true;

-- ============================================
-- 5. 甜點配對表 (mbti_dessert_mappings)
-- ============================================
CREATE TABLE IF NOT EXISTS mbti_dessert_mappings (
  id SERIAL PRIMARY KEY,
  mbti_type TEXT NOT NULL REFERENCES mbti_results(id) ON DELETE CASCADE,
  dessert_name TEXT NOT NULL,
  dessert_description TEXT NOT NULL,
  dessert_image_url TEXT NOT NULL,
  dessert_cta_link TEXT NOT NULL,
  dessert_series TEXT, -- 系列：提拉米蘇、戚風、千層、巴斯克
  dessert_quad TEXT, -- 象限：經典、深色、亮色、果香
  drink_a TEXT, -- A 型推薦飲品
  drink_t TEXT, -- T 型推薦飲品
  alternative_desserts TEXT[], -- 替代甜點陣列
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_dessert_type ON mbti_dessert_mappings(mbti_type);
CREATE INDEX IF NOT EXISTS idx_dessert_active ON mbti_dessert_mappings(is_active);

-- 每個類型只能有一個啟用的甜點配對（partial unique index）
CREATE UNIQUE INDEX IF NOT EXISTS idx_dessert_unique_active 
  ON mbti_dessert_mappings(mbti_type) 
  WHERE is_active = true;

-- ============================================
-- 6. 維度說明表 (dimension_explanations)
-- ============================================
CREATE TABLE IF NOT EXISTS dimension_explanations (
  id SERIAL PRIMARY KEY,
  dimension_key TEXT UNIQUE NOT NULL, -- 'E/I', 'S/N', 'T/F', 'J/P', 'A/T'
  label TEXT NOT NULL,
  explanation_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. 更新時間觸發器 (自動更新 updated_at)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有表添加觸發器
CREATE TRIGGER update_mbti_questions_updated_at BEFORE UPDATE ON mbti_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbti_results_updated_at BEFORE UPDATE ON mbti_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbti_variant_nuances_updated_at BEFORE UPDATE ON mbti_variant_nuances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbti_character_images_updated_at BEFORE UPDATE ON mbti_character_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbti_dessert_mappings_updated_at BEFORE UPDATE ON mbti_dessert_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dimension_explanations_updated_at BEFORE UPDATE ON dimension_explanations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Row Level Security (RLS) 設定
-- ============================================
-- 這些表是公開讀取，但只有管理員可以寫入
-- 你可以在 Supabase Dashboard 設定 Policy

-- 啟用 RLS
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_variant_nuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_character_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_dessert_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_explanations ENABLE ROW LEVEL SECURITY;

-- 公開讀取 Policy（所有人都可以讀）
CREATE POLICY "Public read access" ON mbti_questions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON mbti_results FOR SELECT USING (true);
CREATE POLICY "Public read access" ON mbti_variant_nuances FOR SELECT USING (true);
CREATE POLICY "Public read access" ON mbti_character_images FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON mbti_dessert_mappings FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON dimension_explanations FOR SELECT USING (is_active = true);

-- 管理員寫入 Policy（需要透過 Supabase Dashboard 手動設定）
-- 或者你可以建立一個 admin_users 表來管理權限

-- ============================================
-- 9. 視圖 (Views) - 方便查詢
-- ============================================
-- 完整的結果視圖（包含所有相關資料）
CREATE OR REPLACE VIEW mbti_results_full AS
SELECT 
  r.*,
  ci.image_url as current_character_image,
  dm.dessert_name,
  dm.dessert_description,
  dm.dessert_image_url,
  dm.dessert_cta_link,
  dm.drink_a,
  dm.drink_t,
  dm.alternative_desserts
FROM mbti_results r
LEFT JOIN mbti_character_images ci ON r.id = ci.mbti_type AND ci.is_active = true
LEFT JOIN mbti_dessert_mappings dm ON r.id = dm.mbti_type AND dm.is_active = true
WHERE r.is_active = true;

-- 題目視圖（包含選項）
CREATE OR REPLACE VIEW mbti_questions_full AS
SELECT 
  id,
  question_id,
  text,
  image_url,
  dimension_pair,
  weight,
  jsonb_build_object(
    'label', option_a_label,
    'value', option_a_value
  ) as option_a,
  jsonb_build_object(
    'label', option_b_label,
    'value', option_b_value
  ) as option_b,
  display_order,
  is_active
FROM mbti_questions
WHERE is_active = true
ORDER BY display_order;

-- ============================================
-- 完成！
-- ============================================
-- 現在你可以：
-- 1. 在 Supabase Dashboard 的 Table Editor 直接編輯資料
-- 2. 使用 SQL Editor 執行複雜查詢
-- 3. 透過 API 從前端讀取資料
-- 4. 建立後台管理介面（可選）
