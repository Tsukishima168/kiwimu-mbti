import React, { useState } from 'react';
import { ExploreQuiz as ExploreQuizType, ExploreOption } from '../../data/questions-explore';
import { Language } from '../../contexts/LanguageContext';

const tk = {
  ink:   '#1A1A1A',
  paper: '#F8F8F5',
  acid:  '#CCFF00',
  muted: '#888880',
} as const;

const COVER  = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774772303/redesigned-photo-1774598290392_wlohqn.png';
const AVATAR = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774779587/Speak_all_bkpgxc.webp';

interface Props {
  language: Language;
  quiz: ExploreQuizType;
  onComplete: (answers: Record<string, string>) => void;
}

export default function ExploreQuiz({ language, quiz, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [selected, setSelected]     = useState<string | null>(null);
  const [showVisual, setShowVisual] = useState(false);

  const question = quiz.questions[currentIdx];
  const total    = quiz.questions.length;
  const isLast   = currentIdx === total - 1;
  const bodyFontFamily =
    language === 'ja'
      ? "'Noto Sans JP', 'Inter', sans-serif"
      : language === 'ko'
        ? "'Noto Sans KR', 'Inter', sans-serif"
        : language === 'zh'
          ? "'Noto Sans TC', 'Inter', sans-serif"
          : "'Inter', sans-serif";

  const handleSelect = (option: ExploreOption) => {
    if (selected) return;
    setSelected(option.value);
    setShowVisual(true);
    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: option.value };
      if (isLast) {
        onComplete(newAnswers);
      } else {
        setAnswers(newAnswers);
        setCurrentIdx(i => i + 1);
        setSelected(null);
        setShowVisual(false);
      }
    }, 900);
  };

  return (
    <div style={{ minHeight: '100svh', position: 'relative', overflow: 'hidden', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>

      {/* 模糊背景圖 */}
      <div style={{
        position:           'absolute',
        inset:              0,
        backgroundImage:    `url(${COVER})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        filter:             'blur(28px)',
        transform:          'scale(1.12)',
        zIndex:             0,
      }} />
      {/* 白色遮罩 */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,248,245,0.90)', zIndex: 1 }} />

      {/* 內容層 */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {quiz.questions.map((_, i) => (
              <div key={i} style={{
                width:        i < currentIdx ? 20 : 8,
                height:       8,
                borderRadius: 4,
                background:   i < currentIdx ? tk.ink : i === currentIdx ? tk.acid : 'transparent',
                border:       `1.5px solid ${i === currentIdx ? tk.acid : tk.ink}`,
                transition:   'all 0.3s ease',
              }} />
            ))}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: tk.muted, letterSpacing: '0.1em' }}>
            {currentIdx + 1} / {total}
          </span>
        </div>

        {/* Main */}
        <div style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'center',
          padding:        '32px 24px 40px',
          maxWidth:       600,
          margin:         '0 auto',
          width:          '100%',
        }}>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, color: tk.ink, lineHeight: 1.5, marginBottom: 32 }}>
            {question.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.options.map((option, i) => {
              const isChosen = selected === option.value;
              const isOther  = selected !== null && !isChosen;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  disabled={!!selected}
                  style={{
                    background:  isChosen ? tk.acid : 'rgba(255,255,255,0.6)',
                    border:      `1.5px solid ${isChosen ? tk.ink : 'rgba(26,26,26,0.15)'}`,
                    borderRadius:0,
                    padding:     '18px 20px',
                    textAlign:   'left' as const,
                    cursor:      selected ? 'default' : 'pointer',
                    display:     'flex',
                    alignItems:  'flex-start',
                    gap:         14,
                    boxShadow:   isChosen ? 'none' : '4px 4px 0 rgba(26,26,26,0.08)',
                    transform:   isChosen ? 'translate(4px,4px)' : 'none',
                    opacity:     isOther ? 0.3 : 1,
                    transition:  'all 0.15s ease',
                    width:       '100%',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: isChosen ? tk.ink : tk.muted, letterSpacing: '0.1em', flexShrink: 0, marginTop: 2 }}>
                    {i === 0 ? 'A' : 'B'}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: tk.ink, fontFamily: bodyFontFamily }}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kiwimu 對話框 — 選項正下方 */}
          {showVisual && selected && (
            <div style={{
              marginTop: 24,
              display: 'flex', alignItems: 'flex-end', gap: 10,
              animation: 'slideUp 0.25s ease',
            }}>
              <img
                src={AVATAR}
                alt="Kiwimu"
                style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }}
              />
              <div style={{
                background: tk.acid,
                padding: '12px 14px',
                borderRadius: '12px 12px 12px 0',
                flex: 1,
              }}>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: tk.ink, fontFamily: bodyFontFamily }}>
                  {question.options.find(o => o.value === selected)?.visual}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        button:focus-visible { outline: 2px solid ${tk.acid}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
