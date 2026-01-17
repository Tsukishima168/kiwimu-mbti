
import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    id?: string;
    className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    subtitle,
    children,
    defaultOpen = false,
    id,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div id={id} className={`border-b border-gray-100 transition-all duration-500 ease-in-out ${className} ${isOpen ? 'py-12 md:py-20' : 'py-6 md:py-8'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full group flex flex-col items-center justify-center text-center focus:outline-none"
            >
                <div className="flex items-center gap-3 md:gap-4 transition-transform duration-300">
                    <h3 className="text-[10px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.4em] text-gray-400 group-hover:text-kiwi-dark font-mono uppercase transition-colors">
                        {title}
                        {subtitle && <span className="block mt-1 md:inline md:mt-0 md:ml-2 opacity-70 group-hover:opacity-100 transition-opacity">{subtitle}</span>}
                    </h3>
                    <span className={`transform transition-transform duration-500 text-gray-300 group-hover:text-kiwi-dark ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                </div>
                {!isOpen && (
                    <span className="text-[9px] text-gray-300 mt-2 font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">CLICK TO EXPAND</span>
                )}
            </button>

            <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-12 md:mt-16' : 'max-h-0 opacity-0 mt-0'}`}
            >
                {children}
            </div>
        </div>
    );
};

export default CollapsibleSection;
