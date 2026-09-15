import { MBTI32_SCENES, type Mbti32Scene } from './mbti32Assets.generated';

export const MBTI_BASE_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

export type MbtiBaseType = (typeof MBTI_BASE_TYPES)[number];
export type KiwimuStateGroup = 1 | 2 | 3 | 4 | 5 | 6;
export type KiwimuAssetRole = 'campaign' | 'identity' | 'state' | 'dessert' | 'brand' | 'scene';
export type KiwimuAssetContext =
  | 'landing'
  | 'quiz'
  | 'report'
  | 'story'
  | 'og'
  | 'transition'
  | 'app-icon';

export interface KiwimuVisualAsset {
  id: string;
  role: KiwimuAssetRole;
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
  alt: string;
  contexts: readonly KiwimuAssetContext[];
  status: 'active' | 'reference' | 'retired';
  version: number;
}

const defineAsset = (asset: KiwimuVisualAsset) => Object.freeze(asset);

export const KIWIMU_CAMPAIGN_ASSETS = {
  landingHero: defineAsset({
    id: 'campaign-landing-hero',
    role: 'campaign',
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774772303/redesigned-photo-1774598290392_wlohqn.png',
    width: 1184,
    height: 864,
    aspectRatio: '37 / 27',
    alt: 'Kiwimu 在白色奶油般場景中閉眼休息',
    contexts: ['landing', 'quiz'],
    status: 'active',
    version: 1,
  }),
  conversationAvatar: defineAsset({
    id: 'campaign-conversation-avatar',
    role: 'state',
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774779587/Speak_all_bkpgxc.webp',
    width: 481,
    height: 481,
    aspectRatio: '1 / 1',
    alt: '三隻疊在一起說話的 Kiwimu',
    contexts: ['quiz', 'transition'],
    status: 'active',
    version: 1,
  }),
  socialFallback: defineAsset({
    id: 'campaign-social-fallback',
    role: 'campaign',
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png',
    width: 1200,
    height: 630,
    aspectRatio: '40 / 21',
    alt: 'Kiwimu MBTI Lab 社群分享封面',
    contexts: ['og'],
    status: 'active',
    version: 1,
  }),
} as const;

export const KIWIMU_BRAND_ASSETS = {
  wordmark: defineAsset({
    id: 'brand-wordmark',
    role: 'brand',
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1769501231/%E6%A8%99%E6%BA%96%E5%AD%97-02_ndnf7x.png',
    width: 2568,
    height: 480,
    aspectRatio: '107 / 20',
    alt: 'Kiwimu',
    contexts: ['landing', 'story', 'og'],
    status: 'active',
    version: 1,
  }),
} as const;

const IDENTITY_SOURCES: Record<MbtiBaseType, string> = {
  INTJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTJ_sitgas.png',
  INTP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438026/mbti_INTP_n89sv2.png',
  ENTJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTJ_jrtdic.png',
  ENTP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438025/mbti_ENTP_iikzmh.png',
  INFJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438024/mbti_INFJ_fvjxy5.png',
  INFP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_INFP_j2qekb.png',
  ENFJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438023/mbti_ENFJ_fdpmlb.png',
  ENFP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ENFP_dcbmdx.png',
  ISTJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438022/mbti_ISTJ_m3uc4m.png',
  ISFJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ISFJ_zjjqq6.png',
  ESTJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESTJ_r8crof.png',
  ESFJ: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438021/mbti_ESFJ_jzjd3v.png',
  ISTP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISTP_ajlimj.png',
  ISFP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ISFP_xdgb6x.png',
  ESTP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESTP_rfs53m.png',
  ESFP: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1767438020/mbti_ESFP_hsuas1.png',
};

export const KIWIMU_IDENTITY_ASSETS = Object.fromEntries(
  MBTI_BASE_TYPES.map((type) => [
    type,
    defineAsset({
      id: `identity-${type.toLowerCase()}`,
      role: 'identity',
      src: IDENTITY_SOURCES[type],
      width: 1200,
      height: 1600,
      aspectRatio: '3 / 4',
      alt: `${type} 人格 Kiwimu 插畫`,
      contexts: ['report', 'story', 'og'],
      status: 'active',
      version: 1,
    }),
  ]),
) as Record<MbtiBaseType, KiwimuVisualAsset>;

