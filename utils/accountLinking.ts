import { signInWithPopup, signInWithCustomToken, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firestore.config';

/**
 * Google account login with data preservation
 * Uses signInWithPopup instead of linkWithPopup to avoid popup-blocked errors
 */
export const linkGoogleAccount = async (): Promise<UserCredential> => {
    const currentUser = auth.currentUser;
    const anonymousUid = currentUser?.isAnonymous ? currentUser.uid : null;

    try {
        console.log('Google login initiated...', { isAnonymous: currentUser?.isAnonymous });

        const result = await signInWithPopup(auth, googleProvider);

        // If we had anonymous data, migrate it
        if (anonymousUid && result.user.uid !== anonymousUid) {
            console.log('Migrating data from anonymous to Google account...', {
                from: anonymousUid,
                to: result.user.uid
            });
            await migrateUserData(anonymousUid, result.user.uid);
        }

        return result;
    } catch (error: any) {
        console.error('Google login failed:', error);
        throw error;
    }
};

/**
 * LINE account login with custom token
 * Creates Firebase user from LINE custom token and migrates anonymous data
 */
export const linkAnonymousAccount = async (customToken: string): Promise<void> => {
    const currentUser = auth.currentUser;
    const anonymousUid = currentUser?.isAnonymous ? currentUser.uid : null;

    console.log('LINE login: signing in with custom token...', {
        isAnonymous: currentUser?.isAnonymous,
        anonymousUid
    });

    try {
        // Sign in with LINE custom token
        const result = await signInWithCustomToken(auth, customToken);
        console.log('LINE login successful:', { uid: result.user.uid });

        // Migrate anonymous data if exists
        if (anonymousUid && result.user.uid !== anonymousUid) {
            console.log('Migrating data from anonymous to LINE account...', {
                from: anonymousUid,
                to: result.user.uid
            });
            await migrateUserData(anonymousUid, result.user.uid);
        }
    } catch (error) {
        console.error('LINE account linking failed:', error);
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
            batch.update(runDoc.ref, { uid: newUid });
        });

        // 3. Commit all changes
        await batch.commit();

        console.log(`Migration complete: ${progressSnapshot.size} progress records, ${runsSnapshot.size} test runs`);
    } catch (error) {
        console.error('Data migration failed:', error);
        // Don't throw - partial migration is better than no migration
    }
}

/**
 * Check if current user is anonymous
 */
export const isAnonymousUser = (): boolean => {
    return auth.currentUser?.isAnonymous || false;
};

/**
 * Get display text for account status
 */
export const getAccountStatus = (): string => {
    const user = auth.currentUser;
    if (!user) return '未登入';
    if (user.isAnonymous) return '訪客模式';
    return '已登入';
};
