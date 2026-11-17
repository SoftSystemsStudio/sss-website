import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer, Section } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import { BreadcrumbSchema } from '@/components/StructuredData';
import { getAllPosts } from '@/lib/blog';
import { formatPostDate } from '@/lib/blog-format';

const TITLE = 'Notes for local business owners';
const DESCRIPTION =
  'Plain-English notes on websites, search and getting found, for local business owners. Notes from Soft Systems Studio.';
const OG_IMAGE = `/api/og?title=${encodeURIComponent(TITLE)}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/blog/feed.xml' } },
  // A page's openGraph replaces the layout's, so url, siteName and locale are repeated here.
  openGraph: {
    type: 'website',
    url: '/blog',
    siteName: 'Soft Systems Studio',
    locale: 'en_US',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Section className="pb-12 pt-8 sm:pt-12 lg:pb-16 lg:pt-16">
          <h1 className="rise font-serif text-[48px] leading-[0.96] tracking-[-0.015em] [--rise-delay:0.1s] sm:text-[72px] lg:text-[88px]">
            {TITLE}
          </h1>
          <p className="rise mt-6 max-w-[640px] text-[17px] leading-[1.55] text-ink-soft [--rise-delay:0.2s] sm:text-[21px]">
            {DESCRIPTION}
          </p>
        </Section>

        <Section className="border-t border-line-soft pb-20 pt-4 lg:pb-[120px]">
          {posts.length === 0 ? (
            <p className="py-10 text-[17px] text-ink-soft">The first posts are on the way.</p>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.slug} className="border-b border-line-soft py-8">
                  <p className="text-[15px] text-ink-muted">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  </p>
                  <h2 className="mt-2 font-serif text-[32px] leading-tight sm:text-[40px]">
                    <Link href={`/blog/${post.slug}`} className="link-underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-[680px] text-[17px] leading-relaxed text-ink-soft">
                    {post.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
