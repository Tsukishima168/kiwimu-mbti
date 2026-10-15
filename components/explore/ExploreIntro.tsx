import React from 'react';
import LanguageToggle from '../LanguageToggle';
import KiwimuVisual from '../visuals/KiwimuVisual';
import { KIWIMU_BRAND_ASSETS, KIWIMU_CAMPAIGN_ASSETS } from '../../data/kiwimuVisualAssets';

interface Props {
  introCopy: {
    eyebrow: string;
    sideLabel: string;
    subtitle: string;
    cta: string;
    note: string;
  };
  quizTitle: string;
  onStart: () => void;
}

const ExploreIntro: React.FC<Props> = ({ introCopy, quizTitle, onStart }) => {
  return (
    <main
      className="fade-in"
      style={{
        position: 'relative',
        height: '100svh',
        backgroundImage: `url(${KIWIMU_CAMPAIGN_ASSETS.landingHero.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', 'Inter', 'Noto Sans TC', sans-serif",
      }}
    >
      <style>{`
        @keyframes subtitleIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .subtitle-anim {
          animation: subtitleIn 0.8s ease 0.5s both;
        }
        /* The language pill sits top-left (24..68px). Keep the wordmark block below it on
           narrow screens so the two never overlap; wide screens keep the original 56px. */
        .explore-intro-brand { top: 84px; }
        @media (min-width: 768px) { .explore-intro-brand { top: 56px; } }
      `}</style>

      {/* overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.5) 22%, rgba(10,10,10,0.35) 45%, rgba(10,10,10,0.35) 58%, rgba(10,10,10,0.58) 76%, rgba(10,10,10,0.74) 100%)' }} />

      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
        <LanguageToggle />
      </div>

      {/* 右上角標記 */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: '#FFFFFF',
          textShadow: '0 1px 3px rgba(0,0,0,0.45)',
        }}>
          {introCopy.eyebrow}
        </span>
      </div>

      {/* 右側直排英文點綴 */}
      {/* The label is centred on a fixed anchor 24px from the right edge, so its length or
          font size can never slide it left over the character's face (the face must stay clear). */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        right: 24,
        top: '50%',
        width: 0,
        height: 0,
        zIndex: 10,
      }}>
        <span style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%) rotate(90deg)',
          transformOrigin: 'center center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.24em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.4)',
          whiteSpace: 'nowrap' as const,
        }}>
          {introCopy.sideLabel}
        </span>
      </div>

      {/* 上方：標準字 + 副標 */}
      <div className="explore-intro-brand" style={{
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 14,
        padding: '0 28px',
      }}>
        {/* 標準字 */}
        <KiwimuVisual
          asset={KIWIMU_BRAND_ASSETS.wordmark}
          loading="eager"
          fetchPriority="high"
          style={{
            height: 32,
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            opacity: 0.9,
          }}
        />

        {/* 副標 — 動畫 */}
        <p
          className="subtitle-anim"
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            letterSpacing: '0.05em',
            margin: 0,
            fontFamily: "'Noto Sans TC', 'Inter', sans-serif",
          }}
        >
          {introCopy.subtitle}
        </p>
      </div>

      {/* 底部：半透明按鈕 */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 24,
        right: 24,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 12,
      }}>
        <p style={{
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.14em',
          color: '#FFFFFF',
          textShadow: '0 1px 3px rgba(0,0,0,0.45)',
          margin: 0,
          textTransform: 'uppercase' as const,
        }}>
          {quizTitle}
        </p>
        <button
          onClick={onStart}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '15px 24px',
            background: '#D7C678',
            color: '#1F2F1F',
            border: '1px solid #D7C678',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          }}
        >
          {introCopy.cta}
        </button>

        <p style={{
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em',
          color: '#FFFFFF',
          textShadow: '0 1px 3px rgba(0,0,0,0.45)',
          margin: 0,
        }}>
          {introCopy.note}
        </p>
      </div>
    </main>
  );
};

export default ExploreIntro;
