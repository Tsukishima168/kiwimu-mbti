// Warm the V1 result chunk (recharts + four-language report copy, ~175 KB gzip)
// while the visitor is still answering, so tapping "see result" does not wait
// on the network. The specifier must stay identical to the React.lazy() call in
// App.tsx so the bundler emits a single shared chunk, not a duplicate.
//
// V1.5 (/explore) bundles its result screen into ExploreApp and V2 warms V2App
// from V2QuizFlow, so neither needs this.

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

let started = false;

export const shouldPrefetchResult = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData === true) return false;
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return false;
  return true;
};

const load = () => {
  // A failed prefetch must never surface; React.lazy will retry on demand.
  void import('../components/Result').catch(() => {
    started = false;
  });
};

export const prefetchResultWhenIdle = (): void => {
  if (started || typeof window === 'undefined' || !shouldPrefetchResult()) return;
  started = true;
  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof idle === 'function') idle.call(window, load, { timeout: 4000 });
  else window.setTimeout(load, 1500);
};

export const resetPrefetchResultForTests = (): void => {
  started = false;
};