const STATE_ASSET_DEFINITIONS: Record<KiwimuStateGroup, Omit<KiwimuVisualAsset, 'id' | 'role' | 'contexts' | 'status' | 'version'>> = {
  1: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758443/Carton_Home_ww4nmq.webp',
    width: 481,
    height: 480,
    aspectRatio: '481 / 480',
    alt: '躲在紙箱裡安靜充電的 Kiwimu',
  },
  2: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758442/Hidden_in_Foam_mwzmej.webp',
    width: 480,
    height: 480,
    aspectRatio: '1 / 1',
    alt: '躲在泡沫裡冷靜觀察的 Kiwimu',
  },
  3: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758441/Melting_Cream_bvabdv.webp',
    width: 481,
    height: 480,
    aspectRatio: '481 / 480',
    alt: '像奶油一樣輕輕融化的 Kiwimu',
  },
  4: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Floating_on_Cocoa_akhrjp.webp',
    width: 481,
    height: 481,
    aspectRatio: '1 / 1',
    alt: '漂浮著感應周圍情緒的 Kiwimu',
  },
  5: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Fluffy_Laugh_t30avu.webp',
    width: 480,
    height: 481,
    aspectRatio: '480 / 481',
    alt: '蓬鬆發光並開心大笑的 Kiwimu',
  },
  6: {
    src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Running_Dollop_tpb0xl.webp',
    width: 481,
    height: 481,
    aspectRatio: '1 / 1',
    alt: '全速向前奔跑的 Kiwimu',
  },
};

export const KIWIMU_STATE_ASSETS = Object.fromEntries(
  (Object.entries(STATE_ASSET_DEFINITIONS) as Array<[`${KiwimuStateGroup}`, (typeof STATE_ASSET_DEFINITIONS)[KiwimuStateGroup]]>).map(
    ([group, asset]) => [
      Number(group) as KiwimuStateGroup,
      defineAsset({
        id: `state-${group}`,
        role: 'state',
        ...asset,
        contexts: ['transition', 'quiz'],
        status: 'active',
        version: 1,
      }),
    ],
  ),
) as Record<KiwimuStateGroup, KiwimuVisualAsset>;

