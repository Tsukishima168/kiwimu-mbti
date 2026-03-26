import React, { useEffect, useState } from 'react';
import { ExplorePersonality } from '../../data/questions-explore';

const tk = {
  ink:   '#1A1A1A',
  paper: '#F8F8F5',
  acid:  '#CCFF00',
  muted: '#888880',
} as const;

interface Props {
  mbtiType: string;
  suffix: 'A' | 'T';
  personality: ExplorePersonality;
  onRetest: () => void;
}

export default function ExploreResult({ mbtiType, suffix, personality, onRetest }: Props) {
  const fullType = `${mbtiType}-${suffix}`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'explore_complete', {
        mbti_type: mbtiType,
        suffix,
        full_type: fullType,
        state: personality.state,
      });
    }
  }, []);

  const handleShare = async () => {
    const url = window.location.origin + '/explore';
    const text = `我是「${personality.state}」的 Kiwimu — ${personality.core}\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Kiwimu 狀態測驗', text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <div style={{
      minHeight: '100svh',
      background: tk.paper,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Space Grotesk', 'Inter', 'Noto Sans TC', sans-serif",
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 24px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Type badge */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            background: tk.acid,
            color: tk.ink,
            padding: '4px 10px',
            border: `1.5px solid ${tk.ink}`,
          }}>
            {fullType}
          </span>
        </div>

        {/* State image placeholder — 主理人提供圖後替換 */}
        {personality.imageUrl ? (
          <img
            src={personality.imageUrl}
            alt={`Kiwimu ${personality.state}`}
            style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 24 }}
          />
        ) : (
          <div style={{
            width: 96,
            height: 96,
            border: `1.5px solid ${tk.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            background: tk.acid,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            color: tk.ink,
          }}>
            kiwimu
          </div>
        )}

        {/* State label — hero */}
        <h1 style={{
          fontSize: 'clamp(36px, 10vw, 56px)',
          fontWeight: 800,
          color: tk.ink,
          lineHeight: 1.1,
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {personality.state}
        </h1>

        {/* Core */}
        <p style={{
          fontSize: 15,
          color: tk.muted,
          marginBottom: 32,
          lineHeight: 1.5,
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        }}>
          {personality.core}
        </p>

        {/* Divider */}
        <div style={{ height: 1.5, background: tk.ink, marginBottom: 32 }} />

        {/* Kiwimu says */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: tk.muted,
            marginBottom: 12,
          }}>
            Kiwimu 說
          </div>
          <p style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: tk.ink,
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          }}>
            「{personality.kiwimuSays}」
          </p>
        </div>

        {/* Share card — 截圖分享用 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: tk.muted,
            marginBottom: 10,
          }}>
            截圖 → 分享 IG
          </div>
          <div
            id="explore-share-card"
            style={{
              border: `1.5px solid ${tk.ink}`,
              background: tk.paper,
              padding: '28px 24px',
              boxShadow: `6px 6px 0 ${tk.ink}`,
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase' as const,
                background: tk.acid,
                color: tk.ink,
                padding: '3px 8px',
                border: `1.5px solid ${tk.ink}`,
              }}>
                {fullType}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.15em',
                color: tk.muted,
              }}>
                kiwimu
              </span>
            </div>

            <div style={{
              fontSize: 'clamp(24px, 7vw, 36px)',
              fontWeight: 800,
              color: tk.ink,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {personality.state}
            </div>

            <div style={{
              fontSize: 13,
              color: tk.muted,
              lineHeight: 1.6,
              fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
            }}>
              {personality.core}
            </div>

            <div style={{ height: 1, background: tk.ink, opacity: 0.15 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: tk.muted,
                letterSpacing: '0.1em',
              }}>
                kiwimu.com/explore
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: tk.ink,
                letterSpacing: '0.1em',
              }}>
                {suffix === 'A' ? 'ASSERTIVE' : 'TURBULENT'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Primary — 傳給朋友（擴散） */}
          <button
            onClick={handleShare}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px 24px',
              background: tk.acid,
              border: `1.5px solid ${tk.ink}`,
              color: tk.ink,
              fontWeight: 700,
              fontSize: 14,
              textAlign: 'center' as const,
              boxShadow: `4px 4px 0 ${tk.ink}`,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              transition: 'all 0.1s',
            }}
          >
            {copied ? '連結已複製 ✓' : '傳給朋友來測 →'}
          </button>

          {/* Secondary — 做完整免費版 V1 */}
          <a
            href="/"
            style={{
              display: 'block',
              padding: '16px 24px',
              background: 'transparent',
              border: `1.5px solid ${tk.ink}`,
              color: tk.ink,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              textAlign: 'center' as const,
            }}
          >
            做完整 40 題免費測驗 →
          </a>

          {/* Retest */}
          <button
            onClick={onRetest}
            style={{
              background: 'none',
              border: 'none',
              color: tk.muted,
              fontSize: 12,
              cursor: 'pointer',
              padding: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.1em',
            }}
          >
            重新測驗
          </button>
        </div>
      </div>
    </div>
  );
}
