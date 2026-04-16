import React, { useEffect, useRef } from 'react';
import { CardProps } from './Types';
import { trackButtonClick, trackLoginGateOpened } from '../../utils/analytics';

export const RegistrationGateCard: React.FC<CardProps> = ({ user, onNext, onLogin, onSkipRegistration, t }) => {
    const hasLoggedView = useRef(false);

    useEffect(() => {
        if (!hasLoggedView.current) {
            hasLoggedView.current = true;
            trackLoginGateOpened({ trigger: 'view' });
        }
    }, []);

    const handleLogin = () => {
        if (onLogin) onLogin();
    };

    const handleSkip = () => {
        trackButtonClick('gate_skip', 'registration_gate_card');
        if (onSkipRegistration) onSkipRegistration();
        if (onNext) onNext();
    };

    return (
        <div className="w-full h-full flex flex-col bg-kiwi-dark text-white overflow-hidden pb-16 justify-center px-8 relative">
            {/* Background atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(198,255,0,0.06)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(198,255,0,0.04)_0%,_transparent_50%)] pointer-events-none" />

            {/* Kiwimu watermark in background */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
                style={{ opacity: 0.04 }}
            >
                <img
                    src="https://res.cloudinary.com/dvizdsv4m/image/upload/v1769501231/%E6%A8%99%E6%BA%96%E5%AD%97-02_ndnf7x.png"
                    alt=""
                    crossOrigin="anonymous"
                    style={{ width: '140%', transform: 'rotate(-8deg)', objectFit: 'contain' }}
                />
            </div>

            <div className="relative z-10 text-center max-w-sm mx-auto">
                {/* Icon — cosmic seal instead of lock */}
                <div className="mb-8 flex justify-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(198,255,0,0.12)', border: '1.5px solid rgba(198,255,0,0.35)' }}
                    >
                        {/* Sparkle / constellation icon */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.5 4.5h4.5l-3.75 2.7 1.5 4.5L12 12l-3.75 2.7 1.5-4.5L6 7.5h4.5L12 3z" />
                            <path d="M5 18l1 2M18 5l1 2M5 5l1 2" opacity="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Pulsing "disappearing" hint — i18n */}
                <div className="mb-5 flex items-center justify-center gap-2">
                    <span
                        className="inline-block w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#C6FF00' }}
                    />
                    <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#C6FF00', opacity: 0.85 }}>
                        {t('gate_dissolving') || '配方消散中'}
                    </span>
                    <span
                        className="inline-block w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#C6FF00', animationDelay: '0.5s' }}
                    />
                </div>

                {/* Title */}
                <h2
                    className="text-2xl font-serif font-bold mb-4 tracking-wider leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: t('gate_title') || '' }}
                />

                {/* Description with loss aversion */}
                <p className="text-gray-300 text-sm mb-12 font-serif leading-relaxed px-4">
                    {t('gate_desc')}
                </p>

                {/* CTAs */}
                <div className="space-y-4">
                    {!user && (
                        <button
                            onClick={handleLogin}
                            className="w-full py-4 rounded-md text-xs font-black tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            style={{ background: '#C6FF00', color: '#000' }}
                        >
                            {t('gate_login')}
                        </button>
                    )}

                    <button
                        onClick={handleSkip}
                        className="w-full bg-transparent border border-gray-600 text-gray-400 py-4 rounded-md text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 hover:text-gray-300 transition-all"
                    >
                        {user ? t('gate_continue') : t('gate_skip')}
                    </button>
                </div>
            </div>
        </div>
    );
};
