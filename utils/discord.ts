import { parseQuizNotification, type QuizNotificationInput } from '../shared/quizNotification';
import { getAuthSupabaseClient } from './supabaseAuthBridge';

// Compatibility export for frozen App.tsx. V1 now sends from its existing
// reportMbtiCompleted call with all 40 answers, avoiding duplicate result-only sends.
export interface DiscordNotificationMetadata {
  funnel: 'v1' | 'v1_5';
  personalityNameOverride?: string; stage?: string; source?: string; quizVersion?: string;
  path?: string; sessionId?: string; userId?: string; isLoggedIn?: boolean;
}
/** @deprecated Completion notifications require answers; use queueQuizCompletionNotification. */
export async function sendDiscordNotification(_resultType: string, _suffix: 'A' | 'T', _locale = 'zh',
  _userId?: string, _metadata?: DiscordNotificationMetadata): Promise<void> {}

type Entry = { request: QuizNotificationInput; createdAt: number; attempts: number; nextAttemptAt: number };
const KEY = 'kiwimu_quiz_notifications_v1';
const TTL = 24 * 60 * 60 * 1_000;
const MAX_ENTRIES = 20;
let memory: Entry[] = [];
let memoryOnly = false;
let flushing: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function save(entries: Entry[]) {
  memory = entries.slice(-MAX_ENTRIES);
  if (!memoryOnly) {
    try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch { memoryOnly = true; }
  }
}

function read(): Entry[] {
  let stored: unknown = memory;
  if (!memoryOnly) {
    try { const raw = localStorage.getItem(KEY); if (raw) stored = JSON.parse(raw); } catch { /* Use memory. */ }
  }
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry): entry is Entry => Boolean(entry && parseQuizNotification(entry.request)
    && Number.isFinite(entry.createdAt) && entry.createdAt <= Date.now() && Date.now() - entry.createdAt < TTL
    && Number.isSafeInteger(entry.attempts) && entry.attempts >= 0 && entry.attempts < 10
    && Number.isFinite(entry.nextAttemptAt))).slice(-MAX_ENTRIES);
}

async function accessToken(): Promise<string | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const client = getAuthSupabaseClient();
    if (!client) return null;
    const result = await Promise.race([
      client.auth.getSession(),
      new Promise<null>(resolve => { timeout = setTimeout(() => resolve(null), 1_000); }),
    ]);
    const session = result?.data.session;
    return !result?.error && session && !session.user.is_anonymous ? session.access_token : null;
  } catch { return null; } finally { if (timeout !== undefined) clearTimeout(timeout); }
}

async function post(request: QuizNotificationInput, token: string | null): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch('/api/notify-discord', {
      method: 'POST', credentials: 'same-origin', keepalive: true, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(request),
    });
  } catch { return null; } finally { clearTimeout(timeout); }
}

async function flush() {
  const entries = read();
  const initial = new Set(entries.map(entry => entry.request.completionId));
  const remaining: Entry[] = [];
  for (const entry of entries) {
    if (entry.nextAttemptAt > Date.now()) { remaining.push(entry); continue; }
    const token = await accessToken();
    let response = await post(entry.request, token);
    // Expired sessions still permit an anonymous completion with the same reservation ID.
    if (response?.status === 401 && token) response = await post(entry.request, null);
    if (!response || response.status >= 500 || response.status === 429) {
      const attempts = entry.attempts + 1;
      const retryAfter = Number(response?.headers?.get('Retry-After'));
      const delay = response?.status === 429 && Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1_000, 60 * 60 * 1_000) : Math.min(2 ** attempts * 1_000, 5 * 60 * 1_000);
      if (attempts < 10) remaining.push({ ...entry, attempts, nextAttemptAt: Date.now() + delay });
    }
    // 200/202 (sent/duplicate/review/preview-disabled) are terminal. Invalid payloads are never retried.
  }
  save([...remaining, ...read().filter(entry => !initial.has(entry.request.completionId))]);
  schedule();
}

function schedule() {
  if (timer !== null) clearTimeout(timer);
  const entries = read();
  timer = entries.length ? setTimeout(() => { timer = null; void flushQuizNotifications(); },
    Math.max(0, Math.min(...entries.map(entry => entry.nextAttemptAt)) - Date.now())) : null;
}

export function flushQuizNotifications(): Promise<void> {
  if (!flushing) flushing = flush().finally(() => { flushing = null; });
  return flushing;
}

export function queueQuizCompletionNotification(input: Omit<QuizNotificationInput, 'completionId'>,
  completionId = crypto.randomUUID()): void {
  const request = parseQuizNotification({ ...input, completionId });
  if (!request) return;
  const entries = read();
  if (!entries.some(entry => entry.request.completionId === request.completionId)) {
    save([...entries, { request, createdAt: Date.now(), attempts: 0, nextAttemptAt: Date.now() }]);
  }
  void flushQuizNotifications();
}

export function installQuizNotificationRetry(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onOnline = () => void flushQuizNotifications();
  window.addEventListener('online', onOnline);
  window.addEventListener('focus', onOnline);
  onOnline();
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('focus', onOnline);
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
}
