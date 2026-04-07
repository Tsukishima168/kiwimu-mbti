// 資料載入器
// 這個檔案負責從 Supabase 或 constants.ts 載入資料
// 優先使用 Supabase，如果不可用則 fallback 到 constants.ts

import { QUESTIONS, DIMENSION_EXPLANATIONS, getResultData as getResultDataFromConstants } from '../constants';
import { 
  getQuestions as getQuestionsFromSupabase, 
  getResultData as getResultDataFromSupabase,
  getDimensionExplanations as getDimensionExplanationsFromSupabase,
  isSupabaseAvailable
} from '../supabase/client';
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

const UNIFIED_DESSERT_API_URL =
  import.meta.env.VITE_UNIFIED_DESSERT_API_URL ||
  import.meta.env.VITE_SHOP_MENU_RESOLVE_URL ||
  '/api/mbti-dessert';

async function loadUnifiedDessertContract(type: string): Promise<UnifiedDessertContract | null> {
  try {
    const endpoint = UNIFIED_DESSERT_API_URL.startsWith('http')
      ? new URL(UNIFIED_DESSERT_API_URL)
      : new URL(
          UNIFIED_DESSERT_API_URL,
          typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1'
        );

    endpoint.searchParams.set('mbti', type);

    const response = await fetch(endpoint.toString());
    if (!response.ok) return null;

    const payload = await response.json();
    if (!payload?.success || !payload.data) return null;

    return payload.data as UnifiedDessertContract;
  } catch (error) {
    console.warn('Failed to load unified dessert contract:', error);
    return null;
  }
}

/**
 * 取得測驗題目（優先從 Supabase，fallback 到 constants）
 */
export async function loadQuestions(): Promise<Question[]> {
  if (isSupabaseAvailable()) {
    const questions = await getQuestionsFromSupabase();
    if (questions) {
      return questions as Question[];
    }
  }
  
  // Fallback 到 constants.ts
  return QUESTIONS;
}

/**
 * 取得 MBTI 結果資料（優先從 Supabase，fallback 到 constants）
 */
export async function loadResultData(type: string, variant: 'A' | 'T' = 'A'): Promise<MbtiResultData> {
  let result: MbtiResultData | null = null;

  if (isSupabaseAvailable()) {
    const supabaseResult = await getResultDataFromSupabase(type, variant);
    if (supabaseResult) {
      result = supabaseResult as MbtiResultData;
    }
  }

  if (!result) {
    result = getResultDataFromConstants(type, variant);
  }

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

/**
 * 取得維度說明（優先從 Supabase，fallback 到 constants）
 */
export async function loadDimensionExplanations() {
  if (isSupabaseAvailable()) {
    const explanations = await getDimensionExplanationsFromSupabase();
    if (explanations) {
      return explanations;
    }
  }
  
  // Fallback 到 constants.ts
  return DIMENSION_EXPLANATIONS.map(d => ({
    key: d.key,
    label: d.label,
    text: d.text
  }));
}

/**
 * 檢查是否使用 Supabase
 */
export function isUsingSupabase() {
  return isSupabaseAvailable();
}
