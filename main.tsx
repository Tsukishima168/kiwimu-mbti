import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import KiwimuUniverseRail, { readSupabaseLoginStatus } from './components/KiwimuUniverseRail';
import { trackEvent } from './utils/crossSiteTracking';
import { getAuthSupabaseClient } from './utils/supabaseAuthBridge';
import './styles/tailwind.css';
import './styles/kiwimu-universe.css';
import './styles/kiwimu-site.css';
import PwaUpdateNotice from './components/PwaUpdateNotice';
import { startPwaUpdateMonitor } from './utils/pwaUpdates';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isOgRenderRoute = window.location.pathname.includes('/og-render');
if (!isOgRenderRoute) startPwaUpdateMonitor();

// Read-only login lookup for the rail's `login_status` field (no side effects).
const getRailLoginStatus = () => readSupabaseLoginStatus(getAuthSupabaseClient());

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {!isOgRenderRoute && (
      <KiwimuUniverseRail
        currentSite="kiwimu"
        fromParam="mbti_universe_nav"
        tagCurrentSite
        onTrack={trackEvent}
        getLoginStatus={getRailLoginStatus}
      />
    )}
    <App />
    {!isOgRenderRoute && <PwaUpdateNotice />}
  </React.StrictMode>
);
