import React, { useEffect, useMemo, useState } from 'react';
import type { AppUser } from '../../types';
import { getCelebrityArchetypes } from '../../data/celebrityData';
import { buildV2ImageSlots, type V2ImageSlotSpec, type V2ReportFamilyKey } from '../../data/v2ImageBlueprint';
import { getRarityData, getRarityLabel, getRarityMessage } from '../../data/rarityData';
import {
  getV2TaiwanDraft,
  V2_TW_DRAFT_SOURCE,
  type V2TaiwanDraftReport,
} from '../../data/v2TaiwanDrafts.generated';
import type { MbtiResultData, Score } from '../../types';
import { calculatePercentages, getVariant } from '../../utils/logic';
import { trackAction } from '../../utils/userDataCollector';
import {
  clearV2Entitlement,
  getLastV1Result,
  getLastV2PrototypeResult,
  getV2Entitlement,
  hasV2UnlockQuery,
  setV2Entitlement,
  unlockV2Preview,
  V2Entitlement,
} from '../../utils/v2Access';
import { getAuthSupabaseClient } from '../../utils/supabaseAuthBridge';
import './v2-tailwind.css';
import './v2.css';

interface V2AppProps {
  user?: AppUser | null;
}

type ReportFamilyKey = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';
type VariantCode = 'A' | 'T';
type PercentageKey = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent';

type SpectrumRow = {
  key: string;
  label: string;
  selectedCode: string;
  oppositeCode: string;
  selectedPct: number;
  oppositePct: number;
  description: string;
  v1Note: string;
};

type TagPill = {
  code: string;
  zh: string;
  en: string;
};

const MARQUEE_TEXT = 'KIWIMU MBTI V2 TAIWAN EDITION · LOCAL PROTOTYPE · PAID WALL · DEEP REPORT · ';
const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1']);
const DEV_ONLY_V2 = true;

const FAMILY_THEMES: Record<ReportFamilyKey, { accent: string; ink: string; soft: string; glow: string; panel: string; line: string; haze: string; }> = {
  analysts: {
    accent: '#D3FF3F',
    ink: '#0F172A',
    soft: '#EFF6FF',
    glow: 'rgba(59, 130, 246, 0.14)',
    panel: 'rgba(255, 255, 255, 0.92)',
    line: 'rgba(15, 23, 42, 0.14)',
    haze: 'rgba(211, 255, 63, 0.18)',
  },
  diplomats: {
    accent: '#FFC98B',
    ink: '#7C2D12',
    soft: '#FFF4EA',
    glow: 'rgba(249, 115, 22, 0.12)',
    panel: 'rgba(255, 251, 247, 0.94)',
    line: 'rgba(124, 45, 18, 0.14)',
    haze: 'rgba(255, 201, 139, 0.18)',
  },
  sentinels: {
    accent: '#B9FBC0',
    ink: '#0F4C45',
    soft: '#EEFFF6',
    glow: 'rgba(16, 185, 129, 0.12)',
    panel: 'rgba(255, 255, 255, 0.93)',
    line: 'rgba(15, 76, 69, 0.14)',
    haze: 'rgba(185, 251, 192, 0.18)',
  },
  explorers: {
    accent: '#FFD166',
    ink: '#8A3B12',
    soft: '#FFF6E5',
    glow: 'rgba(245, 158, 11, 0.14)',
    panel: 'rgba(255, 252, 246, 0.94)',
    line: 'rgba(138, 59, 18, 0.14)',
    haze: 'rgba(255, 209, 102, 0.18)',
  },
};

const DIMENSION_TAGS: Record<string, TagPill> = {
  E: { code: 'E', zh: '社群多巴胺節拍器', en: 'Social Pulse' },
  I: { code: 'I', zh: '數位防空洞隱士', en: 'Inner Shelter' },
  S: { code: 'S', zh: '碎片資訊體感收集者', en: 'Signal Sampler' },
  N: { code: 'N', zh: '神經網絡預言者', en: 'Pattern Seer' },
  T: { code: 'T', zh: '演算法邏輯執行者', en: 'Logic Engine' },
  F: { code: 'F', zh: '人性溫度防火牆', en: 'Warmth Guard' },
  J: { code: 'J', zh: '秩序建築師', en: 'Order Architect' },
  P: { code: 'P', zh: '浪潮衝浪即興派', en: 'Fluid Surfer' },
  A: { code: 'A', zh: '無感延遲穩定核心', en: 'Stable Core' },
  T_VARIANT: { code: 'T', zh: '高頻迭代主角韌性', en: 'Iterative Resilience' },
};

