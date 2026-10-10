import React from 'react';
import type { AppUser } from '../types';
import { trackButtonClick } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { V2_REPORT_PRICE_TWD } from '../shared/v2Product';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { KIWIMU_CAMPAIGN_ASSETS } from '../data/kiwimuVisualAssets';
import './quiz-ui.css';

interface IntroProps {
  onStart: () => void;
  user: AppUser | null;
  onLogin: () => void;
  onViewArchive?: () => void;
  onLogout?: () => void;
}

const Intro: React.FC<IntroProps> = ({ onStart, user, onLogin, onViewArchive, onLogout }) => {
  const { t, language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const entry = {
    zh: { choose: '選擇你的探索方式', v1: 'V1｜經典人格', v1Detail: '40 題・測驗與結果免費', v1Start: '開始 V1', v2: 'V2｜敘事探索', v2Detail: '40 個生活情境・第 01 章免費', v2Price: `完整報告 NT$${V2_REPORT_PRICE_TWD}・單次解鎖`, v2Start: '開始 V2', quick: '想先輕鬆看看？V1.5 五題狀態探索', note: '依此刻的感受回答，讓結果成為理解自己的起點。' },
    en: { choose: 'Choose your exploration', v1: 'V1 | Classic personality', v1Detail: '40 questions · Free quiz and results', v1Start: 'Start V1', v2: 'V2 | Narrative exploration', v2Detail: '40 everyday situations · Chapter 01 free', v2Price: `Full report NT$${V2_REPORT_PRICE_TWD} · One-time unlock`, v2Start: 'Start V2', quick: 'A lighter start? V1.5: five questions about today', note: 'Answer from how you feel today. Let the result start a conversation with yourself.' },
    ja: { choose: '自分に合う入口を選ぶ', v1: 'V1｜いつもの人格', v1Detail: '40問・診断と結果は無料', v1Start: 'V1を始める', v2: 'V2｜日常の物語', v2Detail: '40の日常場面・第01章は無料', v2Price: `完全版 NT$${V2_REPORT_PRICE_TWD}・1回の購入で解放`, v2Start: 'V2を始める', quick: 'まずは気軽に：V1.5、今の気持ちを5問で', note: '今の気持ちで答えて、自分を理解するきっかけに。' },
    ko: { choose: '나에게 맞는 탐색 선택', v1: 'V1｜기본 성격', v1Detail: '40문항 · 테스트와 결과 무료', v1Start: 'V1 시작', v2: 'V2｜이야기 탐색', v2Detail: '40가지 일상 상황 · 01장 무료', v2Price: `전체 보고서 NT$${V2_REPORT_PRICE_TWD} · 한 번 결제`, v2Start: 'V2 시작', quick: '가볍게 시작하기: V1.5 오늘의 상태 5문항', note: '지금의 마음으로 답하고, 나를 이해하는 출발점으로 삼아 보세요.' },
  }[language];

  return (
    <div className="classic-intro flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 fade-in relative overflow-hidden">

      {/* Language Toggle in top-left corner */}
      <div className="absolute top-6 left-6 z-50">
        <LanguageToggle />
      </div>

      {/* Login button in top-right corner */}
      {!user || user.isAnonymous ? (
        <button
          onClick={() => { trackButtonClick('登入', 'intro_header'); onLogin(); }}
          className="absolute top-6 right-6 min-h-11 px-6 py-2 border border-kiwi-dark text-kiwi-dark hover:bg-kiwi-dark hover:text-white transition-all duration-300 font-bold text-sm z-50"
        >
          {t('login')}
        </button>
      ) : (
        <details className="absolute top-6 right-6 z-50 ku-account-menu">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
            <span className="max-w-28 truncate text-sm font-medium">{user.displayName || user.email}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          {/* Native details also opens with touch and keyboard. */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 ">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">{t('logged_in')}</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.displayName || user.email || `${t('user_prefix')} ${user.uid.slice(0, 8)}`}
              </p>
            </div>
            <button
              onClick={() => { trackButtonClick('開始測驗', 'intro_dropdown'); onStart(); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{t('start_test')}</span>
            </button>
            {onViewArchive && (
              <button
                onClick={() => { trackButtonClick('我的檔案館', 'intro_dropdown'); onViewArchive(); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span>{t('my_archive')}</span>
                  </div>
                </div>
              </button>
            )}
            {onLogout && (
              <button
                onClick={() => { trackButtonClick('登出', 'intro_dropdown'); onLogout(); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-700"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </details>
      )}

      {/* 裝飾性背景文字 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold text-gray-100 select-none -z-10 pointer-events-none opacity-50">
        MBTI
      </div>

      <div className="flex flex-col items-center z-10 max-w-md w-full text-center">

        {/* 圓形動畫容器 */}
        <button
          type="button"
          aria-label={entry.v1Start}
          className="ku-orbit-frame w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mt-16 mb-6 relative group cursor-pointer bg-gray-100"
          onClick={() => { trackButtonClick('進入_圓形', 'intro_main'); onStart(); }}
        >
          <img
            src={reducedMotion ? KIWIMU_CAMPAIGN_ASSETS.landingHero.src : 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cW13djJidTVwZ2YxdnlrcHRwZGFuNmExdGZnbDN4eW85YXZiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif'}
            alt=""
            width={256}
            height={256}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-display text-xl tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t('enter')}</span>
          </div>
        </button>

        <p className="ku-site-kicker mb-5">01 / Personality lab</p>

        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-[0.04em] md:tracking-[0.08em] text-balance text-kiwi-dark mb-4">
          {t('kiwimu_universe')}
        </h1>

        <p className="text-xs font-mono text-gray-500 mb-2 tracking-[0.3em] uppercase">
          {t('discover_inner_self')}
        </p>
        <p className="text-sm font-serif text-gray-400 mb-6 italic leading-relaxed px-4">
          {t('soft_understanding')}
        </p>

        <nav className="ku-quiz-entry" aria-label={entry.choose}>
          <p className="ku-quiz-entry__heading">{entry.choose}</p>
          <div className="ku-quiz-entry__choices">
            <button className="ku-quiz-entry__choice" onClick={() => { trackButtonClick('V1_經典人格', 'intro_version'); onStart(); }}>
              <strong>{entry.v1}</strong>
              <span>{entry.v1Detail}</span>
              <span className="ku-quiz-entry__cta">{entry.v1Start} ↗</span>
            </button>
            <a className="ku-quiz-entry__choice ku-quiz-entry__choice--v2" href="/read?from=mbti_version_entry" onClick={() => trackButtonClick('V2_敘事探索', 'intro_version')}>
              <strong>{entry.v2}</strong>
              <span>{entry.v2Detail}</span>
              <span>{entry.v2Price}</span>
              <span className="ku-quiz-entry__cta">{entry.v2Start} ↗</span>
            </a>
          </div>
          <a className="ku-quiz-entry__quick" href="/explore?from=mbti_version_entry">{entry.quick} ↗</a>
          <a className="ku-quiz-entry__quick" href="/read/library">{{ zh: '我的已購報告', en: 'My purchased reports', ja: '購入済みレポート', ko: '구매한 보고서' }[language]} ↗</a>
        </nav>

        {(!user || user.isAnonymous) && (
          <button
            onClick={() => { trackButtonClick('登入_誘因', 'intro_main'); onLogin(); }}
            className="mt-4 min-h-11 text-sm font-serif text-kiwi-dark underline decoration-kiwi-dark/30 hover:decoration-kiwi-dark opacity-80 hover:opacity-100 transition-colors"
          >
            {t('login_prompt')}
          </button>
        )}

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-gray-600">{entry.note}</p>
      </div>
    </div>
  );
};

export default Intro;
