import fs from 'node:fs';
import path from 'node:path';
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
  // CI builds with the fixture dir, so an empty index there means BLOG_CONTENT_DIR was lost.
  if (process.env.CI) expect(await links.count(), 'fixture post link').toBeGreaterThan(0);
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
  // Posts are the studio's, with no personal byline.
  await expect(page.locator('main')).toContainText('Soft Systems Studio');
  await expect(page.locator('main article')).not.toContainText('Austin');
  await expect(page.locator('main a[href="/pricing"]').first()).toBeVisible();
  // Each post links to the town pages, and the visible breadcrumb matches the footer's "Blog".
  await expect(page.locator('main a[href="/web-design/columbus-ga"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/blog"]').first()).toHaveText('Blog');
});

test('/blog/feed.xml is RSS', async ({ request }) => {
  const res = await request.get('/blog/feed.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  expect(await res.text()).toContain('<rss');
});

// Production functions don't carry content/blog (the reads are turbopackIgnore'd, so the
// file trace skips them), so a feed built at request time would always be empty there.
// It must be prerendered at build time, like the pages and the sitemap.
test('/blog/feed.xml is prerendered at build time with the posts', async ({ request }) => {
  const body = path.join(process.cwd(), '.next/server/app/blog/feed.xml.body');
  expect(fs.existsSync(body), 'prerendered feed').toBe(true);
  const built = fs.readFileSync(body, 'utf8');
  const served = await (await request.get('/blog/feed.xml')).text();
  expect(served).toBe(built);
  const links = await request.get('/blog').then((r) => r.text());
  if (links.includes('href="/blog/fixture-post"')) {
    expect(built).toContain('/blog/fixture-post</link>');
  }
});
