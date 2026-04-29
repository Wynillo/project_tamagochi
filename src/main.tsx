import React from 'react';
import { createRoot } from 'react-dom/client';

function showError(message: string) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('error-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'error-overlay';
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#1a0f2e;z-index:99999;overflow:auto;padding:16px;box-sizing:border-box;font-family:monospace;color:#ff809f;';
    document.body.appendChild(el);
  }
  const p = document.createElement('div');
  p.style.cssText = 'white-space:pre-wrap;word-break:break-word;margin-bottom:12px;border-bottom:1px solid #ff809f33;padding-bottom:12px;';
  p.textContent = message;
  el.appendChild(p);
}

function setupErrorOverlay() {
  if (typeof window === 'undefined') return;

  const origError = console.error;
  console.error = (...args: any[]) => {
    showError(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
    origError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    showError(`ERROR: ${e.message}\n${e.filename}:${e.lineno}:${e.colno}`);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason instanceof Error ? `${e.reason.message}\n${e.reason.stack}` : JSON.stringify(e.reason);
    showError(`Unhandled Promise Rejection:\n${reason}`);
  });
}

setupErrorOverlay();

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
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
