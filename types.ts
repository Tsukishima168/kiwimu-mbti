
export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent';

export interface Option {
  label: string;
  value: Dimension;
}

export interface Question {
  id: number;
  text: string;
  imageUrl: string;
  dimensionPair: 'EI' | 'SN' | 'TF' | 'JP' | 'AT';
  options: [Option, Option];
  weight?: number;
}

export interface Dessert {
  name: string;
  description: string;
  imageUrl: string;
  ctaLink: string;
}

export interface MbtiResultData {
  id: string;
  title: string;
  summary: string;
  quote: string;
  keywords: string[];
  bgColor: string; // 新增專屬背景色

  coreAnalysis: string;

  dimensionAnalysis: {
    EI: string;
    SN: string;
    TF: string;
    JP: string;
    AT: string;
  };

  strengths: string[];
  blindSpots: string[];

  career: {
    style: string;
    advice: string;
    suitableJobs: string[];
  };

  relationships: {
    style: string;
    strengths: string;
    advice: string;
  };

  socialStyle: string;

  growthAdvice: string;
  soulQuestions: string[];

  characterImage: string;
  dessert: Dessert;
}

export interface Score {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
  A: number;
  Turbulent: number;
}

/** Quiz Progress（測驗進度） */
export interface QuizProgress {
  uid: string;
  answers: Option[];
  currentIndex: number;
  quizVersion: string;
  updatedAt: number; // timestamp
}

/** Test Run（測驗結果歷程） */
export interface TestRun {
  id?: string; // Firestore document ID
  uid: string;
  mbtiType?: string; // Full MBTI type (e.g., "INTJ-A") for sharing
  resultType: string; // e.g., "INTJ"
  suffix: 'A' | 'T';
  scores: Score;
  quizVersion: string;
  scoringVersion: string;
  dessertCatalogVersion: string;
  finishedAt: number; // timestamp
  shareId?: string; // Unique share ID
  shareUrl?: string; // Full shareable URL
  isPublic?: boolean; // Whether result can be publicly shared
}

/** User Profile（用戶個人檔案） */
export interface UserProfile {
  displayName?: string;
  avatar?: string;

  preferences: {
    language: 'zh' | 'en';
    notifications: {
      newFeatures: boolean;
      weeklyInsights: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      shareResults: boolean;
    };
  };

  stats?: {
    totalTests: number;
    firstTestDate: number;
    mostCommonType: string;
    lastTestDate: number;
  };
}

/** User Document（用戶基本資料） */
export interface UserDocument {
  uid: string;
  displayName?: string;
  email?: string;
  createdAt: number;
  lastActiveAt: number;
  profile?: UserProfile;
}
