import { useState, useEffect, useCallback } from 'react';
import { Option } from '../types';
import { CURRENT_QUIZ_VERSION } from '../constants/versions';
import { QUESTIONS } from '../constants';

const STORAGE_KEY = 'kiwimu_quiz_progress';

export interface LocalProgress {
    answers: Option[];
    currentIndex: number;
    quizVersion: string;
    updatedAt: number;
}

export const parseLocalProgress = (saved: string): LocalProgress | null => {
    try {
        const progress = JSON.parse(saved);
        if (!progress || progress.quizVersion !== CURRENT_QUIZ_VERSION
            || !Array.isArray(progress.answers) || progress.answers.length === 0
            || progress.answers.length >= QUESTIONS.length
            || !Number.isInteger(progress.currentIndex)
            || (progress.currentIndex !== progress.answers.length
                && progress.currentIndex !== progress.answers.length - 1)
            || !Number.isFinite(progress.updatedAt)
            || !progress.answers.every((answer: Option, index: number) =>
                answer && typeof answer.label === 'string'
                && QUESTIONS[index].options.some(option => option.value === answer.value))) {
            return null;
        }
        // The answer is saved before the slide animation advances the index.
        // Resume at the next unanswered question even if the page closed mid-animation.
        return { ...progress, currentIndex: progress.answers.length };
    } catch {
        return null;
    }
};

export const useProgressStorage = () => {
    const [hasProgress, setHasProgress] = useState(false);

    const clearProgress = useCallback(() => {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ }
        setHasProgress(false);
    }, []);

    const loadProgress = useCallback((): LocalProgress | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return null;
            const progress = parseLocalProgress(saved);
            if (!progress) clearProgress();
            return progress;
        } catch {
            return null;
        }
    }, [clearProgress]);

    useEffect(() => {
        setHasProgress(loadProgress() !== null);
    }, [loadProgress]);

    const saveProgress = (answers: Option[], currentIndex: number) => {
        const progress: LocalProgress = {
            answers,
            currentIndex,
            quizVersion: CURRENT_QUIZ_VERSION,
            updatedAt: Date.now(),
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            setHasProgress(true);
        } catch {
            // A blocked/full browser store must not interrupt answering.
            setHasProgress(false);
        }
    };

    return { hasProgress, saveProgress, loadProgress, clearProgress };
};
