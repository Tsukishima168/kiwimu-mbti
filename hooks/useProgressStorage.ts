import { useState, useEffect } from 'react';
import { Option } from '../types';
import { CURRENT_QUIZ_VERSION } from '../firestore.config';

const STORAGE_KEY = 'kiwimu_quiz_progress';

export interface LocalProgress {
    answers: Option[];
    currentIndex: number;
    quizVersion: string;
    updatedAt: number;
}

export const useProgressStorage = () => {
    const [hasProgress, setHasProgress] = useState(false);

    // 檢查是否有未完成進度
    useEffect(() => {
        const saved = loadProgress();
        setHasProgress(saved !== null && saved.quizVersion === CURRENT_QUIZ_VERSION);
    }, []);

    const saveProgress = (answers: Option[], currentIndex: number) => {
        const progress: LocalProgress = {
            answers,
            currentIndex,
            quizVersion: CURRENT_QUIZ_VERSION,
            updatedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        setHasProgress(true);
    };

    const loadProgress = (): LocalProgress | null => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;
        try {
            const progress = JSON.parse(saved) as LocalProgress;
            // 只返回當前版本的進度
            if (progress.quizVersion === CURRENT_QUIZ_VERSION) {
                return progress;
            }
            // 舊版本進度自動清除
            clearProgress();
            return null;
        } catch {
            return null;
        }
    };

    const clearProgress = () => {
        localStorage.removeItem(STORAGE_KEY);
        setHasProgress(false);
    };

    return { hasProgress, saveProgress, loadProgress, clearProgress };
};