const SPECTRUM_CONFIG: Array<{
  label: string;
  selectedFromType?: number;
  selectedFromVariant?: VariantCode;
  selectedKey?: PercentageKey;
  oppositeKey: PercentageKey;
  noteKey: keyof MbtiResultData['dimensionAnalysis'];
}> = [
  { label: '能量獲取', selectedFromType: 0, oppositeKey: 'I', noteKey: 'EI' },
  { label: '資訊處理', selectedFromType: 1, oppositeKey: 'N', noteKey: 'SN' },
  { label: '決策判斷', selectedFromType: 2, oppositeKey: 'F', noteKey: 'TF' },
  { label: '生活態度', selectedFromType: 3, oppositeKey: 'P', noteKey: 'JP' },
  { label: '自我抗壓', selectedFromVariant: 'A', selectedKey: 'A', oppositeKey: 'Turbulent', noteKey: 'AT' },
];

const buildCheckoutUrl = (mbtiType: string) => {
  const params = new URLSearchParams({
    utm_source: 'mbti',
    utm_medium: 'v2_paywall',
    utm_campaign: 'mbti_v2_unlock',
    mbti_type: mbtiType,
  });

  return `https://map.kiwimu.com/menu?${params.toString()}`;
};

const cleanQuote = (quote: string) => quote.replace(/[「」]/g, '').trim();

const getSpectrumValue = (scores: ReturnType<typeof calculatePercentages>, key: PercentageKey) => scores[key];

const getOppositeKey = (selectedKey: PercentageKey): PercentageKey => {
  switch (selectedKey) {
    case 'E':
      return 'I';
    case 'I':
      return 'E';
    case 'S':
      return 'N';
    case 'N':
      return 'S';
    case 'T':
      return 'F';
    case 'F':
      return 'T';
    case 'J':
      return 'P';
    case 'P':
      return 'J';
    case 'A':
      return 'Turbulent';
    default:
      return 'A';
  }
};

const getDimensionDescription = (report: V2TaiwanDraftReport, selectedCode: string) => {
  if (selectedCode === 'A' || selectedCode === 'T') {
    return report.dimension.bullets.find((item) => item.label.startsWith('A / T'))?.body || '';
  }

  return report.dimension.bullets.find((item) => item.label.startsWith(`${selectedCode} (`))?.body || '';
};

const buildTagWall = (type: string, variant: VariantCode): TagPill[] => {
  const tags = type.split('').map((letter) => DIMENSION_TAGS[letter]).filter(Boolean);
  tags.push(variant === 'A' ? DIMENSION_TAGS.A : DIMENSION_TAGS.T_VARIANT);
  return tags;
};

const buildSpectrumRows = (
  type: string,
  variant: VariantCode,
  scores: Score,
  resultData: MbtiResultData,
  report: V2TaiwanDraftReport,
): SpectrumRow[] => {
  const percentages = calculatePercentages(scores);

  return SPECTRUM_CONFIG.map((config) => {
    const selectedCode = config.selectedFromVariant
      ? variant
      : type[config.selectedFromType || 0];
    const selectedKey = (config.selectedKey || selectedCode) as PercentageKey;
    const oppositeKey = config.selectedFromVariant
      ? getOppositeKey(selectedKey)
      : getOppositeKey(selectedCode as PercentageKey);

    return {
      key: config.label,
      label: config.label,
      selectedCode,
      oppositeCode: oppositeKey === 'Turbulent' ? 'T' : oppositeKey,
      selectedPct: getSpectrumValue(percentages, selectedKey),
      oppositePct: getSpectrumValue(percentages, oppositeKey),
      description: getDimensionDescription(report, selectedCode),
      v1Note: resultData.dimensionAnalysis[config.noteKey],
    };
  });
};

