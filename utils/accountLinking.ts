import { auth as firebaseAuth } from '../firebase';
import { linkWithCredential, EmailAuthProvider, signInWithCustomToken } from 'firebase/auth';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firestore.config';

/**
 * Link anonymous account with LINE/Google account
 * This preserves all quiz progress and test runs from anonymous account
 */
export const linkAnonymousAccount = async (customToken: string): Promise<void> => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
        throw new Error('No user is currently signed in');
    }

    // If user is not anonymous, just sign in normally
    if (!currentUser.isAnonymous) {
        await signInWithCustomToken(firebaseAuth, customToken);
        return;
    }

    const anonymousUid = currentUser.uid;

    try {
        // Step 1: Sign in with new account in a temporary way to get the new UID
        // We need to know what the new UID will be before linking
        // Unfortunately Firebase doesn't give us the new UID before linking

        // Strategy: Sign out anonymous, sign in with custom token, get new UID,
        // then migrate data from anonymous UID to new UID

        await firebaseAuth.signOut();
        const newUserCredential = await signInWithCustomToken(firebaseAuth, customToken);
        const newUid = newUserCredential.user.uid;

        console.log('Account linking: migrating data from', anonymousUid, 'to', newUid);

        // Step 2: Migrate data from anonymous UID to new UID
        await migrateUserData(anonymousUid, newUid);

        console.log('Account linking completed successfully');
    } catch (error) {
        console.error('Account linking failed:', error);
        throw error;
    }
};

/**
 * Migrate all user data from old UID to new UID
 */
async function migrateUserData(oldUid: string, newUid: string): Promise<void> {
    const batch = writeBatch(db);

    try {
        // 1. Migrate quiz_progress
        const progressQuery = query(
            collection(db, 'quiz_progress'),
            where('uid', '==', oldUid)
        );
        const progressSnapshot = await getDocs(progressQuery);

        progressSnapshot.forEach((progressDoc) => {
            const data = progressDoc.data();
            const newDocId = progressDoc.id.replace(oldUid, newUid);
            const newDocRef = doc(db, 'quiz_progress', newDocId);
            batch.set(newDocRef, { ...data, uid: newUid });
            batch.delete(progressDoc.ref);
        });

        // 2. Migrate test_runs
        const runsQuery = query(
            collection(db, 'test_runs'),
            where('uid', '==', oldUid)
        );
        const runsSnapshot = await getDocs(runsQuery);

        runsSnapshot.forEach((runDoc) => {
            const data = runDoc.data();
            batch.update(runDoc.ref, { uid: newUid });
        });

        // 3. Commit all changes
        await batch.commit();

        console.log(`Migrated ${progressSnapshot.size} progress records and ${runsSnapshot.size} test runs`);
    } catch (error) {
        console.error('Data migration failed:', error);
        throw error;
    }
}

/**
 * Check if current user is anonymous
 */
export const isAnonymousUser = (): boolean => {
    return firebaseAuth.currentUser?.isAnonymous || false;
};

/**
 * Get display text for account status
 */
export const getAccountStatus = (): string => {
    const user = firebaseAuth.currentUser;
    if (!user) return '未登入';
    if (user.isAnonymous) return '訪客模式';
    return '已登入';
};
