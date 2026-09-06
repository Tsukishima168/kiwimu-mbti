import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  KIWIMU_CAMPAIGN_ASSETS,
  KIWIMU_DESSERT_ASSET_IDS,
  KIWIMU_DESSERT_CATALOG,
  KIWIMU_IDENTITY_ASSETS,
  KIWIMU_STATE_ASSETS,
  MBTI_BASE_TYPES,
  getDessertAsset,
  getIdentityAsset,
  getStateAsset,
  KIWIMU_SCENE_ASSETS,
  getSceneAsset,
  getSceneAssetFor,
  sceneAccentStyle,
  toAbsoluteAssetUrl,
  type KiwimuVisualAsset,
} from './kiwimuVisualAssets';

const expectCompleteAsset = (asset: KiwimuVisualAsset) => {
  expect(asset.id).toBeTruthy();
  expect(asset.src).toMatch(/^https:\/\/res\.cloudinary\.com\/dvizdsv4m\/image\/upload\//);
  expect(asset.alt.trim()).not.toBe('');
  expect(asset.width).toBeGreaterThan(0);
  expect(asset.height).toBeGreaterThan(0);
  expect(asset.contexts.length).toBeGreaterThan(0);
};

describe('Kiwimu visual asset manifest', () => {
  it('contains one complete identity asset for every MBTI base type', () => {
    expect(MBTI_BASE_TYPES).toHaveLength(16);
    expect(Object.keys(KIWIMU_IDENTITY_ASSETS)).toHaveLength(16);

    for (const type of MBTI_BASE_TYPES) {
      const asset = getIdentityAsset(type);
      expect(asset?.role).toBe('identity');
      expect(asset?.width).toBe(1200);
      expect(asset?.height).toBe(1600);
      expectCompleteAsset(asset!);
    }
  });

  it('maps every MBTI base type to an available dessert asset', () => {
    expect(Object.keys(KIWIMU_DESSERT_ASSET_IDS)).toHaveLength(16);
    expect(Object.keys(KIWIMU_DESSERT_CATALOG)).toHaveLength(16);

    for (const type of MBTI_BASE_TYPES) {
      const asset = getDessertAsset(type);
      expect(asset?.role).toBe('dessert');
      expectCompleteAsset(asset!);
    }
  });

  it('selects report dessert art by the current report name before type fallback', () => {
    expect(getDessertAsset('INTJ', '茶香巴斯克')?.id).toBe('dessert-basque-tea');
    expect(getDessertAsset('ENFP', '檸檬蘋果戚風蛋糕')?.id).toBe('dessert-chiffon-lemon');
    expect(getDessertAsset('ISFJ', '古早味烤布丁')?.id).toBe('dessert-pudding-classic');
  });

  it('contains all six state assets and the campaign fallbacks', () => {
    expect(Object.keys(KIWIMU_STATE_ASSETS)).toHaveLength(6);
    for (const group of [1, 2, 3, 4, 5, 6] as const) {
      const asset = getStateAsset(group);
      expect(asset.role).toBe('state');
      expectCompleteAsset(asset);
    }

    expectCompleteAsset(KIWIMU_CAMPAIGN_ASSETS.landingHero);
    expectCompleteAsset(KIWIMU_CAMPAIGN_ASSETS.conversationAvatar);
    expectCompleteAsset(KIWIMU_CAMPAIGN_ASSETS.socialFallback);
  });
});



describe('MBTI 32 場景資產', () => {
  const VARIANTS = ['A', 'T'] as const;
  const expectedFullTypes = MBTI_BASE_TYPES.flatMap((type) => VARIANTS.map((v) => `${type}-${v}`));
  const publicDir = path.resolve(__dirname, '..', 'public');
  const HEX = /^#[0-9A-F]{6}$/;

  it('16 型 × A/T 共 32 個變體全部有場景資產', () => {
    expect(expectedFullTypes).toHaveLength(32);
    expect(Object.keys(KIWIMU_SCENE_ASSETS).sort()).toEqual([...expectedFullTypes].sort());
  });

  it('每個變體對到自己的圖，圖鑑編號 1–32 不重複', () => {
    const indexes = new Set<number>();
    for (const fullType of expectedFullTypes) {
      const asset = getSceneAsset(fullType);
      expect(asset, fullType).toBeDefined();
      if (!asset) continue;

      expect(asset.fullType).toBe(fullType);
      expect(`${asset.baseType}-${asset.variant}`).toBe(fullType);

      // 每個尺寸的檔名都必須帶自己的 fullType —— 這是「換圖有換對」的關鍵斷言
      for (const image of [asset.scene, asset.sceneSm, asset.portrait, asset.avatar, asset.og, asset.ogJpg]) {
        expect(image.src, `${fullType} ${image.id}`).toContain(`/${fullType}.`);
        expect(image.src.startsWith('/assets/mbti32/')).toBe(true);
        expect(image.alt.trim()).not.toBe('');
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
      }

      expect(asset.index).toBeGreaterThanOrEqual(1);
      expect(asset.index).toBeLessThanOrEqual(32);
      expect(indexes.has(asset.index)).toBe(false);
      indexes.add(asset.index);
    }
    expect(indexes.size).toBe(32);
  });

  it('產出的圖檔實際存在於 public/', () => {
    for (const asset of Object.values(KIWIMU_SCENE_ASSETS)) {
      for (const image of [asset.scene, asset.sceneSm, asset.portrait, asset.avatar, asset.og, asset.ogJpg]) {
        expect(existsSync(path.join(publicDir, image.src)), image.src).toBe(true);
      }
    }
  });

  it('場景取樣色是合法 hex，且亮度已正規化到可讀區間', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const asset of Object.values(KIWIMU_SCENE_ASSETS)) {
      const { deep, accent, glow } = asset.palette;
      for (const hex of [deep, accent, glow]) expect(hex, asset.fullType).toMatch(HEX);
      // deep 當底色必須夠暗；glow 拿去畫 9px mono 小標，必須明顯亮於 deep
      expect(luminance(deep), `${asset.fullType} deep`).toBeLessThan(0.24);
      expect(luminance(glow), `${asset.fullType} glow`).toBeGreaterThan(0.42);
      expect(luminance(glow)).toBeGreaterThan(luminance(deep) + 0.25);
    }
  });

  it('32 型的人格色對文字都達到 WCAG AA 4.5', () => {
    // v2-dark.css 的站台層取值：頁面底、壓在訊號色上的字、主文字
    const BG_0 = '#0D1C15';
    const ON_SIGNAL = '#14210F';
    const T1 = '#F3EFE2';

    const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const relLuminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };

    for (const asset of Object.values(KIWIMU_SCENE_ASSETS)) {
      const { deep, accent, glow } = asset.palette;
      // section kicker / 圖版標註（9–11px mono）壓在頁面底色上
      expect(contrast(glow, BG_0), `${asset.fullType} glow on bg-0`).toBeGreaterThanOrEqual(4.5);
      // 變體 chip：深色字壓在 accent 底上
      expect(contrast(ON_SIGNAL, accent), `${asset.fullType} on-signal on accent`).toBeGreaterThanOrEqual(4.5);
      // 奶油白主文字壓在圖版底色上
      expect(contrast(T1, deep), `${asset.fullType} t1 on deep`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('角色焦點落在畫面中段，cover 裁切不會把 Kiwimu 切掉', () => {
    for (const asset of Object.values(KIWIMU_SCENE_ASSETS)) {
      expect(asset.focal.x, `${asset.fullType} focal.x`).toBeGreaterThan(0.15);
      expect(asset.focal.x, `${asset.fullType} focal.x`).toBeLessThan(0.85);
      expect(asset.focal.y, `${asset.fullType} focal.y`).toBeGreaterThan(0.25);
      expect(asset.focal.y, `${asset.fullType} focal.y`).toBeLessThan(0.85);
    }
  });

  it('getSceneAssetFor 接受大小寫，變體缺漏時退回 A', () => {
    expect(getSceneAssetFor('intj', 'a')?.fullType).toBe('INTJ-A');
    expect(getSceneAssetFor('INTJ', null)?.fullType).toBe('INTJ-A');
    expect(getSceneAssetFor('INTJ', 'T')?.fullType).toBe('INTJ-T');
    expect(getSceneAssetFor('NOPE', 'A')).toBeUndefined();
    expect(getSceneAsset(null)).toBeUndefined();
  });

  it('OG 圖轉得出絕對網址，供社群爬蟲抓取', () => {
    const asset = getSceneAsset('ENFP-A');
    expect(asset).toBeDefined();
    expect(toAbsoluteAssetUrl(asset!.ogJpg.src)).toBe('https://kiwimu.com/assets/mbti32/og-jpg/ENFP-A.jpg');
    // 已經是絕對網址的資產不應被再加前綴
    expect(toAbsoluteAssetUrl(KIWIMU_CAMPAIGN_ASSETS.socialFallback.src)).toBe(
      KIWIMU_CAMPAIGN_ASSETS.socialFallback.src,
    );
  });

  it('sceneAccentStyle 產出 CSS 變數；無資產時回空物件', () => {
    const style = sceneAccentStyle(getSceneAsset('ISTP-T'));
    expect(style['--type-accent']).toMatch(HEX);
    expect(style['--type-deep']).toMatch(HEX);
    expect(style['--type-glow']).toMatch(HEX);
    expect(style['--focal-x']).toMatch(/^\d+(\.\d+)?%$/);
    expect(sceneAccentStyle(undefined)).toEqual({});
  });
});
