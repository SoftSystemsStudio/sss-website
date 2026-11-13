import { test as base, expect } from '@playwright/test';

/**
 * Console errors that are expected when the site runs without production
 * secrets. Each entry needs a comment saying why it can't be fixed instead.
 *
 * Empty on purpose: with no NEXT_PUBLIC_SENTRY_DSN, next.config.mjs skips
 * withSentryConfig entirely, so the Sentry SDK isn't loaded and logs nothing.
 * Add an entry only after checking the error really is environmental.
 */
const ALLOWED_CONSOLE_ERRORS: RegExp[] = [];

type Fixtures = {
  /** Uncaught page errors, console errors and failed same-origin requests. */
  pageProblems: string[];
};

export const test = base.extend<Fixtures>({
  pageProblems: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL ?? 'http://127.0.0.1').origin;

      // Vercel Web Analytics (app/layout.tsx) loads /_vercel/insights/script.js, which only
      // Vercel's edge serves; `next start` would 404 it and trip the same-origin check below.
      // Fulfil it with an empty script so the page still requests it but nothing else runs.
      await page.route('**/_vercel/insights/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
      );

      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (ALLOWED_CONSOLE_ERRORS.some((re) => re.test(text))) return;
        problems.push(`console.error: ${text}`);
      });
      // A broken image, font or chunk on our own origin is a real regression.
      page.on('response', (res) => {
        if (res.status() >= 400 && res.url().startsWith(origin)) {
          problems.push(`HTTP ${res.status()}: ${res.url()}`);
        }
      });
      page.on('requestfailed', (req) => {
        if (req.url().startsWith(origin)) {
          problems.push(`request failed: ${req.url()} (${req.failure()?.errorText ?? '?'})`);
        }
      });

      await use(problems);

      expect(problems, 'page errors, console errors or failed requests').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
