
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

const hasFirebaseCoreConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (hasFirebaseCoreConfig) {
  try {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('[firebase] auth init skipped:', error);
  }
} else {
  console.warn('[firebase] missing auth env, running without auth provider');
}

// 僅在瀏覽器環境支援時初始化 Analytics（避免 SSR / 部分瀏覽器報錯）
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (hasFirebaseCoreConfig && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { auth, googleProvider, analytics };
