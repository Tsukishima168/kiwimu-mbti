// Supabase Client Configuration
// 用於連接 Supabase 資料庫，讀取 MBTI 測驗相關資料

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Falling back to constants.ts');
}

// 建立 Supabase Client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================
// 資料讀取函數
// ============================================

/**
 * 取得所有啟用的測驗題目
 */
export async function getQuestions() {
  if (!supabase) {
    // Fallback: 如果 Supabase 未設定，回傳 null 讓前端使用 constants.ts
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('mbti_questions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return null;
    }

    // 轉換成前端需要的格式
    const questions = data as any[];
    return questions.map(q => ({
      id: q.question_id,
      text: q.text,
      imageUrl: q.image_url,
      dimensionPair: q.dimension_pair as 'EI' | 'SN' | 'TF' | 'JP' | 'AT',
      weight: q.weight,
      options: [
        { label: q.option_a_label, value: q.option_a_value },
        { label: q.option_b_label, value: q.option_b_value }
      ] as const
    }));
  } catch (error) {
    console.error('Error in getQuestions:', error);
    return null;
  }
}

/**
 * 取得特定 MBTI 類型的完整結果資料
 */
export async function getResultData(mbtiType: string, variant: 'A' | 'T' = 'A') {
  if (!supabase) {
    return null;
  }

  try {
    // 取得基本結果資料
    const { data: resultData, error: resultError } = await supabase
      .from('mbti_results')
      .select('*')
      .eq('id', mbtiType)
      .eq('is_active', true)
      .single();

    if (resultError || !resultData) {
      console.error('Error fetching result data:', resultError);
      return null;
    }

    // 取得 A/T 變體差異
    const { data: variantData } = await supabase
      .from('mbti_variant_nuances')
      .select('nuance_text')
      .eq('mbti_type', mbtiType)
      .eq('variant', variant)
      .single();

    // 取得角色圖片
    const { data: imageData } = await supabase
      .from('mbti_character_images')
      .select('image_url')
      .eq('mbti_type', mbtiType)
      .eq('is_active', true)
      .single();

    // 取得甜點配對
    const { data: dessertData } = await supabase
      .from('mbti_dessert_mappings')
      .select('*')
      .eq('mbti_type', mbtiType)
      .eq('is_active', true)
      .single();

    const rData = resultData as any;
    const vData = variantData as any;
    const iData = imageData as any;
    const dData = dessertData as any;

    // 組合資料
    const coreAnalysis = vData?.nuance_text
      ? `${rData.core_analysis}\n\n${vData.nuance_text}`
      : rData.core_analysis;

    return {
      id: rData.id,
      title: rData.title,
      summary: rData.summary,
      quote: rData.quote,
      keywords: rData.keywords,
      bgColor: rData.bg_color,
      coreAnalysis,
      dimensionAnalysis: rData.dimension_analysis as any,
      strengths: rData.strengths,
      blindSpots: rData.blind_spots,
      career: rData.career as any,
      relationships: rData.relationships as any,
      socialStyle: rData.social_style,
      growthAdvice: rData.growth_advice,
      soulQuestions: rData.soul_questions,
      characterImage: iData?.image_url || rData.character_image_url,
      dessert: dData ? {
        name: dData.dessert_name,
        description: dData.dessert_description,
        imageUrl: dData.dessert_image_url,
        ctaLink: dData.dessert_cta_link
      } : (rData.dessert as any)
    };
  } catch (error) {
    console.error('Error in getResultData:', error);
    return null;
  }
}

/**
 * 取得所有維度說明
 */
export async function getDimensionExplanations() {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('dimension_explanations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching dimension explanations:', error);
      return null;
    }

    const dimensions = data as any[];
    return dimensions.map(d => ({
      key: d.dimension_key,
      label: d.label,
      text: d.explanation_text
    }));
  } catch (error) {
    console.error('Error in getDimensionExplanations:', error);
    return null;
  }
}

/**
 * 取得甜點配對資料（用於結果頁的靈魂甜點區塊）
 */
export async function getDessertMapping(mbtiType: string) {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('mbti_dessert_mappings')
      .select('*')
      .eq('mbti_type', mbtiType)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    const dData = data as any;
    return {
      name: dData.dessert_name,
      series: dData.dessert_series,
      quad: dData.dessert_quad,
      alt: dData.alternative_desserts || [],
      drinkA: dData.drink_a,
      drinkT: dData.drink_t,
      hook: dData.dessert_description
    };
  } catch (error) {
    console.error('Error in getDessertMapping:', error);
    return null;
  }
}

/**
 * 檢查 Supabase 是否可用
 */
export function isSupabaseAvailable() {
  return supabase !== null;
}