function SectionFrame({
  index,
  title,
  subtitle,
  locked,
  children,
}: {
  index: string;
  title: string;
  subtitle?: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="v2-panel">
      <div className="v2-section-head">
        <span className="v2-section-index">{index}</span>
        <div>
          <p className="v2-section-kicker">{title}</p>
          {subtitle ? <h2 className="v2-section-title">{subtitle}</h2> : null}
        </div>
      </div>

      <div className={locked ? 'v2-lock-shell is-locked' : 'v2-lock-shell'}>
        <div className={locked ? 'v2-lock-body' : ''}>{children}</div>
        {locked ? (
          <div className="v2-lock-overlay">
            <p className="v2-lock-label">LOCKED IN V2</p>
            <p className="v2-lock-copy">完成解鎖後，這裡會展開台灣版完整段落、A/T 對照與深度建議。</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DevImageSlot({
  slot,
  compact = false,
}: {
  slot: V2ImageSlotSpec;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'v2-image-slot is-compact' : 'v2-image-slot'}>
      <div className="v2-image-slot-top">
        <p className="v2-card-eyebrow">IMAGE SLOT</p>
        <span className="v2-image-slot-status">{slot.status}</span>
      </div>
      <div className="v2-image-slot-frame">
        <p className="v2-image-slot-key">{slot.key}</p>
        <p className="v2-image-slot-ratio">{slot.ratio}</p>
      </div>
      <div className="v2-image-slot-meta">
        <h3>{slot.title}</h3>
        <p>{slot.placement}</p>
        <p>Size: {slot.recommendedSize}</p>
        <p>Path: {slot.assetPath}</p>
        <p>{slot.notes}</p>
      </div>
    </div>
  );
}

export default function V2App({ user }: V2AppProps) {
  const [entitlement, setEntitlement] = useState<V2Entitlement>(() => getV2Entitlement());
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const source = params.get('source') || 'direct';
  const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
  const resultBundle = useMemo(() => {
    if (source === 'v2_quiz') {
      return getLastV2PrototypeResult() || getLastV1Result();
    }

    return getLastV1Result();
  }, [source]);

  const variant = resultBundle ? getVariant(resultBundle.scores) : 'A';
  const fullType = resultBundle ? `${resultBundle.resultData.id}-${variant}` : null;
  const checkoutUrl = fullType ? buildCheckoutUrl(fullType) : 'https://shop.kiwimu.com';
  const report = useMemo(() => (resultBundle ? getV2TaiwanDraft(resultBundle.resultData.id) : null), [resultBundle]);

  useEffect(() => {
    if (!fullType || !hasV2UnlockQuery(params)) {
      return;
    }

    const unlocked = unlockV2Preview(params.get('order_id') || 'query-preview');
    setEntitlement(unlocked);
    trackAction('v2_unlock_success', {
      mbtiType: fullType,
      unlockType: unlocked.unlockType,
      source,
    });
  }, [fullType, params, source]);

  useEffect(() => {
    if (!fullType || entitlement.status === 'unlocked') {
      return;
    }

    trackAction('v2_paywall_view', {
      mbtiType: fullType,
      source,
      hasUser: Boolean(user && !user.isAnonymous),
    });
  }, [entitlement.status, fullType, source, user]);

  // Check Supabase DB entitlement on mount（付費後由 webhook 寫入 profiles.v2_unlocked_at）
  useEffect(() => {
    const checkSupabaseEntitlement = async () => {
      if (getV2Entitlement().status === 'unlocked') return;

      const supabase = getAuthSupabaseClient();
      if (!supabase) return;

      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('v2_unlocked_at')
        .eq('id', sbUser.id)
        .single();

      if ((profile as { v2_unlocked_at: string | null } | null)?.v2_unlocked_at) {
        const unlocked: V2Entitlement = {
          status: 'unlocked',
          unlockType: 'one_time',
          unlockedAt: (profile as { v2_unlocked_at: string }).v2_unlocked_at,
          sourceOrderId: 'supabase-db',
          expiresAt: null,
        };
        setV2Entitlement(unlocked);
        setEntitlement(unlocked);
        trackAction('v2_unlock_from_supabase', { mbtiType: fullType || 'unknown', source });
      }
    };

    checkSupabaseEntitlement();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckout = () => {
    if (!fullType) {
      return;
    }

    trackAction('v2_checkout_start', {
      mbtiType: fullType,
      source,
      checkoutUrl,
      mode: isLocalPreview ? 'local_simulation' : 'shop_redirect',
    });

    if (DEV_ONLY_V2) {
      if (!isLocalPreview) {
        trackAction('v2_checkout_blocked_dev', {
          mbtiType: fullType,
          source,
          reason: 'dev_only_mode',
        });
        return;
      }

      const unlocked = unlockV2Preview(`local-${Date.now()}`);
      setEntitlement(unlocked);
      trackAction('v2_unlock_success', {
        mbtiType: fullType,
        unlockType: unlocked.unlockType,
        source: 'local_preview',
      });
      return;
    }

    window.location.assign(checkoutUrl);
  };

  const handleResetPreview = () => {
    clearV2Entitlement();
    setEntitlement(getV2Entitlement());
  };

  if (!resultBundle || !fullType) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
            <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
          </div>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center">
          <div className="v2-panel w-full p-8 md:p-10">
            <p className="v2-eyebrow">MBTI V2 TAIWAN EDITION</p>
            <h1 className="mt-4 text-4xl font-bold leading-none md:text-5xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              你的 MBTI 深度靈魂報告
            </h1>
            <p className="mt-5 text-base leading-relaxed text-black/70">
              超越四個字母的類型標籤——V2 以台灣在地視角深度解析你的認知模式、人際節奏與抗壓策略。用 5 題快速定位，或帶入 V1 完整測驗結果直接生成。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/read/quiz" className="kiwimu-btn kiwimu-btn-primary block flex-1 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em]" style={{ color: '#1A1A1A' }}>
                開始 5 題 V2 測驗
              </a>
              <a href="/quiz" className="kiwimu-btn block flex-1 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: '#1A1A1A' }}>
                帶入 V1 結果
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
            <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="v2-panel p-8 md:p-10">
            <p className="v2-eyebrow">V2 CONTENT SYNC REQUIRED</p>
            <h1 className="mt-4 text-3xl font-bold text-black md:text-4xl">{resultBundle.resultData.id} 的台灣版草案尚未同步</h1>
            <p className="mt-4 text-sm leading-relaxed text-black/70">
              目前 `/v2` 會直接讀取 `{V2_TW_DRAFT_SOURCE}`。請先重新執行 `npm run sync:v2:tw`，再回來看本地版面。
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { resultData, scores } = resultBundle;
  const isUnlocked = entitlement.status === 'unlocked';
  const theme = FAMILY_THEMES[report.familyKey as ReportFamilyKey];
  const imageSlots = buildV2ImageSlots(resultData.id, report.familyKey as V2ReportFamilyKey);
  const rootStyle = {
    '--v2-accent': theme.accent,
    '--v2-ink': theme.ink,
    '--v2-soft': theme.soft,
    '--v2-glow': theme.glow,
    '--v2-panel': theme.panel,
    '--v2-line': theme.line,
    '--v2-haze': theme.haze,
  } as React.CSSProperties;
  const soulQuote = cleanQuote(resultData.quote);
  const tagWall = buildTagWall(resultData.id, variant as VariantCode);
  const spectrumRows = buildSpectrumRows(resultData.id, variant as VariantCode, scores, resultData, report);
  const rarityData = getRarityData(resultData.id);
  const rarityLabel = rarityData ? getRarityLabel(rarityData.rank) : null;
  const rarityMessage = rarityData ? getRarityMessage(rarityData.rank) : null;
  const archetypes = getCelebrityArchetypes(resultData.id).slice(0, 2);
  const isDevLocked = DEV_ONLY_V2 && !isUnlocked && !isLocalPreview;
  const primaryButtonLabel = isUnlocked
    ? '下載 / 列印目前頁面'
    : isLocalPreview
      ? '本地模擬解鎖 V2'
      : DEV_ONLY_V2
        ? 'DEV 階段暫不開放'
        : '前往 shop 解鎖 V2';

  return (
    <div className="v2-root min-h-screen px-5 pt-24 pb-16" style={rootStyle}>
      <div className="marquee-container">
        <div className="marquee-track">
          <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
          <span className="marquee-text">{MARQUEE_TEXT.repeat(3)}</span>
        </div>
      </div>

      <div className="v2-backdrop-orb v2-backdrop-orb-left" />
      <div className="v2-backdrop-orb v2-backdrop-orb-right" />

      <div className="mx-auto max-w-7xl">
        <section className="v2-hero">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="v2-pill v2-pill-solid">TAIWAN EDITION</span>
              <span className="v2-pill">V1 永久免費核心</span>
              <span className="v2-pill">{isUnlocked ? 'V2 已解鎖' : 'V2 付費牆預覽'}</span>
              {DEV_ONLY_V2 ? <span className="v2-pill">DEV ONLY / 不進 main</span> : null}
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <p className="v2-eyebrow">MBTI V2</p>
                <h1 className="v2-hero-code">{fullType}</h1>
              </div>
              <p className="v2-hero-title">{report.title}</p>
            </div>

            <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-black/75">
              <p>
                <span className="font-bold text-black">{report.abstract.label}</span>
                <span className="mx-2 text-black/35">/</span>
                {report.abstract.body}
              </p>
              {source === 'v2_quiz' ? (
                <p className="font-medium text-black/70">
                  目前顯示的是本地 `V2 quiz prototype` 跑出的結果，方便你直接測答題節奏和報告串接。
                </p>
              ) : null}
              <p>{resultData.summary}</p>
            </div>

            <blockquote className="v2-quote-block mt-8">
              <p className="v2-eyebrow">SOUL QUOTE</p>
              <p className="v2-quote-body">「{soulQuote}」</p>
            </blockquote>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DevImageSlot slot={imageSlots.heroDesktop} compact />
              <DevImageSlot slot={imageSlots.heroMobile} compact />
            </div>
          </div>

          <div className="v2-hero-aside">
            <div>
              <p className="v2-eyebrow">REPORT SOURCE</p>
              <p className="mt-3 text-sm font-semibold text-black/75">{report.familyLabel}</p>
              <p className="mt-1 text-sm text-black/60">{report.sourcePath}</p>
            </div>

            <div className="v2-status-grid">
              <div>
                <p className="v2-status-label">人格稱號</p>
                <p className="v2-status-value">{resultData.title}</p>
              </div>
              <div>
                <p className="v2-status-label">變體</p>
                <p className="v2-status-value">{variant}</p>
              </div>
              <div>
                <p className="v2-status-label">資料版本</p>
                <p className="v2-status-value">{report.meta.version}</p>
              </div>
              <div>
                <p className="v2-status-label">本地狀態</p>
                <p className="v2-status-value">{isLocalPreview ? 'localhost' : 'preview'}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <DevImageSlot slot={imageSlots.reportCover} compact />
              <DevImageSlot slot={imageSlots.familyMood} compact />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <main className="space-y-6">
            <SectionFrame index="01" title="DESIGN PHILOSOPHY" subtitle="設計初衷與變動世代觀點">
              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[26px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-6">
                  <p className="v2-card-eyebrow">WHY THIS REPORT EXISTS</p>
                  <p className="mt-4 text-lg leading-relaxed text-[color:var(--v2-ink)]">{report.design.quote}</p>
                </div>
                <div className="grid gap-4">
                  {report.design.behaviorLogic.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-[color:var(--v2-line)] bg-white/85 p-5">
                      <p className="v2-card-eyebrow">{item.label}</p>
                      <p className="mt-3 text-sm leading-relaxed text-black/72">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFrame>

            <SectionFrame index="02" title="TAG WALL" subtitle="五個能瞬間辨識你的 V2 標籤">
              <div className="flex flex-wrap gap-3">
                {tagWall.map((tag) => (
                  <div key={`${tag.code}-${tag.zh}`} className="v2-tag-pill">
                    <span className="v2-tag-code">{tag.code}</span>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--v2-ink)]">{tag.zh}</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-black/42">{tag.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionFrame>

            <SectionFrame index="03" title="PROFESSIONAL INSIGHTS" subtitle={report.professional.coreTitle} locked={!isUnlocked}>
              <div className="space-y-5">
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-white/88 p-6">
                  <p className="text-base leading-relaxed text-black/80">{report.professional.coreBody}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {([report.professional.subtypes.A, report.professional.subtypes.T] as const).map((subtype) => (
                    <div key={subtype.code} className="rounded-[24px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="v2-card-eyebrow">{subtype.code} / {subtype.tone}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-[color:var(--v2-ink)]">{subtype.title}</h3>
                        </div>
                        <span className="v2-variant-chip">{subtype.code}</span>
                      </div>
                      <div className="mt-5 space-y-4">
                        {subtype.items.map((item) => (
                          <div key={item.label}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">{item.label}</p>
                            <p className="mt-2 text-sm leading-relaxed text-black/72">{item.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFrame>

            <SectionFrame index="04" title="DIMENSION EVOLUTION" subtitle={report.dimension.tip} locked={!isUnlocked}>
              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4">
                  {report.dimension.bullets.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-[color:var(--v2-line)] bg-white/85 p-5">
                      <p className="v2-card-eyebrow">{item.label}</p>
                      <p className="mt-3 text-sm leading-relaxed text-black/72">{item.body}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-5 md:p-6">
                  <p className="v2-card-eyebrow">COGNITIVE SPECTRUM</p>
                  <div className="mt-5 space-y-4">
                    {spectrumRows.map((row) => (
                      <div key={row.key} className="v2-spectrum-row">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--v2-ink)]">{row.label}</p>
                            <p className="mt-1 text-xs leading-relaxed text-black/55">{row.description || row.v1Note}</p>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{row.selectedCode} / {row.oppositeCode}</p>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/8">
                          <div className="v2-spectrum-fill" style={{ width: `${row.selectedPct}%` }} />
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-4 text-xs text-black/55">
                          <span>{row.selectedCode} {row.selectedPct}%</span>
                          <span className="text-right">{row.oppositeCode} {row.oppositePct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionFrame>

            <SectionFrame index="05" title="CULTURAL CONTEXT" subtitle="職涯策略與感情導航" locked={!isUnlocked}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-white/86 p-6">
                  <p className="v2-card-eyebrow">CAREER</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[color:var(--v2-ink)]">{report.career.title}</h3>
                  <div className="mt-5 space-y-4">
                    {report.career.bullets.map((item) => (
                      <div key={item.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">{item.label}</p>
                        <p className="mt-2 text-sm leading-relaxed text-black/72">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-6">
                  <p className="v2-card-eyebrow">RELATIONSHIP</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[color:var(--v2-ink)]">{report.relationship.title}</h3>
                  <div className="mt-5 space-y-4">
                    {report.relationship.bullets.map((item) => (
                      <div key={item.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">{item.label}</p>
                        <p className="mt-2 text-sm leading-relaxed text-black/72">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionFrame>

            <SectionFrame index="06" title="FREQUENCY & ARCHETYPES" subtitle="稀有度與共鳴原型" locked={!isUnlocked}>
              <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-6">
                  <p className="v2-card-eyebrow">FREQUENCY</p>
                  {rarityData ? (
                    <>
                      <div className="mt-4 flex items-end gap-3">
                        <p className="text-5xl font-bold tracking-tight text-[color:var(--v2-ink)]">{rarityData.totalPopulation}%</p>
                        <p className="pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-black/45">{rarityLabel}</p>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-black/72">{rarityMessage}</p>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-black/68">
                        <div className="rounded-[18px] border border-[color:var(--v2-line)] bg-white/80 p-4">
                          <p className="v2-card-eyebrow">MALE</p>
                          <p className="mt-2 text-xl font-semibold text-[color:var(--v2-ink)]">{rarityData.male}%</p>
                        </div>
                        <div className="rounded-[18px] border border-[color:var(--v2-line)] bg-white/80 p-4">
                          <p className="v2-card-eyebrow">FEMALE</p>
                          <p className="mt-2 text-xl font-semibold text-[color:var(--v2-ink)]">{rarityData.female}%</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-black/70">目前本地原型還沒有對應的稀有度資料。</p>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {archetypes.map((archetype) => (
                    <div key={archetype.name} className="rounded-[24px] border border-[color:var(--v2-line)] bg-white/86 p-6">
                      <p className="v2-card-eyebrow">ARCHETYPE</p>
                      <h3 className="mt-3 text-2xl font-semibold text-[color:var(--v2-ink)]">{archetype.name}</h3>
                      <p className="mt-1 text-sm text-black/52">{archetype.profession}</p>
                      <ul className="mt-5 space-y-2 text-sm leading-relaxed text-black/72">
                        {archetype.resonanceTraits.map((trait) => (
                          <li key={trait}>• {trait}</li>
                        ))}
                      </ul>
                      <div className="mt-5 rounded-[18px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-4">
                        <p className="v2-card-eyebrow">DESSERT PAIRING</p>
                        <p className="mt-2 font-semibold text-[color:var(--v2-ink)]">{archetype.dessertPairing}</p>
                        <p className="mt-2 text-sm leading-relaxed text-black/68">{archetype.pairingReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFrame>

            <SectionFrame index="07" title="SOUL REFLECTION" subtitle={report.dessert.name} locked={!isUnlocked}>
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[24px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-6">
                  <p className="v2-card-eyebrow">SOUL DESSERT</p>
                  <div className="mt-4">
                    <DevImageSlot slot={imageSlots.soulDessert} compact />
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-black/78">{report.dessert.visualLogic}</p>
                  <div className="mt-5 space-y-3">
                    {report.dessert.pairings.map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-[color:var(--v2-line)] bg-white/82 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">{item.label}</p>
                        <p className="mt-2 text-sm leading-relaxed text-black/72">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {report.abyssal.map((question, index) => (
                    <div key={question.title} className="rounded-[24px] border border-[color:var(--v2-line)] bg-white/88 p-5">
                      <p className="v2-card-eyebrow">ABYSSAL 0{index + 1}</p>
                      <h3 className="mt-3 text-xl font-semibold text-[color:var(--v2-ink)]">{question.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-black/72">{question.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFrame>

            <section className="v2-panel v2-footer-panel">
              <p className="v2-card-eyebrow">FOOTER CTA</p>
              <h2 className="mt-3 text-3xl font-semibold text-[color:var(--v2-ink)]">{report.closing}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/quiz" className="kiwimu-btn block px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: '#1A1A1A' }}>
                  回看免費 V1
                </a>
                <a href="/" className="kiwimu-btn block px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: '#1A1A1A' }}>
                  回到 5 題漏斗
                </a>
              </div>
            </section>
          </main>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="v2-panel p-6 md:p-7">
              <p className="v2-card-eyebrow">UPGRADE STATUS</p>
              <h2 className="mt-4 text-3xl font-semibold text-[color:var(--v2-ink)]">
                {isUnlocked ? 'V2 台灣版已解鎖' : 'V2 深度檔案待解鎖'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-black/68">
                {isUnlocked
                  ? '這份頁面現在直接使用 2026 H2 台灣版草案庫 + 現有 V1 結果資料在本地組裝。'
                  : 'V1 永久免費保留。V2 只鎖完整深報告，包含 A/T 對照、維度進化、職涯與關係深度段落。'}
              </p>
              {DEV_ONLY_V2 ? (
                <div className="mt-4 rounded-[18px] border border-[color:var(--v2-line)] bg-[color:var(--v2-soft)] p-4 text-sm leading-relaxed text-black/72">
                  目前固定維持在 `dev/local prototype` 階段，不接正式金流、不影響 `main` 營運，也不作正式上線判定。等你的圖補齊後再進下一步整合。
                </div>
              ) : null}

              <div className="mt-6 space-y-3 text-sm leading-relaxed text-black/72">
                <div className="v2-feature-item">完整台灣版草案文案與家族風格排版</div>
                <div className="v2-feature-item">A/T 亞型對照與真實分數光譜</div>
                <div className="v2-feature-item">稀有度、共鳴原型、靈魂甜點與靈魂拷問</div>
                <div className="v2-feature-item">後續可接本地 entitlement 與真實金流流程</div>
              </div>

              {!isUnlocked ? (
                <div className="mt-4">
                  <DevImageSlot slot={imageSlots.paywallLocked} compact />
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <button
                  onClick={isUnlocked ? () => window.print() : handleCheckout}
                  className="kiwimu-btn kiwimu-btn-primary w-full px-6 py-4 text-sm font-black uppercase tracking-[0.18em]"
                  style={{ color: '#1A1A1A' }}
                  disabled={isDevLocked}
                >
                  {primaryButtonLabel}
                </button>
                {!isUnlocked ? (
                  <a href="/quiz" className="kiwimu-btn block w-full px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: '#1A1A1A' }}>
                    回看免費 V1
                  </a>
                ) : null}
              </div>
            </div>

            <div className="v2-panel p-6 md:p-7">
              <p className="v2-card-eyebrow">LOCAL DEBUG</p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-black/68">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">來源路徑</p>
                  <p className="mt-2 break-all">{V2_TW_DRAFT_SOURCE}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">結果來源</p>
                  <p className="mt-2">source={source} / mbti={fullType}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">本地 entitlement</p>
                  <p className="mt-2">{isUnlocked ? `unlocked (${entitlement.unlockType || 'unknown'})` : 'locked'}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <DevImageSlot slot={imageSlots.pdfCover} compact />
                <DevImageSlot slot={imageSlots.shareTemplate} compact />
              </div>

              {isLocalPreview ? (
                <div className="mt-6 space-y-3">
                  <button onClick={handleResetPreview} className="kiwimu-btn w-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: '#1A1A1A' }}>
                    重設本地解鎖狀態
                  </button>
                  <p className="text-xs leading-relaxed text-black/55">
                    localhost 目前會把「解鎖」視為本地模擬付款，不會真的建立訂單。
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
