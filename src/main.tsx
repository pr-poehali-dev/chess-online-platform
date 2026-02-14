import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker, flushPendingResults } from './lib/serviceWorker';

registerServiceWorker();

window.addEventListener('online', () => {
  flushPendingResults();
});

createRoot(document.getElementById("root")!).render(<App />);