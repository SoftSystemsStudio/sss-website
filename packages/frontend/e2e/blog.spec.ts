import { test, expect } from './fixtures';

test('/blog renders its heading', async ({ page }) => {
  const response = await page.goto('/blog', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Notes for local business owners');
});

test('first post (or the empty state) renders', async ({ page }) => {
  await page.goto('/blog', { waitUntil: 'networkidle' });
  const links = page.locator('main a[href^="/blog/"]:not([href$="feed.xml"])');
  if ((await links.count()) === 0) {
    await expect(page.getByText('The first posts are on the way.')).toBeVisible();
    return;
  }
  const href = await links.first().getAttribute('href');
  expect(href).toBeTruthy();
  const slug = href!.replace(/\/$/, '').split('/').pop()!;
  const response = await page.goto(href!, { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical?.endsWith(`/blog/${slug}`)).toBe(true);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"@type":"Article"'))).toBe(true);
  await expect(page.locator('main a[href="/pricing"]').first()).toBeVisible();
});

test('/blog/feed.xml is RSS', async ({ request }) => {
  const res = await request.get('/blog/feed.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  expect(await res.text()).toContain('<rss');
});
