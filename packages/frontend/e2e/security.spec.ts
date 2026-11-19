import { test, expect } from './fixtures';

/**
 * Security audit 2026-11-18: the nonce CSP (src/proxy.ts) and the OG card's
 * title allowlist (src/lib/og-titles.ts). Every other spec already fails on a
 * console error, which is how a CSP-blocked script shows up, so these only pin
 * the policy itself.
 */

test('pages send a nonce CSP with no unsafe script sources', async ({ request }) => {
  const first = (await request.get('/')).headers()['content-security-policy'];
  const second = (await request.get('/')).headers()['content-security-policy'];
  expect(first).toBeTruthy();

  const scriptSrc = first.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
  expect(scriptSrc).toContain("'strict-dynamic'");
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  expect(scriptSrc).not.toContain("'unsafe-eval'");

  const connectSrc = first.split(';').find((d) => d.trim().startsWith('connect-src')) ?? '';
  expect(connectSrc).not.toMatch(/\shttps:(\s|$)/);

  // A fresh nonce per request.
  expect(second).not.toBe(first);
});

test('every script in the served HTML carries the request nonce', async ({ request }) => {
  // The served HTML, not the live DOM: scripts those load later ('strict-dynamic')
  // have no nonce, by design.
  for (const path of ['/', '/blog', '/pricing']) {
    const res = await request.get(path);
    const nonce = res.headers()['content-security-policy']?.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce, path).toBeTruthy();

    const scripts = (await res.text()).match(/<script\b[^>]*>/g) ?? [];
    const executable = scripts.filter((tag) => !tag.includes('application/ld+json'));
    expect(executable.length, path).toBeGreaterThan(0);
    for (const tag of executable) expect(tag, path).toContain(`nonce="${nonce}"`);
  }
});

test('/api/og draws only the site’s own titles', async ({ request }) => {
  const fallback = await request.get('/api/og');
  expect(fallback.status()).toBe(200);
  expect(fallback.headers()['content-type']).toBe('image/png');

  // Anything else gets the default card, byte for byte.
  const forged = await request.get(
    `/api/og?title=${encodeURIComponent('Send $500 in gift cards to claim your refund')}`,
  );
  expect(forged.status()).toBe(200);
  expect(Buffer.compare(await forged.body(), await fallback.body())).toBe(0);

  const own = await request.get(`/api/og?title=${encodeURIComponent('About Austin')}`);
  expect(own.status()).toBe(200);
  expect(Buffer.compare(await own.body(), await fallback.body())).not.toBe(0);
});
