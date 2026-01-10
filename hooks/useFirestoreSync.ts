import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Option, TestRun, Score } from '../types';
import { CURRENT_QUIZ_VERSION, CURRENT_SCORING_VERSION, CURRENT_DESSERT_VERSION } from '../firestore.config';
import {
    createOrUpdateUser,
    saveProgressToCloud,
    loadProgressFromCloud,
    deleteProgress,
    saveTestRun,
    getTestRuns,
} from '../services/firestore.service';
import { useProgressStorage } from './useProgressStorage';

export const useFirestoreSync = (user: User | null) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const { loadProgress: loadLocalProgress, clearProgress: clearLocalProgress } = useProgressStorage();

    /**
     * Sync local progress to cloud when user logs in
     */
    const syncLocalToCloud = async () => {
        if (!user) return;

        try {
            setIsSyncing(true);

            // Update user document
            await createOrUpdateUser(user.uid, {
                displayName: user.displayName || undefined,
                email: user.email || undefined,
            });

            // Sync local progress to cloud
            const localProgress = loadLocalProgress();
            if (localProgress && localProgress.answers.length > 0) {
                await saveProgressToCloud(user.uid, {
                    answers: localProgress.answers,
                    currentIndex: localProgress.currentIndex,
                    quizVersion: localProgress.quizVersion,
                    updatedAt: localProgress.updatedAt,
                });
            }
        } catch (error) {
            console.error('Error syncing local to cloud:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * Load progress from cloud (prioritize cloud over local)
     */
    const loadCloudProgress = async () => {
        if (!user) return null;

        try {
            const cloudProgress = await loadProgressFromCloud(user.uid);
            return cloudProgress;
        } catch (error) {
            console.error('Error loading cloud progress:', error);
            return null;
        }
    };

    /**
     * Save progress to cloud
     */
    const saveToCloud = async (answers: Option[], currentIndex: number) => {
        if (!user) return;

        try {
            await saveProgressToCloud(user.uid, {
                answers,
                currentIndex,
                quizVersion: CURRENT_QUIZ_VERSION,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error('Error saving progress to cloud:', error);
        }
    };

    /**
     * Clear progress from cloud
     */
    const clearCloudProgress = async () => {
        if (!user) return;

        try {
            await deleteProgress(user.uid, CURRENT_QUIZ_VERSION);
        } catch (error) {
            console.error('Error clearing cloud progress:', error);
        }
    };

    /**
     * Save completed test run
     */
    const saveCompletedTest = async (
        resultType: string,
        suffix: 'A' | 'T',
        scores: Score
    ): Promise<string | null> => {
        if (!user) return null;

        try {
            const runId = await saveTestRun({
                uid: user.uid,
                resultType,
                suffix,
                scores,
                quizVersion: CURRENT_QUIZ_VERSION,
                scoringVersion: CURRENT_SCORING_VERSION,
                dessertCatalogVersion: CURRENT_DESSERT_VERSION,
                finishedAt: Date.now(),
            });

            // Clear progress after saving test run
            await clearCloudProgress();
            clearLocalProgress();

            return runId;
        } catch (error) {
            console.error('Error saving test run:', error);
            return null;
        }
    };

    /**
     * Get all test runs for current user
     */
    const getUserTestRuns = async (): Promise<TestRun[]> => {
        if (!user) return [];

        try {
            return await getTestRuns(user.uid);
        } catch (error) {
            console.error('Error getting test runs:', error);
            return [];
        }
    };

    /**
     * Auto-sync on user login
     */
    useEffect(() => {
        if (user) {
            syncLocalToCloud();
        }
    }, [user?.uid]);

    return {
        isSyncing,
        syncLocalToCloud,
        loadCloudProgress,
        saveToCloud,
        clearCloudProgress,
        saveCompletedTest,
        getUserTestRuns,
    };
};
