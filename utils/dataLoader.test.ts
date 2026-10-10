import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseUnifiedDessertContract } from '../shared/dessertContract';
import { buildUnifiedDessertEndpoint } from './dataLoader';

describe('buildUnifiedDessertEndpoint', () => {
  it('builds the Shop canonical menu path used by local Vite development', () => {
    const endpoint = buildUnifiedDessertEndpoint(
      'estj',
      'https://shop.kiwimu.com/api/menu/mbti',
    );

    expect(endpoint.toString()).toBe('https://shop.kiwimu.com/api/menu/mbti/ESTJ');
  });

  it('builds the production proxy query without changing its path', () => {
    const endpoint = buildUnifiedDessertEndpoint(
      'infj',
      'https://kiwimu.com/api/mbti-dessert',
    );

    expect(endpoint.pathname).toBe('/api/mbti-dessert');
    expect(endpoint.searchParams.get('mbti')).toBe('INFJ');
  });
});

describe('menu loading recovery', () => {
  const data = {
    mbti_type: 'ESTJ', linkage_type: 'exact', soul_dessert_name: '鹹蛋黃巴斯克',
    display_name: '鹹蛋黃巴斯克', canonical_name: '鹹蛋黃｜巴斯克乳酪',
    image_url: 'https://res.cloudinary.com/demo/image/upload/first.webp',
  };
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('does not cache a failure, so retry can recover the real menu photo', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(Response.json({ success: true, data }));
    vi.stubGlobal('fetch', fetcher);
    const { loadUnifiedDessertContract } = await import('./dataLoader');
    expect(await loadUnifiedDessertContract('ESTJ')).toBeNull();
    expect((await loadUnifiedDessertContract('ESTJ'))?.image_url).toBe(data.image_url);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('explicit refresh replaces a cached photo URL instead of reusing stale data', async () => {
    const updated = { ...data, image_url: 'https://res.cloudinary.com/demo/image/upload/current.webp' };
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ success: true, data }))
      .mockResolvedValueOnce(Response.json({ success: true, data: updated }));
    vi.stubGlobal('fetch', fetcher);
    const { loadUnifiedDessertContract } = await import('./dataLoader');
    await loadUnifiedDessertContract('ESTJ');
    expect((await loadUnifiedDessertContract('estj'))?.image_url).toBe(data.image_url);
    expect((await loadUnifiedDessertContract('ESTJ', true))?.image_url).toBe(updated.image_url);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('stalled requests stop loading after eight seconds and remain retryable', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetcher = vi.fn().mockImplementationOnce((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })).mockResolvedValueOnce(Response.json({ success: true, data }));
    vi.stubGlobal('fetch', fetcher);
    const { loadUnifiedDessertContract } = await import('./dataLoader');
    const pending = loadUnifiedDessertContract('ESTJ');
    await vi.advanceTimersByTimeAsync(8000);
    expect(await pending).toBeNull();
    expect(await loadUnifiedDessertContract('ESTJ')).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('parseUnifiedDessertContract', () => {
  const valid = {
    mbti_type: 'ESTJ',
    linkage_type: 'exact',
    soul_dessert_name: '鹹蛋黃巴斯克',
    display_name: '鹹蛋黃巴斯克',
    canonical_name: '鹹蛋黃｜巴斯克乳酪',
    is_available: true,
    resolved: true,
    description: '甜鹹交錯。',
    image_url: 'https://res.cloudinary.com/demo/image/upload/dessert.webp',
    cta_url: 'https://map.kiwimu.com/menu',
  };

  it('accepts and normalizes the expected live contract', () => {
    expect(parseUnifiedDessertContract(valid, 'estj')).toMatchObject({
      mbti_type: 'ESTJ',
      linkage_type: 'exact',
      display_name: '鹹蛋黃巴斯克',
    });
  });

  it.each([
    [{ ...valid, mbti_type: 'INFJ' }, 'ESTJ'],
    [{ ...valid, linkage_type: 'invented' }, 'ESTJ'],
    [{ ...valid, image_url: 'javascript:alert(1)' }, 'ESTJ'],
    [{ ...valid, cta_url: 'https://evil.example/checkout' }, 'ESTJ'],
    [{ ...valid, display_name: '' }, 'ESTJ'],
  ])('rejects mismatched or unsafe upstream data', (contract, expectedType) => {
    expect(parseUnifiedDessertContract(contract, expectedType)).toBeNull();
  });
});
