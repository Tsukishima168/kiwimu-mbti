'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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

export const KiwimuUniverseRail: React.FC<KiwimuUniverseRailProps> = ({
  currentSite,
  authClient,
  onTrack,
}) => {
  const railRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const morePanelId = useId();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreMaxHeight, setMoreMaxHeight] = useState<number>();
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

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!isMoreOpen || !rail) return undefined;

    const measureSpace = () => {
      // Text enlargement can make the rail taller than its usual 3rem.
      setMoreMaxHeight(Math.max(0, Math.floor(window.innerHeight - rail.getBoundingClientRect().bottom - 16)));
    };
    measureSpace();
    const observer = new ResizeObserver(measureSpace);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [isMoreOpen]);

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !railRef.current?.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setIsMoreOpen(false);
      moreButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithEscape, true);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithEscape, true);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    const closeOnResize = () => setIsMoreOpen(false);
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

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

  useEffect(() => {
    const centerCurrentSite = () => {
      const nav = navRef.current;

      if (!nav || !window.matchMedia('(max-width: 640px)').matches) return;

      const currentLink = nav.querySelector<HTMLElement>('[aria-current="page"]');

      if (!currentLink) return;

      nav.scrollLeft = Math.max(
        0,
        currentLink.offsetLeft - (nav.clientWidth - currentLink.clientWidth) / 2,
      );
    };

    const animationFrame = window.requestAnimationFrame(centerCurrentSite);
    window.addEventListener('resize', centerCurrentSite);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', centerCurrentSite);
    };
  }, [currentSite]);

  return (
    <aside
      ref={railRef}
      className={`ku-universe-rail${isMoreOpen ? ' is-menu-open' : ''}`}
      data-current-site={currentSite}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsMoreOpen(false);
      }}
    >
      <div className="ku-universe-rail__inner">
        <div className="ku-universe-rail__identity" aria-label="Kiwimu Universe 五站導覽">
          <span className="ku-universe-rail__orbit" aria-hidden="true">
            {UNIVERSE_SITES.map((site) => (
              <span
                key={site.id}
                className={site.id === currentSite ? 'is-current' : undefined}
              />
            ))}
          </span>
          <span className="ku-universe-rail__wordmark">Kiwimu Universe</span>
          <span className="ku-universe-rail__meta">05 connected sites</span>
        </div>

        <nav ref={navRef} className="ku-universe-rail__nav" aria-label="Kiwimu Universe 站點與展覽">
          {UNIVERSE_SITES.map((site, index) => {
            const isCurrent = site.id === currentSite;

            return (
              <a
                key={site.id}
                href={site.href}
                className={`ku-universe-rail__link${isCurrent ? ' is-current' : ''}${MOBILE_MORE_SITES.has(site.id) ? ' ku-universe-rail__link--mobile-more' : ''}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => trackNavigation(site.id)}
              >
                <span className="ku-universe-rail__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="ku-universe-rail__label">{site.label}</span>
                <span className="ku-universe-rail__descriptor">{site.descriptor}</span>
              </a>
            );
          })}
          <a
            href={FOREST_EXHIBITION_URL}
            className="ku-universe-rail__link ku-universe-rail__link--showcase"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={FOREST_EXHIBITION_LABEL}
          >
            <span className="ku-universe-rail__index" aria-hidden="true">↗</span>
            <span className="ku-universe-rail__label">森林展覽</span>
            <span className="ku-universe-rail__descriptor">臺灣森林 ↗</span>
          </a>
          <button
            ref={moreButtonRef}
            className="ku-universe-rail__more-button"
            type="button"
            aria-expanded={isMoreOpen}
            aria-controls={isMoreOpen ? morePanelId : undefined}
            onClick={() => setIsMoreOpen((open) => !open)}
          >
            更多 <span aria-hidden="true">{isMoreOpen ? '−' : '＋'}</span>
          </button>
        </nav>
        {isMoreOpen && (
          <nav
            id={morePanelId}
            className="ku-universe-rail__more-panel"
            style={{ maxHeight: moreMaxHeight }}
            aria-label="更多站點與森林展覽"
          >
            {UNIVERSE_SITES.filter((site) => MOBILE_MORE_SITES.has(site.id)).map((site) => (
              <a
                key={site.id}
                href={site.href}
                aria-current={site.id === currentSite ? 'page' : undefined}
                onClick={() => {
                  trackNavigation(site.id);
                  setIsMoreOpen(false);
                }}
              >
                <span>{site.descriptor}</span>
                <span className="ku-universe-rail__more-caption">{site.label}</span>
              </a>
            ))}
            <a
              href={FOREST_EXHIBITION_URL}
              className="ku-universe-rail__more-exhibition"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={FOREST_EXHIBITION_LABEL}
              onClick={() => setIsMoreOpen(false)}
            >
              <span>森林展覽 <span aria-hidden="true">↗</span></span>
              <span className="ku-universe-rail__more-caption">島嶼之上｜臺灣森林冠層</span>
            </a>
          </nav>
        )}
      </div>
    </aside>
  );
};

export default KiwimuUniverseRail;
