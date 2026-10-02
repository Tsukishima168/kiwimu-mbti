import React, { useEffect, useState } from 'react';
import { getAuthSupabaseClient } from '../../utils/supabaseAuthBridge';
import { applyRuntimeSeo } from '../../utils/seo';
import { getV2VariantSummary } from '../../data/v2VariantSummaries.generated';
import { getSceneAsset } from '../../data/kiwimuVisualAssets';
import KiwimuVisual from '../visuals/KiwimuVisual';
import V2AccountBar from './V2AccountBar';
import { loginWithGoogle, useSupabaseAuth } from './useSupabaseAuth';
import './v2-tailwind.css';
import './v2.css';
import './v2-dark.css';

type PurchasedReport = {
  mbtiType: string;
  amount: number;
  currency: string;
  purchasedAt: string | null;
  reference: string;
  receiptStatus: 'pending' | 'sending' | 'sent' | 'failed' | 'review';
};
type LibraryData = {
  reports: PurchasedReport[];
  claimableReport: { mbtiType: string; amount: number; currency: string } | null;
};

async function accountRequest(operation: string, body: object = {}) {
  const supabase = getAuthSupabaseClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error('AUTH_REQUIRED');
  const response = await fetch(`/api/v2/${operation}`, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) throw new Error(payload?.code || 'REQUEST_FAILED');
  return payload.data;
}

function requestMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  if (code === 'AUTH_REQUIRED') return '登入已失效，請重新登入後查看。';
  if (code === 'VERIFIED_EMAIL_REQUIRED') return '請使用已驗證 Email 的帳號登入，才能保存報告及收到通知信。';
  if (code === 'ALREADY_LINKED' || code === 'CLAIM_CONFLICT') return '這份報告已保存到另一個帳號，請使用原帳號登入。';
  return '暫時無法讀取，請稍後再試。你的付款紀錄會保留。';
}

