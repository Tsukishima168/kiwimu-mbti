import React, { useEffect, useState } from 'react';
import { shareWithFeedback } from '../../utils/shareFeedback';
import { V2_REPORT_PRICE_TWD } from '../../shared/v2Product';
import { ExplorePersonality } from '../../data/questions-explore';
import { Language } from '../../contexts/LanguageContext';
import { trackButtonClick } from '../../utils/analytics';
import { getStateAsset } from '../../data/kiwimuVisualAssets';
import KiwimuVisual from '../visuals/KiwimuVisual';

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
  const stateAsset = getStateAsset(personality.stateGroup);
  const v2ReportUrl = `/read/${fullType}?from=mbti_explore_result&source=v15_result`;
  const passportUrl = 'https://passport.kiwimu.com/?screen=passport&tab=hub&from=mbti_explore_result';
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [manualShare, setManualShare] = useState(false);
  const copy = {
    zh: { failed: '無法自動分享，請複製下方連結。', shared: '已開啟分享。', v2: `試讀 ${fullType} 的 V2 報告`, price: `第 01 章免費，完整報告 NT$${V2_REPORT_PRICE_TWD}。`, passport: '回會員護照看今日任務', busy: '正在準備分享…' },
    en: { failed: 'Sharing is unavailable. Copy the link below.', shared: 'Shared.', v2: `Preview the ${fullType} V2 report`, price: `Chapter 01 is free. Full report NT$${V2_REPORT_PRICE_TWD}.`, passport: 'See today’s tasks in Passport', busy: 'Preparing to share…' },
    ja: { failed: '共有できませんでした。下のリンクをコピーしてください。', shared: '共有しました。', v2: `${fullType}のV2レポートを試し読み`, price: `第01章は無料。完全版はNT$${V2_REPORT_PRICE_TWD}。`, passport: '会員パスポートで今日のタスクを見る', busy: '共有を準備しています…' },
    ko: { failed: '공유할 수 없습니다. 아래 링크를 복사해 주세요.', shared: '공유했습니다.', v2: `${fullType} V2 보고서 미리 보기`, price: `01장 무료. 전체 보고서 NT$${V2_REPORT_PRICE_TWD}.`, passport: '회원 패스포트에서 오늘의 할 일 보기', busy: '공유 준비 중…' },
  }[language];
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
    if (shareBusy) return;
    setShareBusy(true); setShareMessage(''); setManualShare(false);
    const url = shareUrl.toString();
    const headline = SHARE_TEXT_BUILDERS[language](personality.state, personality.core);
    const text = `${headline}\n\n${url}`;
    const outcome = await shareWithFeedback({ title: SHARE_TITLES[language], text, url });
    setShareBusy(false);
    if (outcome === 'cancelled') return;
    setShareMessage(outcome === 'copied' ? resultCopy.shareCopied : outcome === 'shared' ? copy.shared : copy.failed);
    setManualShare(outcome === 'failed');
  };

  return (
    <div className="explore-result" style={{ minHeight: '100svh', background: tk.paper, display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 24px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Type badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '4px 10px', border: `1.5px solid ${tk.ink}` }}>
            {fullType}
          </span>
        </div>

        {/* State */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#595952', marginBottom: 12 }}>
          {resultCopy.stateLabel}
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 10vw, 56px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
          {personality.state}
        </h1>

        {/* Core */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#595952', marginBottom: 10 }}>
          {resultCopy.coreLabel}
        </div>
        <p style={{ fontSize: 15, color: '#595952', marginBottom: 24, lineHeight: 1.5, fontFamily: bodyFontFamily }}>
          {personality.core}
        </p>

        {/* Character */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, marginLeft: -24, marginRight: -24 }}>
          <KiwimuVisual
            asset={stateAsset}
            alt={`Kiwimu ${personality.state}`}
            style={{ width: '100%', maxWidth: 320, height: 320, objectFit: 'contain' }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1.5, background: tk.ink, marginBottom: 32 }} />

        {/* Kiwimu says */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#595952', marginBottom: 12 }}>
            {resultCopy.saysLabel}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: tk.ink, fontFamily: bodyFontFamily }}>
            「{personality.kiwimuSays}」
          </p>
        </div>

        {/* Share card */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#595952', marginBottom: 10 }}>
            {resultCopy.shareLabel}
          </div>
          <div style={{ border: `1.5px solid ${tk.ink}`, background: tk.paper, padding: '28px 24px', boxShadow: `6px 6px 0 ${tk.ink}`, display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '3px 8px', border: `1.5px solid ${tk.ink}` }}>{fullType}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.15em', color: '#595952' }}>kiwimu</span>
            </div>
            <div style={{ fontSize: 'clamp(24px, 7vw, 36px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{personality.state}</div>
            <div style={{ fontSize: 13, color: '#595952', lineHeight: 1.6, fontFamily: bodyFontFamily }}>{personality.core}</div>
            <div style={{ height: 1, background: tk.ink, opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#595952', letterSpacing: '0.1em' }}>kiwimu.com/explore</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: tk.ink, letterSpacing: '0.1em' }}>{VARIANT_LABELS[language][suffix]}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button type="button" disabled={shareBusy} onClick={handleShare} style={{ display: 'block', width: '100%', padding: '16px 24px', background: tk.acid, border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 700, fontSize: 16, textAlign: 'center' as const, boxShadow: `4px 4px 0 ${tk.ink}`, cursor: 'pointer', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            {shareBusy ? copy.busy : resultCopy.shareButton}
          </button>
          {shareMessage ? <p role="status" style={{ fontSize: 14, lineHeight: 1.7, color: tk.ink }}>{shareMessage}</p> : null}
          {manualShare ? <a href={shareUrl.toString()} style={{ fontSize: 14, lineHeight: 1.7, overflowWrap: 'anywhere', color: tk.ink }}>{shareUrl.toString()}</a> : null}
          <a href="/" onClick={() => trackButtonClick('explore_result_to_v1', 'explore_result', '/')} style={{ display: 'block', padding: '16px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            {resultCopy.fullQuizButton}
          </a>
          <a href={v2ReportUrl} onClick={() => trackButtonClick('explore_result_to_v2_report', 'explore_result', v2ReportUrl)} style={{ display: 'block', padding: '16px 24px', background: tk.ink, border: `1.5px solid ${tk.ink}`, color: tk.paper, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            {copy.v2}
          </a>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#595952', textAlign: 'center' }}>{copy.price}</p>
          <a href={passportUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackButtonClick('explore_result_to_passport', 'explore_result', passportUrl)} style={{ display: 'block', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            {copy.passport}
          </a>
          <a href="https://store.line.me/stickershop/product/33314326/zh-Hant" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const, opacity: 0.6 }}>
            {resultCopy.stickerButton}
          </a>
          <button type="button" onClick={onRetest} style={{ background: 'none', border: 'none', color: '#595952', fontSize: 14, minHeight: 44, cursor: 'pointer', padding: '8px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
            {resultCopy.retestButton}
          </button>
        </div>
      </div>
      <style>{`
        .explore-result :is(button, a):focus-visible { outline: 2px solid ${tk.ink}; outline-offset: 4px; }
        .explore-result :is(button, a) { touch-action: manipulation; }
      `}</style>
    </div>
  );
}
