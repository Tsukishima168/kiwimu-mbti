'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KiwimuUniverseSiteId = 'kiwimu' | 'shop' | 'passport' | 'gacha' | 'map';
export type KiwimuUniverseLoginStatus = 'authenticated' | 'anonymous' | 'unknown';

export interface KiwimuUniverseNavigationDetails {
  [key: string]: string | number;
  source_site: KiwimuUniverseSiteId;
  target_site: KiwimuUniverseSiteId;
  viewport: string;
  viewport_width: number;
  viewport_height: number;
  viewport_category: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  login_status: KiwimuUniverseLoginStatus;
  surface: string;
  // R5 canonical event param names (shared across the five-site outbound_click
  // contract). Kept alongside `surface`/`target_site` rather than renaming
  // them, so existing universe_nav_click history stays comparable.
  link_name: string;
  entry_surface: string;
  destination_type: string;
  transport_type: 'beacon';
}

interface KiwimuUniverseRailProps {
  currentSite: KiwimuUniverseSiteId;
  authClient?: Pick<SupabaseClient, 'auth'> | null;
  onTrack?: (
    eventName: 'universe_nav_click',
    details: KiwimuUniverseNavigationDetails,
  ) => void;
}

const UNIVERSE_SITES: ReadonlyArray<{
  id: KiwimuUniverseSiteId;
  label: string;
  descriptor: string;
  href: string;
}> = [
  // R3: 站內跨站連結不用 UTM，帶單一 from=<來源站>_<位置>。
  { id: 'kiwimu', label: 'MBTI', descriptor: '人格測驗', href: 'https://kiwimu.com/?from=mbti_universe_nav' },
  { id: 'passport', label: 'Passport', descriptor: '會員護照', href: 'https://passport.kiwimu.com/?from=mbti_universe_nav' },
  { id: 'map', label: 'Map', descriptor: '島嶼地圖', href: 'https://map.kiwimu.com/?from=mbti_universe_nav' },
  { id: 'gacha', label: 'Gacha', descriptor: '遊戲中心', href: 'https://gacha.kiwimu.com/?from=mbti_universe_nav' },
  { id: 'shop', label: 'Shop', descriptor: '甜點預訂', href: 'https://shop.kiwimu.com/?from=mbti_universe_nav' },
];

const MOBILE_MORE_SITES = new Set<KiwimuUniverseSiteId>(['map', 'gacha']);
const FOREST_EXHIBITION_URL = 'https://canopy.kiwimu.com/';
const FOREST_EXHIBITION_LABEL = '森林展覽：島嶼之上｜臺灣森林冠層（另開分頁）';

export function createKiwimuUniverseNavigationDetails(
  sourceSite: KiwimuUniverseSiteId,
  targetSite: KiwimuUniverseSiteId,
  loginStatus: KiwimuUniverseLoginStatus,
  surface = 'universe_rail',
): KiwimuUniverseNavigationDetails {
  const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;
  const viewportCategory = viewportWidth === 0
    ? 'unknown'
    : viewportWidth <= 640
      ? 'mobile'
      : viewportWidth <= 1024
        ? 'tablet'
        : 'desktop';

  const targetSiteMeta = UNIVERSE_SITES.find((site) => site.id === targetSite);

  return {
    source_site: sourceSite,
    target_site: targetSite,
    viewport: `${viewportWidth}x${viewportHeight}`,
    viewport_width: viewportWidth,
    viewport_height: viewportHeight,
    viewport_category: viewportCategory,
    login_status: loginStatus,
    surface,
    link_name: targetSiteMeta?.label || targetSite,
    entry_surface: surface,
    destination_type: 'cross_site_nav',
    transport_type: 'beacon',
  };
}

