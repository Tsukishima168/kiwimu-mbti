import React, { useEffect, useState } from 'react';

interface LoadingProps {
  onFinished: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);

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
              <span>PROCESSING 資料運算中</span>
              <span>{progress}%</span>
          </div>
          <div className="h-[2px] bg-gray-200 w-full overflow-hidden">
              <div 
                className="h-full bg-kiwi-dark transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
          </div>
      </div>
      <p className="mt-8 text-xs text-gray-400 tracking-[0.3em] animate-pulse uppercase">
          Analysing Cognitive Functions 分析認知功能
      </p>
    </div>
  );
};

export default Loading;