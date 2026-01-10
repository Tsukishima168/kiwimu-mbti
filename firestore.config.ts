import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);

// Version constants
export const CURRENT_QUIZ_VERSION = 'v1-20250110';
export const CURRENT_SCORING_VERSION = 'score-v1';
export const CURRENT_DESSERT_VERSION = 'dessert-2026Q1';
