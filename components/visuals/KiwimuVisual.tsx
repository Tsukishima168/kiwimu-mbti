import React, { useState } from 'react';
import type { KiwimuVisualAsset } from '../../data/kiwimuVisualAssets';

interface KiwimuVisualProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'height' | 'src' | 'width'> {
  asset: KiwimuVisualAsset;
  alt?: string;
  fit?: 'contain' | 'cover';
}
const FALLBACK_SRC = '/kiwimu_favicon.png';

export default function KiwimuVisual({
  asset,
  alt,
  fit = 'contain',
  loading = 'lazy',
  decoding = 'async',
  onError,
  style,
  ...imageProps
}: KiwimuVisualProps) {
  const [usingFallback, setUsingFallback] = useState(false);

  return (
    <img
      {...imageProps}
      src={usingFallback ? FALLBACK_SRC : asset.src}
      alt={alt || asset.alt}
      width={asset.width}
      height={asset.height}
      loading={loading}
      decoding={decoding}
      crossOrigin={usingFallback ? undefined : 'anonymous'}
      data-asset-id={asset.id}
      data-asset-role={asset.role}
      style={{ aspectRatio: asset.aspectRatio, objectFit: fit, ...style }}
      onError={(event) => {
        onError?.(event);
        if (!usingFallback) setUsingFallback(true);
      }}
    />
  );
}
