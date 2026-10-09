// This cache is optional. It never supplies authentication or paid access.
// If the browser rejects storage, React keeps the current result in this page.
const transient = new Map<string, string | null>();

export const sessionCache = {
  getItem(key: string): string | null {
    if (transient.has(key)) return transient.get(key) ?? null;
    try { return window.sessionStorage.getItem(key); }
    catch { return null; }
  },
  setItem(key: string, value: string): boolean {
    try { window.sessionStorage.setItem(key, value); transient.delete(key); return true; }
    catch { transient.set(key, value); return false; }
  },
  removeItem(key: string): boolean {
    try { window.sessionStorage.removeItem(key); transient.delete(key); return true; }
    catch { transient.set(key, null); return false; }
  },
};
