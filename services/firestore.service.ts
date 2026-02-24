import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db, CURRENT_QUIZ_VERSION } from '../firestore.config';
import { QuizProgress, TestRun, UserDocument } from '../types';
import {
    upsertUser,
    saveQuizProgressToSupabase,
    deleteQuizProgressFromSupabase,
    saveTestRunToSupabase,
} from './supabase-user.service';

/**
 * User operations
 */
export const createOrUpdateUser = async (
    uid: string,
    data: Partial<UserDocument>
): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // Create new user
        await setDoc(userRef, {
            uid,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            ...data,
        });
    } else {
        // Update existing user
        await updateDoc(userRef, {
            lastActiveAt: Date.now(),
            ...data,
        });
    }

    // 雙寫到 Supabase（fire-and-forget，失敗不影響主流程）
    void upsertUser(uid, {
        displayName: data.displayName,
        email: data.email,
        profile: data.profile as Record<string, unknown> | undefined,
    });
};

export const getUser = async (uid: string): Promise<UserDocument | null> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return userDoc.data() as UserDocument;
    }
    return null;
};

/**
 * Quiz Progress operations
 */
export const saveProgressToCloud = async (
    uid: string,
    progress: Omit<QuizProgress, 'uid'>
): Promise<void> => {
    const progressDocId = `${uid}_${progress.quizVersion}`;
    const progressRef = doc(db, 'quiz_progress', progressDocId);

    await setDoc(progressRef, {
        uid,
        ...progress,
        updatedAt: Date.now(),
    });

    // 雙寫到 Supabase（fire-and-forget）
    void saveQuizProgressToSupabase(uid, progress);
};

export const loadProgressFromCloud = async (
    uid: string,
    quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<QuizProgress | null> => {
    const progressDocId = `${uid}_${quizVersion}`;
    const progressRef = doc(db, 'quiz_progress', progressDocId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
        return progressDoc.data() as QuizProgress;
    }
    return null;
};

export const deleteProgress = async (
    uid: string,
    quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<void> => {
    const progressDocId = `${uid}_${quizVersion}`;
    const progressRef = doc(db, 'quiz_progress', progressDocId);
    await deleteDoc(progressRef);

    // 雙寫到 Supabase（fire-and-forget）
    void deleteQuizProgressFromSupabase(uid, quizVersion);
};

/**
 * Generate a unique share ID for test results
 */
const generateShareId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${random}`.toUpperCase();
};

/**
 * Test Run operations
 */
export const saveTestRun = async (
    run: Omit<TestRun, 'id'>
): Promise<string> => {
    const runsCollection = collection(db, 'test_runs');

    // Generate share ID for this test
    const shareId = generateShareId();
    const shareUrl = `https://kiwimu.com/r/${shareId}`;

    const docRef = await addDoc(runsCollection, {
        ...run,
        finishedAt: Date.now(),
        shareId,
        shareUrl,
        isPublic: true, // Allow sharing by default
    });

    // Create share link mapping
    const shareLinkRef = doc(db, 'share_links', shareId);
    await setDoc(shareLinkRef, {
        uid: run.uid,
        testId: docRef.id,
        mbtiType: run.mbtiType,
        createdAt: Date.now(),
    });

    // 雙寫到 Supabase（fire-and-forget）
    void saveTestRunToSupabase(docRef.id, run, shareId, shareUrl);

    return docRef.id;
};

export const getTestRuns = async (uid: string): Promise<TestRun[]> => {
    const runsCollection = collection(db, 'test_runs');

    // TEMPORARY: Removed orderBy to bypass index requirement
    // Once Firestore index is built, uncomment the orderBy line
    const q = query(
        runsCollection,
        where('uid', '==', uid)
        // orderBy('finishedAt', 'desc')  // TODO: Re-enable after index builds
    );

    const snapshot = await getDocs(q);
    const runs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TestRun[];

    // Manual sort in-memory since we can't use orderBy yet
    runs.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));

    return runs;
};

export const getTestRunById = async (runId: string): Promise<TestRun | null> => {
    const runRef = doc(db, 'test_runs', runId);
    const runDoc = await getDoc(runRef);

    if (runDoc.exists()) {
        return {
            id: runDoc.id,
            ...runDoc.data(),
        } as TestRun;
    }
    return null;
};

export const getLatestTestRun = async (uid: string): Promise<TestRun | null> => {
    const runsCollection = collection(db, 'test_runs');
    const q = query(
        runsCollection,
        where('uid', '==', uid),
        orderBy('finishedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
        const firstDoc = snapshot.docs[0];
        return {
            id: firstDoc.id,
            ...firstDoc.data(),
        } as TestRun;
    }
    return null;
};

/**
 * Get shared test result by share ID
 */
export const getSharedTestResult = async (shareId: string): Promise<TestRun | null> => {
    try {
        // First, get the share link mapping
        const shareLinkRef = doc(db, 'share_links', shareId);
        const shareLinkDoc = await getDoc(shareLinkRef);

        if (!shareLinkDoc.exists()) {
            return null;
        }

        const { testId } = shareLinkDoc.data();

        // Then get the actual test run
        const testRun = await getTestRunById(testId);

        // Only return if test is public
        if (testRun && testRun.isPublic !== false) {
            return testRun;
        }

        return null;
    } catch (error) {
        console.error('Error getting shared test result:', error);
        return null;
    }
};
