import React, { useEffect, useId, useRef, useState } from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { getSceneAsset } from '../../data/kiwimuVisualAssets';
import KiwimuScenePlate from '../visuals/KiwimuScenePlate';
import KiwimuAtlasWall from '../visuals/KiwimuAtlasWall';
import V2AccountBar from './V2AccountBar';
import { v2WelcomePricing } from '../../utils/v2PromoCopy';
import { getV2VariantSummary } from '../../data/v2VariantSummaries.generated';

export default function V2Welcome({ onStart, knownType, resumeCount, onResume, draftSaved = true, focusAction = false }: {
  onStart?: () => void; knownType?: string | null; resumeCount?: number; onResume?: () => void; draftSaved?: boolean; focusAction?: boolean;
}) {
  const hasDraft = Boolean(resumeCount && onResume);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const entryRef = useRef<HTMLButtonElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const confirmationId = useId();
  useEffect(() => {
    if (focusAction) entryRef.current?.focus();
  }, [focusAction]);
  useEffect(() => {
    if (confirmRestart) keepRef.current?.focus();
  }, [confirmRestart]);
  const cancelRestart = () => {
    setConfirmRestart(false);
    restartRef.current?.focus();
  };
  const scene = getSceneAsset(knownType || 'INFP-A');
  const pricing = v2WelcomePricing();
  return (
    <main className="v2-surface ad-welcome">
      <V2AccountBar editionLabel="自我探索圖鑑" />
      <div className="ad-welcome-layout">
        <section className="ad-welcome-copy">
          <p className="ad-welcome-eyebrow">{hasDraft ? '繼續未完成的測驗' : '40 個生活情境，認識自己的反應'}</p>
          <h1>{hasDraft ? <>你的進度還在。<br /><em>準備好，就繼續。</em></> : <>你有自己的樣子。<br /><em>也有此刻的狀態。</em></>}</h1>
          {!hasDraft ? <>
            <p className="ad-welcome-lead">每題選一個比較像你的反應。答完後，看看你如何與人相處、面對工作，以及對應的甜點故事。</p>
            <dl className="ad-welcome-facts">
              <div><dt>生活情境</dt><dd>{V2_TAIWAN_QUESTIONS.length}<span>題</span></dd></div>
              <div><dt>閱讀視角</dt><dd>32<span>種</span></dd></div>
              <div><dt>你的步調</dt><dd className="ad-welcome-pace">慢慢來</dd></div>
            </dl>
          </> : null}
          {knownType && !hasDraft ? <p className="ad-welcome-known">上次的測驗結果 <strong>{knownType}</strong> · 也可以重新探索。</p> : null}
          {hasDraft ? <aside className="atlas-quiz-resume" aria-label="接續未完成的測驗">
            <p>已完成 <strong>{resumeCount} / {V2_TAIWAN_QUESTIONS.length} 題</strong>，不必從頭再答。</p>
            <button ref={entryRef} className="ad-btn-primary" type="button" onClick={onResume}>接著答第 {resumeCount! + 1} 題 <span aria-hidden="true">→</span></button>
            <p className="ad-welcome-note" role={draftSaved ? undefined : 'status'}>{draftSaved
              ? '進度只留在這個分頁，24 小時內可續答；關閉分頁或換裝置後可能無法接續。'
              : '目前無法暫存進度。可以在這裡暫停，但請不要重新整理或關閉此分頁。'}</p>
          </aside> : null}
          <p className="ad-welcome-note ad-welcome-pricing"><strong>{pricing.lead}</strong><br />{pricing.detail}</p>
          <div className="ad-btn-row">
            {onStart ? (hasDraft
              ? <button ref={restartRef} className="ad-welcome-secondary ad-welcome-restart" type="button" aria-expanded={confirmRestart} aria-controls={confirmRestart ? confirmationId : undefined} onClick={() => confirmRestart ? cancelRestart() : setConfirmRestart(true)}>重新開始 40 題</button>
              : <button ref={entryRef} className="ad-btn-primary" type="button" onClick={onStart}>開始 40 題探索 <span aria-hidden="true">→</span></button>)
              : <a className="ad-btn-primary" href="/read/quiz">開始 40 題探索 <span aria-hidden="true">→</span></a>}
            {confirmRestart ? <section id={confirmationId} className="ad-restart-confirm" aria-label="確認重新開始" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); cancelRestart(); } }}>
              <p>重新開始會清除已答的 {resumeCount} 題。要從第 1 題重來嗎？</p>
              <div className="ad-btn-row">
                <button ref={keepRef} className="ad-btn-primary" type="button" onClick={cancelRestart}>保留目前進度</button>
                <button className="ad-btn-ghost" type="button" onClick={onStart}>清除並重新開始</button>
              </div>
            </section> : null}
            {!hasDraft ? <a className="ad-welcome-secondary" href={onStart ? '/read' : '/explore'}>{onStart ? '了解測驗與報告' : '改做 V1.5 快速測驗'}</a> : null}
          </div>
          {onStart && !hasDraft ? <p className="ad-welcome-note">中途可按「暫停作答」，回來再繼續。進度只留在此分頁，不會同步到帳號；請在 24 小時內完成。</p> : null}
          {!pricing.promo && import.meta.env.VITE_V2_CHECKOUT_ENABLED !== 'true' ? <p className="ad-welcome-note">目前尚未開放新購買。已購報告可從「我的報告」繼續閱讀。</p> : null}
        </section>
        <aside className="ad-welcome-art" aria-label="Kiwimu 敘事圖鑑選頁">
          {scene ? <KiwimuScenePlate asset={scene} title={getV2VariantSummary(scene.fullType)?.title} priority indexLabel="圖鑑選頁" /> : null}
          <KiwimuAtlasWall highlight={knownType} caption="16 種人格 × A / T · 32 種閱讀視角" />
        </aside>
      </div>
      <section className="ad-welcome-guide" aria-label="這份圖鑑怎麼讀">
        <div><span>從反應開始</span><h2>把日常，放進畫面裡。</h2><p>聚會、工作、訊息與休息。熟悉的情境，讓你比較容易辨認自己的習慣。</p></div>
        <div><span>讀懂保護方式</span><h2>也看看，習慣的另一面。</h2><p>一種做法能替你省力，也可能有代價。報告把兩面放在一起，留給你判斷。</p></div>
        <div><span>帶回生活</span><h2>挑一件小事，試著做。</h2><p>從一個問題、一次對話或短暫停頓開始。讀到有感的地方，再多留一會兒。</p></div>
      </section>
      <p className="ad-welcome-colophon">這是一份以 MBTI 與 A/T 為入口的敘事探索。狀態名稱是閱讀提示，由型別對應，尚非獨立的近期狀態測量。</p>
    </main>
  );
}
