import React from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { getSceneAsset } from '../../data/kiwimuVisualAssets';
import KiwimuScenePlate from '../visuals/KiwimuScenePlate';
import KiwimuAtlasWall from '../visuals/KiwimuAtlasWall';
import V2AccountBar from './V2AccountBar';
import { V2_REPORT_PRICE_TWD } from '../../shared/v2Product';

export default function V2Welcome({ onStart, knownType, resumeCount, onResume }: {
  onStart?: () => void; knownType?: string | null; resumeCount?: number; onResume?: () => void;
}) {
  const scene = getSceneAsset(knownType || 'INFP-A');
  return (
    <main className="v2-surface ad-welcome">
      <V2AccountBar />
      <div className="ad-welcome-masthead"><span>KIWIMU / QUIET ATLAS</span><span>自我探索圖鑑 · VOL. 02</span></div>
      <div className="ad-welcome-layout">
        <section className="ad-welcome-copy">
          <p className="ad-welcome-eyebrow">給自己一段閱讀的時間</p>
          <h1>你有自己的樣子。<br /><em>也有此刻的狀態。</em></h1>
          <p className="ad-welcome-lead">有時想靠近世界，有時想把音量轉小。從生活裡的反應出發，讀讀你如何保護自己，以及還想留給自己什麼。</p>
          <dl className="ad-welcome-facts">
            <div><dt>生活情境</dt><dd>{V2_TAIWAN_QUESTIONS.length}<span>題</span></dd></div>
            <div><dt>閱讀視角</dt><dd>32<span>種</span></dd></div>
            <div><dt>你的步調</dt><dd className="ad-welcome-pace">慢慢來</dd></div>
          </dl>
          {knownType ? <p className="ad-welcome-known">上次的入口座標 <strong>{knownType}</strong> · 也可以重新探索。</p> : null}
          {resumeCount && onResume ? <aside className="atlas-quiz-resume" aria-label="接續未完成的測驗">
            <p>已完成 <strong>{resumeCount} / {V2_TAIWAN_QUESTIONS.length} 題</strong>。可以從上次停下的地方接著回答。</p>
            <button className="ad-btn-primary" type="button" onClick={onResume}>接著答第 {resumeCount + 1} 題 <span aria-hidden="true">↗</span></button>
          </aside> : null}
          <div className="ad-btn-row">
            {onStart ? <button className={resumeCount ? 'ad-btn-ghost' : 'ad-btn-primary'} type="button" onClick={onStart}>{resumeCount ? '重新開始 40 題' : '開始 40 題探索'} <span aria-hidden="true">↗</span></button> : <a className="ad-btn-primary" href="/read/quiz">開始 40 題探索 <span aria-hidden="true">↗</span></a>}
            <a className="ad-btn-ghost" href={onStart ? '/read' : '/explore'}>{onStart ? '返回圖鑑入口' : '先做快速探索'}</a>
          </div>
          <p className="ad-welcome-note">測驗與第 01 章試讀免費；完整 V2 報告 NT${V2_REPORT_PRICE_TWD}，單次解鎖。</p>
          {onStart ? <p className="ad-welcome-note">作答進度暫存在這個分頁，24 小時內可重新整理後續答，不會同步到帳號或其他裝置。</p> : null}
          {import.meta.env.VITE_V2_CHECKOUT_ENABLED !== 'true' ? <p className="ad-welcome-note">目前尚未開放新購買。已購報告可從「我的報告」繼續閱讀。</p> : null}
        </section>
        <aside className="ad-welcome-art" aria-label="Kiwimu 敘事圖鑑選頁">
          {scene ? <KiwimuScenePlate asset={scene} priority indexLabel="圖鑑選頁" /> : null}
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
