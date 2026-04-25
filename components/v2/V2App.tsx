import React, { useEffect, useMemo, useState } from 'react';
import type { AppUser } from '../../types';
import {
  getV2TaiwanDraft,
  V2_TW_DRAFT_SOURCE,
  type V2TaiwanDraftReport,
} from '../../data/v2TaiwanDrafts.generated';
import { getV2PsychArchetype } from '../../data/v2PsychArchetypes.generated';
import { getV2VariantReport } from '../../data/v2VariantReports.generated';
import { getRarityData } from '../../data/rarityData';
import { getResultData } from '../../constants';
import type { MbtiResultData, Score } from '../../types';
import { calculatePercentages, getVariant } from '../../utils/logic';
import { trackAction } from '../../utils/userDataCollector';
import {
  trackPageView,
  trackScreenEngagement,
  trackV2CheckoutStart,
  trackV2PaywallView,
  trackV2Unlocked,
} from '../../utils/analytics';
import { applyRuntimeSeo } from '../../utils/seo';
import {
  clearV2Entitlement,
  getLastV1Result,
  getLastV2PrototypeResult,
  readCachedV2Entitlement,
  hasV2UnlockQuery,
  setV2Entitlement,
  unlockV2Purchase,
  unlockV2Preview,
  type V2Entitlement,
} from '../../utils/v2Access';
import { getAuthSupabaseClient } from '../../utils/supabaseAuthBridge';
import {
  buildV2ReportPath,
  normalizeV2Pathname,
  parseV2RouteTarget,
  type V2VariantCode,
} from '../../utils/v2Routes';
import { buildDessertOrderLink, trackDessertOrderClick } from '../../utils/utmTracking';
import { KiwimuCharacter, type KiwimuState } from './KiwimuCharacter';
import './v2-tailwind.css';
import './v2.css';

interface V2AppProps {
  user?: AppUser | null;
}

type ReportFamilyKey = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';
type VariantCode = 'A' | 'T';
type PercentageKey = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent';

type SpectrumRow = {
  label: string;
  selectedCode: string;
  oppositeCode: string;
  selectedPct: number;
  description: string;
};

type TagCard = {
  code: string;
  zh: string;
  en: string;
};

type CompareCard = {
  code: VariantCode;
  badge: string;
  title: string;
  tone: string;
  strategyLabel: string;
  strategy: string;
  energyLabel: string;
  energy: string;
  cost?: string;
};

type VariantPrototypeCopy = {
  eyebrow: string;
  subtitle: string;
  soulQuote: string;
  heroLines: string[];
  status: string;
  tags: TagCard[];
  professionalQuote: string;
  compareCards: CompareCard[];
  frequencyPrimary: string;
  frequencyPrimaryLabel: string;
  frequencySecondary: string;
  frequencySecondaryLabel: string;
  frequencyNote: string;
  footerTitle: string;
  footerSubtitle: string;
};

type ReportNavChapter = {
  id: string;
  label: string;
  locked: boolean;
};

const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1']);
const IS_DEV = import.meta.env.DEV;

const FAMILY_META: Record<ReportFamilyKey, { familyLabel: string; familyAccent: string; familyKeyLabel: string; familyStage: string }> = {
  analysts: {
    familyLabel: '分析家類 ANALYSTS',
    familyAccent: '#B4DCFF',
    familyKeyLabel: 'Midnight / 深夜思考的冷靜',
    familyStage: '#0C1220',
  },
  diplomats: {
    familyLabel: '外交家類 DIPLOMATS',
    familyAccent: '#FFD6B4',
    familyKeyLabel: 'Dusk / 感知先於語言',
    familyStage: '#140D1E',
  },
  sentinels: {
    familyLabel: '守護者類 SENTINELS',
    familyAccent: '#C9F3C2',
    familyKeyLabel: 'Forest / 幾乎是黑的深綠',
    familyStage: '#0E1510',
  },
  explorers: {
    familyLabel: '探險家類 EXPLORERS',
    familyAccent: '#FFD98A',
    familyKeyLabel: 'Ember / 熱度藏在最深處',
    familyStage: '#1A0E08',
  },
};

const DIMENSION_TAGS: Record<string, TagCard> = {
  E: { code: 'SOC-PULSE', zh: '社群節拍驅動', en: 'Social Pulse' },
  I: { code: 'INNER-SHLD', zh: '內在防空洞', en: 'Inner Shelter' },
  S: { code: 'FACT-SCAN', zh: '現實感測系統', en: 'Fact Scanner' },
  N: { code: 'PATTERN-SIGHT', zh: '模式預見者', en: 'Pattern Sight' },
  T: { code: 'LOGIC-CORE', zh: '邏輯主控台', en: 'Logic Core' },
  F: { code: 'AFFECT-LAYER', zh: '情感感應層', en: 'Affect Layer' },
  J: { code: 'ORDER-RIG', zh: '秩序施工架', en: 'Order Rig' },
  P: { code: 'FLOW-ADAPT', zh: '即興調頻器', en: 'Flow Adapt' },
  A: { code: 'CORE-STEADY', zh: '穩定核心', en: 'Core Steady' },
  T_VARIANT: { code: 'SELF-AUDIT', zh: '高頻自審', en: 'Self Audit' },
};

const SPECTRUM_CONFIG: Array<{
  label: string;
  selectedFromType?: number;
  selectedFromVariant?: VariantCode;
  selectedKey?: PercentageKey;
  oppositeKey: PercentageKey;
}> = [
  { label: '能量獲取', selectedFromType: 0, oppositeKey: 'I' },
  { label: '資訊處理', selectedFromType: 1, oppositeKey: 'N' },
  { label: '決策判斷', selectedFromType: 2, oppositeKey: 'F' },
  { label: '生活態度', selectedFromType: 3, oppositeKey: 'P' },
  { label: '自我抗壓', selectedFromVariant: 'A', selectedKey: 'A', oppositeKey: 'Turbulent' },
];

