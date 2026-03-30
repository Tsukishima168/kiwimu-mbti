import React, { useEffect, useState } from 'react';
import { ExplorePersonality } from '../../data/questions-explore';

const tk = {
  ink:   '#1A1A1A',
  paper: '#F8F8F5',
  acid:  '#CCFF00',
  muted: '#888880',
} as const;

interface Props {
  mbtiType:    string;
  suffix:      'A' | 'T';
  personality: ExplorePersonality;
  quizVersion: 'A' | 'B';
  onRetest:    () => void;
}

export default function ExploreResult({ mbtiType, suffix, personality, quizVersion, onRetest }: Props) {
  const fullType = `${mbtiType}-${suffix}`;
  const [copied, setCopied] = useState(false);

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
    const url  = window.location.origin + '/state-test';
    const text = `我是「${personality.state}」的 Kiwimu — ${personality.core}\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Kiwimu 狀態測驗', text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* cancelled */ }
  };

  return (
    <div style={{ minHeight: '100svh', background: tk.paper, display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', 'Inter', 'Noto Sans TC', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 24px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* Type badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '4px 10px', border: `1.5px solid ${tk.ink}` }}>
            {fullType}
          </span>
        </div>

        {/* State */}
        <h1 style={{ fontSize: 'clamp(36px, 10vw, 56px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
          {personality.state}
        </h1>

        {/* Core */}
        <p style={{ fontSize: 15, color: tk.muted, marginBottom: 24, lineHeight: 1.5, fontFamily: "'Inter', 'Noto Sans TC', sans-serif" }}>
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
            Kiwimu 說
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: tk.ink, fontFamily: "'Inter', 'Noto Sans TC', sans-serif" }}>
            「{personality.kiwimuSays}」
          </p>
        </div>

        {/* Share card */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: tk.muted, marginBottom: 10 }}>
            截圖 → 分享 IG
          </div>
          <div style={{ border: `1.5px solid ${tk.ink}`, background: tk.paper, padding: '28px 24px', boxShadow: `6px 6px 0 ${tk.ink}`, display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, background: tk.acid, color: tk.ink, padding: '3px 8px', border: `1.5px solid ${tk.ink}` }}>{fullType}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: tk.muted }}>kiwimu</span>
            </div>
            <div style={{ fontSize: 'clamp(24px, 7vw, 36px)', fontWeight: 800, color: tk.ink, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{personality.state}</div>
            <div style={{ fontSize: 13, color: tk.muted, lineHeight: 1.6, fontFamily: "'Inter', 'Noto Sans TC', sans-serif" }}>{personality.core}</div>
            <div style={{ height: 1, background: tk.ink, opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: tk.muted, letterSpacing: '0.1em' }}>kiwimu.com/state-test</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: tk.ink, letterSpacing: '0.1em' }}>{suffix === 'A' ? 'ASSERTIVE' : 'TURBULENT'}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleShare} style={{ display: 'block', width: '100%', padding: '16px 24px', background: tk.acid, border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 700, fontSize: 14, textAlign: 'center' as const, boxShadow: `4px 4px 0 ${tk.ink}`, cursor: 'pointer', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            {copied ? '連結已複製 ✓' : '傳給朋友來測 →'}
          </button>
          <a href="/" style={{ display: 'block', padding: '16px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const }}>
            做完整 40 題免費測驗 →
          </a>
          <a href="https://store.line.me/stickershop/product/33314326/zh-Hant" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${tk.ink}`, color: tk.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' as const, opacity: 0.6 }}>
            收藏 Kiwimu LINE 貼圖 →
          </a>
          <button onClick={onRetest} style={{ background: 'none', border: 'none', color: tk.muted, fontSize: 12, cursor: 'pointer', padding: '8px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
            重新測驗
          </button>
        </div>
      </div>
    </div>
  );
}
