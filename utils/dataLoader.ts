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
  if (isSupabaseAvailable()) {
    const result = await getResultDataFromSupabase(type, variant);
    if (result) {
      return result as MbtiResultData;
    }
  }
  
  // Fallback 到 constants.ts
  return getResultDataFromConstants(type, variant);
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
