import { getAllPosts } from '@/lib/blog';

const SITE_URL = 'https://softsystemsstudiollc.com';

// Built once at build time, like the pages: the deployed function has no content/blog to read.
export const dynamic = 'force-static';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const rfc822 = (date: string) => new Date(`${date}T12:00:00Z`).toUTCString();

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return [
        '    <item>',
        `      <title>${esc(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${esc(post.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const lastBuild = posts.length
    ? `    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>\n`
    : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Soft Systems Studio</title>
    <link>${SITE_URL}/blog</link>
    <description>Notes for local business owners on websites, search and getting found.</description>
    <language>en-us</language>
${lastBuild}    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
