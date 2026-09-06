import React, { useEffect, useMemo, useState } from 'react';
import type { AppUser } from '../../types';
import {
  getV2TaiwanDraft,
  type V2TaiwanDraftReport,
} from '../../data/v2TaiwanDrafts.generated';
import V2Welcome from './V2Welcome';
import { getDimensionDescription, matchingRecordedResult, hasDimensionAnswers } from './reportReading';
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
import { withPendingEconomyClaim } from '../../utils/economyClaims';
import {
  KIWIMU_CAMPAIGN_ASSETS,
  getDessertAsset,
  getIdentityAsset,
  getSceneAsset,
  sceneAccentStyle,
  toAbsoluteAssetUrl,
} from '../../data/kiwimuVisualAssets';
import KiwimuVisual from '../visuals/KiwimuVisual';
import KiwimuScenePlate from '../visuals/KiwimuScenePlate';
import KiwimuAtlasWall from '../visuals/KiwimuAtlasWall';
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
  selectedPct: number | null;
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
  details?: Array<{ label: string; body: string }>;
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

const buildTagWall = (type: string, variant: VariantCode): TagCard[] => {
  const tags = type.split('').map((letter) => DIMENSION_TAGS[letter]).filter(Boolean);
  tags.push(variant === 'A' ? DIMENSION_TAGS.A : DIMENSION_TAGS.T_VARIANT);
  return tags;
};

