import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestRun } from '../types';

vi.mock('./supabase-user.service', () => ({ saveTestRunToSupabase: vi.fn() }));
import { saveTestRunToSupabase } from './supabase-user.service';
import { saveTestRun } from './user-data.service';

describe('V1 saved result sharing', () => {
  beforeEach(() => vi.clearAllMocks());

  const run = {
    uid: 'private-owner', resultType: 'INFP', suffix: 'T', finishedAt: 1,
  } as Omit<TestRun, 'id'>;

  it('shares the existing public type route without private identity or answers', async () => {
    vi.mocked(saveTestRunToSupabase).mockResolvedValue(true);
    await saveTestRun(run);
    const [, , , link] = vi.mocked(saveTestRunToSupabase).mock.calls[0];
    const url = new URL(link);
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('r')).toBe('INFP-T');
    expect([...url.searchParams.keys()].sort()).toEqual(['from', 'r']);
    expect(link).not.toContain(run.uid);
  });

  it('does not report a successful save when the private record fails', async () => {
    vi.mocked(saveTestRunToSupabase).mockResolvedValue(false);
    await expect(saveTestRun(run)).rejects.toThrow('Supabase write failed');
  });
});
