
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBiG4Z8ccrx_nswypmuaeFaLAqtnH6Eqj8",
  authDomain: "kiwimu-mbti.firebaseapp.com",
  projectId: "kiwimu-mbti",
  storageBucket: "kiwimu-mbti.firebasestorage.app",
  messagingSenderId: "537717488268",
  appId: "1:537717488268:web:e1586a9d8d5be06c0f59a9",
  measurementId: "G-2NBWRX24YR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
