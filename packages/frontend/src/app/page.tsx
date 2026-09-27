'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar, Footer, Section } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';
import {
  OrganizationSchema,
  LocalBusinessSchema,
  FAQSchema,
  WebSiteSchema,
} from '@/components/StructuredData';
import {
  BUILD_FEE,
  BUILD_ONLY_HOSTING_DAYS,
  BUILD_REVISION_ROUNDS,
  CARE_PLANS,
  RETAINER_MIN,
  RETAINER_RANGE,
  SERVICE_AREA_LABEL,
} from '@/lib/business';

const InteractiveFAQ = dynamic(() => import('@/components/sentient/faq/InteractiveFAQ'), {
  ssr: false,
});

const NAV_ITEMS = [
  { label: 'Website Build', href: '#website' },
  { label: 'Care Plans', href: '#retainer' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'About', href: '/about' },
];

const WEBSITE_FEATURES = [
  'A custom one-page site built around your business and brand',
  'The words written for you — you review, you don’t have to write',
  'Mobile-first and fast, with tap-to-call on phones',
  'Contact form that emails you directly',
  'Basic on-page SEO',
  `${BUILD_REVISION_ROUNDS} rounds of revisions before launch`,
  'Launched on your own domain — registered in your name, so you own it',
];

const PORTFOLIO_SITES = [
  {
    name: 'Kettle & Grain Coffee Co.',
    type: 'Coffee Shop',
    description: 'Atmosphere, menu, and hours — no urgency, just a place worth finding.',
    image: '/images/demo/kettle-and-grain/hero-interior.jpg',
    url: '/demo/kettle-and-grain',
  },
  {
    name: 'Ironwood Auto & Tire',
    type: 'Auto Repair',
    description: 'Phone-first and built for someone who needs their car back today.',
    image: '/images/demo/ironwood-auto/hero-shop.jpg',
    url: '/demo/ironwood-auto',
  },
  {
    name: 'Green Bench Lawn & Landscape',
    type: 'Lawn & Landscape',
    description: 'Portfolio-driven, built around seasonal work and finished yards.',
    image: '/images/demo/green-bench/hero-yard.jpg',
    url: '/demo/green-bench',
  },
];

const FAQS = [
  {
    question: 'How long does a website build take?',
    answer:
      "It depends on scope, so I'll give you a specific date during your intake call — before you commit to anything, not after.",
  },
  {
    question: 'Do you use AI to build websites?',
    answer:
      "Yes — I use AI tools to move faster, but every site is personally designed and reviewed by me before it ships. It's just me; there's no team of designers behind the scenes.",
  },
  {
    question: 'What’s included in revisions?',
    answer: `The build includes ${BUILD_REVISION_ROUNDS} rounds of revisions before launch. A round is one list of everything you’d like changed — I make the changes and send the updated site back to you.`,
  },
  {
    question: 'What if I need changes after launch?',
    answer: `That’s what the Care Plans (${RETAINER_RANGE}) are for: hosting plus 2, 3 or 4 hours of edits a month, depending on the plan. Unused hours don’t roll over. Without a plan, changes are quoted before any work starts.`,
  },
  {
    question: 'Who owns the domain?',
    answer:
      'You do. You register it in your own name (usually about $12 a year), and I connect it to your site and walk you through the setup.',
  },
  {
    question: 'Can I see examples of your work?',
    answer:
      "Check out the demo portfolio below. Soft Systems Studio is a new studio — I don't have real client sites to show yet, so these are demos I built myself to show what's possible, clearly labeled as demos.",
  },
  {
    question: 'Do you offer hosting?',
    answer: `Hosting is included with every Care Plan (${RETAINER_RANGE}). Without one, I hand over your finished site files and help point your domain wherever you choose to host it. Your site stays live on my hosting for ${BUILD_ONLY_HOSTING_DAYS} days after launch while you move it.`,
  },
  {
    question: 'Where are you located, and who do you work with?',
    answer: `Based near Phenix City, Alabama. I work with local service businesses in ${SERVICE_AREA_LABEL} — and remotely with businesses outside that area.`,
  },
];

