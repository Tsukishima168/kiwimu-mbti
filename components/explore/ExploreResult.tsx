import React from 'react';
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
  const suffixLabel = suffix === 'A' ? '完美擠花' : '過度攪拌';

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

        {/* Dessert name — hero */}
        <h1 style={{
          fontSize: 'clamp(36px, 10vw, 56px)',
          fontWeight: 800,
          color: tk.ink,
          lineHeight: 1.1,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          {personality.name}
        </h1>

        {/* Core */}
        <p style={{
          fontSize: 16,
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
        <div style={{ marginBottom: 48 }}>
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

        {/* Suffix state */}
        <div style={{
          border: `1.5px solid ${tk.ink}`,
          padding: '16px 20px',
          marginBottom: 40,
          boxShadow: `4px 4px 0 ${tk.ink}`,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase' as const,
            color: tk.muted,
            marginBottom: 6,
          }}>
            狀態 · {suffix === 'A' ? 'Assertive' : 'Turbulent'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tk.ink }}>
            {suffixLabel}
          </div>
        </div>

        {/* CTA group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Primary CTA → V1 */}
          <a
            href="/"
            style={{
              display: 'block',
              padding: '16px 24px',
              background: tk.acid,
              border: `1.5px solid ${tk.ink}`,
              color: tk.ink,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              textAlign: 'center' as const,
              boxShadow: `4px 4px 0 ${tk.ink}`,
              transition: 'all 0.1s',
            }}
          >
            做完整 40 題 → 解鎖完整報告
          </a>

          {/* Secondary CTA → V2 */}
          <a
            href="/v2"
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
            NT$149 深度報告 →
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
