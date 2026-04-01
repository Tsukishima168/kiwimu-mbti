import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { quizA, quizB, personalities, kiwimuStates } from './data';
import { QuizType, Dimension } from './types';
import { ArrowRight, RotateCcw, Share2, ScanFace, Download } from 'lucide-react';

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
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[6px_6px_0px_#1A1A1A] animate-[pulse_2s_ease-in-out_infinite]">
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

export default function App() {
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
    <div className="min-h-screen font-sans selection:bg-acid selection:text-ink flex flex-col items-center justify-center p-4 pt-20 pb-12">
      
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
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-acid rounded-full border-[1.5px] border-ink opacity-80 mix-blend-multiply z-0"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="inline-block px-3 py-1 bg-ink text-acid font-mono text-[10px] font-medium tracking-widest uppercase rounded-full">
                  System.Init()
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-display font-semibold tracking-tight leading-none uppercase text-ink">
                    {assignedQuiz.title}
                  </h1>
                  
                  <p className="text-ink/80 font-medium leading-relaxed border-l-2 border-acid pl-4 text-sm">
                    {assignedQuiz.description}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStart(assignedQuiz)}
                    className="w-full kiwimu-btn kiwimu-btn-primary p-4 text-lg flex items-center justify-center gap-3 uppercase tracking-wider text-ink"
                  >
                    <ScanFace className="w-5 h-5" />
                    Start Scan
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono text-[10px] text-ink/50 font-medium uppercase tracking-widest">
              [ Version {assignedQuiz.id} // A-B Test Active ]
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
            <div className="flex items-center justify-between font-mono font-medium text-xs border-b-[1.5px] border-ink/20 pb-3 text-ink/60">
              <span>Q.{String(currentQuestionIndex + 1).padStart(2, '0')}</span>
              <span className="bg-ink text-paper px-2 py-0.5 rounded-full tracking-widest">ANALYZING</span>
              <span>{String(selectedQuiz.questions.length).padStart(2, '0')}</span>
            </div>

            <h2 className="text-2xl font-display font-medium leading-snug text-ink">
              {selectedQuiz.questions[currentQuestionIndex].text}
            </h2>

            <div className="space-y-4 pt-4">
              {selectedQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.value, option.visual)}
                  className="w-full kiwimu-btn p-5 text-left text-ink leading-relaxed font-sans font-medium text-sm"
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
             <div className="w-32 h-32 rounded-full border-[1.5px] border-ink bg-acid flex items-center justify-center shadow-[4px_4px_0px_#1A1A1A] animate-pulse p-4">
                <KiwimuStable />
             </div>
             <div className="bg-ink text-paper px-6 py-4 font-display font-medium text-lg tracking-wide border-[1.5px] border-ink shadow-[4px_4px_0px_#CCFF00] rounded-2xl">
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
              const kiwimuState = kiwimuStates[aOrT];

              return (
                <div id="ig-story-card" className="flex flex-col gap-4">
                  {/* IG Story Optimized Card (9:16 Aspect Ratio Feel) */}
                  <div className="kiwimu-card p-0 flex flex-col relative overflow-hidden bg-white aspect-[4/5] sm:aspect-auto">
                    
                    {/* Top Bar */}
                    <div className="bg-ink text-acid p-4 flex justify-between items-center border-b-[1.5px] border-ink">
                      <span className="font-mono font-medium tracking-widest uppercase text-[10px]">Kiwimu Lab // 2026</span>
                      <span className="font-mono font-medium border border-acid/50 rounded-full px-3 py-1 text-[10px]">ID: {type}-{aOrT}</span>
                    </div>
                    
                    {/* Main Character Area (The Focus) */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-paper border-b-[1.5px] border-ink/10 overflow-hidden">
                      {/* Background decorative text */}
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] pointer-events-none">
                        <span className="font-display font-bold text-9xl uppercase whitespace-nowrap -rotate-12">
                          {kiwimuState.title}
                        </span>
                      </div>

                      {/* Dynamic Character SVG */}
                      <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 mb-6 flex items-center justify-center">
                        {/* Abstract background blob for contrast */}
                        <div className="absolute inset-0 bg-acid rounded-full blur-2xl opacity-20"></div>
                        
                        {/* Render the SVG based on A/T state */}
                        {aOrT === 'A' ? <KiwimuStable /> : <KiwimuAnxious />}
                      </div>

                      {/* State Title (Primary Focus) */}
                      <div className="text-center relative z-10 space-y-2">
                        <div className="inline-block bg-ink text-acid px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-full mb-1">
                          Current State
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-display font-bold uppercase leading-none text-ink tracking-tight">
                          {kiwimuState.title}
                        </h2>
                        <p className="text-sm font-medium text-ink/60 max-w-[240px] mx-auto leading-relaxed mt-3">
                          {kiwimuState.description}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Info (Dessert & Quote) */}
                    <div className="p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">Base Flavor</p>
                          <h3 className="text-xl font-display font-semibold uppercase text-ink">{personality.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">Core</p>
                          <span className="inline-block bg-acid px-2 py-1 font-medium text-[10px] border-[1.5px] border-ink rounded-full">
                            {personality.core}
                          </span>
                        </div>
                      </div>

                      <div className="border-l-2 border-acid pl-4 py-1 bg-paper/50 rounded-r-xl p-3">
                        <p className="font-mono text-[10px] font-medium text-ink/40 mb-1 uppercase tracking-widest">Kiwimu Says:</p>
                        <p className="font-sans font-medium text-sm leading-relaxed text-ink/90 italic">
                          "{personality.kiwimuSays}"
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Actions (Outside the card so they don't get screenshot) */}
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 kiwimu-btn py-4 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest text-ink bg-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restart
                    </button>
                    <button
                      onClick={() => alert('長按圖片即可儲存至手機，或截圖分享至 IG 限動！')}
                      className="flex-[2] kiwimu-btn kiwimu-btn-primary py-4 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest text-ink shadow-[4px_4px_0px_#1A1A1A]"
                    >
                      <Download className="w-4 h-4" />
                      Save for IG Story
                    </button>
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