export default function Home() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <WebSiteSchema />
      <FAQSchema faqs={FAQS} />

      <div className="min-h-screen text-brand-ink">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to main content
        </a>

        <Navbar
          items={NAV_ITEMS}
          ctaLabel="Get a Quote"
          ctaHref="/intake"
          brand="Soft Systems Studio"
          variant="light"
        />

        <main id="main-content">
          {/* Full-bleed photo hero — brand first, one composition */}
          <section
            id="site-hero"
            className="relative min-h-[calc(100dvh-4.5rem)] flex items-end overflow-hidden"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/demo/green-bench/hero-yard.jpg"
                alt="Landscaped yard for a local service business"
                fill
                priority
                sizes="100vw"
                className="object-cover sss-kenburns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/55 to-brand-ink/25" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 pt-32 md:pb-24 md:pt-40 text-white">
              <h1 className="sss-display sss-rise text-5xl sm:text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight max-w-4xl">
                Soft Systems
                <br />
                Studio
              </h1>
              <div className="sss-rise sss-rise-delay-1 mt-6 h-1 w-24 bg-brand-lime-bright sss-draw-line" />
              <p className="sss-rise sss-rise-delay-2 mt-6 text-xl md:text-2xl font-medium text-white/95 max-w-xl">
                Websites for local businesses.
              </p>
              <p className="sss-rise sss-rise-delay-3 mt-3 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
                A flat {BUILD_FEE} build for service businesses in {SERVICE_AREA_LABEL}. Care Plans
                from {RETAINER_MIN}/month.
              </p>
              <div className="sss-rise sss-rise-delay-4 mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="/intake"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-brand-ink font-semibold rounded-md hover:bg-brand-lime-wash transition-colors"
                >
                  Get a Quote
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-white/50 bg-black/40 backdrop-blur-sm text-white font-semibold rounded-md hover:border-white transition-colors"
                >
                  See the Work
                </a>
              </div>
            </div>
          </section>

          {/* Website Build */}
          <Section id="website" className="sss-paper">
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime mb-4">
                Website Build
              </p>
              <h2 className="sss-display text-4xl md:text-5xl font-extrabold text-brand-ink max-w-2xl leading-tight">
                One build. One price. {BUILD_FEE}.
              </h2>
              <p className="mt-5 text-lg text-brand-muted max-w-2xl leading-relaxed">
                No tiers, no package ladders. Everything a local service business needs to launch a
                professional site.
              </p>
            </FadeIn>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
              <FadeIn>
                <ul className="space-y-4">
                  {WEBSITE_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-brand-ink-soft border-t border-brand-ink/10 pt-4 first:border-0 first:pt-0"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-sm bg-brand-lime"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="bg-brand-ink text-brand-paper-elevated p-8 md:p-10 rounded-md">
                  <p className="text-sm uppercase tracking-[0.16em] text-white/50 mb-3">Flat fee</p>
                  <p className="sss-display text-5xl font-extrabold text-white">
                    {BUILD_FEE}
                    <span className="block text-base font-medium text-white/55 mt-2 tracking-normal">
                      one-time
                    </span>
                  </p>
                  <a
                    href="/intake"
                    className="mt-8 inline-flex w-full items-center justify-center px-6 py-3.5 bg-brand-lime text-white font-semibold rounded-md hover:bg-brand-lime-bright transition-colors"
                  >
                    Get Started
                  </a>
                  <p className="mt-4 text-sm text-white/50">
                    Need updates after launch?{' '}
                    <a
                      href="#retainer"
                      className="text-brand-lime-wash underline-offset-2 hover:underline"
                    >
                      Care Plans from {RETAINER_MIN}/mo
                    </a>
                    .
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn>
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {[
                  {
                    n: '01',
                    title: 'Quick Intake',
                    body: 'Tell me about your business, brand, and goals in a short form.',
                  },
                  {
                    n: '02',
                    title: 'I Build It',
                    body: 'I design and build the site myself, using AI to move fast.',
                  },
                  {
                    n: '03',
                    title: 'You Launch',
                    body: 'Approve the final result, go live, and start getting customers.',
                  },
                ].map((step) => (
                  <div key={step.n} className="border-t-2 border-brand-lime pt-6">
                    <p className="sss-display text-sm font-semibold text-brand-lime tracking-wide">
                      {step.n}
                    </p>
                    <h3 className="sss-display mt-2 text-xl font-bold text-brand-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-brand-muted text-sm leading-relaxed">{step.body}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </Section>

          {/* Care Plans */}
          <Section id="retainer" className="bg-brand-paper-elevated">
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime mb-4">
                Care Plans
              </p>
              <h2 className="sss-display text-4xl md:text-5xl font-extrabold text-brand-ink max-w-2xl leading-tight">
                Keep it running after launch.
              </h2>
              <p className="mt-5 text-lg text-brand-muted max-w-2xl leading-relaxed">
                Optional monthly plans for hosting, updates, and support. Same services on every
                plan — they differ only in edit hours.
              </p>
            </FadeIn>

            <StaggerContainer className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CARE_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="border border-brand-ink/10 bg-white/60 p-6 rounded-md"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
                    {plan.name}
                  </p>
                  <p className="sss-display mt-3 text-4xl font-extrabold text-brand-ink">
                    {plan.price}
                    <span className="text-base font-medium text-brand-muted">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    {plan.editHours} hours of edits a month
                  </p>
                </div>
              ))}
            </StaggerContainer>

            <FadeIn>
              <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-sm text-brand-ink-soft">
                {[
                  'Hosting & uptime monitoring',
                  'Content and text updates',
                  'Small design tweaks',
                  'Email support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-brand-lime" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-brand-muted max-w-xl">
                Unused hours don&apos;t roll over. Work beyond your hours is quoted first. Cancel
                anytime.
              </p>
              <a
                href="/intake"
                className="mt-8 inline-flex px-7 py-3.5 border border-brand-ink/20 text-brand-ink font-semibold rounded-md hover:border-brand-lime hover:text-brand-lime transition-colors"
              >
                Ask About a Care Plan
              </a>
            </FadeIn>
          </Section>

          {/* Portfolio — interactive previews (cards OK) */}
          <Section id="portfolio" className="sss-paper">
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime mb-4">
                Portfolio
              </p>
              <h2 className="sss-display text-4xl md:text-5xl font-extrabold text-brand-ink max-w-2xl leading-tight">
                See what I can build.
              </h2>
              <p className="mt-5 text-lg text-brand-muted max-w-2xl leading-relaxed">
                Soft Systems Studio is new — these three demos show what&apos;s possible. Clearly
                labeled, not real businesses.{' '}
                <Link href="/about" className="text-brand-lime font-semibold hover:underline">
                  Read my story
                </Link>
              </p>
            </FadeIn>

            <StaggerContainer className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {PORTFOLIO_SITES.map((site) => (
                <Link
                  key={site.name}
                  href={site.url}
                  className="group block overflow-hidden rounded-md border border-brand-ink/10 bg-white/50 hover:border-brand-lime/50 transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={site.image}
                      alt={`${site.name} demo site preview`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-medium uppercase tracking-wide text-white/75">
                        {site.type}
                      </p>
                      <h3 className="sss-display text-xl font-bold mt-1">{site.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-brand-muted leading-relaxed">{site.description}</p>
                    <p className="mt-3 text-sm font-semibold text-brand-lime group-hover:underline">
                      View demo →
                    </p>
                  </div>
                </Link>
              ))}
            </StaggerContainer>
          </Section>

          {/* FAQ */}
          <Section id="faq" className="bg-brand-paper-elevated">
            <FadeIn>
              <h2 className="sss-display text-4xl md:text-5xl font-extrabold text-brand-ink text-center mb-12">
                Questions?
              </h2>
            </FadeIn>
            <InteractiveFAQ faqs={FAQS} />
          </Section>

          {/* Final CTA */}
          <Section className="bg-brand-ink text-white">
            <FadeIn>
              <div className="max-w-3xl">
                <h2 className="sss-display text-4xl md:text-5xl font-extrabold leading-tight">
                  Ready when you are.
                </h2>
                <p className="mt-5 text-lg text-white/65 max-w-xl">
                  Get a quote for a {BUILD_FEE} website build — or browse the demos first.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="/intake"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-lime text-white font-semibold rounded-md hover:bg-brand-lime-bright transition-colors"
                  >
                    Get a Quote
                  </a>
                  <a
                    href="#portfolio"
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-white font-semibold rounded-md hover:border-white/50 transition-colors"
                  >
                    See the Demos
                  </a>
                </div>
              </div>
            </FadeIn>
          </Section>
        </main>

        <Footer />
      </div>
    </>
  );
}
