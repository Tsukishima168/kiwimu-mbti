import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../constants';
import { CURRENT_QUIZ_VERSION } from '../constants/versions';
import { parseLocalProgress } from './useProgressStorage';

const savedProgress = (count: number, patch: Record<string, unknown> = {}) => JSON.stringify({
    answers: QUESTIONS.slice(0, count).map(question => question.options[0]),
    currentIndex: count,
    quizVersion: CURRENT_QUIZ_VERSION,
    updatedAt: Date.now(),
    ...patch,
});

describe('V1 saved progress recovery', () => {
    it.each([1, 5, 12, 39])('restores %i answers at the next unanswered question', count => {
        const progress = parseLocalProgress(savedProgress(count));
        expect(progress?.answers).toHaveLength(count);
        expect(progress?.currentIndex).toBe(count);
    });

    it('does not repeat an answer saved before its slide animation finished', () => {
        expect(parseLocalProgress(savedProgress(12, { currentIndex: 11 }))?.currentIndex).toBe(12);
    });

    it.each([
        '{', 'null', '[]',
        savedProgress(5, { quizVersion: 'old' }),
        savedProgress(5, { currentIndex: -1 }),
        savedProgress(5, { currentIndex: 40 }),
        savedProgress(5, { currentIndex: 1.5 }),
        savedProgress(5, { answers: [null] }),
        savedProgress(5, { answers: [{ label: 'Invalid', value: 'unknown' }] }),
        savedProgress(5, { answers: [{ label: 'Wrong dimension', value: 'A' }] }),
        savedProgress(5, { updatedAt: null }),
        savedProgress(0), savedProgress(40),
    ])('ignores malformed, stale or completed progress: %s', saved => {
        expect(parseLocalProgress(saved)).toBeNull();
    });
});
