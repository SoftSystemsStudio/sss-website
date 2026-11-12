import { test, expect } from './fixtures';

/**
 * Non-page routes and the site's one lead entry point.
 *
 * This site has no forms: quote requests moved to the Lead Tool on
 * 2026-10-02, and /intake is a redirect to its sign-up page. So nothing
 * here submits anything. The redirect is checked with maxRedirects: 0,
 * which reads the Location header without ever contacting the Lead Tool.
 */
const LEAD_TOOL_START = 'https://tool.softsystemsstudiollc.com/start';

test('/hi/austin-hodges.vcf serves a vCard', async ({ request }) => {
  const res = await request.get('/hi/austin-hodges.vcf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/^text\/vcard/);
  const body = await res.text();
  expect(body.startsWith('BEGIN:VCARD\r\n')).toBe(true);
  expect(body).toContain('FN:Austin Hodges');
  expect(body.trimEnd().endsWith('END:VCARD')).toBe(true);
});

test('/hi "Save my contact" points at the vCard', async ({ page }) => {
  await page.goto('/hi');
  await expect(page.locator('a[href="/hi/austin-hodges.vcf"]').first()).toBeVisible();
});

test('/intake redirects to the Lead Tool sign-up, keeping ?type=', async ({ request }) => {
  const plain = await request.get('/intake', { maxRedirects: 0 });
  expect(plain.status()).toBe(307);
  expect(plain.headers()['location']).toBe(LEAD_TOOL_START);

  const typed = await request.get('/intake?type=Florist', { maxRedirects: 0 });
  expect(typed.status()).toBe(307);
  expect(typed.headers()['location']).toBe(`${LEAD_TOOL_START}?type=Florist`);
});

test('mangled Lead Tool links forward to tool.', async ({ request }) => {
  for (const prefix of ['q', 'p', 's']) {
    const res = await request.get(`/${prefix}/example-token`, { maxRedirects: 0 });
    expect(res.status(), prefix).toBe(307);
    expect(res.headers()['location']).toBe(
      `https://tool.softsystemsstudiollc.com/${prefix}/example-token`,
    );
  }
});

test('exact-match domains forward to their town page', async ({ request }) => {
  // Host-matched redirects (next.config.mjs CITY_DOMAINS). maxRedirects: 0
  // reads the Location header without following it off to the live site.
  const cases: [string, string][] = [
    ['columbusgawebdesign.com', 'columbus-ga'],
    ['www.columbusgawebdesign.com', 'columbus-ga'],
    ['phenixcitywebdesign.com', 'phenix-city-al'],
    ['auburnalwebdesign.com', 'auburn-al'],
    ['opelikawebdesign.com', 'opelika-al'],
    ['smithsstationwebdesign.com', 'smiths-station-al'],
  ];
  for (const [host, slug] of cases) {
    const res = await request.get('/anything', { maxRedirects: 0, headers: { host } });
    expect(res.status(), host).toBe(308);
    expect(res.headers()['location'], host).toBe(
      `https://softsystemsstudiollc.com/web-design/${slug}`,
    );
  }
});

test('sitemap lists every town page', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const slug of [
    'columbus-ga',
    'phenix-city-al',
    'auburn-al',
    'opelika-al',
    'smiths-station-al',
  ]) {
    expect(xml, slug).toContain(`https://softsystemsstudiollc.com/web-design/${slug}`);
  }
});

test('home page has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, 'document wider than the viewport').toBeLessThanOrEqual(innerWidth);
});
