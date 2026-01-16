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
};

/**
 * Test Run operations
 */
export const saveTestRun = async (
    run: Omit<TestRun, 'id'>
): Promise<string> => {
    console.log('[DEBUG] saveTestRun: Writing to Firestore', { uid: run.uid, resultType: run.resultType, suffix: run.suffix });
    const runsCollection = collection(db, 'test_runs');
    const docRef = await addDoc(runsCollection, {
        ...run,
        finishedAt: Date.now(),
    });
    console.log('[DEBUG] saveTestRun: Success, doc ID:', docRef.id);
    return docRef.id;
};

export const getTestRuns = async (uid: string): Promise<TestRun[]> => {
    console.log('[DEBUG] getTestRuns: Querying Firestore for uid:', uid);
    const runsCollection = collection(db, 'test_runs');

    // TEMPORARY: Removed orderBy to bypass index requirement
    // Once Firestore index is built, uncomment the orderBy line
    const q = query(
        runsCollection,
        where('uid', '==', uid)
        // orderBy('finishedAt', 'desc')  // TODO: Re-enable after index builds
    );

    const snapshot = await getDocs(q);
    console.log('[DEBUG] getTestRuns: Found', snapshot.docs.length, 'documents');
    const runs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TestRun[];

    // Manual sort in-memory since we can't use orderBy yet
    runs.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));

    console.log('[DEBUG] getTestRuns: Returning runs:', runs);
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
