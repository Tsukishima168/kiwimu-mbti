export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A';

export interface V2Option {
  text: string;
  value: Dimension;
  visual: string;
}

export interface V2Question {
  id: string;
  dimension: string;
  text: string;
  options: V2Option[];
}

export interface QuizType {
  id: 'A' | 'B';
  title: string;
  description: string;
  questions: V2Question[];
}

export interface Personality {
  id: string;
  name: string;
  core: string;
  kiwimuSays: string;
}
