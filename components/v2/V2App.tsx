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
  trackButtonClick,
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
import './v2-tailwind.css';
import './v2.css';
import './v2-dark.css';

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
  { id: 'ch-02', label: '02 你的版本', locked: true },
  { id: 'ch-03', label: '03 四個維度', locked: true },
  { id: 'ch-04', label: '04 認知行為模式', locked: true },
  { id: 'ch-05', label: '05 你的原型', locked: true },
  { id: 'ch-06', label: '06 帶走這個', locked: true },
];

export default function V2App({ user }: V2AppProps) {
  const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
  const pathname = window.location.pathname;
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const hasQuery = window.location.search.length > 1;
  const routeTarget = useMemo(() => parseV2RouteTarget(pathname, params), [params, pathname]);
  const [entitlement, setEntitlementState] = useState<V2Entitlement>(() =>
    isLocalPreview ? readCachedV2Entitlement() : { status: 'locked' },
  );
  const [activeChapter, setActiveChapter] = useState('ch-01');
  const [scrollProgress, setScrollProgress] = useState(0);
  const source = params.get('source') || 'direct';
  const isUnlocked = entitlement.status === 'unlocked';
  const canReadReport = isUnlocked || isLocalPreview;

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
    // 砍掉 32 變體 pack 的 SEO title 優先級，統一用 16 型 Z 世代稱號（report.title）
    const baseType = resultBundle?.resultData.id;
    const title = fullType && report
      ? `${fullType} MBTI 深度報告｜${report.title}｜Kiwimu × 月島甜點`
      : '免費 MBTI 深度報告｜Kiwimu MBTI V2';
    const description = fullType && report && resultBundle
      ? `${fullType} 深度 MBTI 報告：${report.title}。從 16 型 × A/T 變體解讀你的靈魂甜點、職涯傾向與情緒敘事。試讀免費，NT$149 解鎖完整 Kiwimu V2 報告。`
      : '免費 MBTI 16 型試讀，NT$149 解鎖 Kiwimu V2 深度報告：A/T 變體、維度、關係、原型與收束提問一次讀完。';
    const image = resultBundle?.resultData.characterImage || 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png';

    applyRuntimeSeo({
      title,
      description,
      canonical: canonicalUrl,
      ogType: 'article',
      image,
      keywords: [
        // 通用 MBTI 字根
        'MBTI', 'MBTI 深度報告', '16 型人格', 'A 型 T 型',
        // 「免費」入口（含 paywall 結構）
        '免費 MBTI 試讀', '免費 MBTI 測驗',
        // Z 世代 + 月島品牌混搭（GSC 已驗證有真實 query）
        'Z 世代 MBTI', 'MoonType MBTI', '月島 MBTI',
        // 此頁專屬
        fullType,                     // 例 INTJ-A
        baseType,                     // 例 INTJ
        report?.title,                // 例 冷血腦內小劇場導演
        // 商品鉤子
        'Kiwimu', '月島甜點', '靈魂甜點', 'NT$149 MBTI 深度報告',
      ].filter(Boolean).join(','),
      robots: fullType && !hasQuery ? 'index,follow' : 'noindex,follow',
    });
  }, [canonicalUrl, fullType, hasQuery, report, resultBundle]);

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
  }, [fullType, canReadReport]);

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

  // Entrance reveal: fade/rise each block once as it scrolls into view.
  useEffect(() => {
    if (!fullType) {
      return;
    }

    const targets = Array.from(document.querySelectorAll<HTMLElement>('.ad-reveal'));
    if (targets.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    targets.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, [fullType, canReadReport]);

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

  const handleChapterNav = (chapterId: string) => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    const target =
      document.getElementById(chapterId) ?? document.querySelector<HTMLElement>('.ad-paywall-box');

    if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
      if (document.getElementById(chapterId)) {
        setActiveChapter(chapterId);
      }
    }
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
              className="ad-coming-badge inline-flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
            >
              <span className="ad-dot-ink inline-block w-1.5 h-1.5 rounded-full" />
              即將公布 · COMING SOON
            </span>
            <p className="v2-eyebrow mt-4">KIWIMU V2 · MBTI 進化版</p>
            <h1
              className="ad-coming-title mt-3 text-4xl font-bold leading-[1.05] md:text-5xl"
            >
              看見 16 型<br />看不見的那一層
            </h1>
            {v15FullType ? (
              <div
                className="ad-v15-box mt-5 rounded-2xl px-5 py-4"
              >
                <p
                  className="ad-v15-label text-[10px] font-bold uppercase tracking-[0.22em] text-white/50"
                >
                  V1.5 分流結果
                </p>
                <p
                  className="ad-v15-type mt-2 text-2xl font-bold"
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
              <p className="mt-5 text-base leading-relaxed text-white/70">
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
                  className="ad-mono-11 flex items-center gap-2 text-white/40"
                >
                  <span
                    className="ad-dot-acid inline-block w-1.5 h-1.5 rounded-full"
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
              >
                30 秒 V1.5 分流
              </a>
            </div>
            <p
              className="ad-mono-11 mt-6 text-white/30"
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
  const dessertOrderUrl = buildDessertOrderLink(resultData.id, variant);
  const passportUrl = `https://passport.kiwimu.com?utm_source=mbti-lab&utm_medium=result-cta&utm_campaign=2026-q2-kiwimu-routing&utm_content=v2-footer-passport&mbti_type=${resultData.id}&variant=${variant}`;
  const versionTags = variantReport?.tags.length
    ? variantReport.tags.map((tag) => cleanText(tag.label)).filter(Boolean).slice(0, 6)
    : buildVersionTagWall(report, currentVariant, prototypeCopy.tags);
  const rootStyle = {
    '--v2-ink': 'var(--t1)',
    '--v2-acid': '#CCFF00',
    '--v2-paper': 'var(--bg-2)',
    '--v2-muted': 'var(--t3)',
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
  const abstractContent = variantReport?.abstract.body || report.abstract.body;
  const professionalTitle = cleanText(variantReport?.professional.coreTitle || report.professional.coreTitle);
  const professionalBody = cleanText(variantReport?.professional.coreBody || report.professional.coreBody);
  const dimensionTip = cleanText(variantReport?.dimension.tip || report.dimension.tip);
  const careerContent = variantReport?.career.bullets.length ? variantReport.career : report.career;
  const relationshipContent = variantReport?.relationship.bullets.length ? variantReport.relationship : report.relationship;
  const dessertContent = variantReport?.dessert.name ? variantReport.dessert : report.dessert;
  const abyssalContent = variantReport?.abyssal.length ? variantReport.abyssal : report.abyssal;
  const carryFull = cleanText(variantReport?.carry || variantReport?.important || report.closing);
  const coverQuote = cleanText(variantReport?.soulQuote || report.soulQuote || variantReport?.important || report.closing || resultData.quote || abstractContent);
  const coverKicker = cleanText(variantReport?.abstract.label || report.abstract.label || currentCompareCard.tone);
  const coverTitle = cleanText(variantReport?.title || report.title || professionalTitle);
  const unlockPrimaryLabel = isUnlocked
    ? '列印 / 收藏完整報告'
    : isLocalPreview
      ? '解鎖我的完整報告'
      : IS_DEV
        ? 'DEV 階段暫不開放'
        : '解鎖我的完整報告';

  // ─ Apple Dark helpers ─
  const DIM_NAMES: Record<string, string> = {
    I: 'Introverted', E: 'Extroverted', N: 'Intuitive', S: 'Sensing',
    T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving',
  };
  const makeTagCode = (enName: string): string =>
    enName.split(/[\s-]+/).filter(Boolean).slice(0, 2)
      .map((w) => w.slice(0, 4).toUpperCase()).join('-');

  const suppressedSideText = (variantReport?.suppressedSide ?? '')
    .replace(/\n---\s*$/mu, '').trim();

  const behaviorLogic = variantReport?.design.behaviorLogic ?? [];
  const digitalPersonaIntro = variantReport?.design.quote ?? '';
  const importantQuote = variantReport?.important ?? '';

  const REPORT_MARQUEE = `KIWIMU V2 · 狀態光譜測驗 · DEEP REPORT · ${fullType ?? ''} · `;
  const activeChapterLabel =
    REPORT_CHAPTERS.find((chapter) => chapter.id === activeChapter)?.label ?? REPORT_CHAPTERS[0].label;

  return (
    <div className="v2-root" style={{ ...rootStyle, background: 'var(--bg-0)', color: 'var(--t1)', minHeight: '100vh' }}>
      {/* Ambient orbs */}
      <div className="ad-orb ad-orb-1" />
      <div className="ad-orb ad-orb-2" />

      {/* Scroll progress bar */}
      <div className="v2-report-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Floating chapter nav — right rail on desktop, bottom bar on mobile */}
      <nav className="ad-chapternav" aria-label="Chapters">
        <span className="ad-chapternav-current" aria-hidden="true">{activeChapterLabel}</span>
        <div className="ad-chapternav-track">
          {REPORT_CHAPTERS.map((chapter) => {
            const isActive = activeChapter === chapter.id;
            const isLocked = chapter.locked && !canReadReport;
            return (
              <button
                key={chapter.id}
                type="button"
                className={`ad-chapternav-item${isActive ? ' is-active' : ''}${isLocked ? ' is-locked' : ''}`}
                onClick={() => handleChapterNav(chapter.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="ad-chapternav-label">{chapter.label}</span>
                <span className="ad-chapternav-dot" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Fixed marquee */}
      <div className="marquee-container ad-marquee-fixed">
        <div className="marquee-track">
          <span className="marquee-text">{REPORT_MARQUEE.repeat(4)}</span>
          <span className="marquee-text">{REPORT_MARQUEE.repeat(4)}</span>
        </div>
      </div>

      <div className="ad-page">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header id="ch-01" className="ad-hero ad-reveal">
        <div className="ad-hero-eyebrow">
          <span className="ad-hero-eyebrow-dot" />
          {familyMeta.familyLabel} · Kiwimu V2 深度報告
        </div>

        <div className="ad-hero-row">
          <div className="ad-hero-type-block">
            <div className="ad-hero-type-row">
              <span className="ad-hero-type">{resultData.id}</span>
              <div className="ad-hero-variant-block">
                <span className="ad-hero-variant-chip">{currentVariant}</span>
                <span className="ad-hero-variant-label">
                  {currentVariant === 'A' ? 'Assertive · 穩定型' : 'Turbulent · 謹慎型'}
                </span>
              </div>
            </div>
            <p className="ad-hero-subtitle">{coverKicker} · {coverTitle}</p>
          </div>
          {resultData.characterImage ? (
            <div className="ad-char-reveal">
              <img src={resultData.characterImage} alt={`${resultData.id} 角色`} />
            </div>
          ) : null}
        </div>

        <blockquote className="ad-hero-quote">{coverQuote}</blockquote>
        <p className="ad-hero-abstract">{abstractContent}</p>
        <p className="ad-hero-snapshot">這份報告是你此刻的心理快照，不是固定的標籤。人在不同階段、不同狀態下，側重點會移動。</p>

        <div className="ad-hero-state">
          <span className="ad-hero-state-dot" />
          <span>{currentVariant === 'A' ? '當前狀態：穩定輸出期 / 低噪推進中' : '當前狀態：高頻調整期 / 自我監測中'}</span>
        </div>
      </header>

      {/* ── 01: TAG WALL (FREE) ──────────────────────────────── */}
      <div className="ad-section ad-reveal">
        <p className="ad-section-kicker">01 · Tag Wall</p>
        <h2 className="ad-section-title">五個能瞬間辨識你的 V2 標籤</h2>
        <div className="ad-tag-grid">
          {versionTags.slice(0, 5).map((tag, idx) => {
            const zhPart = tag.split('(')[0]?.trim() ?? tag;
            const enMatch = tag.match(/\(([^)]+)\)/u);
            const enPart = enMatch?.[1] ?? '';
            const code = enPart ? makeTagCode(enPart) : `TAG-${String(idx + 1).padStart(2, '0')}`;
            return (
              <div key={tag} className="ad-tag">
                <span className="ad-tag-code">{code}</span>
                <span className="ad-tag-sep" />
                <div className="ad-tag-info">
                  <span className="ad-tag-zh">{zhPart}</span>
                  {enPart ? <span className="ad-tag-en">{enPart}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PAYWALL GATE ─────────────────────────────────────── */}
      {!canReadReport ? (
        <div className="ad-paywall-box ad-reveal">
          <p className="ad-paywall-eyebrow">⬡ Premium</p>
          <h2 className="ad-paywall-title">V2 完整報告正式上線後可解鎖</h2>
          <p className="ad-paywall-sub">Section 02 – 07 · 職涯 × 關係 · 靈魂甜點 · 帶走的字</p>
          <button
            type="button"
            className="ad-btn-primary ad-btn-center"
            onClick={handleCheckout}
          >
            {unlockPrimaryLabel}
          </button>
          {IS_DEV && isLocalPreview ? (
            <div className="ad-mt-12">
              <button type="button" className="ad-btn-ghost ad-btn-center ad-btn-sm" onClick={handleResetPreview}>
                重置預覽
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
        {/* ── 02: PROFESSIONAL INSIGHTS ───────────────────────── */}
        <div id="ch-02" className="ad-section ad-reveal">
          <p className="ad-section-kicker">02 · Professional Insights</p>
          <h2 className="ad-section-title">{professionalTitle}</h2>
          <p className="ad-section-lead">壓力與安穩之間，同一個人會用不同的方式運作。A 與 T 並非優劣，而是兩種真實的狀態切換。</p>
          <div className="ad-card ad-mb-8">
            <p className="ad-body-15">{professionalBody}</p>
          </div>
          <div className="ad-grid-2">
            {compareCards.map((card) => (
              <div key={card.code} className={`ad-subtype-card${card.code === currentVariant ? ' is-active' : ''}`}>
                <div className="ad-subtype-header">
                  <div>
                    <div className="ad-subtype-big-letter">{card.code}</div>
                    <div className="ad-subtype-tone">{card.tone}</div>
                  </div>
                  {card.code === currentVariant ? <span className="ad-badge-acid">你的型</span> : null}
                </div>
                <div className="ad-subtype-name">{card.title}</div>
                <div className="ad-subtype-row">
                  <div className="ad-subtype-label">{card.strategyLabel}</div>
                  <div className="ad-subtype-value">{card.strategy}</div>
                </div>
                <div className="ad-subtype-row">
                  <div className="ad-subtype-label">{card.energyLabel}</div>
                  <div className="ad-subtype-value">{card.energy}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="ad-reflect">你現在比較接近哪一種運作模式？是環境讓你如此，還是你選擇了這樣？</p>
        </div>

        {/* ── 03: DIMENSION SPECTRUM ───────────────────────────── */}
        <div id="ch-03" className="ad-section ad-reveal">
          <p className="ad-section-kicker">03 · Dimension Spectrum</p>
          <h2 className="ad-section-title">你的四維光譜</h2>
          <p className="ad-section-lead">認知偏好是光譜，不是非此即彼的分類。偏向某一端，代表你習慣用那個方式接收和處理世界。</p>
          <div className="ad-dim-grid">
            {spectrumRows.slice(0, 4).map((row) => (
              <div key={row.label} className="ad-dim-card">
                <div className="ad-dim-letter">{row.selectedCode}</div>
                <div className="ad-dim-name">{DIM_NAMES[row.selectedCode] ?? row.selectedCode}</div>
                <div className="ad-dim-track">
                  <div className="ad-dim-fill" style={{ width: `${row.selectedPct}%` }} />
                </div>
                <div className="ad-dim-score">{row.selectedPct}%</div>
                <div className="ad-dim-tip">{row.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 04: DIGITAL PERSONA ──────────────────────────────── */}
        {behaviorLogic.length > 0 ? (
          <div id="ch-04" className="ad-section ad-reveal">
            <p className="ad-section-kicker">04 · Digital Persona</p>
            <h2 className="ad-section-title">在 2026 數位環境中，你這組怎麼運作？</h2>
            <p className="ad-section-lead">數位環境讓行為模式更可見。你在這裡的慣性，通常比你對自己的認知更接近真實的樣子。</p>
            {digitalPersonaIntro ? (
              <div className="ad-card ad-mb-12">
                <p className="ad-body-15">{digitalPersonaIntro}</p>
              </div>
            ) : null}
            <div className="ad-card">
              <div className="ad-list-label">行為邏輯</div>
              <ul className="ad-arrow-list">
                {behaviorLogic.map((item) => (
                  <li key={item.label}><strong className="ad-strong-label">{item.label}：</strong>{item.body}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {/* ── 05: HISTORICAL ARCHETYPES ────────────────────────── */}
        <div id="ch-05" className="ad-section ad-reveal">
          <p className="ad-section-kicker">05 · Historical Archetypes</p>
          <h2 className="ad-section-title">同類過渡期的歷史原型</h2>
          <p className="ad-section-lead">找到跨時代有同樣模式的人，不是要你複製他們。是讓你知道這種思維方式有完整的脈絡，走過去的人不只你一個。</p>
          {(psychArchetype?.figures ?? []).length > 0 ? (
            <div className="ad-grid-3 ad-mb-12">
              {(psychArchetype?.figures ?? []).slice(0, 3).map((figure) => (
                <div key={figure.name} className="ad-person-card">
                  <div className="ad-person-name">{figure.name}</div>
                  <div className="ad-person-body">{figure.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ad-body-14-muted">
              歷史原型資料整理中。
            </p>
          )}
          <div className="ad-rarity-card">
            <div className="ad-rarity-label">⬡ Rarity Profile · 稀缺組合</div>
            <div className="ad-rarity-body">{psychArchetype?.rarity ?? prototypeCopy.frequencyNote}</div>
          </div>
        </div>

        {/* ── 06: CAREER × RELATIONSHIP ────────────────────────── */}
        <div id="ch-06" className="ad-section ad-reveal">
          <p className="ad-section-kicker">06 · Career × Relationship</p>
          <h2 className="ad-section-title">{careerContent.title} × {relationshipContent.title}</h2>
          <p className="ad-section-lead">你在工作裡的反應方式，通常也是你在親密關係中的語言。兩者往往有同樣的心理根源。</p>
          <div className="ad-grid-2">
            <div className="ad-card">
              <div className="ad-list-label">職涯生存模式</div>
              <ul className="ad-arrow-list">
                {careerContent.bullets.map((item) => (
                  <li key={item.label}>{item.body}</li>
                ))}
              </ul>
            </div>
            <div className="ad-card">
              <div className="ad-list-label">關係運作模式</div>
              <ul className="ad-arrow-list">
                {relationshipContent.bullets.map((item) => (
                  <li key={item.label}>{item.body}</li>
                ))}
              </ul>
            </div>
          </div>
          {suppressedSideText ? (
            <div className="ad-suppressed-card">
              <div className="ad-suppressed-label">⬡ Suppressed Side · 壓制面</div>
              <p className="ad-suppressed-body">{suppressedSideText}</p>
            </div>
          ) : null}
          <p className="ad-reflect">你壓制的那一面，是因為某段經歷，還是從來沒有機會展現？</p>
        </div>

        {/* ── 07: SOUL REFLECTION ──────────────────────────────── */}
        <div className="ad-section ad-reveal">
          <p className="ad-section-kicker">07 · Soul Reflection</p>
          <h2 className="ad-section-title">{dessertContent.name}</h2>
          <p className="ad-section-lead">靈魂甜點是一個隱喻，試圖描述讓你感到真實的那種狀態。深問不需要答案，讓問題待在那裡也是一種方式。</p>
          <div className="ad-grid-2">
            <div>
              <div className="ad-card ad-mb-8">
                <p className="ad-body-15 ad-mb-12">
                  {dessertContent.visualLogic}
                </p>
                {dessertContent.pairings.map((pairing) => (
                  <div key={pairing.label} className="ad-pairing-card">
                    <div className="ad-pairing-label">{pairing.label}</div>
                    <div className="ad-pairing-body">{pairing.body}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {abyssalContent.map((q, idx) => (
                <div key={q.title} className="ad-abyssal-card">
                  <div className="ad-abyssal-index">Abyssal 0{idx + 1} · {q.title}</div>
                  <div className="ad-abyssal-body">{q.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CARRY / IMPORTANT ────────────────────────────────── */}
        <div className="ad-carry-section ad-reveal">
          <div className="ad-carry-eyebrow">帶走的字</div>
          <p className="ad-carry-frame">這份報告讀到這裡，你帶走的不是一個分類，而是一種認識自己的角度。</p>
          <p className="ad-carry-body">{carryFull}</p>
          {importantQuote ? (
            <div className="ad-carry-quote">
              <p className="ad-carry-quote-text">{importantQuote}</p>
            </div>
          ) : null}
        </div>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div className="ad-footer ad-reveal">
          <p className="ad-footer-title">你的靈魂甜點已選定</p>
          <p className="ad-footer-sub">{dessertContent.name} — 在月島的某個角落等你</p>
          <div className="ad-btn-row">
            <a
              href={dessertOrderUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-btn-primary"
              onClick={() => trackDessertOrderClick(resultData.id, variant)}
            >
              立即訂購你的靈魂甜點 →
            </a>
            <button type="button" className="ad-btn-ghost" onClick={handleShareStory}>
              分享到 IG Story
            </button>
            <a
              href={passportUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-btn-ghost"
              onClick={() => trackButtonClick('v2_footer_to_passport', 'v2_footer', passportUrl)}
            >
              保存到 Passport
            </a>
          </div>
        </div>
        </>
      )}

      {/* ── DEV STRIP ────────────────────────────────────────── */}
      {IS_DEV ? (
        <section className="v2-dev-strip ad-mt-32">
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

      </div>{/* /ad-page */}
    </div>
  );
}
