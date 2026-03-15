
import { Option, Question, Score } from '../types';
import { QUESTIONS } from '../constants';

type WeightedQuestion = Pick<Question, 'weight'>;

export const calculateResults = (
  answers: Option[],
  questionBank: WeightedQuestion[] = QUESTIONS,
): { type: string, scores: Score } => {
  const scores: Score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, A: 0, Turbulent: 0 };

  answers.forEach((ans, idx) => {
    // Look up the weight of the corresponding question.
    // Default to 1 if not specified.
    const weight = questionBank[idx]?.weight || 1;
    scores[ans.value] += weight;
  });

  // Basic type determination
  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');

  return { type, scores };
};

export const getVariant = (scores: Score): 'A' | 'T' => {
    // Calculate A vs Turbulent percentage to determine variant
    const total = scores.A + scores.Turbulent;
    if (total === 0) return 'A'; // Default to A
    
    // Weighted logic same as percentages
    const pctA = Math.round((scores.A / total) * 100);
    const pctT = 100 - pctA;
    
    return pctA >= pctT ? 'A' : 'T';
};

export const calculatePercentages = (scores: Score) => {
    // With weighted scoring (Total 9 points per dimension), 
    // ties are mathematically impossible (e.g. 4 vs 5).
    // So we can use pure math without artificial bias.
    
    const calcPair = (val1: number, val2: number) => {
        let total = val1 + val2;
        if (total === 0) return [50, 50]; 
        
        let pct1 = Math.round((val1 / total) * 100);
        let pct2 = 100 - pct1;

        return [pct1, pct2];
    };

    const [E, I] = calcPair(scores.E, scores.I);
    const [S, N] = calcPair(scores.S, scores.N);
    const [T, F] = calcPair(scores.T, scores.F);
    const [J, P] = calcPair(scores.J, scores.P);
    const [A, Turbulent] = calcPair(scores.A, scores.Turbulent);

    return {
        E, I,
        S, N,
        T, F,
        J, P,
        A, Turbulent
    };
};