export default function V2ReportLibrary() {
  const auth = useSupabaseAuth();
  const [data, setData] = useState<(LibraryData & { ownerId: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    applyRuntimeSeo({ title: '我的已購報告｜Kiwimu', description: '登入後查看保存在帳號中的 Kiwimu 深度報告與付款紀錄。', canonical: 'https://kiwimu.com/read/library', robots: 'noindex,nofollow' });
  }, []);

  useEffect(() => {
    setData(null);
    if (!auth.userId) return;
    let cancelled = false;
    const ownerId = auth.userId;
    setLoading(true);
    void accountRequest('my-reports').then(payload => {
      if (!cancelled) setData({ ...payload, ownerId });
    }).catch(error => { if (!cancelled) setMessage(requestMessage(error)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth.userId, refresh]);

  const library = data?.ownerId === auth.userId ? data : null;
  const handleClaim = async () => {
    setBusy('claim'); setMessage('');
    try {
      await accountRequest('claim-report');
      setMessage('報告已保存到這個帳號。下次登入，就能在這裡繼續閱讀。');
      setRefresh(value => value + 1);
    } catch (error) { setMessage(requestMessage(error)); }
    finally { setBusy(''); }
  };
  const handleReceipt = async (reference: string) => {
    setBusy(reference); setMessage('');
    try {
      const result = await accountRequest('receipt', { reference });
      setMessage(result.receiptStatus === 'sent'
        ? '付款通知已送出，請查看信箱或垃圾郵件。'
        : '付款紀錄已保存，通知信尚未寄出。你仍可直接打開報告閱讀。');
      setRefresh(value => value + 1);
    } catch (error) { setMessage(requestMessage(error)); }
    finally { setBusy(''); }
  };

  return (
    <div className="v2-app ad-library-shell"><main className="v2-surface ad-library">
      <V2AccountBar />
      <header className="ad-library-heading">
        <p className="ad-section-kicker">YOUR READING SHELF</p>
        <h1>你的報告，留在這裡。</h1>
        <p>換一台手機、換一個步調，都能用購買時的同一個帳號，接著讀下去。</p>
      </header>
      {auth.isLoading ? <p role="status">正在確認登入狀態…</p> : !auth.isLoggedIn ? (
        <section className="ad-library-empty">
          <h2>登入，找回你的已購報告。</h2>
          <p>請使用購買時的帳號。若先前未登入就付款，請在原付款裝置登入，再把報告保存到帳號。</p>
          <button type="button" className="ad-btn-primary" onClick={() => { void loginWithGoogle({ onError: setMessage }); }}>登入查看我的報告 ↗</button>
        </section>
      ) : (
        <>
          <p className="ad-library-account">目前帳號 <strong>{auth.email || '已登入'}</strong></p>
          {loading ? <p role="status">正在找出你保存的報告…</p> : null}
          {library?.claimableReport ? <section className="ad-library-claim">
            <p className="ad-section-kicker">SAVE YOUR PURCHASE</p>
            <h2>把 {library.claimableReport.mbtiType} 保存到帳號。</h2>
            <p>這台裝置上有一份已付款的報告。保存至目前帳號後，你就能在其他裝置登入閱讀。</p>
            <p>請先確認上方帳號正確；保存後會歸屬這個帳號，付款通知也會寄到這個帳號的 Email。</p>
            <button type="button" className="ad-btn-primary" disabled={Boolean(busy)} onClick={handleClaim}>{busy === 'claim' ? '正在保存…' : '保存這份已購報告'}</button>
          </section> : null}
          {library?.reports.length === 0 ? <section className="ad-library-empty">
            <h2>這個帳號還沒有已購報告。</h2>
            <p>如果你已經付款，請確認是否用了另一個帳號。匿名付款的舊報告，需在原付款裝置登入保存。</p>
            <a className="ad-btn-ghost" href="/read">返回圖鑑入口 ↗</a>
          </section> : null}
          <div className="ad-library-grid">
            {library?.reports.map(report => {
              const summary = getV2VariantSummary(report.mbtiType);
              const scene = getSceneAsset(report.mbtiType);
              return <article key={report.reference} className="ad-library-card">
                {scene ? <a className="ad-library-art" href={`/read/${report.mbtiType}`} aria-label={`閱讀 ${report.mbtiType} 報告`}><KiwimuVisual asset={scene.portrait} fit="cover" /></a> : null}
                <div className="ad-library-card-copy">
                  <p className="ad-section-kicker">{report.mbtiType} · 已購買</p>
                  <h2>{summary?.title || 'Kiwimu 深度報告'}</h2>
                  <p>{report.currency === 'TWD' ? 'NT$' : report.currency + ' '}{report.amount}{report.purchasedAt ? ` · ${new Date(report.purchasedAt).toLocaleDateString('zh-TW')}` : ''}</p>
                  <a className="ad-btn-primary" href={`/read/${report.mbtiType}`}>繼續閱讀 ↗</a>
                  <details className="ad-library-receipt"><summary>查看付款紀錄</summary>
                    <p>付款紀錄 <span>{report.reference}</span></p>
                    <p>{report.receiptStatus === 'sent' ? '付款通知已送出，請查看信箱或垃圾郵件。' : '付款已確認，通知信尚未寄出；報告可正常閱讀。'}</p>
                    {report.receiptStatus !== 'sent' && report.receiptStatus !== 'review' ? <button type="button" className="ad-btn-ghost" disabled={Boolean(busy)} onClick={() => { void handleReceipt(report.reference); }}>{busy === report.reference ? '正在處理…' : '寄送付款通知'}</button> : null}
                  </details>
                </div>
              </article>;
            })}
          </div>
          {!loading && !library ? <button type="button" className="ad-btn-ghost" onClick={() => setRefresh(value => value + 1)}>重新讀取</button> : null}
        </>
      )}
      {message ? <p className="ad-library-message" role="status">{message}</p> : null}
    </main></div>
  );
}
