import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createQuizAbandonGuard,
  registerQuizAbandonListeners,
  trackUserSignup,
} from './analytics';

describe('trackUserSignup payload', () => {
  const gtag = vi.fn();
  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('carries method + source_site and no raw user id', () => {
    trackUserSignup('google');
    expect(gtag.mock.calls[0]).toEqual([
      'event',
      'sign_up',
      { site_id: 'mbti_lab', method: 'google', source_site: 'mbti_lab' },
    ]);
  });
});

describe('createQuizAbandonGuard', () => {
  const gtag = vi.fn();
  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
  });
  afterEach(() => vi.unstubAllGlobals());

  const make = (state: { completed?: boolean; answered?: number; total?: number } = {}) => {
    const s = { completed: false, answered: 5, total: 20, ...state };
    const guard = createQuizAbandonGuard({
      isCompleted: () => s.completed,
      getAnsweredCount: () => s.answered,
      getTotalQuestions: () => s.total,
      getStartTime: () => 1_000_000,
      now: () => 1_042_000,
    });
    return { s, guard };
  };

  it('fires quiz_abandon once with trigger + beacon transport, then ignores repeats', () => {
    const { guard } = make();
    expect(guard.fire('hidden')).toBe(true);
    expect(guard.fire('pagehide')).toBe(false);
    expect(guard.fire('unmount')).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][1]).toBe('quiz_abandon');
    expect(gtag.mock.calls[0][2]).toMatchObject({
      abandoned_at_question: 5,
      total_questions: 20,
      progress_percentage: 25,
      time_spent_seconds: 42,
      trigger: 'hidden',
      transport_type: 'beacon',
    });
  });

  it('never fires after completion', () => {
    const { guard } = make({ completed: true });
    expect(guard.fire('unmount')).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('never fires once every question is answered (window before onComplete)', () => {
    const { guard } = make({ answered: 20, total: 20 });
    expect(guard.fire('hidden')).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('skips when no answers yet and still allows a later fire once answered', () => {
    const { s, guard } = make({ answered: 0 });
    expect(guard.fire('pagehide')).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
    s.answered = 3;
    expect(guard.fire('pagehide')).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it('reset() re-arms the guard for a restarted attempt', () => {
    const { guard } = make();
    expect(guard.fire('hidden')).toBe(true);
    expect(guard.fire('hidden')).toBe(false);
    guard.reset();
    expect(guard.fire('hidden')).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});

// Wiring test: the same function Quiz.tsx's mount effect calls, driven by real
// EventTarget events (no jsdom / testing-library in this repo).
describe('registerQuizAbandonListeners (Quiz listener wiring)', () => {
  const gtag = vi.fn();
  let win: EventTarget;
  let doc: EventTarget & { visibilityState: string };
  const state = { completed: false, answered: 7, total: 20 };

  const mount = () => {
    const guard = createQuizAbandonGuard({
      isCompleted: () => state.completed,
      getAnsweredCount: () => state.answered,
      getTotalQuestions: () => state.total,
      getStartTime: () => 0,
      now: () => 10_000,
    });
    const cleanup = registerQuizAbandonListeners(guard, win as unknown as Window, doc as unknown as Document);
    return { guard, cleanup };
  };
  const hide = () => {
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
  };
  const triggers = () => gtag.mock.calls.map(c => c[2].trigger);

  beforeEach(() => {
    gtag.mockClear();
    Object.assign(state, { completed: false, answered: 7, total: 20 });
    win = new EventTarget();
    doc = Object.assign(new EventTarget(), { visibilityState: 'visible' });
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('visibilitychange -> hidden sends exactly one abandon with trigger "hidden"', () => {
    const { cleanup } = mount();
    hide();
    win.dispatchEvent(new Event('pagehide')); // unload right after hiding
    cleanup(); // unmount
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(triggers()).toEqual(['hidden']);
  });

  it('visibilitychange -> visible sends nothing', () => {
    mount();
    doc.visibilityState = 'visible';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(gtag).not.toHaveBeenCalled();
  });

  it('pagehide sends trigger "pagehide"; unmount sends trigger "unmount"', () => {
    mount();
    win.dispatchEvent(new Event('pagehide'));
    expect(triggers()).toEqual(['pagehide']);

    gtag.mockClear();
    const second = mount();
    second.cleanup();
    expect(triggers()).toEqual(['unmount']);
  });

  it('completion suppresses every trigger', () => {
    const { cleanup } = mount();
    state.completed = true;
    hide();
    win.dispatchEvent(new Event('pagehide'));
    cleanup();
    expect(gtag).not.toHaveBeenCalled();
  });

  it('cleanup removes the listeners', () => {
    state.answered = 0;
    const { cleanup } = mount();
    cleanup(); // answered = 0 -> no unmount event either
    state.answered = 7;
    hide();
    win.dispatchEvent(new Event('pagehide'));
    expect(gtag).not.toHaveBeenCalled();
  });
});
