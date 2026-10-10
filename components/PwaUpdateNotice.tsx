import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { acceptPwaUpdate, getPwaUpdateState, hasActiveQuiz, subscribePwaUpdates } from '../utils/pwaUpdates';
import './pwa-update.css';

export default function PwaUpdateNotice() {
  const state = useSyncExternalStore(subscribePwaUpdates, getPwaUpdateState, () => 'idle');
  const [dismissed, setDismissed] = useState(false);
  const [quizActive, setQuizActive] = useState(hasActiveQuiz);
  useEffect(() => {
    const observer = new MutationObserver(() => setQuizActive(hasActiveQuiz()));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  // A deferred notice must not obscure answers. Offer it again when the quiz
  // finishes, including V1.5 which does not persist a reloadable draft.
  useEffect(() => { if (!quizActive) setDismissed(false); }, [quizActive]);
  if (state === 'idle' || dismissed) return null;
  return <aside className="ku-update-notice" aria-label="網站更新">
    <div role="status"><strong>{state === 'failed' ? '暫時無法更新' : '有新版本可以使用'}</strong>
      <p>{quizActive ? '為了保留這次答案，請完成測驗後再更新。' : state === 'failed' ? '請確認網路後再試一次。' : '更新會重新開啟此頁。你也可以選擇稍後再更新。'}</p></div>
    <div className="ku-update-actions">
      <button type="button" onClick={() => setDismissed(true)} disabled={state === 'updating'}>稍後</button>
      <button type="button" onClick={() => { void acceptPwaUpdate(); }} disabled={quizActive || state === 'updating'}>{state === 'updating' ? '正在更新…' : quizActive ? '完成後可更新' : state === 'failed' ? '重試更新' : '更新頁面'}</button>
    </div>
  </aside>;
}
