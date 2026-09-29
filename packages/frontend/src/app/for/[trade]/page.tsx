import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import ShowcaseParallax from '@/components/ShowcaseParallax';
import ConceptCard from '@/components/ConceptCard';
import { PhoneFrame } from '@/components/DeviceFrames';
import { getConcept } from '@/lib/concepts';
import { TRADES, getTrade, quoteHref } from '@/lib/trades';
import { BUILD_FEE, HOME_BASE, RETAINER_MIN, WEBSITE_FEATURES } from '@/lib/business';

// Only the trades in lib/trades.ts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return TRADES.map((trade) => ({ trade: trade.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>;
}): Promise<Metadata> {
  const trade = getTrade((await params).trade);
  if (!trade) return {};
  const title = `Websites for ${trade.audience}`;
  const description = `${trade.promise} Custom one-page websites for ${trade.audience}, anywhere: a flat ${BUILD_FEE}, designed and written by one person.`;
  const ogImage = `/api/og?title=${encodeURIComponent(`${title}.`)}`;
  return {
    title,
    description,
    alternates: { canonical: `/for/${trade.slug}` },
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';

export default async function TradePage({ params }: { params: Promise<{ trade: string }> }) {
  const trade = getTrade((await params).trade);
  if (!trade) notFound();
  const concept = getConcept(trade.conceptSlug);
  const quote = quoteHref(trade);
  const otherTrades = TRADES.filter((t) => t.slug !== trade.slug);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar ctaHref={quote} />

      <main id="main-content">
        {/* Hero */}
        <Section
          className="pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16"
          innerClassName="grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16"
        >
          <div>
            <p className={`rise ${EYEBROW}`}>Soft Systems Studio</p>
            <h1 className="rise mt-5 font-serif text-[52px] leading-[0.94] tracking-[-0.015em] [--rise-delay:0.1s] sm:mt-7 sm:text-[72px] lg:text-[88px]">
              Websites for {trade.audience}.
            </h1>
            <p className="rise mt-4 font-serif text-[28px] italic leading-tight text-ink-muted [--rise-delay:0.18s] sm:text-[36px]">
              {trade.promise}
            </p>
            <p className="rise mt-7 max-w-[560px] text-[17px] leading-[1.55] text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
              {trade.intro} One flat price of {BUILD_FEE}.
            </p>
            <div className="rise mt-8 flex flex-col gap-4 [--rise-delay:0.35s] sm:flex-row sm:items-center sm:gap-8">
              <Button as="link" href={quote} variant="primary" size="lg">
                Get a quote
                <span className="nudge ml-2" aria-hidden="true">
                  →
                </span>
              </Button>
              <Link
                href={concept.href}
                className="link-underline self-start font-semibold sm:self-auto"
              >
                See the {concept.type.toLowerCase()} concept
              </Link>
            </div>
          </div>
          <ShowcaseParallax className="rise relative mx-auto w-full max-w-[420px] [--rise-delay:0.45s] lg:max-w-none">
            <div className="relative overflow-hidden rounded-md bg-limestone px-10 pt-10 sm:px-16 sm:pt-14">
              <div className="mx-auto w-[220px] translate-y-6 sm:w-[240px]">
                <PhoneFrame
                  src={concept.mobileImage}
                  alt={`The ${concept.name} concept site on a phone`}
                  eager
                  depth={14}
                  sizes="240px"
                />
              </div>
            </div>
          </ShowcaseParallax>
        </Section>

        {/* What the site needs to do */}
        <Section className="border-t border-line-soft py-20 lg:py-[120px]">
          <h2 className="reveal max-w-4xl text-balance font-serif text-[44px] leading-[0.98] tracking-[-0.015em] sm:text-[60px] lg:text-[72px]">
            What a website for {trade.audience} <em>has to do.</em>
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 lg:mt-14 lg:gap-14">
            {trade.needs.map((need) => (
              <div key={need.title} className="reveal border-t border-ink pt-6">
                <h3 className="font-serif text-[32px] leading-tight">{need.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{need.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* The concept */}
        <Section className="bg-limestone py-20 lg:py-[120px]">
          <ConceptCard concept={concept} wide heading="h2" className="reveal">
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              A concept site I designed and built for an invented business, to show what this looks
              like in practice. Yours would be built around your business, your photos and your
              customers.
            </p>
          </ConceptCard>
        </Section>

        {/* Price */}
        <Section
          className="py-20 lg:py-[120px]"
          innerClassName="grid gap-12 lg:grid-cols-2 lg:gap-28"
        >
          <div className="reveal">
            <p className={EYEBROW}>The build</p>
            <p className="mt-5 font-serif text-[112px] leading-[0.82] tracking-[-0.03em] sm:text-[160px]">
              {BUILD_FEE}
              <em className="text-[40px] tracking-normal text-ink-muted sm:text-[56px]">, once.</em>
            </p>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ink-soft">
              Care Plans from {RETAINER_MIN}/month cover hosting and edits after launch, and they’re
              optional. I’m based in {HOME_BASE} and work with {trade.audience} anywhere, by phone,
              email and video.
            </p>
            <Link href="/#pricing" className="link-underline mt-6 inline-block font-semibold">
              Pricing details
            </Link>
          </div>
          <ul className="reveal self-end border-t border-line">
            {WEBSITE_FEATURES.map((feature) => (
              <li key={feature} className="border-b border-line py-3.5 text-[17px]">
                {feature}
              </li>
            ))}
          </ul>
        </Section>

        <QuoteCta href={quote} />

        {/* Other trades */}
        <Section className="bg-ink py-10 text-on-ink surface-ink">
          <p className="text-[15px]">
            Also:{' '}
            {otherTrades.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && ' · '}
                <Link href={`/for/${t.slug}`} className="nav-link text-paper">
                  websites for {t.audience}
                </Link>
              </span>
            ))}
          </p>
        </Section>
      </main>

      <Footer />
    </>
  );
}
