// 資料遷移腳本
// 這個腳本會將 constants.ts 中的資料匯入到 Supabase
// 執行方式：npx tsx supabase/scripts/migrate-data.ts

import { createClient } from '@supabase/supabase-js';
import { QUESTIONS, DIMENSION_EXPLANATIONS, getResultData } from '../../constants';
import { MBTI_IMAGE_MAP, DESSERT_IMAGES, VARIANT_NUANCES } from '../../constants';

// 從環境變數讀取 Supabase 設定
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 需要 Service Role Key 才能寫入

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 請設定環境變數：');
  console.error('   VITE_SUPABASE_URL 或 SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// 1. 遷移題目資料
// ============================================
async function migrateQuestions() {
  console.log('📝 開始遷移題目資料...');

  const questions = QUESTIONS.map((q, index) => ({
    question_id: q.id,
    text: q.text,
    image_url: q.imageUrl,
    dimension_pair: q.dimensionPair,
    weight: q.weight || 1,
    option_a_label: q.options[0].label,
    option_a_value: q.options[0].value,
    option_b_label: q.options[1].label,
    option_b_value: q.options[1].value,
    display_order: index + 1,
    is_active: true
  }));

  const { data, error } = await supabase
    .from('mbti_questions')
    .upsert(questions, { onConflict: 'question_id' });

  if (error) {
    console.error('❌ 遷移題目失敗:', error);
    return false;
  }

  console.log(`✅ 成功遷移 ${questions.length} 題`);
  return true;
}

// ============================================
// 2. 遷移維度說明
// ============================================
async function migrateDimensionExplanations() {
  console.log('📚 開始遷移維度說明...');

  const explanations = DIMENSION_EXPLANATIONS.map((d, index) => ({
    dimension_key: d.key,
    label: d.label,
    explanation_text: d.text,
    display_order: index + 1,
    is_active: true
  }));

  const { data, error } = await supabase
    .from('dimension_explanations')
    .upsert(explanations, { onConflict: 'dimension_key' });

  if (error) {
    console.error('❌ 遷移維度說明失敗:', error);
    return false;
  }

  console.log(`✅ 成功遷移 ${explanations.length} 個維度說明`);
  return true;
}

// ============================================
// 3. 遷移 MBTI 結果資料
// ============================================
async function migrateResults() {
  console.log('🎯 開始遷移 MBTI 結果資料...');

  const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                     'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

  for (const type of mbtiTypes) {
    const resultData = getResultData(type, 'A'); // 先取得 A 型資料

    const result = {
      id: resultData.id,
      title: resultData.title,
      summary: resultData.summary,
      quote: resultData.quote,
      keywords: resultData.keywords,
      bg_color: resultData.bgColor,
      core_analysis: resultData.coreAnalysis.split('\n\n')[0], // 移除 A/T 變體部分
      dimension_analysis: resultData.dimensionAnalysis,
      strengths: resultData.strengths,
      blind_spots: resultData.blindSpots,
      career: resultData.career,
      relationships: resultData.relationships,
      social_style: resultData.socialStyle,
      growth_advice: resultData.growthAdvice,
      soul_questions: resultData.soulQuestions,
      character_image_url: resultData.characterImage,
      dessert: resultData.dessert,
      version: 'v1',
      is_active: true
    };

    const { error } = await supabase
      .from('mbti_results')
      .upsert(result, { onConflict: 'id' });

    if (error) {
      console.error(`❌ 遷移 ${type} 失敗:`, error);
      continue;
    }

    console.log(`  ✅ ${type} 已遷移`);
  }

  console.log('✅ 所有結果資料已遷移');
  return true;
}

// ============================================
// 4. 遷移 A/T 變體差異
// ============================================
async function migrateVariantNuances() {
  console.log('🔄 開始遷移 A/T 變體差異...');

  const nuances = Object.entries(VARIANT_NUANCES).flatMap(([type, variants]) => [
    {
      mbti_type: type,
      variant: 'A' as const,
      nuance_text: variants.A
    },
    {
      mbti_type: type,
      variant: 'T' as const,
      nuance_text: variants.T
    }
  ]);

  const { error } = await supabase
    .from('mbti_variant_nuances')
    .upsert(nuances, { onConflict: 'mbti_type,variant' });

  if (error) {
    console.error('❌ 遷移變體差異失敗:', error);
    return false;
  }

  console.log(`✅ 成功遷移 ${nuances.length} 個變體差異`);
  return true;
}

// ============================================
// 5. 遷移角色圖片
// ============================================
async function migrateCharacterImages() {
  console.log('🖼️  開始遷移角色圖片...');

  const images = Object.entries(MBTI_IMAGE_MAP).map(([type, url]) => ({
    mbti_type: type,
    image_url: url,
    image_alt: `${type} 角色圖片`,
    is_active: true
  }));

  // 先停用所有現有圖片
  await supabase
    .from('mbti_character_images')
    .update({ is_active: false })
    .neq('is_active', false);

  // 插入新圖片
  const { error } = await supabase
    .from('mbti_character_images')
    .upsert(images, { onConflict: 'mbti_type,is_active' });

  if (error) {
    console.error('❌ 遷移角色圖片失敗:', error);
    return false;
  }

  console.log(`✅ 成功遷移 ${images.length} 張角色圖片`);
  return true;
}

// ============================================
// 6. 遷移甜點配對（需要從 constants.ts 的 getResultData 中提取）
// ============================================
async function migrateDessertMappings() {
  console.log('🍰 開始遷移甜點配對...');

  // 這個需要根據你的實際資料結構來調整
  // 目前先建立一個範例結構
  const dessertMappings = [
    {
      mbti_type: 'INTJ',
      dessert_name: '北海道經典巴斯克',
      dessert_description: '極致的濃度直達靈魂核心，理智與感官的完美角力。',
      dessert_image_url: DESSERT_IMAGES.BASQUE_CLASSIC,
      dessert_cta_link: 'https://linktr.ee/moon_moon_dessert',
      dessert_series: '巴斯克',
      dessert_quad: '經典',
      drink_a: '美式咖啡',
      drink_t: '經典拿鐵',
      alternative_desserts: ['檸檬巴斯克', '茶香巴斯克']
    },
    // ... 其他類型
  ];

  // 你需要根據實際的 SOUL_ANCHOR_MAP 來建立完整的配對
  // 這裡只是範例

  console.log('⚠️  甜點配對需要手動建立，請參考 Result.tsx 中的 SOUL_ANCHOR_MAP');
  return true;
}

// ============================================
// 主執行函數
// ============================================
async function main() {
  console.log('🚀 開始資料遷移...\n');

  try {
    await migrateQuestions();
    await migrateDimensionExplanations();
    await migrateResults();
    await migrateVariantNuances();
    await migrateCharacterImages();
    await migrateDessertMappings();

    console.log('\n✅ 所有資料遷移完成！');
    console.log('📊 請到 Supabase Dashboard 檢查資料');
  } catch (error) {
    console.error('\n❌ 遷移過程發生錯誤:', error);
    process.exit(1);
  }
}

// 執行
if (require.main === module) {
  main();
}

export { main as migrateData };
