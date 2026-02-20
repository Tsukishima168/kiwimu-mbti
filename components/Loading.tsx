import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingProps {
  onFinished: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onFinished();
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 30ms * 100 = 3000ms total

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg">
      <div className="w-64">
        <div className="flex justify-between text-xs font-mono tracking-widest text-kiwi-dark mb-2">
          <span>{t('loading_processing')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-[2px] bg-gray-200 w-full overflow-hidden">
          <div
            className="h-full bg-kiwi-dark transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-10 px-6 text-center">
        <p className="text-[10px] md:text-xs text-gray-400 tracking-[0.3em] animate-pulse uppercase leading-loose">
          {t('loading_analyzing')}<br />
          <span className="mt-2 block">{t('loading_analyzing_sub')}</span>
        </p>
      </div>
    </div>
  );
};

export default Loading;