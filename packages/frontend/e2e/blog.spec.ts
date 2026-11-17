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

test('/blog advertises its RSS feed and has its own og:url', async ({ page }) => {
  await page.goto('/blog', { waitUntil: 'networkidle' });
  const rss = page.locator('link[rel="alternate"][type="application/rss+xml"]');
  await expect(rss).toHaveCount(1);
  expect(await rss.getAttribute('href')).toMatch(/\/blog\/feed\.xml$/);
  expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toMatch(/\/blog$/);
});

test('a post has one untruncated title, its own meta, heading anchors and related notes', async ({
  page,
}) => {
  await page.goto('/blog', { waitUntil: 'networkidle' });
  const links = page.locator('main a[href^="/blog/"]:not([href$="feed.xml"])');
  const count = await links.count();
  if (process.env.CI) expect(count, 'fixture post link').toBeGreaterThan(0);
  test.skip(count === 0, 'no posts in this build');
  const href = (await links.first().getAttribute('href'))!;
  await page.goto(href, { waitUntil: 'networkidle' });

  // <title>: the post title, plus the site name only when the whole fits in 60 characters.
  const h1 = (await page.getByRole('heading', { level: 1 }).textContent())!.trim();
  await expect(page.locator('head title')).toHaveCount(1);
  const title = await page.title();
  const suffix = ' | Soft Systems Studio';
  expect(title).toBe(h1.length + suffix.length <= 60 ? `${h1}${suffix}` : h1);

  const meta = (sel: string) => page.locator(sel).getAttribute('content');
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  expect((await meta('meta[name="description"]'))!.length).toBeGreaterThan(0);
  expect(await meta('meta[property="og:type"]')).toBe('article');
  expect((await meta('meta[property="og:url"]'))!.endsWith(href)).toBe(true);
  expect(await meta('meta[property="og:title"]')).toBe(h1);
  expect(await meta('meta[property="og:image"]')).toContain('/api/og?title=');
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');

  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const article = ld
    .map((t) => JSON.parse(t) as Record<string, unknown>)
    .find((j) => j['@type'] === 'Article');
  expect(article?.inLanguage).toBe('en-US');
  expect(typeof article?.wordCount).toBe('number');
  expect(article?.mainEntityOfPage).toEqual({
    '@type': 'WebPage',
    '@id': `https://softsystemsstudiollc.com${href}`,
  });

  // Every h2/h3 in the body has a unique kebab-case id.
  const ids = await page
    .locator('.blog-prose h2, .blog-prose h3')
    .evaluateAll((els) => els.map((e) => e.id));
  for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  for (const id of ids)
    expect(id.startsWith('-') || id.endsWith('-') || id.includes('--')).toBe(false);
  expect(new Set(ids).size).toBe(ids.length);
  if (href === '/blog/fixture-post') expect(ids).toContain('prices-come-from-tokens');

  // "More notes" only when there are other posts, up to 3, never the current one.
  const more = page.getByRole('navigation', { name: 'More notes' });
  if (count < 2) {
    await expect(more).toHaveCount(0);
  } else {
    await expect(more).toBeVisible();
    const related = await more
      .locator('a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related).not.toContain(href);
  }
});
