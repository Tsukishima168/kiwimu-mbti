
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
