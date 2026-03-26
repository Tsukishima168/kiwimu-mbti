import React, { useState } from 'react';
import { ExploreQuiz as ExploreQuizType, ExploreOption } from '../../data/questions-explore';

// Design tokens — neo-brutalist ink/acid/paper (DESIGN.md)
const tk = {
  ink:   '#1A1A1A',
  paper: '#F8F8F5',
  acid:  '#CCFF00',
  muted: '#888880',
} as const;

interface Props {
  quiz: ExploreQuizType;
  onComplete: (answers: Record<string, string>) => void;
}

export default function ExploreQuiz({ quiz, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showVisual, setShowVisual] = useState(false);

  const question = quiz.questions[currentIdx];
  const total = quiz.questions.length;
  const isLast = currentIdx === total - 1;

  const handleSelect = (option: ExploreOption) => {
    if (selected) return; // 防止重複點擊
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
    <div style={{
      minHeight: '100svh',
      background: tk.paper,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Space Grotesk', 'Inter', 'Noto Sans TC', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i < currentIdx ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i < currentIdx ? tk.ink : i === currentIdx ? tk.acid : 'transparent',
                border: `1.5px solid ${tk.ink}`,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
        {/* Counter */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: tk.muted,
          letterSpacing: '0.1em',
        }}>
          {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Dimension tag */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase' as const,
          color: tk.muted,
          marginBottom: 16,
        }}>
          {question.dimension}
        </div>

        {/* Question */}
        <h2 style={{
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontWeight: 700,
          color: tk.ink,
          lineHeight: 1.5,
          marginBottom: 32,
        }}>
          {question.text}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question.options.map((option, i) => {
            const isChosen = selected === option.value;
            const isOther = selected !== null && !isChosen;
            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={!!selected}
                style={{
                  background: isChosen ? tk.acid : tk.paper,
                  border: `1.5px solid ${tk.ink}`,
                  borderRadius: 0,
                  padding: '18px 20px',
                  textAlign: 'left' as const,
                  cursor: selected ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  boxShadow: isChosen ? 'none' : `4px 4px 0 ${tk.ink}`,
                  transform: isChosen ? 'translate(4px, 4px)' : 'none',
                  opacity: isOther ? 0.35 : 1,
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                {/* Option letter */}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: isChosen ? tk.ink : tk.muted,
                  letterSpacing: '0.1em',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {i === 0 ? 'A' : 'B'}
                </span>
                <span style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: tk.ink,
                  fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
                }}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Kiwimu visual reaction */}
        {showVisual && selected && (
          <div style={{
            marginTop: 24,
            padding: '14px 18px',
            border: `1.5px solid ${tk.ink}`,
            borderRadius: 0,
            background: tk.paper,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease',
          }}>
            <span style={{ fontSize: 20 }}>🍦</span>
            <span style={{
              fontSize: 12,
              color: tk.muted,
              lineHeight: 1.5,
              fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
            }}>
              {question.options.find(o => o.value === selected)?.visual}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        button:focus-visible { outline: 2px solid ${tk.acid}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
