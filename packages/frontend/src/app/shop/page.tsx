import type { Metadata } from 'next';
import { OG_TITLES, ogImage } from '@/lib/og-titles';
import { Navbar, Footer, Section } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import { GUMROAD_STORE_URL, SHOP_PRODUCTS } from '@/lib/business';

const TITLE = OG_TITLES.shop;
const DESCRIPTION =
  'Checklists and fill-in-the-blank templates for local business owners from Soft Systems Studio. Download them from my Gumroad store.';
const OG_IMAGE = ogImage(OG_TITLES.shop);

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/shop' },
  openGraph: {
    type: 'website',
    siteName: 'Soft Systems Studio',
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

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';

export default function ShopPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Section className="pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
          <p className={`rise ${EYEBROW}`}>Shop</p>
          <h1 className="rise mt-5 font-serif text-[56px] [--rise-delay:0.1s] leading-[0.92] tracking-[-0.015em] sm:mt-8 sm:text-[80px] lg:text-[108px]">
            Templates and <br className="hidden sm:inline" />
            <em>checklists.</em>
          </h1>
          <p className="rise mt-8 max-w-3xl text-lg leading-relaxed text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
            Things I wrote for local business owners who’d rather do some of the work themselves.
            Each one opens on my Gumroad store, which handles the download and any payment and asks
            for your email address to send you the files.
          </p>
        </Section>

        <Section className="border-t border-line-soft py-20 lg:py-[120px]">
          <ul className="grid gap-10 md:grid-cols-2 md:gap-x-14" aria-label="Products">
            {SHOP_PRODUCTS.map((product) => (
              <li
                key={product.url}
                className="reveal flex flex-col border-t border-ink pt-6"
                data-testid="shop-product"
              >
                <p className="text-[15px] font-semibold text-ink-muted">{product.price}</p>
                <h2 className="mt-2 font-serif text-[32px] leading-tight sm:text-[36px]">
                  {product.name}
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
                  {product.description}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{product.format}</p>
                <a
                  href={product.url}
                  rel="noopener"
                  className="link-underline mt-6 self-start text-lg font-semibold"
                >
                  {product.cta}{' '}
                  <span className="nudge" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="reveal mt-16 text-[17px] leading-relaxed text-ink-soft">
            You can also browse{' '}
            <a href={GUMROAD_STORE_URL} rel="noopener" className="link-underline font-semibold">
              my whole Gumroad store
            </a>
            .
          </p>
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
