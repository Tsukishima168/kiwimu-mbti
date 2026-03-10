/**
 * V2App — MBTI Lab v2
 * Source: MBTI-Lab-V1.5-TEST (Studio AI export)
 * motion/react → ./motion shim（待正式安裝 motion package 後直接換 import）
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { quizA, quizB, personalities, kiwimuStates } from './data';
import { QuizType, Dimension } from './types';
// Inline icons — avoids adding lucide-react dependency to main repo
const IconScanFace = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const IconRotateCcw = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
import './v2.css';

type Step = 'intro' | 'quiz' | 'visual' | 'result';

// --- Kiwimu Character SVG Components ---
const KiwimuStable = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[6px_6px_0px_#1A1A1A] animate-[bounce_3s_ease-in-out_infinite]">
    {/* Sparkles - Acid Green */}
    <path d="M160 40 L 165 30 L 170 40 L 180 45 L 170 50 L 165 60 L 160 50 L 150 45 Z" fill="#CCFF00" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M30 90 L 35 80 L 40 90 L 50 95 L 40 100 L 35 110 L 30 100 L 20 95 Z" fill="#CCFF00" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round"/>

    {/* Main Body - Perfect Swirl */}
    <path
      d="M100 40 C 60 60, 40 100, 45 140 C 50 170, 80 180, 100 180 C 120 180, 150 170, 155 140 C 160 100, 140 60, 100 40 Z"
      fill="#FFFFFF"
      stroke="#1A1A1A"
      strokeWidth="8"
      strokeLinejoin="round"
    />
    {/* Swirl Top Curl */}
    <path d="M100 40 C 100 10, 130 10, 130 35 C 130 55, 110 65, 100 70" fill="none" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>

    {/* Inner Swirl Lines */}
    <path d="M60 120 Q 100 140 140 120" fill="none" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round"/>
    <path d="M75 95 Q 100 110 125 95" fill="none" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round"/>

    {/* Confident/Calm Face */}
    <circle cx="85" cy="145" r="5" fill="#1A1A1A"/>
    <circle cx="115" cy="145" r="5" fill="#1A1A1A"/>
    <path d="M95 155 Q 100 160 105 155" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const KiwimuAnxious = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[6px_6px_0px_#1A1A1A] animate-pulse">
    {/* Chaos Lines / Sweat - Acid Green */}
    <path d="M150 70 Q 155 50 160 70 Q 155 90 150 70 Z" fill="#CCFF00" stroke="#1A1A1A" strokeWidth="3"/>
    <path d="M40 100 Q 45 80 50 100 Q 45 120 40 100 Z" fill="#CCFF00" stroke="#1A1A1A" strokeWidth="3"/>
    <path d="M80 40 Q 90 20 100 40" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round"/>
    <path d="M110 30 Q 120 10 130 30" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round"/>

    {/* Main Body - Melting / Spreading */}
    <path
      d="M100 70 C 60 70, 20 130, 25 160 C 30 185, 170 185, 175 160 C 180 130, 140 70, 100 70 Z"
      fill="#FFFFFF"
      stroke="#1A1A1A"
      strokeWidth="8"
      strokeLinejoin="round"
    />
    {/* Deflated Top Curl */}
    <path d="M100 70 C 90 50, 60 50, 60 70 C 60 85, 80 90, 90 95" fill="none" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>

    {/* Melting Wobble Lines */}
    <path d="M45 150 Q 65 130 85 150 T 125 150 T 155 150" fill="none" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round"/>

    {/* Anxious Face (> <) */}
    <path d="M75 135 L 85 145 L 75 155" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M125 135 L 115 145 L 125 155" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M95 165 Q 100 155 105 165" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);
// ------------------------------------------

