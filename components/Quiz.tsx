
import React, { useState, useEffect, useMemo } from 'react';
import { Option, Question } from '../types';
import { QUESTIONS } from '../constants';

interface QuizProps {
  onComplete: (answers: Option[]) => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion: Question = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  // Image Preloading Logic
  useEffect(() => {
    const nextQuestion = QUESTIONS[currentIndex + 1];
    if (nextQuestion && nextQuestion.imageUrl) {
        const img = new Image();
        img.src = nextQuestion.imageUrl;
    }
  }, [currentIndex]);

  // 隨機洗牌邏輯
  const shuffledOptions = useMemo(() => {
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const handleOptionSelect = (option: Option) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      } else {
        onComplete(newAnswers);
      }
    }, 400); // 加快一點過場速度
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || isAnimating) return;
    setCurrentIndex(prev => prev - 1);
    setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers.pop();
        return newAnswers;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-kiwi-bg">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-kiwi-bg/95 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto px-6 h-20 flex items-end justify-between pb-4">
                <h1 className="text-sm font-display font-bold text-kiwi-dark tracking-[0.2em] uppercase">
                    Kiwimu Lab
                </h1>
                <div className="flex items-center gap-3 text-xs font-mono tracking-wider text-gray-400">
                     <span>{String(currentIndex + 1).padStart(2, '0')}</span>
                     <span className="w-12 h-[1px] bg-gray-300"></span>
                     <span>{String(QUESTIONS.length).padStart(2, '0')}</span>
                </div>
            </div>
            <div className="h-[1px] bg-gray-100 w-full">
                <div 
                    className="h-full bg-kiwi-dark transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col pt-24 pb-12 px-6 justify-center">
            <div className="max-w-2xl mx-auto w-full">
                
                {/* Question Container */}
                <div className={`transition-all duration-500 transform ${isAnimating ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'}`}>
                    
                    {/* Atmospheric Image Block */}
                    <div className="w-full aspect-[21/9] mb-10 relative overflow-hidden bg-gray-100">
                        <img 
                            src={currentQuestion.imageUrl} 
                            alt="Atmosphere" 
                            className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-1000 ease-out hover:scale-105"
                        />
                        <div className="absolute inset-0 border border-black/5 pointer-events-none"></div>
                    </div>

                    {/* Text Area */}
                    <div className="mb-12 md:mb-16">
                        <h2 className="text-xl md:text-3xl font-serif font-medium text-kiwi-dark text-center leading-relaxed tracking-wide">
                            {currentQuestion.text}
                        </h2>
                    </div>

                    {/* Options Area */}
                    <div className="grid gap-5 max-w-xl mx-auto mb-16">
                        {shuffledOptions.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                className="group relative w-full p-6 md:p-8 text-center border border-gray-200 hover:border-kiwi-dark hover:bg-white transition-all duration-300 active:scale-[0.99] bg-white/50"
                            >
                                <span className="absolute top-4 left-4 text-[10px] font-mono text-gray-300 group-hover:text-kiwi-dark transition-colors uppercase tracking-widest">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="block text-base md:text-lg text-gray-700 font-light leading-relaxed group-hover:text-black group-hover:font-normal">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Previous Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0 || isAnimating}
                            className={`
                                flex items-center gap-3 px-6 py-3 text-[10px] font-mono tracking-[0.2em] uppercase transition-all duration-300 rounded-full border border-transparent hover:border-gray-200
                                ${currentIndex === 0 
                                    ? 'opacity-0 pointer-events-none' 
                                    : 'text-gray-400 hover:text-kiwi-dark cursor-pointer'
                                }
                            `}
                        >
                            <span>←</span>
                            <span>BACK</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default Quiz;
