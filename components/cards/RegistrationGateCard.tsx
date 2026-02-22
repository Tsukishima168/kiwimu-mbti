import React from 'react';
import { CardProps } from './Types';

export const RegistrationGateCard: React.FC<CardProps> = ({ user, onNext, onLogin, onSkipRegistration, t }) => {
    return (
        <div className="w-full h-full flex flex-col bg-kiwi-dark text-white overflow-hidden pb-16 justify-center px-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-kiwi-dark opacity-50"></div>

            <div className="relative z-10 text-center max-w-sm mx-auto">
                <div className="mb-8 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2
                    className="text-2xl font-serif font-bold mb-4 tracking-wider leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: t('gate_title') || '' }}
                />

                <p className="text-gray-300 text-sm mb-12 font-serif leading-relaxed px-4">
                    {t('gate_desc')}
                </p>

                <div className="space-y-4">
                    {!user && (
                        <button
                            onClick={onLogin}
                            className="w-full bg-white text-kiwi-dark py-4 rounded-md text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            {t('gate_login')}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (onSkipRegistration) onSkipRegistration();
                            if (onNext) onNext();
                        }}
                        className="w-full bg-transparent border border-gray-500 text-gray-300 py-4 rounded-md text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors"
                    >
                        {user ? t('gate_continue') : t('gate_skip')}
                    </button>
                </div>
            </div>
        </div>
    );
};
