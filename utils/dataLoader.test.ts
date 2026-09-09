import { describe, expect, it } from 'vitest';
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
