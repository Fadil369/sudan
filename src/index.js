import React from 'react';
import ReactDOM from 'react-dom/client';
import SudanGovPortal from './pages/SudanGovPortal';
import AuthProvider from './components/AuthProvider';
import SecureErrorBoundary from './components/SecureErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import auditLogger from './security/AuditLogger';

// Initialize audit logging
auditLogger.logSystemEvent('STARTUP', {
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SecureErrorBoundary>
      <AuthProvider>
        <SudanGovPortal />
      </AuthProvider>
    </SecureErrorBoundary>
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
