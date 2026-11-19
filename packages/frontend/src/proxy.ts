import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '@/lib/env';

/**
 * Content Security Policy with a fresh nonce per request (security audit
 * 2026-11-18). Replaces the old static policy in next.config.mjs, which needed
 * 'unsafe-inline' and 'unsafe-eval' for scripts and let the page connect to
 * any https: host.
 *
 * Next reads the nonce from the request's CSP header while rendering and puts
 * it on its own scripts (docs: node_modules/next/dist/docs/01-app/02-guides/
 * content-security-policy.md). A nonce only works on a page rendered per
 * request, so app/layout.tsx opts every page into dynamic rendering.
 *
 * 'strict-dynamic' lets a nonced script load further scripts (Next's chunks,
 * Vercel Analytics' /_vercel/insights/script.js), and nothing else.
 *
 * connect-src lists every host the browser talks to: this origin (Analytics
 * beacons to /_vercel/insights, Sentry's /monitoring tunnel) and Sentry's
 * ingest hosts in case the tunnel is ever off. Add a host here before adding
 * anything that calls it from the browser.
 *
 * style-src keeps 'unsafe-inline': React style={} attributes and next/font
 * need it, and a nonce in style-src would switch 'unsafe-inline' off.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    // Fonts are self-hosted (src/fonts via next/font/local); no Google Fonts origins.
    "font-src 'self' data:",
    `connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io${
      isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''
    }`,
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, getEnv().NODE_ENV === 'development');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Pages only: skip API routes, Next's static files and image optimizer,
    // the Sentry tunnel, Vercel's own paths, and any path with a file
    // extension (images, fonts, robots.txt, sitemap.xml, feed.xml, .vcf).
    {
      source: '/((?!api/|_next/static|_next/image|monitoring|_vercel|.*\\.[a-zA-Z0-9]+$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
