import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readBookmark, saveBookmark } from './readingBookmark';
let store: Map<string, string>;
beforeEach(() => {
  store = new Map(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-05'));
  vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('separates readers and report types', () => {
  saveBookmark('reader-a', 'ESTJ-A', 'ch-06');
  expect(readBookmark('reader-a', 'ESTJ-A')).toBe('ch-06');
  expect(readBookmark('reader-b', 'ESTJ-A')).toBeNull();
  expect(readBookmark('reader-a', 'ESTJ-T')).toBeNull();
});
it('ignores malformed storage and invalid chapters', () => {
  store.set('kiwimu:v2:reading:reader-a:ESTJ-A', '{broken'); expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
  saveBookmark('reader-a', 'ESTJ-A', 'ch-09'); expect(store.size).toBe(1);
  store.set('kiwimu:v2:reading:reader-a:ESTJ-A', JSON.stringify({ version: 1, chapter: 'ch-09', updatedAt: Date.now() }));
  expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
});
it('rejects expired and future bookmarks', () => {
  saveBookmark('reader-a', 'ESTJ-A', 'ch-04');
  vi.advanceTimersByTime(181 * 24 * 60 * 60 * 1000); expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
  vi.setSystemTime(new Date('2026-10-04')); expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
});
it('rejects unknown versions, report codes and empty owners', () => {
  saveBookmark('', 'ESTJ-A', 'ch-04'); saveBookmark('reader-a', 'INVALID-A', 'ch-04'); expect(store.size).toBe(0);
  store.set('kiwimu:v2:reading:reader-a:ESTJ-A', JSON.stringify({ version: 2, chapter: 'ch-04', updatedAt: Date.now() }));
  expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
});
it('keeps reading functional when browser storage is blocked', () => {
  vi.stubGlobal('localStorage', { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
  expect(() => saveBookmark('reader-a', 'ESTJ-A', 'ch-03')).not.toThrow();
  expect(readBookmark('reader-a', 'ESTJ-A')).toBeNull();
});
