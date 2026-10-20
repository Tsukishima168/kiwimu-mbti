-- V2 限時免費解鎖紀錄（活動至台灣時間 2026/11/30 23:59:59）。
-- 這不是付款：不進 line_pay_orders、不計營收、不寄收據、不發商家 Discord 通知。
-- 套用順序：先套用本檔，再部署會讀寫這張表的程式。可重複執行。
--
-- 結束防線的選擇：用「有預設值的 created_at」對常數做 CHECK，而不是 CHECK 內呼叫 now()
-- 或在 trigger 內比對 now()。
--   * CHECK 只能放不會變的判斷；常數比較對既有資料永遠成立，pg_dump／restore 不受影響。
--   * trigger 內比對 now() 會在 12/01 之後 restore 時拒絕舊資料（COPY 會觸發 trigger）。
--   * created_at 由 DB 以 now() 預設帶入；service_role 只拿到不含 created_at 的欄位級 INSERT
--     權限，API 無法自填較早的時間繞過防線。延長活動需同時改程式常數與本 CHECK。
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TABLE IF NOT EXISTS public.v2_promo_unlocks (
  user_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mbti_type TEXT NOT NULL CHECK (mbti_type ~ '^[EI][NS][TF][JP]-[AT]$'),
  promo_id TEXT NOT NULL CHECK (promo_id ~ '^[a-z0-9_]{1,40}$'),
  source TEXT NULL CHECK (source IS NULL OR source ~ '^[A-Za-z0-9_.-]{1,80}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 主鍵讓重複領取冪等，也讓每個帳號最多 32 列（16 型 × A/T）。
  CONSTRAINT v2_promo_unlocks_pkey PRIMARY KEY (user_uid, mbti_type),
  CONSTRAINT v2_promo_unlocks_before_end
    CHECK (created_at < TIMESTAMPTZ '2026-12-01 00:00:00+08')
);

ALTER TABLE public.v2_promo_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_promo_unlocks FORCE ROW LEVEL SECURITY;

-- 瀏覽器角色完全沒有權限；service_role 只能讀與新增（不含 created_at），不能改或刪。
REVOKE ALL ON TABLE public.v2_promo_unlocks FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.v2_promo_unlocks TO service_role;
GRANT INSERT (user_uid, mbti_type, promo_id, source) ON TABLE public.v2_promo_unlocks TO service_role;

DROP POLICY IF EXISTS v2_promo_unlocks_service_only ON public.v2_promo_unlocks;
CREATE POLICY v2_promo_unlocks_service_only ON public.v2_promo_unlocks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.v2_promo_unlocks IS
  'V2 free promo grants. Not payments: no revenue, receipt or merchant notification. Server-only.';

NOTIFY pgrst, 'reload schema';
COMMIT;
