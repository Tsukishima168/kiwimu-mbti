import React, { useEffect, useState } from 'react';
import { ExplorePersonality } from '../../data/questions-explore';
import { Language } from '../../contexts/LanguageContext';
import { trackButtonClick } from '../../utils/analytics';

const tk = {
  ink:   '#1A1A1A',
  paper: '#F8F8F5',
  acid:  '#CCFF00',
  muted: '#888880',
} as const;

interface Props {
  language:    Language;
  mbtiType:    string;
  suffix:      'A' | 'T';
  personality: ExplorePersonality;
  quizVersion: 'A' | 'B';
  resultCopy: {
    stateLabel: string;
    coreLabel: string;
    saysLabel: string;
    shareLabel: string;
    shareButton: string;
    shareCopied: string;
    retestButton: string;
    fullQuizButton: string;
    stickerButton: string;
  };
  onRetest:    () => void;
}

const SHARE_TITLES: Record<Language, string> = {
  zh: 'Kiwimu 狀態測驗',
  en: 'Kiwimu State Test',
  ja: 'Kiwimu 状態テスト',
  ko: 'Kiwimu 상태 테스트',
};

const SHARE_TEXT_BUILDERS: Record<Language, (state: string, core: string) => string> = {
  zh: (state, core) => `我是「${state}」的 Kiwimu — ${core}`,
  en: (state, core) => `I got "${state}" on Kiwimu — ${core}`,
  ja: (state, core) => `今日の私は「${state}」だった。${core}`,
  ko: (state, core) => `오늘의 나는 "${state}" 상태였어. ${core}`,
};

const VARIANT_LABELS: Record<Language, Record<'A' | 'T', string>> = {
  zh: { A: '堅定型', T: '動盪型' },
  en: { A: 'ASSERTIVE', T: 'TURBULENT' },
  ja: { A: '自信型', T: '敏感型' },
  ko: { A: '확신형', T: '격동형' },
};

export default function ExploreResult({ language, mbtiType, suffix, personality, quizVersion, resultCopy, onRetest }: Props) {
  const fullType = `${mbtiType}-${suffix}`;
  const v2ReportUrl = `/read/${fullType}?utm_source=mbti-lab&utm_medium=result-cta&utm_campaign=2026-q2-kiwimu-v2&utm_content=explore-result-v2&source=v15_result`;
  const passportUrl = `https://passport.kiwimu.com?utm_source=mbti-lab&utm_medium=result-cta&utm_campaign=2026-q2-kiwimu-routing&utm_content=explore-result-passport&mbti_type=${mbtiType}&variant=${suffix}`;
  const [copied, setCopied] = useState(false);
  const shareUrl = new URL('/explore', window.location.origin);
  shareUrl.searchParams.set('v', quizVersion.toLowerCase());
  shareUrl.searchParams.set('lang', language);
  const bodyFontFamily =
    language === 'ja'
      ? "'Noto Sans JP', 'Inter', sans-serif"
      : language === 'ko'
        ? "'Noto Sans KR', 'Inter', sans-serif"
        : language === 'zh'
          ? "'Noto Sans TC', 'Inter', sans-serif"
          : "'Inter', sans-serif";

  useEffect(() => {
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'explore_complete', {
        mbti_type:    mbtiType,
        suffix,
        full_type:    fullType,
        state:        personality.state,
        quiz_version: quizVersion,
      });
    }
  }, []);

  const handleShare = async () => {
    const url = shareUrl.toString();
    const headline = SHARE_TEXT_BUILDERS[language](personality.state, personality.core);
    const text = `${headline}\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: SHARE_TITLES[language], text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* cancelled */ }
  };

  return (
    <div style={{ minHeight: '100svh', background: tk.paper, display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 24px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Type badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '4px 10px', border: `1.5px solid ${tk.ink}` }}>
            {fullType}
          </span>
        </div>

        {/* State */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: tk.muted, marginBottom: 12 }}>
          {resultCopy.stateLabel}
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 10vw, 56px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
          {personality.state}
        </h1>

        {/* Core */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: tk.muted, marginBottom: 10 }}>
          {resultCopy.coreLabel}
        </div>
        <p style={{ fontSize: 15, color: tk.muted, marginBottom: 24, lineHeight: 1.5, fontFamily: bodyFontFamily }}>
          {personality.core}
        </p>

        {/* Character */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, marginLeft: -24, marginRight: -24 }}>
          {personality.imageUrl ? (
            <img src={personality.imageUrl} alt={`Kiwimu ${personality.state}`} style={{ width: '100%', maxWidth: 320, height: 320, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 240, height: 240, background: tk.acid, border: `1.5px solid ${tk.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: tk.ink }}>kiwimu</div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1.5, background: tk.ink, marginBottom: 32 }} />

        {/* Kiwimu says */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: tk.muted, marginBottom: 12 }}>
            {resultCopy.saysLabel}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: tk.ink, fontFamily: bodyFontFamily }}>
            「{personality.kiwimuSays}」
          </p>
        </div>

        {/* Share card */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: tk.muted, marginBottom: 10 }}>
            {resultCopy.shareLabel}
          </div>
          <div style={{ border: `1.5px solid ${tk.ink}`, background: tk.paper, padding: '28px 24px', boxShadow: `6px 6px 0 ${tk.ink}`, display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '3px 8px', border: `1.5px solid ${tk.ink}` }}>{fullType}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: tk.muted }}>kiwimu</span>
            </div>
            <div style={{ fontSize: 'clamp(24px, 7vw, 36px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{personality.state}</div>
            <div style={{ fontSize: 13, color: tk.muted, lineHeight: 1.6, fontFamily: bodyFontFamily }}>{personality.core}</div>
            <div style={{ height: 1, background: tk.ink, opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: tk.muted, letterSpacing: '0.1em' }}>kiwimu.com/explore</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: tk.ink, letterSpacing: '0.1em' }}>{VARIANT_LABELS[language][suffix]}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleShare} style={{ display: 'block', width: '100%', padding: '16px 24px', background: tk.acid, border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 700, fontSize: 14, textAlign: 'center' as const, boxShadow: `4px 4px 0 ${tk.ink}`, cursor: 'pointer', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            {copied ? resultCopy.shareCopied : resultCopy.shareButton}
          </button>
          <a href="/" onClick={() => trackButtonClick('explore_result_to_v1', 'explore_result', '/')} style={{ display: 'block', padding: '16px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            {resultCopy.fullQuizButton}
          </a>
          <a href={v2ReportUrl} onClick={() => trackButtonClick('explore_result_to_v2_report', 'explore_result', v2ReportUrl)} style={{ display: 'block', padding: '16px 24px', background: tk.ink, border: `1.5px solid ${tk.ink}`, color: tk.paper, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            讀取 {fullType} V2 深度報告
          </a>
          <a href={passportUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackButtonClick('explore_result_to_passport', 'explore_result', passportUrl)} style={{ display: 'block', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            保存到 Kiwimu Passport
          </a>
          <a href="https://store.line.me/stickershop/product/33314326/zh-Hant" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const, opacity: 0.6 }}>
            {resultCopy.stickerButton}
          </a>
          <button onClick={onRetest} style={{ background: 'none', border: 'none', color: tk.muted, fontSize: 12, cursor: 'pointer', padding: '8px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
            {resultCopy.retestButton}
          </button>
        </div>
      </div>
    </div>
  );
}
