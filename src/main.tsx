import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/installPrompt';
import { registerServiceWorker, flushPendingResults } from './lib/serviceWorker';

registerServiceWorker();

// Блокируем поворот экрана на мобильных — всегда портретная ориентация
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}

window.addEventListener('online', () => {
  flushPendingResults();
});

createRoot(document.getElementById("root")!).render(<App />);