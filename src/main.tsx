import React from 'react';
import { createRoot } from 'react-dom/client';

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

async function init() {
  await registerServiceWorker();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  
  const { App } = await import('./App');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init().catch(console.error);
