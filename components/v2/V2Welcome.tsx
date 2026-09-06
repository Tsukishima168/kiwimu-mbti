import React from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { getSceneAsset } from '../../data/kiwimuVisualAssets';
import KiwimuScenePlate from '../visuals/KiwimuScenePlate';
import KiwimuAtlasWall from '../visuals/KiwimuAtlasWall';

export default function V2Welcome({ onStart, knownType }: { onStart?: () => void; knownType?: string | null }) {
  const scene = getSceneAsset(knownType || 'INFP-A');
  return (
    <main className="v2-surface ad-welcome">
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
          <div className="ad-btn-row">
            {onStart ? <button className="ad-btn-primary" type="button" onClick={onStart}>開始 40 題探索 <span aria-hidden="true">↗</span></button> : <a className="ad-btn-primary" href="/read/quiz">開始 40 題探索 <span aria-hidden="true">↗</span></a>}
            <a className="ad-btn-ghost" href={onStart ? '/read' : '/explore'}>{onStart ? '返回圖鑑入口' : '先做快速探索'}</a>
          </div>
          <p className="ad-welcome-note">選比較接近你的反應就好，兩個選項都沒有高下。完成後可免費試讀；完整報告仍在整理中。</p>
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
