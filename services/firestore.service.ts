import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy
} from 'firebase/firestore';
import { db, CURRENT_QUIZ_VERSION } from '../firestore.config';
import { QuizProgress, TestRun, UserDocument, UserProfile, UserProfileSetupInput } from '../types';
import {
    upsertUser,
    saveQuizProgressToSupabase,
    deleteQuizProgressFromSupabase,
    saveTestRunToSupabase,
    saveUserPreferencesToSupabase,
    completeUserProfileSetupToSupabase,
} from './supabase-user.service';

type FirestoreMirrorOptions = {
    skipSupabaseMirror?: boolean;
};

type FirestoreTestRunOptions = FirestoreMirrorOptions & {
    preferredId?: string;
    preferredShareId?: string;
    preferredShareUrl?: string;
    preferredFinishedAt?: number;
};

/**
 * User operations
 */
export const createOrUpdateUser = async (
    uid: string,
    data: Partial<UserDocument>,
    options: FirestoreMirrorOptions = {}
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
    if (!options.skipSupabaseMirror) {
        void upsertUser(uid, {
            displayName: data.displayName,
            email: data.email,
            profile: data.profile ? (data.profile as unknown as Record<string, unknown>) : undefined,
        });
    }
};

export const getUser = async (uid: string): Promise<UserDocument | null> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return userDoc.data() as UserDocument;
    }
    return null;
};

export const getUserPreferences = async (
    uid: string
): Promise<UserProfile['preferences'] | null> => {
    const userDoc = await getUser(uid);
    return userDoc?.profile?.preferences ?? null;
};

export const saveUserPreferences = async (
    uid: string,
    preferences: UserProfile['preferences'],
    options: FirestoreMirrorOptions = {}
): Promise<void> => {
    const userRef = doc(db, 'users', uid);

    await setDoc(userRef, {
        profile: {
            preferences,
        },
        lastActiveAt: Date.now(),
    }, { merge: true });

    if (!options.skipSupabaseMirror) {
        void saveUserPreferencesToSupabase(uid, preferences);
    }
};

export const completeUserProfileSetup = async (
    uid: string,
    input: UserProfileSetupInput,
    options: FirestoreMirrorOptions = {}
): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    const existingUser = await getUser(uid);
    const nextProfile: UserProfile = {
        ...(existingUser?.profile ?? {}),
        setup: {
            ...(existingUser?.profile?.setup ?? {}),
            nickname: input.displayName,
            birthday: input.birthday ?? null,
            city: input.city ?? null,
            interests: input.interests,
            completed: true,
            completedAt: Date.now(),
        },
    };

    await setDoc(userRef, {
        uid,
        displayName: input.displayName,
        birthday: input.birthday ?? null,
        city: input.city ?? null,
        interests: input.interests,
        isProfileSetup: true,
        email: input.email ?? null,
        createdAt: existingUser?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
        profile: nextProfile,
    }, { merge: true });

    if (!options.skipSupabaseMirror) {
        void completeUserProfileSetupToSupabase(uid, input);
    }
};

/**
 * Quiz Progress operations
 */
export const saveProgressToCloud = async (
    uid: string,
    progress: Omit<QuizProgress, 'uid'>,
    options: FirestoreMirrorOptions = {}
): Promise<void> => {
    const progressDocId = `${uid}_${progress.quizVersion}`;
    const progressRef = doc(db, 'quiz_progress', progressDocId);

    await setDoc(progressRef, {
        uid,
        ...progress,
        updatedAt: Date.now(),
    });

    // 雙寫到 Supabase（fire-and-forget）
    if (!options.skipSupabaseMirror) {
        void saveQuizProgressToSupabase(uid, progress);
    }
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
    quizVersion: string = CURRENT_QUIZ_VERSION,
    options: FirestoreMirrorOptions = {}
): Promise<void> => {
    const progressDocId = `${uid}_${quizVersion}`;
    const progressRef = doc(db, 'quiz_progress', progressDocId);
    await deleteDoc(progressRef);

    // 雙寫到 Supabase（fire-and-forget）
    if (!options.skipSupabaseMirror) {
        void deleteQuizProgressFromSupabase(uid, quizVersion);
    }
};

/**
 * Generate a unique share ID for test results
 */
const generateShareId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${random}`.toUpperCase();
};

export const createFirestoreTestRunId = (): string => doc(collection(db, 'test_runs')).id;

/**
 * Test Run operations
 */
export const saveTestRun = async (
    run: Omit<TestRun, 'id'>,
    options: FirestoreTestRunOptions = {}
): Promise<string> => {
    const runsCollection = collection(db, 'test_runs');

    // Generate share ID for this test
    const shareId = options.preferredShareId ?? generateShareId();
    const shareUrl = options.preferredShareUrl ?? `https://kiwimu.com/r/${shareId}`;
    const finishedAt = options.preferredFinishedAt ?? Date.now();
    const runId = options.preferredId ?? doc(runsCollection).id;
    const runRef = doc(runsCollection, runId);

    await setDoc(runRef, {
        ...run,
        finishedAt,
        shareId,
        shareUrl,
        isPublic: true, // Allow sharing by default
    });

    // Create share link mapping
    const shareLinkRef = doc(db, 'share_links', shareId);
    await setDoc(shareLinkRef, {
        uid: run.uid,
        testId: runId,
        mbtiType: run.mbtiType,
        createdAt: Date.now(),
    });

    if (!options.skipSupabaseMirror) {
        // 雙寫到 Supabase（fire-and-forget）
        void saveTestRunToSupabase(runId, run, shareId, shareUrl);
    }

    return runId;
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
