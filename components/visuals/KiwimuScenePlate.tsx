import React from 'react';
import type { KiwimuSceneAsset } from '../../data/kiwimuVisualAssets';
import { sceneAccentStyle } from '../../data/kiwimuVisualAssets';

interface KiwimuScenePlateProps {
  asset: KiwimuSceneAsset;
  /** 右下角的圖鑑編號行，例如 `NO. 01 / 32` */
  indexLabel?: string;
  /** 破格到 900px（桌機 cinema mode）；報告 hero 用 true */
  bleed?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Quiet Atlas 的標本圖版：圓拱畫框 + 場景全景 + 博物館式雙語標註。
 *
 * 場景圖裡的 Kiwimu 只佔畫面約三成，所以這個元件只用在大版位；
 * 卡片與 chip 請改用 `asset.portrait` / `asset.avatar`（以角色框為中心的裁切）。
 * `object-position` 吃 `--focal-x/y`，確保 cover 裁切永遠不會切掉喙與腳。
 */
export default function KiwimuScenePlate({
  asset,
  indexLabel,
  bleed = false,
  priority = false,
  className,
}: KiwimuScenePlateProps) {
  const { scene, sceneSm } = asset;
  return (
    <div
      className={['ad-scene', bleed ? 'ad-bleed' : '', className].filter(Boolean).join(' ')}
      style={sceneAccentStyle(asset)}
    >
      <figure className="ad-scene-figure">
        <img
          className="ad-scene-img"
          src={scene.src}
          srcSet={`${sceneSm.src} ${sceneSm.width}w, ${scene.src} ${scene.width}w`}
          sizes="(min-width: 900px) 900px, 100vw"
          width={scene.width}
          height={scene.height}
          alt={scene.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          data-asset-id={scene.id}
          data-asset-role={scene.role}
        />
        <div className="ad-scene-scrim" aria-hidden="true" />
        <figcaption className="ad-scene-label">
          <span className="ad-scene-label-main">
            <span className="ad-scene-code">
              {asset.fullType} · {asset.familyEn}
            </span>
            <span className="ad-scene-title">{asset.title}</span>
          </span>
          {indexLabel ? <span className="ad-scene-index">{indexLabel}</span> : null}
        </figcaption>
      </figure>
    </div>
  );
}
