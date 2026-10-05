const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const isChapter = (value: unknown): value is string => typeof value === 'string' && /^ch-0[1-8]$/.test(value);
function key(owner: string, type: string) {
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(owner) || !/^[IE][NS][TF][JP]-[AT]$/.test(type)) return null;
  return `kiwimu:v2:reading:${owner}:${type}`;
}

export function readBookmark(owner: string, type: string): string | null {
  const storageKey = key(owner, type);
  if (!storageKey) return null;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const age = Date.now() - value?.updatedAt;
    return value?.version === 1 && isChapter(value.chapter) && Number.isFinite(age) && age >= 0 && age <= MAX_AGE_MS ? value.chapter : null;
  } catch { return null; }
}

export function saveBookmark(owner: string, type: string, chapter: string) {
  const storageKey = key(owner, type);
  if (!storageKey || !isChapter(chapter)) return;
  try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, chapter, updatedAt: Date.now() })); }
  catch { /* A blocked browser store must never interrupt reading. */ }
}
