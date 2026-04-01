import React from 'react';
import '../components/v2/v2.css';

const Today: React.FC = () => {
  return (
    <div className="v2-root min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <p
          className="text-base font-medium mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}
        >
          月島今日特選，即將登場
        </p>
        <a
          href="/state-test"
          className="kiwimu-btn kiwimu-btn-primary inline-block px-6 py-2 text-sm font-medium"
          style={{ color: '#1A1A1A' }}
        >
          先去做測驗
        </a>
      </div>
    </div>
  );
};

export default Today;
