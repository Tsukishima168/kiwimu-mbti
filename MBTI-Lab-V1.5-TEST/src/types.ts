export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'T';

export interface Option {
  text: string;
  value: Dimension;
  visual: string;
}

export interface Question {
  id: string;
  dimension: string;
  text: string;
  options: Option[];
}

export interface QuizType {
  id: 'A' | 'B';
  title: string;
  description: string;
  questions: Question[];
}

export interface Personality {
  id: string;
  name: string;
  core: string;
  kiwimuSays: string;
}
