import { QUESTIONS, getResultData as getResultDataFromConstants } from '../constants';
import type { Question, MbtiResultData } from '../types';

interface UnifiedDessertContract {
  mbti_type: string;
  linkage_type: string;
  soul_dessert_name: string;
  display_name: string;
  canonical_name: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_url?: string;
}

const dessertCache = new Map<string, UnifiedDessertContract | null>();

const UNIFIED_DESSERT_API_URL =
  import.meta.env.VITE_UNIFIED_DESSERT_API_URL ||
  import.meta.env.VITE_SHOP_MENU_RESOLVE_URL ||
  '/api/mbti-dessert';

async function loadUnifiedDessertContract(type: string): Promise<UnifiedDessertContract | null> {
  if (dessertCache.has(type)) return dessertCache.get(type)!;
  try {
    const endpoint = UNIFIED_DESSERT_API_URL.startsWith('http')
      ? new URL(UNIFIED_DESSERT_API_URL)
      : new URL(
          UNIFIED_DESSERT_API_URL,
          typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1'
        );

    endpoint.searchParams.set('mbti', type);

    const response = await fetch(endpoint.toString());
    if (!response.ok) {
      dessertCache.set(type, null);
      return null;
    }

    const payload = await response.json();
    if (!payload?.success || !payload.data) {
      dessertCache.set(type, null);
      return null;
    }

    const contract = payload.data as UnifiedDessertContract;
    dessertCache.set(type, contract);
    return contract;
  } catch (error) {
    console.warn('Failed to load unified dessert contract:', error);
    dessertCache.set(type, null);
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
