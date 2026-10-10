import React, { useEffect, useId, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './quiz-ui.css';

interface ResumeModalProps {
    onResume: () => void;
    onRestart: () => void;
    progress: { currentIndex: number; total: number };
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
    onResume,
    onRestart,
    progress,
}) => {
    const { t } = useLanguage();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();
        return () => dialog.close();
    }, []);
    const progressText = t('resume_progress')
        .replace('{current}', String(progress.currentIndex))
        .replace('{total}', String(progress.total));

    return (
        <dialog ref={dialogRef} className="quiz-resume" aria-labelledby={titleId} aria-describedby={descriptionId}
            onCancel={event => { event.preventDefault(); onResume(); }}
            onKeyDown={event => {
                if (event.key !== 'Tab') return;
                const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
                if (!buttons?.length) return;
                const first = buttons[0], last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }}>
                {/* Header */}
                <div className="mb-6">
                    <h2 id={titleId} className="text-2xl font-serif font-medium text-kiwi-dark mb-3">
                        {t('resume_title')}
                    </h2>
                    <p id={descriptionId} className="text-gray-600 text-base leading-relaxed">
                        {progressText}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        {t('resume_saved')}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-1 bg-gray-100 w-full rounded-full overflow-hidden">
                        <div
                            className="h-full bg-kiwi-dark transition-[width] duration-500"
                            style={{ width: `${(progress.currentIndex / progress.total) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="quiz-resume-actions">
                    <button
                        type="button"
                        autoFocus
                        onClick={onResume}
                        className="flex-1 bg-kiwi-dark text-white py-3.5 px-6 hover:bg-opacity-90 transition-all duration-200 font-medium tracking-wide"
                    >
                        {t('resume_resume')}
                    </button>
                    <button
                        type="button"
                        onClick={onRestart}
                        className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 px-6 hover:border-kiwi-dark hover:text-kiwi-dark transition-all duration-200 font-medium tracking-wide"
                    >
                        {t('resume_restart')}
                    </button>
                </div>

                {/* Hint */}
                <p className="text-xs text-gray-600 text-center mt-5 leading-relaxed">
                    {t('resume_hint')}
                </p>
        </dialog>
    );
};

export default ResumeModal;