export const KIWIMU_DESSERT_CATALOG = {
  BASQUE_CLASSIC: defineAsset({ id: 'dessert-basque-classic', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282899/dessert/menu_item_d120a328-3222-4618-8aed-9a547f7b386a.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '北海道經典巴斯克蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  BASQUE_LEMON: defineAsset({ id: 'dessert-basque-lemon', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282850/dessert/menu_item_0a76fe1d-0302-4bff-8997-236d4a004b0b.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '檸檬巴斯克蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  MILLE_CREPE_LEMON: defineAsset({ id: 'dessert-mille-crepe-lemon', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282898/dessert/menu_item_c0820442-bab4-4c47-a4a8-60ef88da22d9.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '檸檬柚子千層蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  TIRAMISU_BAILEYS: defineAsset({ id: 'dessert-tiramisu-baileys', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282893/dessert/menu_item_63cd7340-1b89-47a6-b49a-1ee0c1eb86fe.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '奶酒提拉米蘇', contexts: ['report', 'story'], status: 'active', version: 2 }),
  TIRAMISU_YUZU: defineAsset({ id: 'dessert-tiramisu-yuzu', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282902/dessert/menu_item_ed08801b-55f5-4d51-9db4-37cc03688bef.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '柚子蘋果提拉米蘇', contexts: ['report', 'story'], status: 'active', version: 2 }),
  BASQUE_TEA: defineAsset({ id: 'dessert-basque-tea', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282900/dessert/menu_item_e58bac5a-eb09-4a7d-b5ad-47e8491e63c0.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '蜜香紅茶千層蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  CHIFFON_HOKKAIDO: defineAsset({ id: 'dessert-chiffon-hokkaido', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282904/dessert/menu_item_e2fbf554-87d6-4e5f-86cf-c302d2f3bfc5.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '北海道戚風蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  CHIFFON_PUDDING: defineAsset({ id: 'dessert-chiffon-pudding', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282895/dessert/menu_item_8e59b833-853a-4164-b747-6382c4bd7658.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '焦糖烤布丁戚風蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  CHIFFON_LEMON: defineAsset({ id: 'dessert-chiffon-lemon', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282905/dessert/menu_item_f2861596-f10e-4c18-bfb0-5b63335329e9.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '檸檬戚風蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  MILLE_CREPE_STRAWBERRY: defineAsset({ id: 'dessert-mille-crepe-strawberry', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282903/dessert/menu_item_f5c62e8d-59df-44c5-bcd6-d6473097b32b.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '十勝水果派對千層蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  MILLE_CREPE_CLASSIC: defineAsset({ id: 'dessert-mille-crepe-classic', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282901/dessert/menu_item_e9fa32e1-d48a-4cbc-8663-f9888c18c3e2.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '經典十勝原味千層', contexts: ['report', 'story'], status: 'active', version: 2 }),
  PUDDING_CLASSIC: defineAsset({ id: 'dessert-pudding-classic', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282892/dessert/menu_item_5fc488d8-c1dd-45c6-aa4f-e164b6d793ab.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '經典手工烤布丁', contexts: ['report', 'story'], status: 'active', version: 2 }),
  BASQUE_SALTED_EGG: defineAsset({ id: 'dessert-basque-salted-egg', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282894/dessert/menu_item_7bb2e59f-934e-44a3-af13-d52c5c43853c.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '鹹蛋黃巴斯克蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  CHIFFON_BERRY: defineAsset({ id: 'dessert-chiffon-berry', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771923761/dessert/menu_item_e3a60ea8-aa3e-40f3-ad8e-3cc4dd12ec02.webp', width: 636, height: 636, aspectRatio: '1 / 1', alt: '莓果戚風蛋糕', contexts: ['report', 'story'], status: 'active', version: 2 }),
  TIRAMISU_CLASSIC: defineAsset({ id: 'dessert-tiramisu-classic', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282853/dessert/menu_item_fdf76c2c-121e-4069-bdf0-5662c214c622.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '經典提拉米蘇', contexts: ['report', 'story'], status: 'active', version: 2 }),
  TIRAMISU_PUDDING_MOCHA: defineAsset({ id: 'dessert-tiramisu-pudding-mocha', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282893/dessert/menu_item_63cd7340-1b89-47a6-b49a-1ee0c1eb86fe.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '摩卡焦糖提拉米蘇', contexts: ['report', 'story'], status: 'active', version: 3 }),
  TIRAMISU_MATCHA: defineAsset({ id: 'dessert-tiramisu-matcha', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282897/dessert/menu_item_a9a834ed-39ca-4524-8f03-2183db366d1f.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '抹茶提拉米蘇', contexts: ['report', 'story'], status: 'active', version: 2 }),
  MILLE_CREPE_CHOCO: defineAsset({ id: 'dessert-mille-crepe-choco', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789289016/dessert/menu_item_d323bd72-12ff-4bbb-9533-16fac4d08bba.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '巧克力布朗尼千層蛋糕', contexts: ['report', 'story'], status: 'active', version: 3 }),
  CHIFFON_FRUIT: defineAsset({ id: 'dessert-chiffon-fruit', role: 'dessert', src: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1789282906/dessert/menu_item_3d59121a-b450-42a4-8fa0-be85f8b4b9bd.webp', width: 1200, height: 1200, aspectRatio: '1 / 1', alt: '水果戚風蛋糕', contexts: ['report', 'story'], status: 'reference', version: 2 }),
} as const;

export type DessertAssetId = keyof typeof KIWIMU_DESSERT_CATALOG;

export const KIWIMU_DESSERT_ASSET_IDS: Record<MbtiBaseType, DessertAssetId> = {
  INTJ: 'BASQUE_CLASSIC',
  INTP: 'MILLE_CREPE_LEMON',
  ENTJ: 'TIRAMISU_BAILEYS',
  ENTP: 'TIRAMISU_YUZU',
  INFJ: 'BASQUE_TEA',
  INFP: 'CHIFFON_PUDDING',
  ENFJ: 'TIRAMISU_PUDDING_MOCHA',
  ENFP: 'MILLE_CREPE_STRAWBERRY',
  ISTJ: 'MILLE_CREPE_CLASSIC',
  ISFJ: 'PUDDING_CLASSIC',
  ESTJ: 'BASQUE_SALTED_EGG',
  ESFJ: 'CHIFFON_BERRY',
  ISTP: 'TIRAMISU_CLASSIC',
  ISFP: 'TIRAMISU_MATCHA',
  ESTP: 'MILLE_CREPE_CHOCO',
  ESFP: 'BASQUE_LEMON',
};

const DESSERT_NAME_ASSET_IDS: ReadonlyArray<readonly [RegExp, DessertAssetId]> = [
  [/(水果派對|水果森林).*千層/, 'MILLE_CREPE_STRAWBERRY'],
  [/草莓.*千層/, 'MILLE_CREPE_STRAWBERRY'],
  [/檸檬.*千層/, 'MILLE_CREPE_LEMON'],
  [/奶酒.*提拉米蘇/, 'TIRAMISU_BAILEYS'],
  [/柚子.*提拉米蘇/, 'TIRAMISU_YUZU'],
  [/蜜香紅茶.*千層/, 'BASQUE_TEA'],
  [/茶香.*巴斯克/, 'BASQUE_TEA'],
  [/檸檬.*戚風/, 'CHIFFON_LEMON'],
  [/(清晨|北海道).*戚風/, 'CHIFFON_HOKKAIDO'],
  [/(烤焦糖布丁|焦糖烤布丁|布丁).*戚風/, 'CHIFFON_PUDDING'],
  [/(草莓|莓果).*(生乳酪|戚風)/, 'CHIFFON_BERRY'],
  [/布朗尼.*千層/, 'MILLE_CREPE_CHOCO'],
  [/大理石|巧克力.*千層/, 'MILLE_CREPE_CHOCO'],
  [/(古早味|手工|經典).*布丁/, 'PUDDING_CLASSIC'],
  [/鹹蛋黃.*巴斯克/, 'BASQUE_SALTED_EGG'],
  [/檸檬.*巴斯克/, 'BASQUE_LEMON'],
  [/(北海道|原味|經典|極致).*巴斯克/, 'BASQUE_CLASSIC'],
  [/(烤焦糖|焦糖|摩卡).*提拉米蘇/, 'TIRAMISU_PUDDING_MOCHA'],
  [/抹茶.*提拉米蘇/, 'TIRAMISU_MATCHA'],
  [/經典.*提拉米蘇/, 'TIRAMISU_CLASSIC'],
];

export const isMbtiBaseType = (value: string): value is MbtiBaseType =>
  (MBTI_BASE_TYPES as readonly string[]).includes(value);

export const getIdentityAsset = (type: string): KiwimuVisualAsset | undefined =>
  isMbtiBaseType(type) ? KIWIMU_IDENTITY_ASSETS[type] : undefined;

export const getStateAsset = (group: KiwimuStateGroup): KiwimuVisualAsset =>
  KIWIMU_STATE_ASSETS[group];

export const getDessertAsset = (type: string, dessertName?: string): KiwimuVisualAsset | undefined => {
  if (dessertName) {
    const match = DESSERT_NAME_ASSET_IDS.find(([pattern]) => pattern.test(dessertName));
    if (match) return KIWIMU_DESSERT_CATALOG[match[1]];
  }

  return isMbtiBaseType(type)
    ? KIWIMU_DESSERT_CATALOG[KIWIMU_DESSERT_ASSET_IDS[type]]
    : undefined;
};



/* ───────────────────────────────────────────────────────────────────────────
   MBTI 32 場景資產（Quiet Atlas）

   來源：`kiwimu-mbti-32-handfeel-singles-v1` 32 張 2560² 場景稿，經
   `scripts/build-mbti32-assets.py` 產出五種尺寸與場景取樣色，寫入
   `data/mbti32Assets.generated.ts`。本檔是元件唯一取用入口。

   為什麼是「場景」而不是換掉 identity 圖：
   - 場景圖裡的 Kiwimu 只佔畫面約三成，直接縮到卡片尺寸會認不出角色。
   - 因此大尺寸（hero / 報告封面 / 分享圖）走 scene 全景，
     小尺寸（卡片 / chip / 導覽）走 portrait / avatar 這兩個以角色框為中心的裁切，
     黑長喙、黑 U 型眼、黑短腳一定在框內，辨識度不掉。
   - 既有的 16 型 identity cutout 仍保留，供需要去背角色的版位使用。
   ─────────────────────────────────────────────────────────────────────────── */

export type MbtiVariant = 'A' | 'T';

export interface KiwimuSceneAsset {
  readonly fullType: string;
  readonly baseType: string;
  readonly variant: MbtiVariant;
  readonly familyEn: string;
  readonly familyZh: string;
  /** 該變體的場景稱號，例如「無畏的建築師」 */
  readonly title: string;
  /** 圖鑑編號 1–32 */
  readonly index: number;
  /** 角色中心點（0–1），給 object-position 用，確保 cover 裁切不切掉 Kiwimu */
  readonly focal: { readonly x: number; readonly y: number };
  /** 場景取樣色：deep 打底、accent 邊框與強調、glow 小面積訊號 */
  readonly palette: { readonly deep: string; readonly accent: string; readonly glow: string };
  /** 全景 1600²（hero / 報告封面） */
  readonly scene: KiwimuVisualAsset;
  /** 全景 800²（列表 / 低頻寬） */
  readonly sceneSm: KiwimuVisualAsset;
  /** 角色裁切 720²（卡片） */
  readonly portrait: KiwimuVisualAsset;
  /** 角色特寫 224²（chip / 導覽） */
  readonly avatar: KiwimuVisualAsset;
  /** 分享圖 1200×630 WebP */
  readonly og: KiwimuVisualAsset;
  /** 分享圖 1200×630 JPEG（LINE 等爬蟲保底） */
  readonly ogJpg: KiwimuVisualAsset;
}

const SITE_ORIGIN = 'https://kiwimu.com';

/** 場景資產是站內相對路徑；OG / 結構化資料需要絕對網址時用這個。 */
export const toAbsoluteAssetUrl = (src: string): string =>
  src.startsWith('/') ? `${SITE_ORIGIN}${src}` : src;

const sceneImage = (
  image: Mbti32Scene['scene'],
  id: string,
  alt: string,
  contexts: readonly KiwimuAssetContext[],
): KiwimuVisualAsset =>
  defineAsset({
    id,
    role: 'scene',
    src: image.src,
    width: image.width,
    height: image.height,
    aspectRatio: `${image.width} / ${image.height}`,
    alt,
    contexts,
    status: 'active',
    version: 1,
  });

const buildSceneAsset = (raw: Mbti32Scene): KiwimuSceneAsset => {
  const key = raw.fullType.toLowerCase();
  const sceneAlt = `${raw.fullType}「${raw.title}」場景：Kiwimu 站在自己的世界裡`;
  const charAlt = `${raw.fullType}「${raw.title}」的 Kiwimu`;
  return Object.freeze({
    fullType: raw.fullType,
    baseType: raw.baseType,
    variant: raw.variant,
    familyEn: raw.familyEn,
    familyZh: raw.familyZh,
    title: raw.title,
    index: raw.index,
    focal: raw.focal,
    palette: raw.palette,
    scene: sceneImage(raw.scene, `scene-${key}`, sceneAlt, ['report', 'story']),
    sceneSm: sceneImage(raw.sceneSm, `scene-sm-${key}`, sceneAlt, ['report', 'story', 'transition']),
    portrait: sceneImage(raw.portrait, `portrait-${key}`, charAlt, ['report', 'story', 'quiz']),
    avatar: sceneImage(raw.avatar, `avatar-${key}`, charAlt, ['report', 'transition']),
    og: sceneImage(raw.og, `og-${key}`, sceneAlt, ['og']),
    ogJpg: sceneImage(raw.ogJpg, `og-jpg-${key}`, sceneAlt, ['og']),
  });
};

export const KIWIMU_SCENE_ASSETS: Record<string, KiwimuSceneAsset> = Object.freeze(
  Object.fromEntries(
    Object.values(MBTI32_SCENES).map((raw) => [raw.fullType, buildSceneAsset(raw)]),
  ),
);

export const isMbtiVariant = (value: string): value is MbtiVariant => value === 'A' || value === 'T';

/** 取某個變體的場景資產，例如 `getSceneAsset('INTJ-A')`。 */
export const getSceneAsset = (fullType: string | null | undefined): KiwimuSceneAsset | undefined =>
  fullType ? KIWIMU_SCENE_ASSETS[fullType.toUpperCase()] : undefined;

/** 型別與變體分開傳時用這個；變體缺漏時退回 A。 */
export const getSceneAssetFor = (
  type: string | null | undefined,
  variant: string | null | undefined,
): KiwimuSceneAsset | undefined => {
  if (!type) return undefined;
  const v = variant && isMbtiVariant(variant.toUpperCase()) ? variant.toUpperCase() : 'A';
  return getSceneAsset(`${type.toUpperCase()}-${v}`);
};

/** 把場景取樣色接到 CSS 變數上，讓該頁的強調色跟著人格走。 */
export const sceneAccentStyle = (asset: KiwimuSceneAsset | undefined): Record<string, string> => {
  if (!asset) return {};
  return {
    '--type-accent': asset.palette.accent,
    '--type-deep': asset.palette.deep,
    '--type-glow': asset.palette.glow,
    '--focal-x': `${(asset.focal.x * 100).toFixed(1)}%`,
    '--focal-y': `${(asset.focal.y * 100).toFixed(1)}%`,
  };
};