const buildSpectrumRows = (
  type: string,
  variant: VariantCode,
  scores: Score,
  dimensionBullets: ReadonlyArray<{ label: string; body: string }>,
): SpectrumRow[] => {
  const percentages = calculatePercentages(scores);

  return SPECTRUM_CONFIG.map((config) => {
    const selectedCode = config.selectedFromVariant ? variant : type[config.selectedFromType || 0];
    const selectedKey = (config.selectedKey || selectedCode) as PercentageKey;
    const oppositeKey = config.selectedFromVariant ? getOppositeKey(selectedKey) : getOppositeKey(selectedCode as PercentageKey);


    return {
      label: config.label,
      selectedCode,
      oppositeCode: oppositeKey === 'Turbulent' ? 'T' : oppositeKey,
      selectedPct: hasDimensionAnswers(scores, selectedKey, oppositeKey) ? percentages[selectedKey] : null,
      description: getDimensionDescription(selectedCode, dimensionBullets, Boolean(config.selectedFromVariant)),
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

  const abstractBody = report.abstract.body;

  return {
    eyebrow: `${familyMeta.familyLabel} · KIWIMU V2 深度報告`,
    subtitle: `${report.title} · ${typeTitle}`,
    soulQuote: cleanText(report.soulQuote || report.closing || resultData.quote || abstractBody),
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
  { id: 'ch-04', label: '04 日常的反應', locked: true },
  { id: 'ch-05', label: '05 可以試的事', locked: true },
  { id: 'ch-06', label: '06 工作與關係', locked: true },
  { id: 'ch-07', label: '07 感官與提問', locked: true },
  { id: 'ch-08', label: '08 帶走這個', locked: true },
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
  const [reportMessage, setReportMessage] = useState('');
  const [activeChapter, setActiveChapter] = useState('ch-01');
  const [scrollProgress, setScrollProgress] = useState(0);
  const source = params.get('source') || 'direct';
  const isUnlocked = entitlement.status === 'unlocked';
  const canReadReport = isUnlocked || isLocalPreview;

  const recordedBundle = useMemo(() => {
    const v2 = getLastV2PrototypeResult();
    const v1 = getLastV1Result();
    return routeTarget ? matchingRecordedResult(routeTarget.fullType, [v2, v1]) : (source === 'v2_quiz' ? v2 || v1 : v1);
  }, [routeTarget, source]);
  const resultBundle = useMemo(() => recordedBundle || (routeTarget ? {
    resultData: getResultData(routeTarget.type, routeTarget.variant),
    // A shared type page has no personal scores. Its spectrum stays qualitative.
    scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, A: 0, Turbulent: 0 },
  } : null), [recordedBundle, routeTarget]);

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
      ? `${fullType} 深度 MBTI 報告：${report.title}。從 16 型 × A/T 變體解讀你的靈魂甜點、職涯傾向與情緒敘事。提供免費試讀，完整報告仍在整理中。`
      : 'Kiwimu V2 敘事探索：40 道生活情境，讀懂 A/T 傾向、日常反應、關係與小練習。完成後可免費試讀。';
    // 分享圖優先用該 A/T 變體的場景圖；JPEG 版是給 LINE 等對 WebP 支援不穩的爬蟲。
    const ogScene = getSceneAsset(fullType);
    const image = ogScene
      ? toAbsoluteAssetUrl(ogScene.ogJpg.src)
      : getIdentityAsset(baseType || '')?.src
        || resultBundle?.resultData.characterImage
        || KIWIMU_CAMPAIGN_ASSETS.socialFallback.src;

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
    trackV2Unlocked(fullType || 'unknown', unlocked.unlockType || 'unknown', source || 'unknown');
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
        setReportMessage('暫時無法開啟付款頁，請稍後再試。');
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
    if (!fullType) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setReportMessage('報告連結已複製，可以貼給想分享的人。');
      trackAction('v2_story_share_click', { mbtiType: fullType, source });
    } catch {
      setReportMessage(`無法自動複製，請手動複製連結：${canonicalUrl}`);
    }
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
    return <V2Welcome />;
  }

  if (!report) {
    return (
      <div className="v2-surface v2-root">
        <div className="v2-shell">
          <section className="v2-panel v2-empty-panel">
            <p className="v2-label">報告整理中</p>
            <h1 className="v2-empty-title">{resultBundle.resultData.id} 的內容暫時無法顯示</h1>
            <p className="v2-empty-copy">請稍後再試，或回到圖鑑入口重新探索。</p>
          </section>
        </div>
      </div>
    );
  }

  const { resultData, scores } = resultBundle;
  const identityAsset = getIdentityAsset(resultData.id);
  // 32 場景圖以 `${type}-${variant}` 對應；缺圖時退回既有 16 型 identity cutout。
  const sceneAsset = getSceneAsset(fullType);
  const familyMeta = FAMILY_META[report.familyKey as ReportFamilyKey];
  const currentVariant = variant as VariantCode;
  const prototypeCopy = buildPrototypeCopy(currentVariant, report, resultData);
  const variantReport = getV2VariantReport(fullType);
  // 狀態層：草案裡的「當前狀態命名」。MBTI 是入口座標，狀態才是此刻的讀數。
  // 兩者並置——32 型仍是主標與分享單位，狀態升到同一層而不是取代它。
  const stateInfo = variantReport?.state ?? null;
  const oppositeVariant = currentVariant === 'A' ? 'T' : 'A';
  const oppositeVariantReport = getV2VariantReport(`${resultData.id}-${oppositeVariant}`);
  const dimensionBullets = variantReport?.dimension.bullets.length ? variantReport.dimension.bullets : report.dimension.bullets;
  const spectrumRows = buildSpectrumRows(resultData.id, variant as VariantCode, scores, dimensionBullets);
  const dessertOrderUrl = buildDessertOrderLink(resultData.id, variant);
  const passportUrl = withPendingEconomyClaim(
    `https://passport.kiwimu.com?utm_source=mbti-lab&utm_medium=result-cta&utm_campaign=2026-q2-kiwimu-routing&utm_content=v2-footer-passport&mbti_type=${resultData.id}&variant=${variant}`,
  );
  const versionTags = variantReport?.tags.length
    ? variantReport.tags.map((tag) => cleanText(tag.label)).filter(Boolean).slice(0, 6)
    : buildVersionTagWall(report, currentVariant, prototypeCopy.tags);
  const rootStyle = {
    '--v2-ink': 'var(--t1)',
    '--v2-acid': 'var(--signal)',
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
      details: subtypeItems.slice(2).map(item => ({ label: cleanText(item.label), body: cleanText(item.body) })),
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
  const dessertAsset = getDessertAsset(resultData.id, dessertContent.name);
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
    <div
      className="v2-surface v2-root v2-report-shell"
      style={{
        ...rootStyle,
        ...sceneAccentStyle(sceneAsset),
        // 背景交給 CSS：inline style 會蓋掉 .v2-surface.v2-report-shell 的頂光漸層
        color: 'var(--t1)',
      }}
    >
      {/* Ambient orbs */}
      <div className="ad-orb ad-orb-1" />
      <div className="ad-orb ad-orb-2" />

      {/* Scroll progress bar */}
      <div className="v2-report-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Floating chapter nav — right rail on desktop, bottom bar on mobile */}
      <nav className="ad-chapternav" aria-label="報告章節">
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

      <details className="ad-mobile-contents">
        <summary><span>{activeChapterLabel}</span><span>章節目錄 <span aria-hidden="true">⌃</span></span></summary>
        <nav aria-label="手機報告章節">
          {REPORT_CHAPTERS.map(chapter => (
            <button key={chapter.id} type="button" aria-current={chapter.id === activeChapter ? 'location' : undefined}
              onClick={event => { const details = event.currentTarget.closest('details'); if (details) details.open = false; handleChapterNav(chapter.id); }}>
              <span>{chapter.label}</span><span>{chapter.locked && !canReadReport ? '完整報告' : '↗'}</span>
            </button>
          ))}
        </nav>
      </details>

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

        {sceneAsset ? (
          <KiwimuScenePlate
            asset={sceneAsset}
            bleed
            priority
            indexLabel={`NO. ${String(sceneAsset.index).padStart(2, '0')} / 32`}
          />
        ) : null}

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
          {!sceneAsset && identityAsset ? (
            <div className="ad-char-reveal">
              <KiwimuVisual
                asset={identityAsset}
                alt={`${fullType} 人格 Kiwimu 插畫`}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          ) : null}
        </div>

        {stateInfo ? (
          <div className="ad-hero-statename">
            <span className="ad-hero-statename-head">
              <span className="ad-hero-statename-dot" />
              這份敘事的狀態
            </span>
            <strong className="ad-hero-statename-primary">{stateInfo.primary}</strong>
            {stateInfo.secondary ? (
              <span className="ad-hero-statename-secondary">{stateInfo.secondary}</span>
            ) : null}
          </div>
        ) : null}

        <blockquote className="ad-hero-quote">{coverQuote}</blockquote>
        {stateInfo?.framing ? (
          <p className="ad-hero-framing">{stateInfo.framing}</p>
        ) : null}
        <p className="ad-hero-abstract">{abstractContent}</p>
        <p className="ad-hero-snapshot">狀態名稱由這次的型別對應，是理解日常的敘事提示。它還沒有獨立測量你最近的能量或耗損；讀到不符合自己的地方，可以保留不同意見。</p>

        {stateInfo ? null : (
          <div className="ad-hero-state">
            <span className="ad-hero-state-dot" />
            <span>{currentVariant === 'A' ? '當前狀態：穩定輸出期 / 低噪推進中' : '當前狀態：高頻調整期 / 自我監測中'}</span>
          </div>
        )}
      </header>

      {/* ── 01: TAG WALL (FREE) ──────────────────────────────── */}
      <div className="ad-section ad-reveal">
        <p className="ad-section-kicker">01 · Tag Wall</p>
        <h2 className="ad-section-title">五個理解自己的切角</h2>
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
          <p className="ad-section-lead">A 與 T 描述兩種自我回應傾向。把它們放在一起讀，看看哪些做法替你省力，哪些也讓你付出代價。</p>
          {/* 狀態真相：付費層的第一個回報。免費區只給狀態名，這裡才說「你靠什麼活著」。 */}
          {stateInfo?.truth ? (
            <div className="ad-state-truth ad-mb-8">
              <p className="ad-state-truth-kicker">
                <span className="ad-state-truth-dot" />
                狀態真相 · {stateInfo.primary}
              </p>
              <div className="ad-state-truth-body">
                {stateInfo.truth.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => (
                  line.startsWith('- ')
                    ? <p key={line} className="ad-state-truth-item">{line.slice(2)}</p>
                    : <p key={line} className="ad-state-truth-line">{line}</p>
                ))}
              </div>
            </div>
          ) : null}
          <div className="ad-card ad-mb-8">
            <p className="ad-body-15">{professionalBody}</p>
          </div>
          <p className="ad-compare-hint">A / T 對照 · 左右滑動閱讀兩種傾向</p>
          <div className="ad-grid-2 ad-compare-scroll" tabIndex={0} role="region" aria-label="A 與 T 傾向對照">
            {compareCards.map((card) => (
              <div key={card.code} className={`ad-subtype-card${card.code === currentVariant ? ' is-active' : ''}`}>
                <div className="ad-subtype-header">
                  <div>
                    <div className="ad-subtype-big-letter">{card.code}</div>
                    <div className="ad-subtype-tone">{card.tone}</div>
                  </div>
                  {card.code === currentVariant ? <span className="ad-badge-acid">本次傾向</span> : null}
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
                {card.details?.map(item => (
                  <div className="ad-subtype-row" key={item.label}>
                    <div className="ad-subtype-label">{item.label}</div>
                    <div className="ad-subtype-value">{item.body}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="ad-reflect">回想一個最近的情境：這個反應當時幫了你什麼？後來又留下了什麼？</p>
        </div>

        {/* ── 03: DIMENSION SPECTRUM ───────────────────────────── */}
        <div id="ch-03" className="ad-section ad-reveal">
          <p className="ad-section-kicker">03 · Dimension Spectrum</p>
          <h2 className="ad-section-title">你的四維光譜</h2>
          <p className="ad-section-lead">四組偏好提供不同的觀察角度。百分比只表示本機這次作答的加權傾向，不代表能力、人口排名或診斷。</p>
          <div className="ad-dim-grid">
            {spectrumRows.slice(0, 4).map((row) => (
              <div key={row.label} className="ad-dim-card">
                <div className="ad-dim-letter">{row.selectedCode}</div>
                <div className="ad-dim-name">{DIM_NAMES[row.selectedCode] ?? row.selectedCode}</div>
                {row.selectedPct !== null ? <>
                  <div className="ad-dim-track" aria-hidden="true"><div className="ad-dim-fill" style={{ width: `${row.selectedPct}%` }} /></div>
                  <div className="ad-dim-score">{row.selectedPct}% <span>本次作答</span></div>
                </> : <p className="ad-dim-score-note">型別閱讀 · 尚無本機作答分數</p>}
                <div className="ad-dim-tip">{row.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 04: DIGITAL PERSONA ──────────────────────────────── */}
        {behaviorLogic.length > 0 ? (
          <div id="ch-04" className="ad-section ad-reveal">
            <p className="ad-section-kicker">04 · Digital Persona</p>
            <h2 className="ad-section-title">回到訊息、工作與日常裡</h2>
            <p className="ad-section-lead">以下是這個型別的敘事觀察。找一個你熟悉的場景對照，看看哪些反應像你，哪些需要換個說法。</p>
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

        <section id="ch-05" className="ad-section ad-reveal">
          <p className="ad-section-kicker">05 · Small Practices</p>
          <h2 className="ad-section-title">把理解，放進一件小事裡。</h2>
          <p className="ad-section-lead">不用一次改變很多。挑一個有感的練習，試完再看看它是否適合你。</p>
          <div className="ad-practice-list">
            {variantReport?.practices.map((item, index) => (
              <article key={item.label} className="ad-practice">
                <span className="ad-practice-index" aria-hidden="true">{['?', '↗', '↔', '◌'][index]}</span>
                <div><h3>{item.label}</h3><p>{item.body}</p></div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 06: CAREER × RELATIONSHIP ────────────────────────── */}
        <div id="ch-06" className="ad-section ad-reveal">
          <p className="ad-section-kicker">06 · Career × Relationship</p>
          <h2 className="ad-section-title">{careerContent.title} × {relationshipContent.title}</h2>
          <p className="ad-section-lead">工作與關係可能喚起不同的反應。分開讀這兩個場景，看看你在哪裡自在，又在哪裡需要多一點空間。</p>
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
              <div className="ad-suppressed-label">另一個還沒說出口的需要</div>
              <p className="ad-suppressed-body">{suppressedSideText}</p>
            </div>
          ) : null}
          <p className="ad-reflect">如果有一句話一直沒說出口，你希望在什麼樣的場合被聽見？</p>
        </div>

        {/* ── 07: SOUL REFLECTION ──────────────────────────────── */}
        <div id="ch-07" className="ad-section ad-reveal">
          <p className="ad-section-kicker">07 · Soul Reflection</p>
          <h2 className="ad-section-title">{dessertContent.name}</h2>
          <p className="ad-section-lead">把甜點當作這份敘事的味覺比喻。下面的問題可以慢慢想，也可以先從一口熟悉的味道開始。</p>
          <div className="ad-grid-2">
            <div>
              <div className="ad-card ad-dessert-card ad-mb-8">
                {dessertAsset ? (
                  <figure className="ad-dessert-visual">
                    <KiwimuVisual
                      asset={dessertAsset}
                      className="ad-dessert-image"
                      alt={`${fullType} 靈魂甜點：${dessertContent.name}`}
                      fit="cover"
                    />
                    <figcaption className="ad-dessert-caption">
                      <span className="ad-dessert-caption-code">Soul Dessert · {fullType}</span>
                      <span className="ad-dessert-caption-name">{dessertContent.name}</span>
                    </figcaption>
                  </figure>
                ) : null}
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
                  <div className="ad-abyssal-index">留給自己 0{idx + 1} · {q.title}</div>
                  <div className="ad-abyssal-body">{q.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CARRY / IMPORTANT ────────────────────────────────── */}
        <div id="ch-08" className="ad-carry-section ad-reveal">
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
          <p className="ad-footer-title">讓這次閱讀，回到生活。</p>
          <p className="ad-footer-sub">{dessertContent.name} · 這次敘事的味覺提案</p>
          <div className="ad-btn-row">
            <a
              href={dessertOrderUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-btn-primary"
              onClick={() => trackDessertOrderClick(resultData.id, variant)}
            >
              查看月島甜點 →
            </a>
            <button type="button" className="ad-btn-ghost" onClick={handleShareStory}>
              複製報告連結
            </button>
            <a
              href={passportUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-btn-ghost"
              onClick={() => trackButtonClick('v2_footer_to_passport', 'v2_footer', passportUrl)}
            >
              開啟 Passport
            </a>
          </div>
        </div>
        </>
      )}

      {reportMessage ? <p className="ad-feedback" role="status">{reportMessage}</p> : null}

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