const cleanText = (value?: string | null) => (value || '').replace(/\s*---\s*$/, '').replace(/[「」]/g, '').trim();

const toAnchorSentence = (value?: string | null) => {
  const sentence = cleanText(value).split(/[。！？]/u)[0]?.trim();
  if (!sentence) {
    return '';
  }

  return `${sentence.replace(/[，、；：,:;]$/u, '')}。`;
};

const splitCoverQuote = (value?: string | null) => {
  const normalized = cleanText(value);
  if (!normalized) {
    return { lead: '', tail: '' };
  }

  const parts = normalized.split(/[，,]/u).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return { lead: normalized, tail: '' };
  }

  return {
    lead: `${parts[0]}，`,
    tail: parts.slice(1).join('，'),
  };
};

const splitCoverSubcopy = (value?: string | null) => {
  const normalized = cleanText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[。！？]/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
};

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

const buildSyntheticScores = (type: string, variant: V2VariantCode): Score => ({
  E: type.includes('E') ? 74 : 26,
  I: type.includes('I') ? 74 : 26,
  S: type.includes('S') ? 71 : 29,
  N: type.includes('N') ? 71 : 29,
  T: type.includes('T') ? 68 : 32,
  F: type.includes('F') ? 68 : 32,
  J: type.includes('J') ? 64 : 36,
  P: type.includes('P') ? 64 : 36,
  A: variant === 'A' ? 66 : 34,
  Turbulent: variant === 'T' ? 66 : 34,
});

const buildTagWall = (type: string, variant: VariantCode): TagCard[] => {
  const tags = type.split('').map((letter) => DIMENSION_TAGS[letter]).filter(Boolean);
  tags.push(variant === 'A' ? DIMENSION_TAGS.A : DIMENSION_TAGS.T_VARIANT);
  return tags;
};

const buildSpectrumRows = (
  type: string,
  variant: VariantCode,
  scores: Score,
  dimensionBullets: Array<{ label: string; body: string }>,
): SpectrumRow[] => {
  const percentages = calculatePercentages(scores);
  const descriptions = new Map(dimensionBullets.map((item) => [item.label, item.body]));

  return SPECTRUM_CONFIG.map((config) => {
    const selectedCode = config.selectedFromVariant ? variant : type[config.selectedFromType || 0];
    const selectedKey = (config.selectedKey || selectedCode) as PercentageKey;
    const oppositeKey = config.selectedFromVariant ? getOppositeKey(selectedKey) : getOppositeKey(selectedCode as PercentageKey);
    const descriptionKey = selectedCode === 'A' || selectedCode === 'T' ? 'A / T (自我認同)' : `${selectedCode} (${selectedCode === 'I' ? '內向' : selectedCode === 'N' ? '直覺' : selectedCode === 'T' ? '思考' : selectedCode === 'J' ? '判斷' : selectedCode === 'E' ? '外向' : selectedCode === 'S' ? '實感' : selectedCode === 'F' ? '情感' : '感知'})`;

    return {
      label: config.label,
      selectedCode,
      oppositeCode: oppositeKey === 'Turbulent' ? 'T' : oppositeKey,
      selectedPct: percentages[selectedKey],
      description: descriptions.get(descriptionKey) || descriptions.get('A / T (自我認同)') || '',
    };
  });
};

const buildPrototypeCopy = (
  variant: VariantCode,
  report: V2TaiwanDraftReport,
  resultData: MbtiResultData,
): VariantPrototypeCopy => {
  const familyMeta = FAMILY_META[report.familyKey as ReportFamilyKey];
  const typeTitle = variant === 'A' ? '穩定變體' : '高敏變體';
  const aItems = report.professional.subtypes.A.items;
  const tItems = report.professional.subtypes.T.items;

  return {
    eyebrow: `${familyMeta.familyLabel} · KIWIMU V2 深度報告`,
    subtitle: `${report.title} · ${typeTitle}`,
    soulQuote: cleanText(report.soulQuote || report.closing || resultData.quote || report.abstract.body),
    heroLines: [report.abstract.body, report.design.quote, ...report.design.behaviorLogic.map((item) => item.body)].slice(0, 3),
    status: variant === 'A' ? '當前狀態：穩定輸出期 / 低噪推進中' : '當前狀態：高頻調整期 / 自我監測中',
    tags: buildTagWall(resultData.id, variant).slice(0, 6),
    professionalQuote: report.professional.coreBody,
    compareCards: [
      {
        code: 'A',
        badge: variant === 'A' ? '你的型' : '相對型',
        title: report.professional.subtypes.A.title,
        tone: report.professional.subtypes.A.tone,
        strategyLabel: aItems[0]?.label || '情緒能量',
        strategy: aItems[0]?.body || report.professional.coreBody,
        energyLabel: aItems[1]?.label || '穩定度',
        energy: aItems[1]?.body || report.abstract.body,
      },
      {
        code: 'T',
        badge: variant === 'T' ? '你的型' : '另一型',
        title: report.professional.subtypes.T.title,
        tone: report.professional.subtypes.T.tone,
        strategyLabel: tItems[0]?.label || '情緒能量',
        strategy: tItems[0]?.body || report.professional.coreBody,
        energyLabel: tItems[1]?.label || '內隱焦慮',
        energy: tItems[1]?.body || report.abstract.body,
      },
    ],
    frequencyPrimary: `${getRarityData(resultData.id)?.totalPopulation ?? 2.4}%`,
    frequencyPrimaryLabel: '人口出現率',
    frequencySecondary: variant === 'A' ? '1.0%' : '0.9%',
    frequencySecondaryLabel: '變體切面',
    frequencyNote: '這個比例不是要證明你多特別，而是讓你知道這種狀態確實有人活過。',
    footerTitle: report.dessert.name,
    footerSubtitle: report.dessert.visualLogic,
  };
};

