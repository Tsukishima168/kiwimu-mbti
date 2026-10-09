import { V2_TAIWAN_QUESTIONS as questions } from '../../data/v2TaiwanQuestions.generated';
import type { Option } from '../../types';

export const V2_QUIZ_DRAFT_KEY = 'kiwimu_v2_quiz_draft_v1';
const MAX_AGE = 24 * 60 * 60 * 1000;
// A question, option, order or weight change invalidates the old draft.
const bank = JSON.stringify(questions);
const revision = Array.from(bank).reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
const version = `v2-tw-40:${revision}`;

type DraftStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type QuizDraft = { answers: Option[]; currentIndex: number };

export function parseQuizDraft(raw: string, now = Date.now()): QuizDraft | null {
  try {
    const draft = JSON.parse(raw);
    if (!draft || draft.version !== version || !Array.isArray(draft.indices)
      || draft.indices.length < 1 || draft.indices.length > questions.length
      || !draft.indices.every((index: unknown) => index === 0 || index === 1)
      || !Number.isFinite(draft.updatedAt) || draft.updatedAt > now + 60_000
      || now - draft.updatedAt >= MAX_AGE) return null;
    // A refresh during the last answer/result transition returns to that question.
    const indices = draft.indices.slice(0, questions.length - 1) as (0 | 1)[];
    return {
      answers: indices.map((option, index) => ({
        label: questions[index].options[option].label,
        value: questions[index].options[option].value,
      })),
      currentIndex: indices.length,
    };
  } catch { return null; }
}

export function loadQuizDraft(store?: DraftStore): QuizDraft | null {
  try {
    const storage = store ?? window.sessionStorage;
    const raw = storage.getItem(V2_QUIZ_DRAFT_KEY);
    if (!raw) return null;
    const draft = parseQuizDraft(raw);
    if (!draft) storage.removeItem(V2_QUIZ_DRAFT_KEY);
    return draft;
  } catch { return null; }
}

export function clearQuizDraft(store?: DraftStore): void {
  try { (store ?? window.sessionStorage).removeItem(V2_QUIZ_DRAFT_KEY); }
  catch { /* Restricted storage must not prevent a restart or completion. */ }
}

export function saveQuizDraft(answers: Option[], store?: DraftStore, now = Date.now()): boolean {
  try {
    const storage = store ?? window.sessionStorage;
    if (!answers.length) { storage.removeItem(V2_QUIZ_DRAFT_KEY); return true; }
    if (answers.length > questions.length) return false;
    const indices = answers.map((answer, index) => questions[index].options.findIndex(option => option.value === answer.value));
    if (indices.some(index => index < 0)) return false;
    storage.setItem(V2_QUIZ_DRAFT_KEY, JSON.stringify({ version, indices, updatedAt: now }));
    return true;
  } catch { return false; }
}
