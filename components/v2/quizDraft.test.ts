import { describe, expect, it } from 'vitest';
import { V2_TAIWAN_QUESTIONS as questions } from '../../data/v2TaiwanQuestions.generated';
import { calculateResults } from '../../utils/logic';
import { clearQuizDraft, loadQuizDraft, parseQuizDraft, saveQuizDraft, V2_QUIZ_DRAFT_KEY } from './quizDraft';

function store() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
const answers = questions.map((question, index) => question.options[index % 2]);
const now = Date.now();
function raw(length = 8) {
  const storage = store();
  saveQuizDraft(answers.slice(0, length), storage, now);
  return storage.getItem(V2_QUIZ_DRAFT_KEY)!;
}

describe('V2 interrupted quiz', () => {
  it('resumes the next unanswered question, preserving scoring and canonical labels', () => {
    const draft = parseQuizDraft(raw(), now)!;
    expect(draft.currentIndex).toBe(8);
    expect(draft.answers).toEqual(answers.slice(0, 8).map(({ label, value }) => ({ label, value })));
    expect(calculateResults([...draft.answers, ...answers.slice(8)], questions)).toEqual(calculateResults(answers, questions));
  });
  it('returns a refresh during result resolution to the last answer, rather than auto-completing', () => {
    expect(parseQuizDraft(raw(40), now)?.currentIndex).toBe(39);
    expect(parseQuizDraft(raw(40), now)?.answers).toHaveLength(39);
  });
  it.each([undefined, null, [], [2], ['0'], [0, null], Array(41).fill(0)])('rejects invalid option indices %j', indices => {
    expect(parseQuizDraft(JSON.stringify({ ...JSON.parse(raw()), indices }), now)).toBeNull();
  });
  it('rejects corrupt, incompatible, expired and future drafts', () => {
    expect(parseQuizDraft('{', now)).toBeNull();
    expect(parseQuizDraft(JSON.stringify({ ...JSON.parse(raw()), version: 'old-bank' }), now)).toBeNull();
    expect(parseQuizDraft(raw(), now + 24 * 60 * 60 * 1000)).toBeNull();
    expect(parseQuizDraft(raw(), now - 60_001)).toBeNull();
  });
  it('removes an invalid draft and clears a restarted/completed draft', () => {
    const storage = store(); storage.setItem(V2_QUIZ_DRAFT_KEY, '{}');
    expect(loadQuizDraft(storage)).toBeNull(); expect(storage.getItem(V2_QUIZ_DRAFT_KEY)).toBeNull();
    saveQuizDraft(answers.slice(0, 10), storage); clearQuizDraft(storage);
    expect(loadQuizDraft(storage)).toBeNull();
  });
  it('going back to the first question removes progress; stores only indices, version and timestamp', () => {
    const storage = store(); saveQuizDraft(answers.slice(0, 1), storage);
    expect(Object.keys(JSON.parse(storage.getItem(V2_QUIZ_DRAFT_KEY)!))).toEqual(['version', 'indices', 'updatedAt']);
    expect(saveQuizDraft([], storage)).toBe(true); expect(loadQuizDraft(storage)).toBeNull();
  });
  it('does not break answering, restart or completion when storage throws', () => {
    const fail = () => { throw new Error('storage disabled'); };
    const storage = { getItem: fail, setItem: fail, removeItem: fail };
    expect(saveQuizDraft(answers, storage)).toBe(false);
    expect(loadQuizDraft(storage)).toBeNull(); expect(() => clearQuizDraft(storage)).not.toThrow();
  });
});
