import { test, expect } from './fixtures';

/**
 * One smoke test per page route: it returns 200, shows its real heading,
 * throws nothing in the browser (see fixtures.ts), and has a footer.
 *
 * Headings are copied from the page source; if a page's copy changes on
 * purpose, update the string here.
 */
type PageCase = {
  path: string;
  heading: string | RegExp;
  /** Pages built with components/ui/Footer.tsx carry Privacy and Terms links. */
  siteFooter: boolean;
};

const PAGES: PageCase[] = [
  { path: '/', heading: 'You built the business.', siteFooter: true },
  { path: '/about', heading: 'One person.', siteFooter: true },
  { path: '/pricing', heading: 'Pay for the site', siteFooter: true },
  { path: '/privacy', heading: 'Privacy Policy', siteFooter: true },
  { path: '/terms', heading: 'Terms of Service', siteFooter: true },
  { path: '/hi', heading: 'Austin Hodges', siteFooter: true },
  // Outreach-only trade page; slug from lib/trades.ts.
  { path: '/for/lawn-care', heading: 'Websites for lawn care companies.', siteFooter: true },
  // The /demo/* pages are fictional businesses with their own footers (no
  // studio Privacy/Terms links), so only the footer's presence is checked.
  { path: '/demo/green-bench', heading: 'Yards worth walking home to.', siteFooter: false },
  { path: '/demo/ironwood-auto', heading: /Honest work,\s*plainly explained\./, siteFooter: false },
  { path: '/demo/kettle-and-grain', heading: /Coffee,\s*unhurried\./, siteFooter: false },
  { path: '/demo/mayhaw', heading: 'Flowers for the days that matter', siteFooter: false },
];

for (const { path, heading, siteFooter } of PAGES) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status(), `status of ${path}`).toBe(200);

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(heading);

    const footer = page.locator('footer').last();
    await expect(footer).toBeVisible();

    if (siteFooter) {
      // Compliance item 14: legal name, current year and a contact email.
      await expect(footer).toContainText(`© ${new Date().getFullYear()} Soft Systems Studio LLC`);
      await expect(footer.locator('a[href^="mailto:"]').first()).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Privacy', exact: true })).toHaveAttribute(
        'href',
        '/privacy',
      );
      await expect(footer.getByRole('link', { name: 'Terms', exact: true })).toHaveAttribute(
        'href',
        '/terms',
      );
    }
  });
}

test('unknown routes return the 404 page', async ({ request }) => {
  // request (not page) so the expected 404 isn't counted as a page problem.
  for (const path of ['/this-page-does-not-exist', '/for/not-a-real-trade']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(404);
    expect(await res.text()).toContain('doesn’t exist.');
  }
});
