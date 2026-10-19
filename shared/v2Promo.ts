// V2 限時免費解鎖的唯一時窗定義。client 只拿來決定顯示文案；
// 是否能新領取由 server（/api/v2/promo-claim）以 server 時間判斷，DB 另有常數防線。
// 活動以上線時間為起點，沒有開始時間；結束時間不含當下（台灣時間 12/01 00:00:00 起不可再領）。
// 台灣沒有日光節約時間，明確寫出 +08:00 後以 epoch 比較，與執行環境時區無關。
export const V2_FREE_PROMO_ID = 'v2_free_202611';
export const V2_FREE_PROMO_ENDS_AT = '2026-12-01T00:00:00+08:00';
export const V2_FREE_PROMO_ENDS_AT_MS = Date.parse(V2_FREE_PROMO_ENDS_AT);
// 顯示用固定字串，不經 toLocaleString，避免海外瀏覽器把時間換算成當地時區。
export const V2_FREE_PROMO_END_LABEL = '2026/11/30 23:59';

export function isV2FreePromoActive(nowMs: number = Date.now()): boolean {
  return Number.isFinite(nowMs) && nowMs < V2_FREE_PROMO_ENDS_AT_MS;
}
