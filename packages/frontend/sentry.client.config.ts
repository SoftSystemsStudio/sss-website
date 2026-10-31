/**
 * Sentry Client-Side Configuration
 *
 * This file configures the Sentry SDK for client-side (browser) error tracking.
 * It captures JavaScript errors only. Session replay and performance tracing
 * are deliberately off: the privacy policy says Sentry is used for error
 * monitoring only (compliance audit 2026-10-31). Keep the two in step.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment and release identification
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_RELEASE_VERSION,

  // Error monitoring only: no performance tracing, no session replay.
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Enable Sentry (set to true to test in development)
  enabled: true,

  // Debug mode for development (set to true to see Sentry logs)
  debug: process.env.NODE_ENV === 'development',

  // Filter out common browser errors that are not actionable
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'NetworkError',
    'net::ERR_',
    'AbortError',
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Common benign errors
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'Script error',
    // User-caused errors
    'Request aborted',
    'cancelled',
  ],

  // URLs to ignore from error tracking
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    // Facebook/social widgets
    /graph\.facebook\.com/i,
    /connect\.facebook\.net/i,
    // Analytics
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],

  // Scrub sensitive data from events before sending
  beforeSend(event, hint) {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry] Sending event:', hint.originalException);
    }

    // Scrub sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
          try {
            const urlString = String(breadcrumb.data.url);
            const url = new URL(urlString, window.location.origin);
            const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth', 'api_key'];
            sensitiveParams.forEach((param) => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
              }
            });
            breadcrumb.data.url = url.toString();
          } catch {
            // Ignore URL parsing errors
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // No Replay or BrowserTracing integration (see the header comment).
  integrations: [],
});
