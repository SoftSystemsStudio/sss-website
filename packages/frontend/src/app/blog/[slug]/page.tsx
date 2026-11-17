import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar, Footer, Section } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { getAllPosts, getPost } from '@/lib/blog';
import { formatPostDate } from '@/lib/blog-format';
import { CITY_PAGES, cityLabel } from '@/lib/cities';

// Only posts in the content dir exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;

  return (
    <>
      <ArticleSchema
        title={post.title}
        description={post.description}
        path={path}
        datePublished={post.date}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path },
        ]}
      />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Section className="pb-10 pt-8 sm:pt-12 lg:pb-14 lg:pt-16">
          <p className="rise text-[15px] text-ink-muted [--rise-delay:0.05s]">
            <Link href="/blog" className="link-underline">
              Blog
            </Link>
            {' · Soft Systems Studio · '}
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
          <h1 className="rise mt-4 max-w-[900px] text-balance font-serif text-[40px] leading-[1] tracking-[-0.015em] [--rise-delay:0.1s] sm:text-[60px] lg:text-[72px]">
            {post.title}
          </h1>
          <p className="rise mt-6 max-w-[680px] font-serif text-[24px] italic leading-snug text-ink-muted [--rise-delay:0.18s] sm:text-[28px]">
            {post.description}
          </p>
        </Section>

        <Section className="border-t border-line-soft pb-16 pt-10 lg:pb-24">
          <article className="max-w-[720px]">
            {/* Already sanitized by renderMarkdown (lib/blog.ts). */}
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

            <aside className="mt-14 border-t border-line pt-6">
              <h2 className="font-serif text-[28px] leading-tight">Sources</h2>
              <ul className="mt-3 space-y-2 text-[16px] text-ink-soft">
                {post.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      rel="noopener"
                      className="link-underline break-words font-semibold"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>

            <p className="mt-10 text-[17px] text-ink-soft">
              Wondering what a site would cost you?{' '}
              <Link href="/pricing" className="link-underline font-semibold">
                See every price
              </Link>
              .
            </p>
            <p className="mt-3 text-[17px] text-ink-soft">
              Meeting in person around:{' '}
              {CITY_PAGES.map((city, i) => (
                <span key={city.slug}>
                  {i > 0 && ', '}
                  <Link href={`/web-design/${city.slug}`} className="link-underline font-semibold">
                    {cityLabel(city)}
                  </Link>
                </span>
              ))}
              .
            </p>
          </article>
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
