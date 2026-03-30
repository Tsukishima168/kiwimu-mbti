import React from 'react';

const COVER   = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774772303/redesigned-photo-1774598290392_wlohqn.png';
const WORDMARK = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1769501231/%E6%A8%99%E6%BA%96%E5%AD%97-02_ndnf7x.png';

interface Props {
  quizTitle: string;
  onStart: () => void;
}

const ExploreIntro: React.FC<Props> = ({ onStart }) => {
  return (
    <div
      className="fade-in"
      style={{
        position: 'relative',
        height: '100svh',
        backgroundImage: `url(${COVER})`,
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
      `}</style>

      {/* overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.35)' }} />

      {/* 右上角標記 */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.4)',
        }}>
          5 題 · 1 MIN
        </span>
      </div>

      {/* 右側直排英文點綴 */}
      <div style={{
        position: 'absolute',
        right: 18,
        top: '50%',
        transform: 'translateY(-50%) rotate(90deg)',
        transformOrigin: 'center center',
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.3em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.28)',
          whiteSpace: 'nowrap' as const,
        }}>
          KIWIMU STATE TEST
        </span>
      </div>

      {/* 上方：標準字 + 副標 */}
      <div style={{
        position: 'absolute',
        top: 56,
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
        <img
          src={WORDMARK}
          alt="Kiwimu"
          style={{
            height: 32,
            width: 'auto',
            objectFit: 'contain',
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
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: '0.05em',
            margin: 0,
            fontFamily: "'Noto Sans TC', 'Inter', sans-serif",
          }}
        >
          今天的你，打發到哪了？
        </p>
      </div>

      {/* 底部：半透明按鈕 */}
      <div style={{
        position: 'absolute',
        bottom: 180,
        left: 24,
        right: 24,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 10,
      }}>
        <button
          onClick={onStart}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '15px 24px',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.35)',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          }}
        >
          開始打發 →
        </button>

        <p style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          margin: 0,
        }}>
          不需要登入 · 完全免費
        </p>
      </div>
    </div>
  );
};

export default ExploreIntro;
