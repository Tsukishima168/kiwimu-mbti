import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import KiwimuUniverseRail from './components/KiwimuUniverseRail';
import './styles/tailwind.css';
import './styles/kiwimu-universe.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isOgRenderRoute = window.location.pathname.includes('/og-render');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {!isOgRenderRoute && <KiwimuUniverseRail currentSite="kiwimu" />}
    <App />
  </React.StrictMode>
);
