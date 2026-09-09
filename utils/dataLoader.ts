import { QUESTIONS, getResultData as getResultDataFromConstants } from '../constants';
import type { Question, MbtiResultData } from '../types';
import {
  parseUnifiedDessertContract,
  type UnifiedDessertContract,
} from '../shared/dessertContract';
export type { UnifiedDessertContract } from '../shared/dessertContract';

const dessertCache = new Map<string, UnifiedDessertContract>();

const SHOP_MENU_MBTI_ENDPOINT = 'https://shop.kiwimu.com/api/menu/mbti';

const UNIFIED_DESSERT_API_URL =
  import.meta.env.VITE_UNIFIED_DESSERT_API_URL ||
  import.meta.env.VITE_SHOP_MENU_RESOLVE_URL ||
  (import.meta.env.DEV ? SHOP_MENU_MBTI_ENDPOINT : '/api/mbti-dessert');

export function buildUnifiedDessertEndpoint(
  type: string,
  baseUrl = UNIFIED_DESSERT_API_URL,
): URL {
  const normalizedType = type.trim().toUpperCase();
  const isShopMenuEndpoint = /\/api\/menu\/mbti\/?$/u.test(baseUrl);

  if (isShopMenuEndpoint) {
    return new URL(`${baseUrl.replace(/\/$/u, '')}/${encodeURIComponent(normalizedType)}`);
  }

  const endpoint = baseUrl.startsWith('http')
    ? new URL(baseUrl)
    : new URL(
        baseUrl,
        typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1',
      );
  endpoint.searchParams.set('mbti', normalizedType);
  return endpoint;
}

export async function loadUnifiedDessertContract(type: string): Promise<UnifiedDessertContract | null> {
  const normalizedType = type.trim().toUpperCase();
  if (dessertCache.has(normalizedType)) return dessertCache.get(normalizedType)!;
  try {
    const endpoint = buildUnifiedDessertEndpoint(normalizedType);

    const response = await fetch(endpoint.toString());
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (!payload?.success || !payload.data) {
      return null;
    }

    const contract = parseUnifiedDessertContract(payload.data, normalizedType);
    if (!contract) return null;
    dessertCache.set(normalizedType, contract);
    return contract;
  } catch (error) {
    console.warn('Failed to load unified dessert contract:', error);
    return null;
  }
}

export function loadQuestions(): Question[] {
  return QUESTIONS;
}

export async function loadResultData(type: string, variant: 'A' | 'T' = 'A'): Promise<MbtiResultData> {
  const result = getResultDataFromConstants(type, variant);

  const unifiedDessert = await loadUnifiedDessertContract(type);
  if (!unifiedDessert) {
    return result;
  }

  return {
    ...result,
    dessert: {
      ...result.dessert,
      name: unifiedDessert.display_name || unifiedDessert.soul_dessert_name || result.dessert.name,
      description: unifiedDessert.description || result.dessert.description,
      imageUrl: unifiedDessert.image_url || result.dessert.imageUrl,
      ctaLink: unifiedDessert.cta_url || result.dessert.ctaLink,
    },
  };
}
