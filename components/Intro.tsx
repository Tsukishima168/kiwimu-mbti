import React from 'react';
import type { AppUser } from '../types';
import { trackButtonClick } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface IntroProps {
  onStart: () => void;
  user: AppUser | null;
  onLogin: () => void;
  onViewArchive?: () => void;
  onLogout?: () => void;
}

const Intro: React.FC<IntroProps> = ({ onStart, user, onLogin, onViewArchive, onLogout }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 fade-in relative overflow-hidden">

      {/* Language Toggle in top-left corner */}
      <div className="absolute top-6 left-6 z-50">
        <LanguageToggle />
      </div>

      {/* Login button in top-right corner */}
      {!user || user.isAnonymous ? (
        <button
          onClick={() => { trackButtonClick('登入', 'intro_header'); onLogin(); }}
          className="absolute top-6 right-6 px-6 py-2 border border-kiwi-dark text-kiwi-dark hover:bg-kiwi-dark hover:text-white transition-all duration-300 font-bold text-sm z-50"
        >
          {t('login')}
        </button>
      ) : (
        <div className="absolute top-6 right-6 z-50 group">
          <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
            <span className="text-sm font-medium">{user.displayName || user.email}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
                  <span className="px-2 py-0.5 bg-kiwi-dark text-white text-xs rounded-full font-mono">0</span>
                </div>
              </button>
            )}
            {/* Settings Shortcut */}
            <button
              onClick={() => { trackButtonClick('設定', 'intro_dropdown'); if (onViewArchive) onViewArchive(); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6" />
                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                <path d="M1 12h6m6 0h6" />
                <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
              </svg>
              <span>{t('settings')}</span>
            </button>
            {onLogout && (
              <button
                onClick={() => { trackButtonClick('登出', 'intro_dropdown'); onLogout(); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-700"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 裝飾性背景文字 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold text-gray-100 select-none -z-10 pointer-events-none opacity-50">
        MBTI
      </div>

      <div className="flex flex-col items-center z-10 max-w-md w-full text-center">

        {/* 圓形動畫容器 */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl mb-12 relative group cursor-pointer bg-gray-100"
          onClick={() => { trackButtonClick('進入_圓形', 'intro_main'); onStart(); }}
        >
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cW13djJidTVwZ2YxdnlrcHRwZGFuNmExdGZnbDN4eW85YXZiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif"
            alt="KIWIMU Intro"
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-display text-xl tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t('enter')}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-[0.08em] text-kiwi-dark mb-4">
          {t('kiwimu_universe')}
        </h1>

        <p className="text-xs font-mono text-gray-500 mb-2 tracking-[0.3em] uppercase">
          {t('discover_inner_self')}
        </p>
        <p className="text-sm font-serif text-gray-400 mb-12 italic leading-relaxed px-4">
          {t('soft_understanding')}
        </p>

        <button
          onClick={() => { trackButtonClick('Start_開始旅程', 'intro_main'); onStart(); }}
          className="px-12 py-4 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-bold tracking-[0.2em] text-sm uppercase hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          {t('start_journey')}
        </button>

        {(!user || user.isAnonymous) && (
          <button
            onClick={() => { trackButtonClick('登入_誘因', 'intro_main'); onLogin(); }}
            className="mt-4 text-xs font-serif text-kiwi-dark underline decoration-kiwi-dark/30 hover:decoration-kiwi-dark opacity-80 hover:opacity-100 transition-all"
          >
            {t('login_prompt')}
          </button>
        )}

        {/* Social Proof - Gentle & Minimal */}
        <div className="mt-10 space-y-2 opacity-70 hover:opacity-100 transition-opacity">
          <p className="text-xs text-gray-500 tracking-wider font-serif">
            {t('tested_users').split('<count>')[0]}<span className="font-semibold text-gray-700">10,000+</span>{t('tested_users').split('<count>')[1]}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-2.5 h-2.5 fill-current text-yellow-400" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-mono text-gray-400">4.9/5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