export const KiwimuUniverseRail: React.FC<KiwimuUniverseRailProps> = ({ currentSite, authClient, onTrack }) => {
  const railRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const panelId = useId();
  const loginStatusRef = useRef<KiwimuUniverseLoginStatus>('unknown');

  const trackNavigation = (targetSite: KiwimuUniverseSiteId) => {
    try {
      onTrack?.(
        'universe_nav_click',
        createKiwimuUniverseNavigationDetails(currentSite, targetSite, loginStatusRef.current),
      );
    } catch {
      // Analytics must never block the cross-site navigation.
    }
  };

  useEffect(() => {
    if (!authClient) {
      loginStatusRef.current = 'unknown';
      return undefined;
    }

    let isActive = true;

    void authClient.auth.getSession()
      .then(({ data, error }) => {
        if (!isActive) return;
        loginStatusRef.current = error
          ? 'unknown'
          : data.session?.user
            ? 'authenticated'
            : 'anonymous';
      })
      .catch(() => {
        if (isActive) loginStatusRef.current = 'unknown';
      });

    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, session) => {
      loginStatusRef.current = session?.user ? 'authenticated' : 'anonymous';
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [authClient]);



  const measureMenu = () => {
    const rail = railRef.current;
    if (rail) setMenuHeight(Math.max(0, Math.floor(window.innerHeight - Math.max(0, rail.getBoundingClientRect().bottom) - 16)));
  };
  const closeMenu = (restoreFocus = false) => {
    if (restoreFocus) moreRef.current?.focus();
    setMoreOpen(false);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const root = document.documentElement;
    const previousHeight = root.style.getPropertyValue('--ku-rail-height');
    const measure = () => {
      // Fixed route headers also need the real height after text enlargement.
      root.style.setProperty('--ku-rail-height', `${rail.getBoundingClientRect().height}px`);
      measureMenu();
    };
    const resize = () => {
      measure();
      if (!window.matchMedia('(max-width: 640px)').matches) closeMenu();
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(rail);
    measure();
    window.addEventListener('resize', resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      if (previousHeight) root.style.setProperty('--ku-rail-height', previousHeight);
      else root.style.removeProperty('--ku-rail-height');
    };
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); closeMenu(true); }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !railRef.current?.contains(event.target)) closeMenu();
    };
    const onBlur = () => closeMenu();
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('blur', onBlur);
    window.addEventListener('scroll', measureMenu, { passive: true });
    document.addEventListener('pointerdown', onOutside, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('scroll', measureMenu);
      document.removeEventListener('pointerdown', onOutside, true);
    };
  }, [moreOpen]);

  const siteLink = (site: typeof UNIVERSE_SITES[number], inPanel = false) => {
    const isCurrent = site.id === currentSite;
    // Preserve the cross-site attribution contract and the current site's URL.
    const href = site.href;
    return <a key={site.id} href={href}
      className={`ku-universe-rail__link${isCurrent ? ' is-current' : ''}${!inPanel && MOBILE_MORE_SITES.has(site.id) ? ' ku-universe-rail__secondary' : ''}`}
      aria-current={isCurrent ? 'page' : undefined}
      onClick={() => { trackNavigation(site.id); if (inPanel) closeMenu(true); }}>{site.descriptor}</a>;
  };
  const forestLink = (inPanel = false) => <a href={FOREST_EXHIBITION_URL} target="_blank" rel="noopener noreferrer"
    aria-label={FOREST_EXHIBITION_LABEL}
    className={`ku-universe-rail__link ku-universe-rail__showcase${inPanel ? '' : ' ku-universe-rail__secondary'}`}
    onClick={inPanel ? () => closeMenu(true) : undefined}>
      <span>森林展覽 <span aria-hidden="true">↗</span></span>
      {inPanel ? <span className="ku-universe-rail__hint">臺灣森林冠層・另開分頁</span> : null}
    </a>;

  return <aside ref={railRef} className={`ku-universe-rail${moreOpen ? ' is-menu-open' : ''}`} data-current-site={currentSite}
    onBlurCapture={event => { const next = event.relatedTarget; if (!(next instanceof Node) || !railRef.current?.contains(next)) closeMenu(); }}>
    <div className="ku-universe-rail__inner">
      <div className="ku-universe-rail__identity" aria-label="Kiwimu Universe 五站與展覽導覽">
        <span className="ku-universe-rail__wordmark">Kiwimu Universe</span>
      </div>
      <nav className="ku-universe-rail__nav" aria-label="Kiwimu Universe 站點與展覽">
        {UNIVERSE_SITES.map(site => siteLink(site))}
        {forestLink()}
        <button ref={moreRef} type="button"
          className={`ku-universe-rail__more${MOBILE_MORE_SITES.has(currentSite) ? ' is-current' : ''}`}
          aria-expanded={moreOpen} aria-controls={moreOpen ? panelId : undefined}
          onClick={() => { if (moreOpen) closeMenu(); else { measureMenu(); setMoreOpen(true); } }}>
          更多 <span aria-hidden="true">{moreOpen ? '−' : '＋'}</span>
        </button>
      </nav>
      {moreOpen ? <nav id={panelId} className="ku-universe-rail__more-panel" aria-label="更多站點與森林展覽" style={{ maxHeight: menuHeight }}>
        {UNIVERSE_SITES.filter(site => MOBILE_MORE_SITES.has(site.id)).map(site => siteLink(site, true))}
        {forestLink(true)}
      </nav> : null}
    </div>
  </aside>;
};

export default KiwimuUniverseRail;