const buildVersionTagWall = (
  report: V2TaiwanDraftReport,
  variant: VariantCode,
  fallbackTags: TagCard[],
) => {
  return [
    report.professional.subtypes[variant].title,
    report.abstract.label,
    ...report.design.behaviorLogic.map((item) => item.label),
    ...fallbackTags.map((tag) => tag.zh),
  ]
    .map((item) => cleanText(item))
    .filter((item, index, source) => item && source.indexOf(item) === index)
    .slice(0, 6);
};

const REPORT_CHAPTERS: ReportNavChapter[] = [
  { id: 'ch-01', label: '01 當下的你', locked: false },
  { id: 'ch-02', label: '02 你的版本', locked: false },
  { id: 'ch-03', label: '03 四個維度', locked: true },
  { id: 'ch-04', label: '04 你怎麼活', locked: true },
  { id: 'ch-05', label: '05 你的原型', locked: true },
  { id: 'ch-06', label: '06 帶走這個', locked: true },
];

export default function V2App({ user }: V2AppProps) {
  const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
  const pathname = window.location.pathname;
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeTarget = useMemo(() => parseV2RouteTarget(pathname, params), [params, pathname]);
  const [entitlement, setEntitlementState] = useState<V2Entitlement>(() =>
    isLocalPreview ? readCachedV2Entitlement() : { status: 'locked' },
  );
  const [activeChapter, setActiveChapter] = useState('ch-01');
  const [scrollProgress, setScrollProgress] = useState(0);
  const source = params.get('source') || 'direct';
  const isUnlocked = entitlement.status === 'unlocked';

  const routeBundle = useMemo(() => {
    if (!routeTarget) return null;
    return {
      resultData: getResultData(routeTarget.type, routeTarget.variant),
      scores: buildSyntheticScores(routeTarget.type, routeTarget.variant),
    };
  }, [routeTarget]);

  const resultBundle = useMemo(() => {
    if (source === 'v2_quiz') {
      return getLastV2PrototypeResult() || routeBundle || getLastV1Result();
    }

    return routeBundle || getLastV1Result();
  }, [routeBundle, source]);

  const variant = routeTarget?.variant || (resultBundle ? getVariant(resultBundle.scores) : 'A');
  const fullType = routeTarget?.fullType || (resultBundle ? `${resultBundle.resultData.id}-${variant}` : null);
  const report = useMemo(() => (resultBundle ? getV2TaiwanDraft(resultBundle.resultData.id) : null), [resultBundle]);
  const seoVariantReport = useMemo(() => (fullType ? getV2VariantReport(fullType) : null), [fullType]);
  const canonicalPath = fullType ? buildV2ReportPath(fullType) : '/read';
  const canonicalUrl = `https://kiwimu.com${canonicalPath}`;

  useEffect(() => {
    const normalizedPath = normalizeV2Pathname(window.location.pathname);
    if (normalizedPath !== window.location.pathname) {
      window.history.replaceState({}, '', `${normalizedPath}${window.location.search}`);
      return;
    }

    if (window.location.pathname === '/read' && routeTarget) {
      const nextUrl = new URL(window.location.href);
      nextUrl.pathname = buildV2ReportPath(routeTarget.fullType);
      nextUrl.searchParams.delete('mbti');
      window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
    }
  }, [routeTarget]);

  useEffect(() => {
    const title = fullType && report
      ? `${fullType} 深度報告｜${seoVariantReport?.title || report.title}｜Kiwimu MBTI V2`
      : 'Kiwimu MBTI V2 深度報告';
    const description = fullType && report && resultBundle
      ? `${seoVariantReport?.abstract.body || report.abstract.body} 讀完免費章節後，可以解鎖完整 V2 深度報告。`
      : 'Kiwimu MBTI V2 深度報告：從 MBTI 類型出發，讀到更完整的 A/T 變體、維度、關係、原型與收束提問。';
    const image = resultBundle?.resultData.characterImage || 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png';

    applyRuntimeSeo({
      title,
      description,
      canonical: canonicalUrl,
      ogType: 'article',
      image,
      keywords: ['Kiwimu', 'MBTI', 'V2', '深度報告', fullType || '人格報告'].join(','),
      robots: fullType ? 'index,follow' : 'noindex,follow',
    });
  }, [canonicalUrl, fullType, report, resultBundle, seoVariantReport]);

  useEffect(() => {
    const enteredAt = Date.now();
    trackPageView(canonicalPath);
    return () => {
      trackScreenEngagement(canonicalPath, Math.round((Date.now() - enteredAt) / 1000));
    };
  }, [canonicalPath]);

  useEffect(() => {
    if (!fullType || !hasV2UnlockQuery(params, { allowPreview: IS_DEV, allowSuccess: true })) {
      return;
    }

    const unlocked = params.get('unlock') === 'success'
      ? unlockV2Purchase(params.get('order_id') || params.get('transaction_id') || 'linepay')
      : unlockV2Preview(params.get('order_id') || 'query-preview');
    setEntitlementState(unlocked);
    trackAction('v2_unlock_success', {
      mbtiType: fullType,
      unlockType: unlocked.unlockType,
      source,
    });
    trackV2Unlocked(fullType, unlocked.unlockType, source);
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
    trackV2PaywallView(fullType, source);
  }, [entitlement.status, fullType, source, user]);

  useEffect(() => {
    const checkSupabaseEntitlement = async () => {
      const supabase = getAuthSupabaseClient();
      if (!supabase) {
        if (!isLocalPreview) {
          clearV2Entitlement();
        }
        return;
      }

      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) {
        if (!isLocalPreview) {
          clearV2Entitlement();
        }
        return;
      }

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
        setEntitlementState(unlocked);
        trackAction('v2_unlock_from_supabase', { mbtiType: fullType || 'unknown', source });
        trackV2Unlocked(fullType || 'unknown', 'one_time', 'supabase-db');
      } else if (!isLocalPreview) {
        clearV2Entitlement();
      }
    };

    void checkSupabaseEntitlement();
  }, [fullType, isLocalPreview, source]);

  useEffect(() => {
    if (!fullType) {
      return;
    }

    setActiveChapter('ch-01');

    const sections = REPORT_CHAPTERS.map((chapter) => document.getElementById(chapter.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveChapter(visible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [fullType, isUnlocked]);

  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  const handleCheckout = () => {
    void (async () => {
    if (!fullType) {
      return;
    }

    const checkoutUrl = '/api/linepay/request';
    trackAction('v2_checkout_start', {
      mbtiType: fullType,
      source,
      checkoutUrl,
      mode: isLocalPreview ? 'local_simulation' : 'shop_redirect',
    });
    trackV2CheckoutStart(fullType, source, checkoutUrl);

    if (IS_DEV) {
      if (!isLocalPreview) {
        trackAction('v2_checkout_blocked_dev', {
          mbtiType: fullType,
          source,
          reason: 'dev_only_mode',
        });
        return;
      }

      const unlocked = unlockV2Preview(`local-${Date.now()}`);
      setEntitlementState(unlocked);
      trackAction('v2_unlock_success', {
        mbtiType: fullType,
        unlockType: unlocked.unlockType,
        source: 'local_preview',
      });
      return;
    }

      try {
        const response = await fetch('/api/linepay/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mbtiType: fullType,
            source,
            userUid: user?.uid || null,
          }),
        });

        const result = await response.json() as {
          ok?: boolean;
          paymentUrl?: string;
          error?: string;
        };

        if (!response.ok || !result.ok || !result.paymentUrl) {
          throw new Error(result.error || 'LINE Pay request failed');
        }

        window.location.assign(result.paymentUrl);
      } catch (error) {
        console.error('Failed to start LINE Pay checkout', error);
        trackAction('v2_checkout_error', {
          mbtiType: fullType,
          source,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    })();
  };

  const handleResetPreview = () => {
    clearV2Entitlement();
    setEntitlementState({ status: 'locked' });
  };

  const handleShareStory = async () => {
    if (!fullType) {
      return;
    }

    trackAction('v2_story_share_click', { mbtiType: fullType, source });

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.warn('Failed to copy V2 share URL', error);
    }

    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  if (!resultBundle || !fullType) {
    const marquee = 'KIWIMU V2 · COMING SOON · 32 VARIANTS · 心理原型層 · 即將公布 · ';
    const v15Bundle = source === 'v15_quiz' ? getLastV2PrototypeResult() : null;
    const v15FullType = v15Bundle ? `${v15Bundle.resultData.id}-${getVariant(v15Bundle.scores)}` : null;
    const v15Title = v15Bundle?.resultData.title;
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{marquee.repeat(3)}</span>
            <span className="marquee-text">{marquee.repeat(3)}</span>
          </div>
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center">
          <div className="v2-panel w-full p-8 md:p-10">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: '#CCFF00',
                color: '#1A1A1A',
                border: '1px solid #1A1A1A',
                borderRadius: 999,
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1A1A1A' }} />
              即將公布 · COMING SOON
            </span>
            <p className="v2-eyebrow mt-4">KIWIMU V2 · MBTI 進化版</p>
            <h1
              className="mt-3 text-4xl font-bold leading-[1.05] md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              看見 16 型<br />看不見的那一層
            </h1>
            {v15FullType ? (
              <div
                className="mt-5 rounded-2xl px-5 py-4"
                style={{ background: '#1A1A1A', color: '#F8F8F5' }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  V1.5 分流結果
                </p>
                <p
                  className="mt-2 text-2xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {v15FullType}
                </p>
                {v15Title && <p className="mt-1 text-sm text-white/70">{v15Title}</p>}
                <p className="mt-3 text-xs text-white/60 leading-relaxed">
                  V2 上線後會直接帶你進 {v15FullType} 的深度報告。<br />
                  在那之前，先做完整 V1 看完免費版。
                </p>
              </div>
            ) : (
              <p className="mt-5 text-base leading-relaxed text-black/70">
                V2 把 16 型再拆成 32 種變體，疊上心理原型層與歷史軌跡，寫成一份只屬於你的深度報告。<br />
                目前內容仍在最後校對，先用下面的入口認識自己的 MBTI。
              </p>
            )}
            <div className="mt-6 space-y-2">
              {[
                '32 variant：A 穩定核心 × T 自審驅動',
                '心理原型層 × 歷史軌跡，不只是四個字母',
                '台灣版敘事，不是翻譯過來的框架',
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-center gap-2 text-black/50"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: '#CCFF00', border: '1px solid #1A1A1A' }}
                  />
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/quiz"
                className="kiwimu-btn kiwimu-btn-primary flex-1 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em]"
              >
                先做 V1 純 MBTI
              </a>
              <a
                href="/read/quiz"
                className="kiwimu-btn flex-1 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em]"
                style={{ color: '#1A1A1A' }}
              >
                30 秒 V1.5 分流
              </a>
            </div>
            <p
              className="mt-6 text-black/40"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            >
              V2 上線後會在這裡公布。先做 V1 / V1.5，型別資料未來可以直接帶進來。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="v2-root">
        <div className="v2-shell">
          <section className="v2-panel v2-empty-panel">
            <p className="v2-label">V2 CONTENT SYNC REQUIRED</p>
            <h1 className="v2-empty-title">{resultBundle.resultData.id} 的台灣版草案尚未同步</h1>
            <p className="v2-empty-copy">目前 `/read` 會直接讀取 `{V2_TW_DRAFT_SOURCE}`，請先同步草案資料再看這個 prototype。</p>
          </section>
        </div>
      </div>
    );
  }

  const { resultData, scores } = resultBundle;
  const familyMeta = FAMILY_META[report.familyKey as ReportFamilyKey];
  const currentVariant = variant as VariantCode;
  const prototypeCopy = buildPrototypeCopy(currentVariant, report, resultData);
  const variantReport = getV2VariantReport(fullType);
  const oppositeVariant = currentVariant === 'A' ? 'T' : 'A';
  const oppositeVariantReport = getV2VariantReport(`${resultData.id}-${oppositeVariant}`);
  const psychArchetype = getV2PsychArchetype(fullType);
  const dimensionBullets = variantReport?.dimension.bullets.length ? variantReport.dimension.bullets : report.dimension.bullets;
  const spectrumRows = buildSpectrumRows(resultData.id, variant as VariantCode, scores, dimensionBullets);
  const rarityData = getRarityData(resultData.id);
  const dessertOrderUrl = buildDessertOrderLink(resultData.id, variant);
  const versionTags = variantReport?.tags.length
    ? variantReport.tags.map((tag) => cleanText(tag.label)).filter(Boolean).slice(0, 6)
    : buildVersionTagWall(report, currentVariant, prototypeCopy.tags);
  const heroState: KiwimuState = variant === 'A' ? 'still' : 'hover';
  const rootStyle = {
    '--v2-ink': '#1A1A1A',
    '--v2-acid': '#CCFF00',
    '--v2-paper': '#F8F8F5',
    '--v2-muted': '#888880',
    '--v2-family': familyMeta.familyAccent,
    '--v2-stage': familyMeta.familyStage,
  } as React.CSSProperties;

  const compareCards: CompareCard[] = (['A', 'T'] as VariantCode[]).map((code) => {
    const sourceReport = code === currentVariant ? variantReport : oppositeVariantReport;
    const fallbackCard = prototypeCopy.compareCards.find((card) => card.code === code) || prototypeCopy.compareCards[0];
    const subtypeItems = sourceReport?.professional.subtypeItems || [];

    return {
      ...fallbackCard,
      badge: code === currentVariant ? '你的型' : '另一型',
      title: cleanText(sourceReport?.professional.subtypeTitle || fallbackCard.title),
      tone: cleanText(sourceReport?.professional.subtypeLabel || fallbackCard.tone || (code === 'A' ? 'A 變體' : 'T 變體')),
      strategyLabel: cleanText(subtypeItems[0]?.label || fallbackCard.strategyLabel),
      strategy: cleanText(subtypeItems[0]?.body || fallbackCard.strategy),
      energyLabel: cleanText(subtypeItems[1]?.label || fallbackCard.energyLabel),
      energy: cleanText(subtypeItems[1]?.body || fallbackCard.energy),
      cost: cleanText(subtypeItems[3]?.body || subtypeItems[2]?.body || fallbackCard.cost || '') || undefined,
    };
  });

  const currentCompareCard =
    compareCards.find((card) => card.code === currentVariant) || compareCards[0];
  const oppositeCompareCard =
    compareCards.find((card) => card.code !== currentVariant) || compareCards[1];
  const oppositeSubtype = report.professional.subtypes[oppositeVariant];
  const abstractContent = variantReport?.abstract.body || report.abstract.body;
  const professionalTitle = cleanText(variantReport?.professional.coreTitle || report.professional.coreTitle);
  const professionalBody = cleanText(variantReport?.professional.coreBody || report.professional.coreBody);
  const dimensionTip = cleanText(variantReport?.dimension.tip || report.dimension.tip);
  const careerContent = variantReport?.career.bullets.length ? variantReport.career : report.career;
  const relationshipContent = variantReport?.relationship.bullets.length ? variantReport.relationship : report.relationship;
  const dessertContent = variantReport?.dessert.name ? variantReport.dessert : report.dessert;
  const abyssalContent = variantReport?.abyssal.length ? variantReport.abyssal : report.abyssal;
  const carryFull = cleanText(variantReport?.carry || variantReport?.important || report.closing);
  const oppositeSideTitle = cleanText(oppositeVariantReport?.professional.subtypeTitle || oppositeSubtype.title);
  const oppositeSideItems = oppositeVariantReport?.professional.subtypeItems.length
    ? oppositeVariantReport.professional.subtypeItems
    : oppositeSubtype.items;
  const coverQuote = cleanText(variantReport?.soulQuote || report.soulQuote || variantReport?.important || report.closing || resultData.quote || abstractContent);
  const coverQuoteParts = splitCoverQuote(coverQuote);
  const coverSubcopyParts = splitCoverSubcopy(abstractContent);
  const carryLine = toAnchorSentence(carryFull || psychArchetype?.rarity || abstractContent);
  const dimensionHeadline = `${resultData.id.split('').join(' · ')} 在你現在這個階段`;
  const coverKicker = cleanText(variantReport?.abstract.label || report.abstract.label || currentCompareCard.tone);
  const coverTitle = cleanText(variantReport?.title || report.title || professionalTitle);
  const rawCoverVariantTitle = cleanText(currentCompareCard.title);
  const coverVariantTitle =
    rawCoverVariantTitle && rawCoverVariantTitle !== coverTitle && rawCoverVariantTitle !== coverKicker
      ? rawCoverVariantTitle
      : '';
  const chapterTwoTitle = professionalTitle
    ? `${professionalTitle} 的 A / T 雙版本`
    : 'A 和 T，是兩種運作方式';
  const chapterThreeTitle = dimensionTip || dimensionHeadline;
  const chapterFiveLead = toAnchorSentence(psychArchetype?.stateName || psychArchetype?.rarity || prototypeCopy.frequencyNote);
  const chapterSixLead = toAnchorSentence(dessertContent.visualLogic || abstractContent);
  const chapterStatusCopy = isUnlocked ? '完整內容已展開' : '以下為預覽切片，解鎖後可讀全文';
  const paywallPreviewItems = [
    {
      number: '03',
      name: '四個維度',
      description: toAnchorSentence(dimensionTip) || `${dimensionHeadline} 的完整光譜讀數。`,
    },
    {
      number: '04',
      name: '你怎麼活',
      description: [
        cleanText(careerContent.title),
        cleanText(relationshipContent.title),
        oppositeSideTitle,
      ]
        .filter(Boolean)
        .join('、') + '。',
    },
    {
      number: '05',
      name: '你的原型',
      description: toAnchorSentence(psychArchetype?.rarity || psychArchetype?.stateName || prototypeCopy.frequencyNote),
    },
    {
      number: '06',
      name: '帶走這個',
      description: [cleanText(dessertContent.name), cleanText(abyssalContent[0]?.title)]
        .filter(Boolean)
        .join('、') + '，以及最後留下來的那句話。',
    },
  ].map((item) => ({
    ...item,
    description: item.description.replace(/^、/u, '').trim(),
  }));
  const archetypeTeaserTitle = (psychArchetype?.figures || [])
    .slice(0, 3)
    .map((figure) => cleanText(figure.name).split(/\s+[A-Z][a-z]+/u)[0]?.trim() || cleanText(figure.name))
    .join(' · ');
  const unlockPrimaryLabel = isUnlocked
    ? '列印 / 收藏完整報告'
    : isLocalPreview
      ? '解鎖我的完整報告'
      : IS_DEV
        ? 'DEV 階段暫不開放'
        : '解鎖我的完整報告';

  return (
    <div className="v2-root v2-report-root" style={rootStyle}>
      <div className="v2-report-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="v2-report-layer-bar">
        <span className="v2-report-run-tag">第 1 次顯影</span>
        <span className="v2-report-type-tag">{fullType} · {familyMeta.familyLabel}</span>
      </div>

      <nav className="v2-report-nav" aria-label="V2 report chapters">
        {REPORT_CHAPTERS.map((chapter, index) => {
          const href = chapter.locked && !isUnlocked ? '#paywall' : `#${chapter.id}`;
          const isActive = activeChapter === chapter.id && (!chapter.locked || isUnlocked);

          return (
            <React.Fragment key={chapter.id}>
              {index === 2 ? <span className="v2-report-nav-divider" aria-hidden="true" /> : null}
              <a
                href={href}
                className={[
                  'v2-report-nav-pill',
                  isActive ? 'is-active' : '',
                  chapter.locked && !isUnlocked ? 'is-locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {chapter.locked && !isUnlocked ? '🔒 ' : ''}
                {chapter.label}
              </a>
            </React.Fragment>
          );
        })}
      </nav>

      <main className="v2-report-shell">
        <section id="ch-01" className="v2-report-cover">
          <div className="v2-report-cover-badge">
            <span className="v2-report-cover-dot" />
            {fullType} · {familyMeta.familyLabel}
          </div>

          <div className="v2-report-kiwimu-wrap">
            <KiwimuCharacter className="v2-report-cover-kiwimu" state={heroState} />
          </div>

          <div className="v2-report-cover-title-stack">
            {coverKicker ? <p className="v2-report-cover-kicker">{coverKicker}</p> : null}
            {coverTitle ? <h1 className="v2-report-cover-title">{coverTitle}</h1> : null}
            {coverVariantTitle ? <p className="v2-report-cover-variant">{coverVariantTitle}</p> : null}
          </div>

          <p className="v2-report-cover-quote">
            「{coverQuoteParts.lead}
            {coverQuoteParts.tail ? (
              <>
                <br />
                <em>{coverQuoteParts.tail}</em>
              </>
            ) : null}
            」
          </p>

          <div className="v2-report-cover-subcopy">
            {coverSubcopyParts[0] ? <p>{coverSubcopyParts[0]}。</p> : null}
            {coverSubcopyParts[1] ? <p><strong>{coverSubcopyParts[1]}。</strong></p> : null}
            {coverSubcopyParts[2] ? <p>{coverSubcopyParts[2]}。</p> : null}
          </div>

          <div className="v2-report-identity-card">
            <p className="v2-report-card-label">身份核心</p>
            <h2 className="v2-report-cover-core-title">{professionalTitle}</h2>
            <p>{professionalBody}</p>
            <p>{currentCompareCard.energy}</p>
          </div>
        </section>

        <hr className="v2-report-rule" />

        <section id="ch-02" className="v2-report-paper-section">
          <div className="v2-report-inner">
            <p className="v2-report-eyebrow">02 · 你的兩個版本</p>
            <h2 className="v2-report-title">{chapterTwoTitle}</h2>

            <div className="v2-report-at-grid">
              {compareCards.map((card) => (
                <article
                  key={card.code}
                  className={[
                    'v2-report-at-card',
                    card.code === currentVariant ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <p className="v2-report-at-label">
                    {resultData.id}-{card.code} · {card.tone}
                    {card.code === currentVariant ? ' ← 你' : ''}
                  </p>
                  <p className="v2-report-at-name">{card.title}</p>
                  <div className="v2-report-at-copy-block">
                    <p className="v2-report-at-copy-label">{card.strategyLabel}</p>
                    <p>{card.strategy}</p>
                  </div>
                  <div className="v2-report-at-copy-block">
                    <p className="v2-report-at-copy-label">{card.energyLabel}</p>
                    <p>{card.energy}</p>
                  </div>
                  {card.cost ? <p className="v2-report-at-cost">{card.cost}</p> : null}
                </article>
              ))}
            </div>

            <p className="v2-report-eyebrow v2-report-tag-intro">你的關鍵標籤</p>
          </div>

          <div className="v2-report-fade-curtain">
            <div className="v2-report-tag-wall">
              {versionTags.map((tag) => (
                <span key={tag} className="v2-report-tag-chip">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="paywall" className={isUnlocked ? 'v2-report-paywall is-unlocked' : 'v2-report-paywall'}>
          <div className="v2-report-paywall-inner">
            <p className="v2-report-paywall-eyebrow">
              {isUnlocked ? '完整報告已解鎖' : '完整顯影在另一邊'}
            </p>

            <div className="v2-report-kiwimu-wrap v2-report-paywall-kiwimu-wrap">
              <KiwimuCharacter className="v2-report-paywall-kiwimu" state={isUnlocked ? 'glow' : 'watch'} />
            </div>

            <h2 className="v2-report-paywall-headline">
              {isUnlocked ? '完整內容已展開' : '你看到的是輪廓'}
            </h2>
            <p className="v2-report-paywall-subcopy">
              {isUnlocked
                ? '往下就是四個已解鎖章節。現在可以完整讀完這份報告。'
                : '打開剩下的四個章節，看見你的完整版本。'}
            </p>

            <div className="v2-report-paywall-list">
              {paywallPreviewItems.map((item) => (
                <div
                  key={item.number}
                  className={[
                    'v2-report-paywall-item',
                    isUnlocked ? 'is-unlocked' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="v2-report-paywall-number">{isUnlocked ? 'OPEN' : item.number}</span>
                  <div>
                    <p className="v2-report-paywall-name">{item.name}</p>
                    <p className="v2-report-paywall-desc">{item.description}</p>
                  </div>
                  {isUnlocked ? <span className="v2-report-paywall-state">已展開</span> : null}
                </div>
              ))}
            </div>

            {!isUnlocked ? (
              <>
                <button
                  type="button"
                  className="kiwimu-btn kiwimu-btn-cta v2-report-unlock-btn"
                  onClick={handleCheckout}
                  disabled={IS_DEV && !isLocalPreview}
                >
                  {unlockPrimaryLabel}
                </button>
                <p className="v2-report-paywall-price">NT$149 · 一次性 · 永久保存</p>
              </>
            ) : null}
          </div>
        </section>

        <section id="ch-03" className={`v2-report-locked-section ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="v2-report-inner">
            <div className="v2-report-locked-header">
              <span className="v2-report-locked-label">03 · 四個維度</span>
              {!isUnlocked ? <span className="v2-report-lock-icon">🔒</span> : null}
            </div>
            <h3 className="v2-report-locked-title">{chapterThreeTitle}</h3>
            <p className="v2-report-section-state">{chapterStatusCopy}</p>

            {isUnlocked ? (
              <div className="v2-report-detail-stack">
                <div className="v2-report-dimension-grid">
                  {dimensionBullets.map((item) => (
                    <article key={item.label} className="v2-report-detail-card">
                      <p className="v2-report-card-label">{item.label}</p>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>

                <div className="v2-report-spectrum-panel">
                  <p className="v2-report-card-label">認知光譜</p>
                  <p className="v2-report-spectrum-tip">{dimensionTip}</p>
                  <div className="v2-report-spectrum-list">
                    {spectrumRows.map((row) => (
                      <article key={row.label} className="v2-report-spectrum-row">
                        <div className="v2-report-spectrum-head">
                          <div>
                            <h4>{row.label}</h4>
                            <p>{row.description}</p>
                          </div>
                          <span>{row.selectedCode} / {row.oppositeCode}</span>
                        </div>
                        <div className="v2-report-spectrum-track">
                          <div className="v2-report-spectrum-dot" style={{ left: `calc(${row.selectedPct}% - 8px)` }} />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="v2-report-tease-grid">
                {dimensionBullets.slice(0, 4).map((item) => (
                  <article key={item.label} className="v2-report-tease-card">
                    <p className="v2-report-tease-label">{item.label}</p>
                    <p className="v2-report-tease-copy">{item.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="ch-04" className={`v2-report-locked-section ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="v2-report-inner">
            <div className="v2-report-locked-header">
              <span className="v2-report-locked-label">04 · 你怎麼活</span>
              {!isUnlocked ? <span className="v2-report-lock-icon">🔒</span> : null}
            </div>
            <h3 className="v2-report-locked-title">職涯、感情，以及被壓住的另一面</h3>
            <p className="v2-report-section-state">{chapterStatusCopy}</p>

            {isUnlocked ? (
              <div className="v2-report-life-grid">
              <article className="v2-report-detail-card">
                <p className="v2-report-card-label">職涯</p>
                <h4>{careerContent.title}</h4>
                {careerContent.bullets.map((item) => (
                  <div key={item.label} className="v2-report-card-copy">
                    <p className="v2-report-card-label">{item.label}</p>
                    <p>{item.body}</p>
                  </div>
                ))}
              </article>

              <article className="v2-report-detail-card">
                <p className="v2-report-card-label">關係</p>
                <h4>{relationshipContent.title}</h4>
                {relationshipContent.bullets.map((item) => (
                  <div key={item.label} className="v2-report-card-copy">
                    <p className="v2-report-card-label">{item.label}</p>
                    <p>{item.body}</p>
                  </div>
                ))}
              </article>

              <article className="v2-report-detail-card">
                <p className="v2-report-card-label">另一面</p>
                <h4>{oppositeSideTitle}</h4>
                <div className="v2-report-card-copy">
                  <p>{oppositeSideItems[0]?.body || oppositeCompareCard.strategy}</p>
                </div>
                <div className="v2-report-card-copy">
                  <p>{oppositeSideItems[1]?.body || oppositeCompareCard.energy}</p>
                </div>
              </article>
              </div>
            ) : (
              <div className="v2-report-tease-list">
                <article className="v2-report-tease-row">
                  <p className="v2-report-tease-label">職涯</p>
                  <p className="v2-report-tease-copy">{careerContent.bullets[0]?.body || careerContent.title}</p>
                </article>
                <article className="v2-report-tease-row">
                  <p className="v2-report-tease-label">關係</p>
                  <p className="v2-report-tease-copy">{relationshipContent.bullets[0]?.body || relationshipContent.title}</p>
                </article>
                <article className="v2-report-tease-row">
                  <p className="v2-report-tease-label">另一面</p>
                  <p className="v2-report-tease-copy">{oppositeSideItems[0]?.body || oppositeSideTitle}</p>
                </article>
              </div>
            )}
          </div>
        </section>

        <section id="ch-05" className={`v2-report-locked-section ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="v2-report-inner">
            <div className="v2-report-locked-header">
              <span className="v2-report-locked-label">05 · 你的原型</span>
              {!isUnlocked ? <span className="v2-report-lock-icon">🔒</span> : null}
            </div>
            <h3 className="v2-report-locked-title">{isUnlocked ? '世界上的位置，不只是一個人口比例' : archetypeTeaserTitle || '世界上的位置，不只是一個人口比例'}</h3>
            <p className="v2-report-section-state">{chapterStatusCopy}</p>
            {chapterFiveLead ? <p className="v2-report-section-lead">{chapterFiveLead}</p> : null}

            {isUnlocked ? (
              <div className="v2-report-archetype-grid">
                <article className="v2-report-rarity-card">
                  <p className="v2-report-card-label">{prototypeCopy.frequencyPrimaryLabel}</p>
                  <p className="v2-report-rarity-value">{prototypeCopy.frequencyPrimary}</p>
                  <p>{psychArchetype?.rarity || prototypeCopy.frequencyNote}</p>
                  <p className="v2-muted-copy">{prototypeCopy.frequencySecondaryLabel} · {prototypeCopy.frequencySecondary}</p>
                  {rarityData ? (
                    <p className="v2-muted-copy">資料底：{resultData.id} 基礎人口占比約 {rarityData.totalPopulation}%</p>
                  ) : null}
                </article>

                {psychArchetype ? (
                  <article className="v2-report-detail-card v2-report-archetype-state-card">
                    <p className="v2-report-card-label">切面說明</p>
                    <p>{psychArchetype.stateName}</p>
                    <div className="v2-report-card-copy">
                      <p>{psychArchetype.rarity}</p>
                    </div>
                  </article>
                ) : null}

                {(psychArchetype?.figures || []).slice(0, 3).map((figure) => (
                  <article key={figure.name} className="v2-report-detail-card">
                    <p className="v2-report-card-label">人物切面</p>
                    <h4>{figure.name}</h4>
                    <p>{figure.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="v2-report-tease-grid">
                {chapterFiveLead ? (
                  <article className="v2-report-tease-card">
                    <p className="v2-report-tease-label">心理切面</p>
                    <p className="v2-report-tease-copy">{chapterFiveLead}</p>
                  </article>
                ) : null}
                {(psychArchetype?.figures || []).slice(0, 2).map((figure) => (
                  <article key={figure.name} className="v2-report-tease-card">
                    <p className="v2-report-tease-label">{figure.name}</p>
                    <p className="v2-report-tease-copy">{figure.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="ch-06" className={`v2-report-locked-section v2-report-carry-section ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="v2-report-inner">
            <div className="v2-report-locked-header">
              <span className="v2-report-locked-label">06 · 帶走這個</span>
              {!isUnlocked ? <span className="v2-report-lock-icon">🔒</span> : null}
            </div>
            <h3 className="v2-report-locked-title">靈魂甜點 · 深問三題 · 讀完之後留下來的東西</h3>
            <p className="v2-report-section-state">{chapterStatusCopy}</p>
            {chapterSixLead ? <p className="v2-report-section-lead">{chapterSixLead}</p> : null}

            {isUnlocked ? (
              <div className="v2-report-reflection-grid">
              <article className="v2-report-detail-card">
                <p className="v2-report-card-label">靈魂甜點</p>
                <h4>{dessertContent.name}</h4>
                <p>{dessertContent.visualLogic}</p>
                <div className="v2-report-dessert-pairings">
                  {dessertContent.pairings.map((item) => (
                    <div key={`${item.label}-${item.body}`} className="v2-report-pairing-chip">{item.label}：{item.body}</div>
                  ))}
                </div>
              </article>

              <div className="v2-report-question-stack">
                {abyssalContent.map((question, index) => (
                  <article key={question.title} className="v2-report-detail-card">
                    <p className="v2-report-card-label">深問 0{index + 1}</p>
                    <h4>{question.title}</h4>
                    <p>{question.body}</p>
                  </article>
                ))}
              </div>

              <article className="v2-report-carry-card">
                <p className="v2-report-card-label">帶走這個</p>
                <p className="v2-report-carry-line">{carryFull}</p>
              </article>
              </div>
            ) : (
              <div className="v2-report-tease-grid">
                <article className="v2-report-tease-card">
                  <p className="v2-report-tease-label">靈魂甜點</p>
                  <p className="v2-report-tease-copy">{dessertContent.name}</p>
                </article>
                {abyssalContent[0] ? (
                  <article className="v2-report-tease-card">
                    <p className="v2-report-tease-label">深問 01</p>
                    <p className="v2-report-tease-copy">{abyssalContent[0].title}</p>
                  </article>
                ) : null}
                <article className="v2-report-tease-card">
                  <p className="v2-report-tease-label">帶走這個</p>
                  <p className="v2-report-tease-copy">{carryLine}</p>
                </article>
              </div>
            )}
          </div>
        </section>

        {isUnlocked ? (
        <footer className="v2-report-footer">
          <div>
            <p className="v2-label v2-label-on-dark">KIWIMU SOUL DESSERT</p>
            <h2>{dessertContent.name || prototypeCopy.footerTitle}</h2>
            <p>{dessertContent.visualLogic || prototypeCopy.footerSubtitle}</p>
          </div>

          <KiwimuCharacter className="v2-footer-kiwimu" state="ascend" />

          <div className="v2-footer-actions">
            <a
              href={dessertOrderUrl}
              target="_blank"
              rel="noreferrer"
              className="kiwimu-btn kiwimu-btn-cta"
              onClick={() => trackDessertOrderClick(resultData.id, variant)}
            >
              🍰 立即訂購你的靈魂甜點
            </a>
            <button type="button" className="kiwimu-btn kiwimu-btn-dark" onClick={handleShareStory}>
              📱 分享到 IG Story
            </button>
          </div>
        </footer>
        ) : null}

        {IS_DEV ? (
          <section className="v2-dev-strip">
            <div>
              <p className="v2-label">LOCAL DEBUG</p>
              <p>source={source} · mbti={fullType} · entitlement={isUnlocked ? 'unlocked' : 'locked'}</p>
            </div>
            <div className="v2-dev-actions">
              {isUnlocked ? (
                <button type="button" className="kiwimu-btn" onClick={() => window.print()}>
                  列印目前頁面
                </button>
              ) : null}
              {isLocalPreview ? (
                <button type="button" className="kiwimu-btn" onClick={handleResetPreview}>
                  重置預覽鎖定
                </button>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
