-- V2 限時免費延長：原結束時間台灣時間 2026/11/30 23:59:59（不含 2026-12-01 00:00:00），
-- 店主 2026-11-03 決定延長至 2026/12/31 23:59。新的結束瞬間（不含）= 2027-01-01 00:00:00+08
-- = UTC 2026-12-31T16:00:00Z。原價 NT$99 不變，promo_id（v2_free_202611）不變。
--
-- 這個值必須與 shared/v2Promo.ts 的 V2_FREE_PROMO_ENDS_AT 一致
-- （shared/v2Promo.test.ts 會讀 supabase/migrations/ 內檔名排序最後一個含
-- v2_promo_unlocks_before_end 的 migration 來比對；再次延長時請新增一支同類 migration，不要改本檔）。
--
-- 套用順序：先套用本檔（放寬 DB 防線），再部署新的程式常數。
-- 反過來做會出現「頁面顯示還能領、DB 卻拒絕」的空窗。
-- 舊的 20261020100000_v2_promo_unlocks.sql 是已套用的歷史，不修改。
-- 不含 BEGIN／COMMIT：由套用工具包交易。
-- 既有資料的 created_at 都早於舊結束時間，因此新 CHECK 對既有資料必然成立。
ALTER TABLE public.v2_promo_unlocks DROP CONSTRAINT v2_promo_unlocks_before_end;
ALTER TABLE public.v2_promo_unlocks ADD CONSTRAINT v2_promo_unlocks_before_end CHECK (created_at < TIMESTAMPTZ '2027-01-01 00:00:00+08');
