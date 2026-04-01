export type V2ReportFamilyKey = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';

export interface V2ImageSlotSpec {
  key: string;
  title: string;
  placement: string;
  ratio: string;
  recommendedSize: string;
  format: 'webp' | 'png';
  assetPath: string;
  notes: string;
  status: 'todo';
}

const FAMILY_LABELS: Record<V2ReportFamilyKey, string> = {
  analysts: 'Analysts',
  diplomats: 'Diplomats',
  sentinels: 'Sentinels',
  explorers: 'Explorers',
};

const ROOT = '/assets/dev/v2-tw';

export function buildV2ImageSlots(type: string, familyKey: V2ReportFamilyKey) {
  const familyLabel = FAMILY_LABELS[familyKey];
  const lowerType = type.toLowerCase();

  const slots: V2ImageSlotSpec[] = [
    {
      key: 'v2-hero-desktop',
      title: 'V2 Hero Desktop',
      placement: 'Hero top section / desktop primary visual',
      ratio: '4:5',
      recommendedSize: '1600x2000',
      format: 'webp',
      assetPath: `${ROOT}/hero/v2-hero-desktop.webp`,
      notes: '桌機主視覺。需保留人物外圍留白，避免標題壓圖。',
      status: 'todo',
    },
    {
      key: 'v2-hero-mobile',
      title: 'V2 Hero Mobile',
      placement: 'Hero top section / mobile crop',
      ratio: '3:4',
      recommendedSize: '1200x1600',
      format: 'webp',
      assetPath: `${ROOT}/hero/v2-hero-mobile.webp`,
      notes: '手機版主視覺，重點需集中在中央 60% 安全區。',
      status: 'todo',
    },
    {
      key: `family-mood-${familyLabel.toLowerCase()}`,
      title: `${familyLabel} Moodboard`,
      placement: 'Sidebar / family atmosphere card',
      ratio: '1:1',
      recommendedSize: '1400x1400',
      format: 'webp',
      assetPath: `${ROOT}/families/${familyLabel.toLowerCase()}-mood.webp`,
      notes: '四大家族氛圍圖。偏材質、氣味、場景，不要塞過多文字。',
      status: 'todo',
    },
    {
      key: `report-cover-${lowerType}`,
      title: `${type} Report Cover`,
      placement: 'Hero / report cover / archive cover',
      ratio: '3:4',
      recommendedSize: '1440x1920',
      format: 'webp',
      assetPath: `${ROOT}/covers/${lowerType}-cover.webp`,
      notes: '16 型各自封面主圖。可作 header、archive、分享二次裁切來源。',
      status: 'todo',
    },
    {
      key: 'paywall-locked-preview',
      title: 'Paywall Locked Preview',
      placement: 'Locked state / paywall teaser',
      ratio: '16:10',
      recommendedSize: '1600x1000',
      format: 'webp',
      assetPath: `${ROOT}/paywall/locked-preview.webp`,
      notes: '未解鎖視覺。需保留可疊 blur 與 CTA 的空間。',
      status: 'todo',
    },
    {
      key: `dessert-${lowerType}`,
      title: `${type} Soul Dessert`,
      placement: 'Soul Dessert section',
      ratio: '4:3',
      recommendedSize: '1600x1200',
      format: 'webp',
      assetPath: `${ROOT}/desserts/${lowerType}-dessert.webp`,
      notes: '甜點圖要能承接該型的視覺邏輯與色調，盡量避免過滿構圖。',
      status: 'todo',
    },
    {
      key: 'pdf-cover-master',
      title: 'PDF Cover Master',
      placement: 'Exported PDF / print cover',
      ratio: 'A4 portrait',
      recommendedSize: '2480x3508',
      format: 'png',
      assetPath: `${ROOT}/export/pdf-cover-master.png`,
      notes: '列印與 PDF 封面母版，需保留上方標題與下方署名字樣安全區。',
      status: 'todo',
    },
    {
      key: 'share-template-master',
      title: 'Share Template Master',
      placement: 'OG / social share image',
      ratio: '1200x630',
      recommendedSize: '1200x630',
      format: 'png',
      assetPath: `${ROOT}/share/share-template-master.png`,
      notes: '分享圖母版。後續可疊 MBTI type、稱號、短句。',
      status: 'todo',
    },
  ];

  return {
    heroDesktop: slots[0],
    heroMobile: slots[1],
    familyMood: slots[2],
    reportCover: slots[3],
    paywallLocked: slots[4],
    soulDessert: slots[5],
    pdfCover: slots[6],
    shareTemplate: slots[7],
    all: slots,
  };
}
