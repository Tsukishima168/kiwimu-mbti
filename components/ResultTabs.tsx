import React, { useState, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface ResultTabsProps {
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
  activeTab?: string;
}

const ResultTabs: React.FC<ResultTabsProps> = ({ tabs, onTabChange, activeTab }) => {
  const [selected, setSelected] = useState(activeTab || tabs[0]?.id);

  useEffect(() => {
    if (activeTab) {
      setSelected(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setSelected(tabId);
    onTabChange(tabId);
    
    // 平滑滾動到對應區塊
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      const offset = 120; // Header 高度
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-4 md:py-5 
                text-xs md:text-sm font-mono font-bold tracking-wider uppercase 
                whitespace-nowrap border-b-2 transition-all duration-300
                ${selected === tab.id
                  ? 'border-kiwi-dark text-kiwi-dark'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <span className="text-base md:text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultTabs;