export default function V2App() {
  const [step, setStep] = useState<Step>('intro');
  const [assignedQuiz, setAssignedQuiz] = useState<QuizType>(quizA);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Dimension[]>([]);
  const [currentVisual, setCurrentVisual] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const version = params.get('v');
    if (version === 'A') {
      setAssignedQuiz(quizA);
    } else if (version === 'B') {
      setAssignedQuiz(quizB);
    } else {
      setAssignedQuiz(Math.random() > 0.5 ? quizA : quizB);
    }
  }, []);

  const handleStart = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setStep('quiz');
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const handleAnswer = (value: Dimension, visual: string) => {
    setAnswers([...answers, value]);
    setCurrentVisual(visual);
    setStep('visual');

    setTimeout(() => {
      if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setStep('quiz');
      } else {
        setStep('result');
      }
    }, 2500);
  };

  const reset = () => {
    setStep('intro');
    setSelectedQuiz(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    const params = new URLSearchParams(window.location.search);
    if (!params.get('v')) {
      setAssignedQuiz(Math.random() > 0.5 ? quizA : quizB);
    }
  };

  const calculateResult = () => {
    if (answers.length < 5) return { type: 'INFP', aOrT: 'A' };
    const type = `${answers[0]}${answers[1]}${answers[2]}${answers[3]}`;
    const aOrT = answers[4] as 'A' | 'T';
    return { type, aOrT };
  };

  return (
    <div className="v2-root min-h-screen font-sans flex flex-col items-center justify-center p-4 pt-20 pb-12">

      {/* Top Marquee */}
      <div className="marquee-container">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-text">
              KIWIMU MBTI LAB // PASSPORT // YZ GENERATION //
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="kiwimu-card p-8 space-y-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border-[1.5px] opacity-80 mix-blend-multiply z-0" style={{ backgroundColor: '#CCFF00', borderColor: '#1A1A1A' }}></div>

              <div className="relative z-10 space-y-8">
                <div className="inline-block px-3 py-1 font-mono text-[10px] font-medium tracking-widest uppercase rounded-full" style={{ backgroundColor: '#1A1A1A', color: '#CCFF00' }}>
                  System.Init()
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight leading-none uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
                    {assignedQuiz.title}
                  </h1>

                  <p className="font-medium leading-relaxed text-sm pl-4" style={{ color: 'rgba(26,26,26,0.8)', borderLeft: '2px solid #CCFF00' }}>
                    {assignedQuiz.description}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStart(assignedQuiz)}
                    className="w-full kiwimu-btn kiwimu-btn-primary p-4 text-lg flex items-center justify-center gap-3 uppercase tracking-wider"
                    style={{ color: '#1A1A1A' }}
                  >
                    <IconScanFace />
                    Start Scan
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center font-mono text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(26,26,26,0.5)' }}>
              [ Version {assignedQuiz.id} // A-B Test Active ]
            </div>

            <div className="text-center">
              <a href="/" className="text-xs underline underline-offset-4" style={{ color: 'rgba(26,26,26,0.4)' }}>
                ← 返回 v1
              </a>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && selectedQuiz && (
          <motion.div
            key={`quiz-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="flex items-center justify-between font-mono font-medium text-xs pb-3" style={{ borderBottom: '1.5px solid rgba(26,26,26,0.2)', color: 'rgba(26,26,26,0.6)' }}>
              <span>Q.{String(currentQuestionIndex + 1).padStart(2, '0')}</span>
              <span className="px-2 py-0.5 rounded-full tracking-widest" style={{ backgroundColor: '#1A1A1A', color: '#F8F8F5' }}>ANALYZING</span>
              <span>{String(selectedQuiz.questions.length).padStart(2, '0')}</span>
            </div>

            <h2 className="text-2xl font-medium leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
              {selectedQuiz.questions[currentQuestionIndex].text}
            </h2>

            <div className="space-y-4 pt-4">
              {selectedQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.value, option.visual)}
                  className="w-full kiwimu-btn p-5 text-left leading-relaxed font-medium text-sm"
                  style={{ color: '#1A1A1A' }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'visual' && (
          <motion.div
            key="visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-md w-full flex flex-col items-center justify-center text-center space-y-8 py-20"
          >
             <div className="w-32 h-32 rounded-full flex items-center justify-center animate-pulse p-4" style={{ border: '1.5px solid #1A1A1A', backgroundColor: '#CCFF00', boxShadow: '4px 4px 0px #1A1A1A' }}>
                <KiwimuStable />
             </div>
             <div className="px-6 py-4 font-medium text-lg tracking-wide rounded-2xl" style={{ backgroundColor: '#1A1A1A', color: '#F8F8F5', border: '1.5px solid #1A1A1A', boxShadow: '4px 4px 0px #CCFF00', fontFamily: "'Space Grotesk', sans-serif" }}>
               {currentVisual}
             </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-6"
          >
            {(() => {
              const { type, aOrT } = calculateResult();
              const personality = personalities[type] || personalities['INFP'];
              const kiwimuState = kiwimuStates[aOrT as 'A' | 'T'];

              return (
                <div id="ig-story-card" className="flex flex-col gap-4">
                  <div className="kiwimu-card p-0 flex flex-col relative overflow-hidden bg-white" style={{ aspectRatio: '4/5' }}>

                    {/* Top Bar */}
                    <div className="p-4 flex justify-between items-center" style={{ backgroundColor: '#1A1A1A', color: '#CCFF00', borderBottom: '1.5px solid #1A1A1A' }}>
                      <span className="font-mono font-medium tracking-widest uppercase text-[10px]">Kiwimu Lab // 2026</span>
                      <span className="font-mono font-medium rounded-full px-3 py-1 text-[10px]" style={{ border: '1px solid rgba(204,255,0,0.5)' }}>ID: {type}-{aOrT}</span>
                    </div>

                    {/* Main Character Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: '#F8F8F5', borderBottom: '1.5px solid rgba(26,26,26,0.1)' }}>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" style={{ opacity: 0.03 }}>
                        <span className="font-bold text-9xl uppercase whitespace-nowrap -rotate-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {kiwimuState.title}
                        </span>
                      </div>

                      <div className="relative z-10 w-56 h-56 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#CCFF00' }}></div>
                        {aOrT === 'A' ? <KiwimuStable /> : <KiwimuAnxious />}
                      </div>

                      <div className="text-center relative z-10 space-y-2">
                        <div className="inline-block px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-full mb-1" style={{ backgroundColor: '#1A1A1A', color: '#CCFF00' }}>
                          Current State
                        </div>
                        <h2 className="font-bold uppercase leading-none tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                          {kiwimuState.title}
                        </h2>
                        <p className="text-sm font-medium max-w-[240px] mx-auto leading-relaxed mt-3" style={{ color: 'rgba(26,26,26,0.6)' }}>
                          {kiwimuState.description}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Info */}
                    <div className="p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(26,26,26,0.4)' }}>Base Flavor</p>
                          <h3 className="text-xl font-semibold uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>{personality.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(26,26,26,0.4)' }}>Core</p>
                          <span className="inline-block px-2 py-1 font-medium text-[10px] rounded-full" style={{ backgroundColor: '#CCFF00', border: '1.5px solid #1A1A1A' }}>
                            {personality.core}
                          </span>
                        </div>
                      </div>

                      <div className="pl-4 py-1 rounded-r-xl p-3" style={{ borderLeft: '2px solid #CCFF00', backgroundColor: 'rgba(248,248,245,0.5)' }}>
                        <p className="font-mono text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(26,26,26,0.4)' }}>Kiwimu Says:</p>
                        <p className="font-medium text-sm leading-relaxed italic" style={{ color: 'rgba(26,26,26,0.9)' }}>
                          "{personality.kiwimuSays}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 kiwimu-btn py-4 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest bg-white"
                      style={{ color: '#1A1A1A' }}
                    >
                      <IconRotateCcw />
                      Restart
                    </button>
                    <button
                      onClick={() => alert('長按圖片即可儲存至手機，或截圖分享至 IG 限動！')}
                      className="kiwimu-btn kiwimu-btn-primary py-4 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                      style={{ flex: 2, color: '#1A1A1A', boxShadow: '4px 4px 0px #1A1A1A' }}
                    >
                      <IconDownload />
                      Save for IG Story
                    </button>
                  </div>

                  <div className="text-center">
                    <a href="/" className="text-xs underline underline-offset-4" style={{ color: 'rgba(26,26,26,0.4)' }}>
                      ← 返回 v1
                    </a>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
