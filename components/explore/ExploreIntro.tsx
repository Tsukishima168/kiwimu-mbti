import React, { useEffect, useState } from 'react';

// V1.5 片頭 — 鮮奶油打發過程
// 色調：薰衣草霧白，與 V1 暖米色做區隔
// 調性：YZ 世代小遊戲，輕盈不沉重

const tk = {
  bg:      '#F0ECFF', // 薰衣草霧白（V1 是暖米 #F8F8F5）
  ink:     '#1A1A1A',
  acid:    '#CCFF00',
  lavBlue: '#C4B5FD', // 軟紫，打發過程的「空氣感」
  muted:   '#888880',
  white:   '#FFFFFF',
} as const;

// 打發三階段文字
const STAGES = [
  { label: '還是液態',   sub: '鬆散、還沒想好、流動中' },
  { label: '開始起泡',   sub: '有點感覺了、但還沒成形' },
  { label: '打發成型',   sub: '有稜有角、知道自己是誰' },
];

interface Props {
  quizTitle: string;
  onStart: () => void;
}

export default function ExploreIntro({ quizTitle, onStart }: Props) {
  const [stageIdx, setStageIdx] = useState(0);
  const [peaked, setPeaked] = useState(false);

  // 自動跑打發動畫：0 → 1 → 2 → 停在 2
  useEffect(() => {
    const t1 = setTimeout(() => setStageIdx(1), 900);
    const t2 = setTimeout(() => setStageIdx(2), 1800);
    const t3 = setTimeout(() => setPeaked(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const currentStage = STAGES[stageIdx];

  return (
    <div style={{
      minHeight: '100svh',
      background: tk.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Space Grotesk', 'Inter', 'Noto Sans TC', sans-serif",
      overflow: 'hidden',
    }}>

      {/* 頂部標記 */}
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase' as const,
          color: tk.muted,
        }}>
          kiwimu state test
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
          color: tk.muted,
        }}>
          5 題 · 1 min
        </span>
      </div>

      {/* 中央動畫區 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        gap: 0,
      }}>

        {/* 鮮奶油打發視覺 */}
        <div style={{
          position: 'relative',
          width: 180,
          height: 180,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          {/* 底部容器（打蛋盆） */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: 140,
            height: 24,
            borderRadius: '0 0 70px 70px',
            background: tk.lavBlue,
            opacity: 0.3,
            transition: 'all 0.6s ease',
          }} />

          {/* 鮮奶油體 — 根據 stageIdx 變形 */}
          <div style={{
            position: 'relative',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            width: stageIdx === 0 ? 110 : stageIdx === 1 ? 96 : 80,
            height: stageIdx === 0 ? 36 : stageIdx === 1 ? 88 : 140,
            background: tk.white,
            border: `2px solid ${tk.ink}`,
            borderRadius: stageIdx === 0
              ? '50% 50% 50% 50%'
              : stageIdx === 1
              ? '50% 50% 40% 40% / 60% 60% 40% 40%'
              : '46% 46% 42% 42% / 56% 56% 44% 44%',
            boxShadow: peaked ? `0 0 0 4px ${tk.lavBlue}` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* 眼睛 — stage 2 才出現 */}
            {stageIdx >= 1 && (
              <div style={{
                display: 'flex',
                gap: 10,
                marginTop: stageIdx === 2 ? -12 : 0,
                transition: 'all 0.4s ease',
                opacity: stageIdx >= 1 ? 1 : 0,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: tk.ink }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: tk.ink }} />
              </div>
            )}
          </div>

          {/* 打發紋路（氣泡感） */}
          {[...Array(stageIdx * 2)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 6 + (i % 3) * 3,
              height: 6 + (i % 3) * 3,
              borderRadius: '50%',
              background: tk.lavBlue,
              opacity: 0.5,
              top: 30 + (i * 18) % 80,
              left: i % 2 === 0 ? 10 : 140,
              transition: 'all 0.5s ease',
            }} />
          ))}
        </div>

        {/* 打發狀態說明 */}
        <div style={{
          textAlign: 'center' as const,
          marginBottom: 8,
          minHeight: 64,
          transition: 'all 0.4s ease',
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: tk.ink,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            transition: 'all 0.4s ease',
          }}>
            {currentStage.label}
          </div>
          <div style={{
            fontSize: 13,
            color: tk.muted,
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
            letterSpacing: '0.02em',
          }}>
            {currentStage.sub}
          </div>
        </div>

        {/* 打發進度條 */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 48,
          marginTop: 16,
        }}>
          {STAGES.map((_, i) => (
            <div key={i} style={{
              width: i <= stageIdx ? 28 : 8,
              height: 4,
              borderRadius: 2,
              background: i <= stageIdx ? tk.ink : tk.lavBlue,
              opacity: i <= stageIdx ? 1 : 0.4,
              transition: 'all 0.5s ease',
            }} />
          ))}
        </div>

        {/* 主標題 */}
        <div style={{ textAlign: 'center' as const, marginBottom: 40, maxWidth: 320 }}>
          <h1 style={{
            fontSize: 'clamp(26px, 7vw, 36px)',
            fontWeight: 800,
            color: tk.ink,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}>
            今天的你
            <br />
            打發到哪了？
          </h1>
          <p style={{
            fontSize: 14,
            color: tk.muted,
            lineHeight: 1.6,
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          }}>
            5 個情境找出你現在的 Kiwimu 狀態
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '18px 24px',
            background: peaked ? tk.acid : tk.lavBlue,
            border: `2px solid ${tk.ink}`,
            color: tk.ink,
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.02em',
            boxShadow: peaked ? `5px 5px 0 ${tk.ink}` : `3px 3px 0 ${tk.lavBlue}`,
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: peaked ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          {peaked ? '開始打發 →' : '等我成形…'}
        </button>

        <div style={{
          marginTop: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: tk.muted,
          letterSpacing: '0.15em',
          textAlign: 'center' as const,
        }}>
          不需要登入 · 完全免費
        </div>
      </div>

      {/* 底部品牌 */}
      <div style={{
        padding: '16px 24px',
        textAlign: 'center' as const,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: tk.muted,
        letterSpacing: '0.15em',
        opacity: 0.6,
      }}>
        by Moon Moon 月島甜點 · kiwimu.com
      </div>
    </div>
  );
}
