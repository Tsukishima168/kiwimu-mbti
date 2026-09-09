import React from 'react';
import { KIWIMU_SCENE_ASSETS, getSceneAsset } from '../../data/kiwimuVisualAssets';

interface KiwimuAtlasWallProps {
  /** 要點亮的變體，例如已知的 V1.5 結果 `INTJ-A` */
  highlight?: string | null;
  /** 圖鑑牆下方的說明行；不給就不顯示 */
  caption?: string;
  className?: string;
}

const ORDER = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

/**
 * Quiet Atlas 的圖鑑牆：32 個變體以標本的方式一次攤開。
 *
 * 用在「還不知道自己是誰」的頁面（落地、測驗前）——先看見整個圖鑑，
 * 再找到自己的位置。海報哲學要的是「透過網格、星座與重複的柔和形狀溝通」，
 * 所以這裡刻意用 avatar（角色特寫）而不是全景：小尺寸下仍看得出黑喙與黑腳，
 * 32 張排在一起才會讀成同一個物種的標本冊，而不是 32 張風景照。
 */
export default function KiwimuAtlasWall({ highlight, caption, className }: KiwimuAtlasWallProps) {
  const highlighted = getSceneAsset(highlight);

  return (
    <div className={['ad-atlas-wall', className].filter(Boolean).join(' ')}>
      <div className="ad-atlas-grid" aria-hidden="true">
        {ORDER.flatMap((type) =>
          (['A', 'T'] as const).map((variant) => {
            const key = `${type}-${variant}`;
            const asset = KIWIMU_SCENE_ASSETS[key];
            if (!asset) return null;
            const isOn = highlighted?.fullType === key;
            return (
              <span
                key={key}
                className={`ad-atlas-tile${isOn ? ' is-highlighted' : ''}`}
                style={{ backgroundColor: asset.palette.deep }}
              >
                <img
                  src={asset.avatar.src}
                  width={asset.avatar.width}
                  height={asset.avatar.height}
                  alt=""
                  /* 圖鑑牆是這頁的主視覺，不能 lazy——32 張 avatar 合計約 220KB */
                  loading="eager"
                  fetchPriority="low"
                  decoding="async"
                />
              </span>
            );
          }),
        )}
      </div>
      {caption ? <p className="ad-atlas-caption">{caption}</p> : null}
    </div>
  );
}
