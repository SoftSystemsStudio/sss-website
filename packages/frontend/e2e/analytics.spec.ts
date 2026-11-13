import { test, expect } from './fixtures';

// Compliance standard item 5: cookieless analytics need no consent banner, but only while the
// site itself still sets no cookies and writes nothing to browser storage. The Vercel script is
// stubbed in fixtures.ts, so this guards our own code; the real script is checked on a deployed
// preview (Network tab on a fresh profile).
test('page views are counted without cookies or browser storage', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (req) => requested.push(new URL(req.url()).pathname));

  await page.goto('/');

  await expect.poll(() => requested).toContain('/_vercel/insights/script.js');
  expect(await page.evaluate(() => document.cookie)).toBe('');
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
  expect(await page.evaluate(() => window.sessionStorage.length)).toBe(0);
});
