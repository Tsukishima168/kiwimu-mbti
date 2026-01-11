
import {
    linkWithPopup,
    signInWithPopup,
    GoogleAuthProvider,
    User,
    AuthCredential,
    linkWithCredential,
    UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const linkGoogleAccount = async (): Promise<UserCredential> => {
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.isAnonymous) {
        try {
            console.log('Attempting to link Google account to anonymous session...');
            return await linkWithPopup(currentUser, googleProvider);
        } catch (error: any) {
            if (error.code === 'auth/credential-already-in-use') {
                // The Google account is already linked to another user.
                // In this case, we must sign in with the existing account.
                // TODO: We technically "lose" the current anonymous data unless we merge it manually.
                // For MVP, we'll just sign in to the existing account.
                console.warn('Google account already exists. Signing in instead of linking.');
                return await signInWithPopup(auth, googleProvider);
            }
            throw error;
        }
    } else {
        return await signInWithPopup(auth, googleProvider);
    }
};

// For LINE, we use custom token, so we need linkWithCredential
export const linkAnonymousAccount = async (customToken: string) => {
    // This is handled in LoginCallback usually, but good to have helper
    // Note: linkWithCredential requires an AuthCredential, but signInWithCustomToken gives us a User.
    // Firebase doesn't support "linkWithCustomToken" directly in the same way.
    // Workaround: Sign in with custom token to get the "target" user, then we might need to merge data manually?
    // OR: Since we are using custom auth for LINE, we can't easily "link" it to an anonymous firebase user 
    // without a custom token that represents the CREDENTIAL, not the USER.
    // 
    // Actually, sign in with custom token signs you in as that user.
    // If we want to merge, we have to do it at database level.

    // For now, let's just sign in. Data merging is a "Nice to have" for LINE if linking is hard.
    // But wait, the objective is "Data Retention".

    // If we can't link credentials easily for Custom Token, we rely on the logic:
    // 1. Sign in as LINE user (new UID)
    // 2. Copy data from Anonymous UID (saved in local/session) to New UID

    // We will handle this data copy in the components.
    return;
};
