import React, { useEffect, useState } from 'react';

type DessertPhotoProps = {
  src: string;
  name: string;
  fullType: string | null;
  loading: boolean;
  unavailable: boolean;
  onRetry: () => void;
};

export default function DessertPhoto({ src, name, fullType, loading, unavailable, onRetry }: DessertPhotoProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);

  return (
    <figure className={`ad-dessert-visual${!src || failed ? ' is-placeholder' : ''}`}>
      {src && !failed ? (
        <>
          <img
            key={src}
            src={src}
            className="ad-dessert-image"
            alt={`${name}，月島菜單品項`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          <figcaption className="ad-dessert-caption">
            <span className="ad-dessert-caption-code">Menu Pairing · {fullType}</span>
            <span className="ad-dessert-caption-name">{name}</span>
          </figcaption>
        </>
      ) : (
        <div className="ad-dessert-photo-status" aria-live="polite" aria-busy={loading}>
          <p>{loading ? '正在載入月島甜點照片…' : failed ? '甜點照片暫時載入不了。' : unavailable ? '目前無法載入月島菜單與照片。' : '這款甜點目前沒有菜單照片。'}</p>
          <p className="ad-dessert-photo-note">{loading ? '你可以先繼續閱讀，照片會在這裡顯示。' : '實際品項與供應資訊，請以月島菜單為準。'}</p>
          {!loading ? <button type="button" className="ad-btn-ghost" onClick={onRetry}>重新載入照片</button> : null}
        </div>
      )}
    </figure>
  );
}
