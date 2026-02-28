import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import process from 'process';
import App from './App';
import auditLogger from './security/AuditLogger';

// Polyfills for crypto-browserify
window.Buffer = Buffer;
window.process = process;

// Initialize audit logging
auditLogger.logSystemEvent('STARTUP', {
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  timestamp: new Date().toISOString()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enhanced error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[SECURITY] Unhandled promise rejection:', event.reason);
  auditLogger.logError(new Error(event.reason), {
    type: 'unhandled_promise_rejection',
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handling for global errors
window.addEventListener('error', (event) => {
  console.error('[SECURITY] Global error:', event.error);
  auditLogger.logError(event.error, {
    type: 'global_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

// Register service worker (handled by vite-plugin-pwa)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  });
}
