import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import Faq from '@/components/Faq';
import QuoteCta from '@/components/QuoteCta';
import { CityServiceSchema, FAQSchema } from '@/components/StructuredData';
import { CITY_PAGES, cityLabel, getCity } from '@/lib/cities';
import {
  ADD_ONS_FROM,
  BUILD_FROM,
  HOME_BASE,
  RETAINER_MIN,
  WEBSITE_FEATURES,
  getPackage,
} from '@/lib/business';

// Only the towns in lib/cities.ts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return CITY_PAGES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const city = getCity((await params).city);
  if (!city) return {};
  const title = `Web design in ${cityLabel(city)}`;
  const description = `${city.promise} I design, write and build websites for ${city.name} businesses. One-page sites from ${BUILD_FROM}, every price published.`;
  const ogImage = `/api/og?title=${encodeURIComponent(`Web design in ${city.name}`)}`;
  return {
    title,
    description,
    alternates: { canonical: `/web-design/${city.slug}` },
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

const NEEDS = [
  {
    title: 'Found on a phone',
    body: 'Most people look a business up on their phone first. Every site I build is designed for that screen before any other.',
  },
  {
    title: 'One tap to call',
    body: 'Your phone number, hours and location where people look first, with tap-to-call on phones.',
  },
  {
    title: 'Yours to keep',
    body: 'Launched on a domain registered in your own name, so the site is yours whoever hosts it.',
  },
];

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = getCity((await params).city);
  if (!city) notFound();
  const path = `/web-design/${city.slug}`;
  const otherTowns = CITY_PAGES.filter((c) => city.nearby.includes(c.slug));
  const starter = getPackage('starter');
  const business = getPackage('business');
  const growth = getPackage('growth');

  const faqs = [
    {
      question: `How much does a website cost in ${city.name}?`,
      answer: `The price depends on the size of the site, not where you are. A one-page site is ${starter.price}, up to 5 pages is ${business.price}, and up to 12 pages with online booking, payments or a blog is ${growth.price}. Each package covers the design, the writing, the build and launch on your own domain. Add-ons start at ${ADD_ONS_FROM}, and every price is on the pricing page.`,
    },
    {
      question: `Can we meet in person in ${city.name}?`,
      answer:
        city.slug === 'smiths-station-al'
          ? `Yes. ${HOME_BASE} is where I’m based, so it’s an easy one. If you’d rather skip the meeting, phone and video work just as well.`
          : `Yes. I’m based in ${HOME_BASE} and meet clients in person around ${city.name}. If you’d rather skip the drive, phone and video work just as well.`,
    },
    {
      question: `Will my site show up in ${city.name} searches?`,
      answer: `I can’t promise a ranking, and nobody honest can. Every package includes basic on-page SEO, so search engines can tell what you do and where you are. The ${growth.name} package also adds a page for each town you serve. Care Plans start at ${RETAINER_MIN}/month and keep the site hosted and up to date.`,
    },
  ];

  return (
    <>
      <CityServiceSchema
        name={city.name}
        state={city.state}
        stateCode={city.stateCode}
        path={path}
      />
      <FAQSchema faqs={faqs} />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <Section className="pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
          <h1 className="rise font-serif text-[52px] leading-[0.94] tracking-[-0.015em] [--rise-delay:0.1s] sm:text-[72px] lg:text-[96px]">
            Web design in {city.name}, {city.state}
          </h1>
          <p className="rise mt-5 font-serif text-[28px] italic leading-tight text-ink-muted [--rise-delay:0.18s] sm:text-[36px]">
            {city.promise}
          </p>
          <p className="rise mt-7 max-w-[640px] text-[17px] leading-[1.55] text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
            {city.intro}
          </p>
          <div className="rise mt-8 flex flex-col gap-4 [--rise-delay:0.35s] sm:flex-row sm:items-center sm:gap-8">
            <Button as="anchor" href="/intake" variant="primary" size="lg">
              Get a quote
              <span className="nudge ml-2" aria-hidden="true">
                →
              </span>
            </Button>
            <Link href="/pricing" className="link-underline self-start font-semibold sm:self-auto">
              See every price
            </Link>
          </div>
        </Section>

        {/* Why a site matters here */}
        <Section
          className="border-t border-line-soft py-20 lg:py-[120px]"
          innerClassName="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20"
        >
          <h2 className="reveal text-balance font-serif text-[40px] leading-[1] tracking-[-0.015em] sm:text-[56px] lg:text-[64px]">
            A website for a business in <em>{city.name}</em>
          </h2>
          <div className="reveal space-y-5 text-[17px] leading-relaxed text-ink-soft sm:text-lg">
            {city.angle.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section className="bg-limestone py-20 lg:py-[100px]">
          <div className="grid gap-10 md:grid-cols-3 lg:gap-14">
            {NEEDS.map((need) => (
              <div key={need.title} className="reveal border-t border-ink pt-6">
                <h3 className="font-serif text-[32px] leading-tight">{need.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{need.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Price */}
        <Section
          className="py-20 lg:py-[120px]"
          innerClassName="grid gap-12 lg:grid-cols-2 lg:gap-28"
        >
          <div className="reveal">
            <p className="font-serif text-[112px] leading-[0.82] tracking-[-0.03em] sm:text-[160px]">
              <em className="mr-3 text-[40px] tracking-normal text-ink-muted sm:text-[56px]">
                from
              </em>
              {BUILD_FROM}
            </p>
            <p className="mt-14 max-w-md text-[17px] leading-relaxed text-ink-soft sm:mt-16">
              That’s a one-page site. More pages, online booking or payments cost more, and every
              price is published. Care Plans from {RETAINER_MIN}/month cover hosting and edits after
              launch, and they’re optional.
            </p>
            <Link href="/pricing" className="link-underline mt-6 inline-block font-semibold">
              What each package includes
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

        {/* FAQ */}
        <Section
          className="border-t border-line-soft py-20 lg:py-[120px]"
          innerClassName="grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16"
        >
          <h2 className="reveal font-serif text-[48px] leading-[0.98] tracking-[-0.015em] sm:text-[64px]">
            Questions
          </h2>
          <div className="reveal">
            <Faq faqs={faqs} />
          </div>
        </Section>

        <QuoteCta />

        {/* Nearby towns */}
        <Section className="bg-ink py-10 text-on-ink surface-ink">
          <p className="text-[15px]">
            Also:{' '}
            {otherTowns.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && ' · '}
                <Link href={`/web-design/${t.slug}`} className="nav-link text-paper">
                  web design in {cityLabel(t)}
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
